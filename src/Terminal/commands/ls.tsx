import React from "react";
import { Theme } from "@mui/material/styles";

import { hasTextExtension, type TextFilePath } from "../../Paths/TextFilePath";
import type { ContractFilePath } from "../../Paths/ContractFilePath";
import type { ProgramFilePath } from "../../Paths/ProgramFilePath";
import type { ContentFilePath } from "../../Paths/ContentFile";
import type { ScriptFilePath } from "../../Paths/ScriptFilePath";

import { makeStyles } from "tss-react/mui";
import { BaseServer } from "../../Server/BaseServer";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { Terminal } from "../../Terminal";
import libarg from "arg";
import { showLiterature } from "../../Literature/LiteratureHelpers";
import { showMessage } from "../../Message/MessageHelpers";
import { FilePath, combinePath, removeDirectoryFromPath } from "../../Paths/FilePath";
import {
  Directory,
  directoryExistsOnServer,
  getFirstDirectoryInPath,
  resolveDirectory,
  root,
} from "../../Paths/Directory";
import { isMember } from "../../utils/EnumHelper";
import { Settings } from "../../Settings/Settings";
import { formatBytes, formatRam } from "../../ui/formatNumber";

export function ls(args: (string | number | boolean)[], server: BaseServer): void {
  enum FileType {
    Folder,
    Message,
    TextFile,
    Program,
    Contract,
    Script,
  }

  type FileGroup =
    | {
        // Types that are not clickable only need to be string[]
        type: FileType.Folder | FileType.Program | FileType.Contract;
        segments: string[];
      }
    | { type: FileType.Message; segments: FilePath[] }
    | { type: FileType.Script; segments: ScriptFilePath[] }
    | { type: FileType.TextFile; segments: TextFilePath[] };

  interface LSFlags {
    ["-l"]: boolean;
    ["-h"]: boolean;
    ["--grep"]: string;
  }
  let flags: LSFlags;
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    flags = libarg(
      {
        "-l": Boolean,
        "-h": Boolean,
        "--grep": String,
        "-g": "--grep",
      },
      { argv: args },
    );
  } catch (e) {
    // catch passing only -g / --grep with no string to use as the search
    incorrectUsage();
    return;
  }
  const filter = flags["--grep"] ?? "";

  const numArgs = args.length;
  function incorrectUsage(): void {
    Terminal.error("Incorrect usage of ls command. Usage: ls [dir] [-l] [-h] [-g, --grep pattern]");
  }

  if (numArgs > 5) {
    return incorrectUsage();
  }

  let baseDirectory = Terminal.currDir;
  // Parse first argument which should be a directory.
  if (args[0] && typeof args[0] == "string" && !args[0].startsWith("-")) {
    const directory = resolveDirectory(args[0], args[0].startsWith("/") ? root : Terminal.currDir);
    if (directory !== null && directoryExistsOnServer(directory, server)) {
      baseDirectory = directory;
    } else return incorrectUsage();
  }

  // Display all programs and scripts
  const allPrograms: ProgramFilePath[] = [];
  const allScripts: ScriptFilePath[] = [];
  const allTextFiles: TextFilePath[] = [];
  const allContracts: ContractFilePath[] = [];
  const allMessages: FilePath[] = [];
  const folders: Directory[] = [];

  function handlePath(path: FilePath, dest: FilePath[]): void {
    // This parses out any files not in the starting directory.
    const parsedPath = removeDirectoryFromPath(baseDirectory, path);
    if (!parsedPath) return;

    if (!parsedPath.includes(filter)) return;

    // Check if there's a directory in the parsed path, if so we need to add the folder and not the file.
    const firstParentDir = getFirstDirectoryInPath(parsedPath);
    if (firstParentDir) {
      if (!firstParentDir.includes(filter) || folders.includes(firstParentDir)) return;
      folders.push(firstParentDir);
      return;
    }
    dest.push(parsedPath);
  }

  // Get all of the programs and scripts on the machine into one temporary array
  // Type assertions that programs and msg/lit are filepaths are safe due to checks in
  // Program, Message, and Literature constructors
  for (const program of server.programs) handlePath(program as FilePath, allPrograms);
  for (const scriptFilename of server.scripts.keys()) handlePath(scriptFilename, allScripts);
  for (const txtFilename of server.textFiles.keys()) handlePath(txtFilename, allTextFiles);
  for (const contract of server.contracts) handlePath(contract.fn, allContracts);
  for (const msgOrLit of server.messages) handlePath(msgOrLit as FilePath, allMessages);

  // Sort the files/folders alphabetically then print each
  allPrograms.sort();
  allScripts.sort();
  allTextFiles.sort();
  allContracts.sort();
  allMessages.sort();
  folders.sort();

  let maxSizeStrLength = 0;
  let maxRamStrLength = 0;
  if (flags["-l"]) {
    // Collect all items to calculate max string lengths
    const allDisplayableItems: { path: FilePath | Directory; type: FileType }[] = [];
    folders.forEach((p) => allDisplayableItems.push({ path: p, type: FileType.Folder }));
    allMessages.forEach((p) => allDisplayableItems.push({ path: p, type: FileType.Message }));
    allTextFiles.forEach((p) => allDisplayableItems.push({ path: p, type: FileType.TextFile }));
    allScripts.forEach((p) => allDisplayableItems.push({ path: p, type: FileType.Script }));
    allPrograms.forEach((p) => allDisplayableItems.push({ path: p, type: FileType.Program }));
    allContracts.forEach((p) => allDisplayableItems.push({ path: p, type: FileType.Contract }));

    for (const item of allDisplayableItems) {
      const { ramDisplay, sizeDisplay } = getItemNumericData(item.path, item.type);
      if (sizeDisplay.length > maxSizeStrLength) maxSizeStrLength = sizeDisplay.length;
      if (ramDisplay.length > maxRamStrLength) maxRamStrLength = ramDisplay.length;
    }
  }

  function getItemNameElement(relativePath: string, fileType: FileType): React.ReactElement {
    switch (fileType) {
      case FileType.Folder:
        return <span style={{ color: "cyan" }}>{relativePath}</span>;
      case FileType.Message:
        return <ClickableMessageLink path={relativePath as FilePath} />;
      case FileType.TextFile:
      case FileType.Script:
        return <ClickableContentFileLink path={relativePath as ScriptFilePath | TextFilePath} />;
      case FileType.Program:
      case FileType.Contract:
      default:
        return <span>{relativePath}</span>;
    }
  }

  function getItemNumericData(relativePath: string, fileType: FileType): { ramDisplay: string; sizeDisplay: string } {
    let sizeDisplay = "-";
    const fullPath =
      fileType === FileType.Message || relativePath.startsWith("/")
        ? (relativePath as FilePath)
        : combinePath(baseDirectory, relativePath as FilePath);

    // Determine file size
    let contentBytes = 0;
    if (fileType === FileType.TextFile) {
      const file = server.textFiles.get(fullPath as TextFilePath);
      contentBytes = file?.content ? new TextEncoder().encode(file.content).length : 0;
    } else {
      // Script
      const file = server.scripts.get(fullPath as ScriptFilePath);
      contentBytes = file?.content ? new TextEncoder().encode(file.content).length : 0;
    }
    if (flags["-l"] && flags["-h"]) {
      sizeDisplay = formatBytes(contentBytes);
    } else {
      sizeDisplay = `${contentBytes}`;
    }

    // Determine RAM usage
    let ramDisplay = "-";
    if (fileType === FileType.Script) {
      const file = server.scripts.get(fullPath as ScriptFilePath);
      const ramUsage = file?.getRamUsage(server.scripts);
      ramDisplay = ramUsage ? formatRam(ramUsage) : "NaN";
    }
    return { ramDisplay, sizeDisplay };
  }

  function SegmentGrid(props: { colSize: string; children: React.ReactChild[] }): React.ReactElement {
    const { classes } = makeStyles()({
      segmentGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, var(--colSize))",
      },
    })();
    const style = { ["--colSize"]: props.colSize } as React.CSSProperties;
    return (
      <span style={style} className={classes.segmentGrid}>
        {props.children}
      </span>
    );
  }

  function ClickableContentFileLink(props: { path: ScriptFilePath | TextFilePath }): React.ReactElement {
    const { classes } = makeStyles()((theme: Theme) => ({
      link: {
        cursor: "pointer",
        textDecorationLine: "underline",
        color: theme.palette.warning.main,
      },
    }))();
    const fullPath = combinePath(baseDirectory, props.path);
    function onClick() {
      let content;
      if (hasTextExtension(fullPath)) {
        content = server.textFiles.get(fullPath)?.content ?? "";
      } else {
        content = server.scripts.get(fullPath)?.content ?? "";
      }
      const files = new Map<ContentFilePath, string>();
      const options = { hostname: server.hostname, vim: Settings.MonacoDefaultToVim };
      files.set(fullPath, content);
      Router.toPage(Page.ScriptEditor, { files, options });
    }
    return (
      <span>
        <span className={classes.link} onClick={onClick}>
          {props.path}
        </span>
      </span>
    );
  }

  function ClickableMessageLink(props: { path: FilePath }): React.ReactElement {
    const { classes } = makeStyles()({
      link: {
        cursor: "pointer",
        textDecorationLine: "underline",
      },
    })();
    function onClick(): void {
      if (!server.isConnectedTo) {
        return Terminal.error(`File is not on this server, connect to ${server.hostname} and try again`);
      }
      // Message and lit files are always in root, no need to combine path with base directory
      if (isMember("MessageFilename", props.path)) {
        showMessage(props.path);
      } else if (isMember("LiteratureName", props.path)) {
        showLiterature(props.path);
      }
    }
    return (
      <span>
        <span className={classes.link} onClick={onClick}>
          {props.path}
        </span>
      </span>
    );
  }

  function LongListItem(props: {
    children: React.ReactNode;
    sizeInfo: string;
    ramInfo: string;
    maxSizeStrLengthCalculated: number;
    maxRamStrLengthCalculated: number;
  }): React.ReactElement {
    const sizeColumnWidth = props.maxSizeStrLengthCalculated > 0 ? `${props.maxSizeStrLengthCalculated}ch` : "auto";
    const ramColumnWidth = props.maxRamStrLengthCalculated > 0 ? `${props.maxRamStrLengthCalculated}ch` : "auto";
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `${ramColumnWidth} ${sizeColumnWidth} 1fr`,
          alignItems: "baseline",
          gap: "1em",
        }}
      >
        <span style={{ color: Settings.theme.secondary, whiteSpace: "nowrap", textAlign: "right" }}>
          {props.ramInfo}
        </span>
        <span style={{ color: Settings.theme.secondary, whiteSpace: "nowrap", textAlign: "right" }}>
          {props.sizeInfo}
        </span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{props.children}</span>
      </div>
    );
  }

  function postSegments({ type, segments }: FileGroup, flags: LSFlags): void {
    if (segments.length === 0) return;

    // print file based on mode
    if (flags["-l"]) {
      for (const segmentPath of segments) {
        const { ramDisplay, sizeDisplay } = getItemNumericData(segmentPath, type);
        const nameElement = getItemNameElement(segmentPath, type);
        Terminal.printRaw(
          <LongListItem
            key={segmentPath.toString()}
            sizeInfo={sizeDisplay}
            ramInfo={ramDisplay}
            maxSizeStrLengthCalculated={maxSizeStrLength}
            maxRamStrLengthCalculated={maxRamStrLength}
          >
            {nameElement}
          </LongListItem>,
        );
      }
    } else {
      const segmentElements = segments.map((segmentPath) => {
        const nameElement = getItemNameElement(segmentPath, type);
        return React.cloneElement(nameElement, { key: segmentPath.toString() });
      });
      const colSize = Math.ceil(Math.max(...segments.map((segment) => segment.length)) * 0.7) + "em";
      Terminal.printRaw(<SegmentGrid colSize={colSize}>{segmentElements}</SegmentGrid>);
    }
  }

  const groups: FileGroup[] = [
    { type: FileType.Folder, segments: folders },
    { type: FileType.Message, segments: allMessages },
    { type: FileType.TextFile, segments: allTextFiles },
    { type: FileType.Program, segments: allPrograms },
    { type: FileType.Contract, segments: allContracts },
    { type: FileType.Script, segments: allScripts },
  ];
  for (const group of groups) {
    if (group.segments.length > 0) postSegments(group, flags);
  }
}
