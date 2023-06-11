import type { TextFilePath } from "../../Paths/TextFilePath";
import type { ContractFilePath } from "../../Paths/ContractFilePath";
import type { ProgramFilePath } from "../../Paths/ProgramFilePath";
import type { ContentFilePath } from "../../Paths/ContentFile";
import type { ScriptFilePath } from "../../Paths/ScriptFilePath";

import { Theme } from "@mui/material/styles";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import { BaseServer } from "../../Server/BaseServer";
import { Router } from "../../ui/GameRoot";
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
import { checkEnum } from "../../utils/helpers/enum";
import { LiteratureName, MessageFilename } from "@enums";

export function ls(args: (string | number | boolean)[], server: BaseServer): void {
  interface LSFlags {
    ["-l"]: boolean;
    ["--grep"]: string;
  }
  let flags: LSFlags;
  try {
    flags = libarg(
      {
        "-l": Boolean,
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
    Terminal.error("Incorrect usage of ls command. Usage: ls [dir] [-l] [-g, --grep pattern]");
  }

  if (numArgs > 4) {
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

  function SegmentGrid(props: { colSize: string; children: React.ReactChild[] }): React.ReactElement {
    const classes = makeStyles({
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
  function ClickableScriptLink(props: { path: ScriptFilePath }): React.ReactElement {
    const classes = makeStyles((theme: Theme) =>
      createStyles({
        link: {
          cursor: "pointer",
          textDecorationLine: "underline",
          color: theme.palette.warning.main,
        },
      }),
    )();
    const fullPath = combinePath(baseDirectory, props.path);
    function onClick() {
      const code = server.scripts.get(fullPath)?.content ?? "";
      const map = new Map<ContentFilePath, string>();
      map.set(fullPath, code);
      Router.toScriptEditor(map);
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
    const classes = makeStyles({
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
      if (checkEnum(MessageFilename, props.path)) {
        showMessage(props.path);
      } else if (checkEnum(LiteratureName, props.path)) {
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
        type: FileType.Folder | FileType.Program | FileType.Contract | FileType.TextFile;
        segments: string[];
      }
    | { type: FileType.Message; segments: FilePath[] }
    | { type: FileType.Script; segments: ScriptFilePath[] };

  function postSegments({ type, segments }: FileGroup, flags: LSFlags): void {
    let segmentElements: React.ReactElement[];
    const colSize = flags["-l"]
      ? "100%"
      : Math.ceil(Math.max(...segments.map((segment) => segment.length)) * 0.7) + "em";
    switch (type) {
      case FileType.Folder:
        segmentElements = segments.map((segment) => (
          <span key={segment} style={{ color: "cyan" }}>
            {segment}
          </span>
        ));
        break;
      case FileType.Message:
        segmentElements = segments.map((segment) => <ClickableMessageLink key={segment} path={segment} />);
        break;
      case FileType.Script:
        segmentElements = segments.map((segment) => <ClickableScriptLink key={segment} path={segment} />);
        break;
      default:
        segmentElements = segments.map((segment) => <span key={segment}>{segment}</span>);
    }
    Terminal.printRaw(<SegmentGrid colSize={colSize}>{segmentElements}</SegmentGrid>);
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
