import { Theme } from "@mui/material/styles";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { toString } from "lodash";
import React from "react";
import { BaseServer } from "../../Server/BaseServer";
import { evaluateDirectoryPath, getFirstParentDirectory, isValidDirectoryPath } from "../DirectoryHelpers";
import { Router } from "../../ui/GameRoot";
import { Terminal } from "../../Terminal";
import libarg from "arg";
import { showLiterature } from "../../Literature/LiteratureHelpers";
import { MessageFilenames, showMessage } from "../../Message/MessageHelpers";

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
  const filter = flags["--grep"];

  const numArgs = args.length;
  function incorrectUsage(): void {
    Terminal.error("Incorrect usage of ls command. Usage: ls [dir] [-l] [-g, --grep pattern]");
  }

  if (numArgs > 4) {
    return incorrectUsage();
  }

  // Directory path
  let prefix = Terminal.cwd();
  if (!prefix.endsWith("/")) {
    prefix += "/";
  }

  // If first arg doesn't contain a - it must be the file/folder
  const dir = args[0] && typeof args[0] == "string" && !args[0].startsWith("-") ? args[0] : "";
  const newPath = evaluateDirectoryPath(dir + "", Terminal.cwd());
  prefix = newPath || "";
  if (!prefix.endsWith("/")) {
    prefix += "/";
  }
  if (!isValidDirectoryPath(prefix)) {
    return incorrectUsage();
  }

  // Root directory, which is the same as no 'prefix' at all
  if (prefix === "/") {
    prefix = "";
  }

  // Display all programs and scripts
  const allPrograms: string[] = [];
  const allScripts: string[] = [];
  const allTextFiles: string[] = [];
  const allContracts: string[] = [];
  const allMessages: string[] = [];
  const folders: string[] = [];

  function handleFn(fn: string, dest: string[]): void {
    let parsedFn = fn;
    if (prefix) {
      if (!fn.startsWith(prefix)) {
        return;
      } else {
        parsedFn = fn.slice(prefix.length, fn.length);
      }
    }

    if (filter && !parsedFn.includes(filter)) {
      return;
    }

    // If the fn includes a forward slash, it must be in a subdirectory.
    // Therefore, we only list the "first" directory in its path
    if (parsedFn.includes("/")) {
      const firstParentDir = getFirstParentDirectory(parsedFn);
      if (filter && !firstParentDir.includes(filter)) {
        return;
      }

      if (!folders.includes(firstParentDir)) {
        folders.push(firstParentDir);
      }

      return;
    }

    dest.push(parsedFn);
  }

  // Get all of the programs and scripts on the machine into one temporary array
  for (const program of server.programs) handleFn(program, allPrograms);
  for (const scriptFilename of server.scripts.keys()) handleFn(scriptFilename, allScripts);
  for (const txt of server.textFiles) handleFn(txt.fn, allTextFiles);
  for (const contract of server.contracts) handleFn(contract.fn, allContracts);
  for (const msgOrLit of server.messages) handleFn(msgOrLit, allMessages);

  // Sort the files/folders alphabetically then print each
  allPrograms.sort();
  allScripts.sort();
  allTextFiles.sort();
  allContracts.sort();
  allMessages.sort();
  folders.sort();

  interface ClickableRowProps {
    row: string;
    prefix: string;
    hostname: string;
  }

  function ClickableScriptRow({ row, prefix, hostname }: ClickableRowProps): React.ReactElement {
    const classes = makeStyles((theme: Theme) =>
      createStyles({
        scriptLinksWrap: {
          display: "inline-flex",
          color: theme.palette.warning.main,
        },
        scriptLink: {
          cursor: "pointer",
          textDecorationLine: "underline",
          paddingRight: "1.15em",
          "&:last-child": { padding: 0 },
        },
      }),
    )();

    const rowSplit = row.split("~");
    let rowSplitArray = rowSplit.map((x) => [x.trim(), x.replace(x.trim(), "")]);
    rowSplitArray = rowSplitArray.filter((x) => !!x[0]);

    function onScriptLinkClick(filename: string): void {
      if (!server.isConnectedTo) {
        return Terminal.error(`File is not on this server, connect to ${hostname} and try again`);
      }
      if (filename.startsWith("/")) filename = filename.slice(1);
      // Terminal.getFilepath needs leading slash to correctly work here
      if (prefix === "") filename = `/${filename}`;
      const filepath = Terminal.getFilepath(`${prefix}${filename}`);
      // Terminal.getScript also calls Terminal.getFilepath and therefore also
      // needs the given parameter
      if (!filepath) {
        return Terminal.error(`Invalid filename (${prefix}${filename}) when clicking script link. This is a bug.`);
      }
      const code = toString(Terminal.getScript(`${prefix}${filename}`)?.code);
      Router.toScriptEditor({ [filepath]: code });
    }

    return (
      <span className={classes.scriptLinksWrap}>
        {rowSplitArray.map((rowItem) => (
          <span key={"script_" + rowItem[0]}>
            <span className={classes.scriptLink} onClick={() => onScriptLinkClick(rowItem[0])}>
              {rowItem[0]}
            </span>
            <span>{rowItem[1]}</span>
          </span>
        ))}
      </span>
    );
  }

  function ClickableMessageRow({ row, prefix, hostname }: ClickableRowProps): React.ReactElement {
    const classes = makeStyles((theme: Theme) =>
      createStyles({
        linksWrap: {
          display: "inline-flex",
          color: theme.palette.primary.main,
        },
        link: {
          cursor: "pointer",
          textDecorationLine: "underline",
          paddingRight: "1.15em",
          "&:last-child": { padding: 0 },
        },
      }),
    )();

    const rowSplit = row.split("~");
    let rowSplitArray = rowSplit.map((x) => [x.trim(), x.replace(x.trim(), "")]);
    rowSplitArray = rowSplitArray.filter((x) => !!x[0]);

    function onMessageLinkClick(filename: string): void {
      if (!server.isConnectedTo) {
        return Terminal.error(`File is not on this server, connect to ${hostname} and try again`);
      }
      if (filename.startsWith("/")) filename = filename.slice(1);
      const filepath = Terminal.getFilepath(`${prefix}${filename}`);
      if (!filepath) {
        return Terminal.error(`Invalid filename ${prefix}${filename} when clicking message link. This is a bug.`);
      }

      if (filepath.endsWith(".lit")) {
        showLiterature(filepath);
      } else if (filepath.endsWith(".msg")) {
        showMessage(filepath as MessageFilenames);
      }
    }

    return (
      <span className={classes.linksWrap}>
        {rowSplitArray.map((rowItem) => (
          <span key={"text_" + rowItem[0]}>
            <span className={classes.link} onClick={() => onMessageLinkClick(rowItem[0])}>
              {rowItem[0]}
            </span>
            <span>{rowItem[1]}</span>
          </span>
        ))}
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

  interface FileGroup {
    type: FileType;
    segments: string[];
  }

  function postSegments(group: FileGroup, flags: LSFlags): void {
    const segments = group.segments;
    const linked = group.type === FileType.Script || group.type === FileType.Message;
    const maxLength = Math.max(...segments.map((s) => s.length)) + 1;
    const filesPerRow = flags["-l"] === true ? 1 : Math.ceil(80 / maxLength);
    for (let i = 0; i < segments.length; i++) {
      let row = "";
      for (let col = 0; col < filesPerRow; col++) {
        if (!(i < segments.length)) break;
        row += segments[i];
        row += " ".repeat(maxLength * (col + 1) - row.length);
        if (linked) {
          row += "~";
        }
        i++;
      }
      i--;

      switch (group.type) {
        case FileType.Folder:
          Terminal.printRaw(<span style={{ color: "cyan" }}>{row}</span>);
          break;
        case FileType.Script:
          Terminal.printRaw(<ClickableScriptRow row={row} prefix={prefix} hostname={server.hostname} />);
          break;
        case FileType.Message:
          Terminal.printRaw(<ClickableMessageRow row={row} prefix={prefix} hostname={server.hostname} />);
          break;
        default:
          Terminal.print(row);
      }
    }
  }

  const groups: FileGroup[] = [
    { type: FileType.Folder, segments: folders },
    { type: FileType.Message, segments: allMessages },
    { type: FileType.TextFile, segments: allTextFiles },
    { type: FileType.Program, segments: allPrograms },
    { type: FileType.Contract, segments: allContracts },
    { type: FileType.Script, segments: allScripts },
  ].filter((g) => g.segments.length > 0);
  for (const group of groups) {
    postSegments(group, flags);
  }
}
