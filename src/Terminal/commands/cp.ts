import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { isScriptFilename } from "../../Script/isScriptFilename";
import { getDestinationFilepath, areFilesEqual } from "../DirectoryHelpers";

export function cp(args: (string | number | boolean)[], server: BaseServer): void {
  try {
    if (args.length !== 2) return Terminal.error("Incorrect usage of cp command. Usage: cp [src] [dst]");
    // Convert a relative path source file to the absolute path.
    const src = Terminal.getFilepath(args[0] + "");
    if (src === null) return Terminal.error(`Invalid source filename ${args[0]}`);

    // Get the destination based on the source file and the current directory
    const t_dst = getDestinationFilepath(args[1] + "", src, Terminal.cwd());
    if (t_dst === null) return Terminal.error("error parsing dst file");

    // Convert a relative path destination file to the absolute path.
    const dst = Terminal.getFilepath(t_dst);
    if (!dst) return Terminal.error(`Invalid destination filename ${t_dst}`);
    if (areFilesEqual(src, dst)) return Terminal.error("src and dst cannot be the same");

    const srcExt = src.slice(src.lastIndexOf("."));
    const dstExt = dst.slice(dst.lastIndexOf("."));
    if (srcExt !== dstExt) return Terminal.error("src and dst must have the same extension.");

    if (!isScriptFilename(src) && !src.endsWith(".txt")) {
      return Terminal.error("cp only works for scripts and .txt files");
    }

    // Scp for txt files
    if (src.endsWith(".txt")) {
      let txtFile = null;
      for (let i = 0; i < server.textFiles.length; ++i) {
        if (areFilesEqual(server.textFiles[i].fn, src)) {
          txtFile = server.textFiles[i];
          break;
        }
      }

      if (txtFile === null) {
        return Terminal.error("No such file exists!");
      }

      const tRes = server.writeToTextFile(dst, txtFile.text);
      if (!tRes.success) {
        Terminal.error("cp failed");
        return;
      }
      if (tRes.overwritten) {
        Terminal.print(`WARNING: ${dst} already exists and will be overwritten`);
        Terminal.print(`${dst} overwritten`);
        return;
      }
      Terminal.print(`${dst} copied`);
      return;
    }

    // Get the current script
    const sourceScript = server.scripts.get(src);
    if (!sourceScript) return Terminal.error("cp failed. No such script exists");

    const sRes = server.writeToScriptFile(dst, sourceScript.code);
    if (!sRes.success) {
      Terminal.error(`cp failed`);
      return;
    }
    if (sRes.overwritten) {
      Terminal.print(`WARNING: ${dst} already exists and will be overwritten`);
      Terminal.print(`${dst} overwritten`);
      return;
    }
    Terminal.print(`${dst} copied`);
  } catch (e) {
    Terminal.error(e + "");
  }
}
