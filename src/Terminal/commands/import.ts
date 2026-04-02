import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { combinePath, isFilePath } from "../../Paths/FilePath";
import { Directory } from "../../Paths/Directory";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import JSZip from "jszip";

async function importZip(server: BaseServer, destination: Directory, blob: Blob) {
  // TODO: handle file name encodings?
  const zip = await JSZip.loadAsync(blob);
  const files: [string, JSZip.JSZipObject][] = [];
  zip.forEach((path, zipObj) => {
    if (zipObj.dir) {
      return;
    }
    files.push([path, zipObj]);
  });
  for (const [path, zipObj] of files) {
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
      text = await zipObj.async("text");
    } catch (error) {
      console.error(error);
      Terminal.error(`Skipping ${path}: failed to unpack. Error: ${error}`);
      continue;
    }
    server.writeToContentFile(destFilePath, text);
  }
}

export function import_(args: (string | number | boolean)[], server: BaseServer): void {
  if (args.length !== 1) {
    return Terminal.error("Incorrect usage of import command. Usage: import [dir]");
  }
  const destinationInput = String(args[0]);
  const destination = Terminal.getDirectory(destinationInput);
  if (destination === null) {
    return Terminal.error(`Could not resolve ${destinationInput} as a Directory`);
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".zip";
  input.onchange = () => {
    const { files } = input;
    if (files === null || files.length === 0) {
      return;
    }
    const { name } = files[0];
    const destOrRoot = destination === "" ? "/" : destination;
    Terminal.print(`Starting to unzip ${name} into ${destOrRoot}`);
    importZip(server, destination, files[0]).then(
      () => {
        Terminal.print(`Successfully unzipped ${name}`);
      },
      (error) => {
        console.error(error);
        Terminal.error(`Error while unzipping ${name}. Error: ${error}`);
      },
    );
  };
  input.click();
}
