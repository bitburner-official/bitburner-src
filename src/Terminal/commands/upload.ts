import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { combinePath, isFilePath } from "../../Paths/FilePath";
import { hasTextExtension, validTextExtensions } from "../../Paths/TextFilePath";
import { hasScriptExtension, validScriptExtensions } from "../../Paths/ScriptFilePath";
import { PromptEvent } from "../../ui/React/PromptManager";
import { ContentFilePath } from "src/Paths/ContentFile";

function pickDirectory(): Promise<null | FileList> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true;
    input.onchange = () => {
      resolve(input.files);
    };
    input.oncancel = () => {
      resolve(null);
    };
    input.click();
  });
}

function askConfirm(txt: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    PromptEvent.emit({
      txt,
      resolve: (value: string | boolean) => {
        if (typeof value === "string") {
          reject(new Error("PromptEvent got a string, expected boolean"));
        } else {
          resolve(value);
        }
      },
    });
  });
}

function isFileExists(server: BaseServer, file: ContentFilePath): boolean {
  if (hasTextExtension(file)) {
    return server.textFiles.has(file);
  } else {
    return server.scripts.has(file);
  }
}

async function uploadAsync(args: (string | number | boolean)[], server: BaseServer) {
  if (args.length !== 1) {
    return Terminal.error("Incorrect usage of upload command. Usage: upload [dir]");
  }
  const destinationInput = String(args[0]);
  const destination = Terminal.getDirectory(destinationInput);
  if (destination === null) {
    return Terminal.error(`Could not resolve ${destinationInput} as a Directory`);
  }
  const files = await pickDirectory();
  if (files === null || files.length === 0) {
    return;
  }
  const withPath: (
    | { badPath: string }
    | { overwrite: ContentFilePath; file: File }
    | { create: ContentFilePath; file: File }
  )[] = [...files].map((f) => {
    const { webkitRelativePath } = f;
    const path = webkitRelativePath.substring(1 + webkitRelativePath.indexOf("/"));
    if (!isFilePath(path)) {
      return { badPath: path };
    }
    const destFilePath = combinePath(destination, path);
    if (!hasTextExtension(destFilePath) && !hasScriptExtension(destFilePath)) {
      return { badPath: path };
    }
    if (isFileExists(server, destFilePath)) {
      return {
        overwrite: destFilePath,
        file: f,
      };
    }
    return {
      create: destFilePath,
      file: f,
    };
  });
  const overwrite = withPath.filter((item) => "overwrite" in item);
  const skipped = withPath.filter((item) => "badPath" in item);
  const create = withPath.filter((item) => "create" in item);
  let lines = [`Upload files to ${destination}?`];
  if (overwrite.length !== 0) {
    lines = [
      ...lines,
      "",
      `${overwrite.length} files will be overwritten:`,
      ...overwrite.map(({ overwrite }) => `O ${overwrite}`),
    ];
  }
  if (skipped.length !== 0) {
    const extensions = [...validScriptExtensions, ...validTextExtensions];
    const last = extensions.pop() as string;
    const allValid = extensions.join(', ') + ' and ' + last;
    lines = [
      ...lines,
      "",
      'Characters * ? [ ] ! \\ ~ | # " \' and whitespace are not allowed in file paths.',
      `Only file extensions ${allValid} are allowed.`,
      'A file name must have at least one character before the extension.',
      '',
      `${skipped.length} files will be skipped due to prohibited file paths:`,
      ...skipped.map(({ badPath }) => `S ${badPath}`),
    ];
  }
  if (create.length !== 0) {
    lines = [...lines, "", `${create.length} new files will be created:`, ...create.map(({ create }) => `C ${create}`)];
  }
  if (!(await askConfirm(lines.join("\n")))) {
    return;
  }
  const destForPrint = destination === "" ? "/" : destination;
  Terminal.print(`Starting to upload files to ${destForPrint}`);
  for (const item of [...overwrite, ...create]) {
    const destFilePath = "create" in item ? item.create : item.overwrite;
    let text: string | undefined = undefined;
    try {
      text = await item.file.text();
    } catch (error) {
      console.error(error);
      Terminal.error(`Failed to upload ${destFilePath}. Error: ${error}`);
      continue;
    }
    server.writeToContentFile(destFilePath, text);
  }
  Terminal.print(`Successfully uploaded files to ${destForPrint}`);
}

export function upload(args: (string | number | boolean)[], server: BaseServer): void {
  uploadAsync(args, server).catch((error) => {
    console.error(error);
    Terminal.error(`Error while uploading files. Error: ${error}`);
  });
}
