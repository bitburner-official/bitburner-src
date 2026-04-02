import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { combinePath, isFilePath } from "../../Paths/FilePath";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import JSZip from "jszip";

export function import_(args: (string | number | boolean)[], server: BaseServer): void {
    if (args.length !== 1) {
        return Terminal.error("Incorrect usage of import command. Usage: import [dir]");
    }
    const destinationInput = String(args[0]);
    const destination = Terminal.getDirectory(destinationInput);
    if (destination === null) {
        return Terminal.error(`Could not resolve ${destinationInput} as a FilePath or Directory`);
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    input.click();
    input.onchange = async (e) => {
        const {files} = input;
        if(files === null || files.length === 0) {
            return;
        }
        const file = files[0];
        const zip = await JSZip.loadAsync(file);
        zip.forEach((relativePath, file) => {
            if(!isFilePath(relativePath)) {
                return; // TODO: error?
            }
            const destFilePath = combinePath(destination, relativePath);
            if (!hasTextExtension(destFilePath) && !hasScriptExtension(destFilePath)) {
                return; // TODO: error?
            }
            server.writeToContentFile(destFilePath, 'hello world');
        });
    }
}
