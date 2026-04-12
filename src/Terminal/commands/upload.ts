import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { combinePath, isFilePath } from "../../Paths/FilePath";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { Directory } from "src/Paths/Directory";

async function uploadDir(server: BaseServer, destination: Directory, files: FileList): Promise<number> {
  let success = 0;
  for (const f of files) {
    const path = f.webkitRelativePath;
    if (!isFilePath(path)) {
      Terminal.warn(`Skipping ${path}: bad file path`);
      continue;
    }
    const destFilePath = combinePath(destination, path);
    if (!hasTextExtension(destFilePath) && !hasScriptExtension(destFilePath)) {
      Terminal.warn(`Skipping ${path}: bad file extension`);
      continue;
    }
    let text: string | undefined = undefined;
    try {
      text = await f.text();
    } catch (error) {
      console.error(error);
      Terminal.error(`Skipping ${path}. Error: ${error}`);
      continue;
    }
    server.writeToContentFile(destFilePath, text);
    ++success;
  }
  return success;
}

export function upload(args: (string | number | boolean)[], server: BaseServer): void {
  if (args.length !== 1) {
    return Terminal.error("Incorrect usage of upload command. Usage: upload [dir]");
  }
  const destinationInput = String(args[0]);
  const destination = Terminal.getDirectory(destinationInput);
  if (destination === null) {
    return Terminal.error(`Could not resolve ${destinationInput} as a Directory`);
  }

  const input = document.createElement("input");
  input.type = "file";
  input.webkitdirectory = true;
  input.onchange = () => {
    input.onchange = null;
    const { files } = input;
    if (files === null) {
      return;
    }
    const destOrRoot = destination === "" ? "/" : destination;
    Terminal.print(`Starting to upload files to ${destOrRoot}`);
    uploadDir(server, destination, files).then(
      (numFiles) => {
        Terminal.print(`Successfully uploaded ${numFiles} files to ${destOrRoot}`);
      },
      (error) => {
        console.error(error);
        Terminal.error(`Error while uploading files to ${destOrRoot}. Error: ${error}`);
      },
    );
  };
  input.click();
}
