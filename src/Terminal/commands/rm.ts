import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { PromptEvent } from "../../ui/React/PromptManager";
import { type Directory } from "../../Paths/Directory";
import { getAllDirectories } from "../../Paths/ListFiles";
import type { ProgramFilePath } from "../../Paths/ProgramFilePath";
import type { IReturnStatus } from "../../types";
import type { FilePath } from "../../Paths/FilePath";

export function rm(args: (string | number | boolean)[], server: BaseServer): void {
  const errors = {
    arg: (reason: string) => `Incorrect usage of rm command. ${reason}. Usage: rm [OPTION]... [FILE]...`,
    dirsProvided: (name: string) =>
      `Incorrect usage of rm command. To delete directories, use the -r flag. Failing directory: ${name}`,
    invalidFile: (name: string) => `Invalid filename: ${name}`,
    noSuchFile: (name: string) => `File does not exist: ${name}`,
    noSuchDir: (name: string) => `Directory does not exist: ${name}`,
    deleteFailed: (name: string, reason?: string) => `Failed to delete "${name}". ${reason ?? "Uncaught error"}`,
    rootDeletion: () =>
      "You are trying to delete all files within the root directory. If this is intentional, use the --no-preserve-root flag",
  } as const;

  if (args.length === 0) return Terminal.error(errors["arg"]("No arguments provided"));

  const recursive = args.includes("-r") || args.includes("-R") || args.includes("--recursive") || args.includes("-rf");
  const force = args.includes("-f") || args.includes("--force") || args.includes("-rf");
  const ignoreSpecialRoot = args.includes("--no-preserve-root");

  const isTargetString = (
    arg: string | number | boolean,
    index: number,
    array: (string | number | boolean)[],
  ): arg is string =>
    typeof arg === "string" && (!arg.startsWith("-") || (index - 1 >= 0 && array[index - 1] === "--"));
  const targets = args.filter(isTargetString);

  if (targets.length === 0) return Terminal.error(errors["arg"]("No targets provided"));
  if (!ignoreSpecialRoot && targets.includes("/")) return Terminal.error(errors["rootDeletion"]());

  const directories: Directory[] = [];
  const files: FilePath[] = [];
  const allDirs: Set<Directory> = getAllDirectories(server);
  const allFiles: Set<FilePath> = new Set([
    ...server.scripts.keys(),
    ...server.textFiles.keys(),
    ...(server.programs as ProgramFilePath[]),
  ]);

  for (const file of server.contracts) {
    allFiles.add(file.fn);
  }
  for (const file of server.messages) {
    if (file.endsWith(".lit")) {
      allFiles.add(file as FilePath);
    }
  }

  for (const target of targets) {
    // Directories can be specified with or without a trailing slash. However,
    // trying to remove a file with a trailing slash is an error.
    const fileDir = Terminal.getDirectory(target + (target[target.length - 1] === "/" ? "" : "/"));
    const file = Terminal.getFilepath(target);

    const fileExists = file !== null && allFiles.has(file);

    if (fileDir === null) return Terminal.error(errors.invalidFile(target));
    const dirExists = allDirs.has(fileDir);
    if (file === null || dirExists) {
      // If file === null, it means we specified a trailing-slash directory/,
      // or something that does not have an extension or otherwise isn't file-like.
      if (fileExists) {
        // We have this early case here specifically to handle situations where
        // a file and a directory with the same name exist. That's right, you
        // can have *both* /foo.txt *and* /foo.txt/bar.txt.
        //
        // In this case, we need to treat filenames preferrentially as files first.
        // If we have -r, we will *also* delete the directory.
        files.push(file);
      }
      if (!recursive) {
        if (fileExists) {
          // This is valid, but we shouldn't touch the directory.
          continue;
        } else {
          // Only exists as a directory (maybe).
          return Terminal.error(errors.dirsProvided(target));
        }
      }
      if (!dirExists && !force) {
        return Terminal.error(errors.noSuchDir(target));
      }
      // If we pass -f and pass a non-existing directory, we will add it
      // here and then it will match no files, producing no errors. This
      // aligns with Unix rm.
      directories.push(fileDir);
      continue;
    }
    if (!force && !allFiles.has(file)) {
      // With -f, we ignore file-not-found and try to delete everything at the end.
      return Terminal.error(errors.noSuchFile(target));
    }
    files.push(file);
  }

  for (const file of allFiles) {
    for (const dir of directories) {
      if (file.startsWith(dir)) {
        files.push(file);
      }
    }
  }

  const targetList = files.map((file) => "* " + file.toString()).join("\n");

  const reports: { target: string; result: IReturnStatus }[] = [];

  const deleteSelectedTargets = () => {
    for (const file of files) {
      reports.push({ target: file, result: server.removeFile(file) });
    }

    for (const report of reports) {
      if (report.result.res) {
        Terminal.success(`Deleted: ${report.target}`);
      } else {
        Terminal.error(errors.deleteFailed(report.target, report.result.msg));
      }
    }
  };

  if (
    force ||
    (files.length === 1 && !files[0].endsWith(".exe") && !files[0].endsWith(".lit") && !files[0].endsWith(".cct"))
  ) {
    deleteSelectedTargets();
  } else {
    const promptText = `Are you sure you want to delete ${
      files.length === 1 ? files[0] : "these files"
    }? This is irreversible.${files.length > 1 ? "\n\nDeleting:\n" + targetList : ""}`;

    PromptEvent.emit({
      txt: promptText,
      resolve: (value: string | boolean) => {
        if (typeof value === "string") throw new Error("PromptEvent got a string, expected boolean");
        if (value) deleteSelectedTargets();
      },
    });
  }
}
