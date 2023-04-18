import { Theme } from "@mui/material/styles";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import { BaseServer } from "../../Server/BaseServer";
import { Router } from "../../ui/GameRoot";
import { Terminal } from "../../Terminal";
import libarg from "arg";
import { showLiterature } from "../../Literature/LiteratureHelpers";
import { MessageFilename, showMessage } from "../../Message/MessageHelpers";
import { ScriptFilePath } from "../../Paths/ScriptFilePath";
import { FilePath, combinePath, removeDirectoryFromPath } from "../../Paths/FilePath";
import { ContentFilePath } from "../../Files/ContentFile";
import {
  Directory,
  directoryExistsOnServer,
  getFirstDirectoryInPath,
  resolveDirectory,
  root,
} from "../../Paths/Directory";
import { TextFilePath } from "../../Paths/TextFilePath";
import { ContractFilePath } from "../../Paths/ContractFilePath";
import { ProgramFilePath } from "../../Paths/ProgramFilePath";
import { checkEnum } from "../../utils/helpers/enum";
import { LiteratureName } from "../../Literature/data/LiteratureNames";

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
  for (const program of server.programs) handlePath(program, allPrograms);
  for (const scriptFilename of server.scripts.keys()) handlePath(scriptFilename, allScripts);
  for (const txtFilename of server.textFiles.keys()) handlePath(txtFilename, allTextFiles);
  for (const contract of server.contracts) handlePath(contract.fn, allContracts);
  for (const msgOrLit of server.messages) handlePath(msgOrLit as FilePath, allMessages as FilePath[]);

  // Sort the files/folders alphabetically then print each
  allPrograms.sort();
  allScripts.sort();
  allTextFiles.sort();
  allContracts.sort();
  allMessages.sort();
  folders.sort();

  interface ScriptRowProps {
    scripts: ScriptFilePath[];
  }
  function ClickableScriptRow({ scripts }: ScriptRowProps): React.ReactElement {
    const classes = makeStyles((theme: Theme) =>
      createStyles({
        scriptLinksWrap: {
          display: "inline-flex",
          color: theme.palette.warning.main,
        },
        scriptLink: {
          cursor: "pointer",
          textDecorationLine: "underline",
          marginRight: "1.5em",
          "&:last-child": { marginRight: 0 },
        },
      }),
    )();

    function onScriptLinkClick(filename: ScriptFilePath): void {
      const filePath = combinePath(baseDirectory, filename);
      const code = server.scripts.get(filePath)?.content ?? "";
      const map = new Map<ContentFilePath, string>();
      map.set(filePath, code);
      Router.toScriptEditor(map);
    }

    return (
      <span className={classes.scriptLinksWrap}>
        {scripts.map((script) => (
          <span key={script}>
            <span className={classes.scriptLink} onClick={() => onScriptLinkClick(script)}>
              {script}
            </span>
            <span></span>
          </span>
        ))}
      </span>
    );
  }

  interface MessageRowProps {
    messages: FilePath[];
  }
  function ClickableMessageRow({ messages }: MessageRowProps): React.ReactElement {
    const classes = makeStyles((theme: Theme) =>
      createStyles({
        linksWrap: {
          display: "inline-flex",
          color: theme.palette.primary.main,
        },
        link: {
          cursor: "pointer",
          textDecorationLine: "underline",
          marginRight: "1.5em",
          "&:last-child": { marginRight: 0 },
        },
      }),
    )();

    function onMessageLinkClick(filename: FilePath): void {
      if (!server.isConnectedTo) {
        return Terminal.error(`File is not on this server, connect to ${server.hostname} and try again`);
      }
      // Message and lit files have no directories

      if (checkEnum(MessageFilename, filename)) {
        showMessage(filename);
      } else if (checkEnum(LiteratureName, filename)) {
        showLiterature(filename);
      }
    }

    return (
      <span className={classes.linksWrap}>
        {messages.map((message) => (
          <span key={message}>
            <span className={classes.link} onClick={() => onMessageLinkClick(message)}>
              {message}
            </span>
            <span></span>
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

  type FileGroup =
    | {
        // Types that are not clickable only need to be string[]
        type: FileType.Folder | FileType.Program | FileType.Contract | FileType.TextFile;
        segments: string[];
      }
    | { type: FileType.Message; segments: FilePath[] }
    | { type: FileType.Script; segments: ScriptFilePath[] };

  function postSegments({ type, segments }: FileGroup, flags: LSFlags): void {
    const maxLength = Math.max(...segments.map((s) => s.length)) + 1;
    const filesPerRow = flags["-l"] === true ? 1 : Math.ceil(80 / maxLength);
    const padLength = Math.max(maxLength + 2, 40);
    let i = 0;
    if (type === FileType.Script) {
      while (i < segments.length) {
        const scripts: ScriptFilePath[] = [];
        for (let col = 0; col < filesPerRow && i < segments.length; col++, i++) {
          scripts.push(segments[i]);
        }
        Terminal.printRaw(<ClickableScriptRow scripts={scripts} />);
      }
      return;
    }
    if (type === FileType.Message) {
      while (i < segments.length) {
        const messages: FilePath[] = [];
        for (let col = 0; col < filesPerRow && i < segments.length; col++, i++) {
          messages.push(segments[i]);
        }
        Terminal.printRaw(<ClickableMessageRow messages={messages} />);
      }
      return;
    }
    while (i < segments.length) {
      let row = "";
      for (let col = 0; col < filesPerRow; col++, i++) {
        if (!(i < segments.length)) break;
        row += segments[i].padEnd(padLength);
        i++;
      }
      switch (type) {
        case FileType.Folder:
          Terminal.printRaw(<span style={{ color: "cyan" }}>{row}</span>);
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
  ];
  for (const group of groups) {
    if (group.segments.length > 0) postSegments(group, flags);
  }
}
