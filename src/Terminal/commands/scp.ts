import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { GetServer } from "../../Server/AllServers";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { isMember } from "../../utils/EnumHelper";
import { LiteratureName } from "@enums";
import { ContentFile } from "../../Paths/ContentFile";

export function scp(args: (string | number | boolean)[], server: BaseServer): void {
  if (args.length < 2) {
    return Terminal.error("Incorrect usage of scp command. Usage: scp [source filename] [destination hostname]");
  }

  // Validate destination server
  const destHostname = String(args.pop());
  const destServer = GetServer(destHostname);
  if (!destServer) return Terminal.error(`Invalid destination server: ${destHostname}`);

  // Validate filepaths
  const filenames = args.map(String);
  const files: (LiteratureName | ContentFile)[] = [];

  // File validation loop, handle all errors before copying any files
  for (const filename of filenames) {
    const path = Terminal.getFilepath(filename);
    if (!path) return Terminal.error(`Invalid file path: ${filename}`);
    // Validate .lit files
    if (path.endsWith(".lit")) {
      if (!isMember("LiteratureName", path) || !server.messages.includes(path)) {
        return Terminal.error(`scp failed: ${path} does not exist on server ${server.hostname}`);
      }
      files.push(path);
      continue;
    }
    // Error for invalid filetype
    if (!hasScriptExtension(path) && !hasTextExtension(path)) {
      return Terminal.error(
        `scp failed: ${path} has invalid extension. scp only works for scripts (.js, .jsx, .ts, .tsx, .script), text files (.txt, .json), and literature files (.lit)`,
      );
    }
    const sourceContentFile = server.getContentFile(path);
    if (!sourceContentFile) return Terminal.error(`scp failed: ${path} does not exist on server ${server.hostname}`);
    files.push(sourceContentFile);
  }

  // Actually copy the files (no more errors possible)
  for (const file of files) {
    // Lit files, entire "file" is just the name
    if (isMember("LiteratureName", file)) {
      if (destServer.messages.includes(file)) {
        Terminal.print(`${file} was already on ${destHostname}, file skipped`);
        continue;
      }
      destServer.messages.push(file);
      Terminal.print(`${file} copied to ${destHostname}`);
      continue;
    }

    // Content files (script and txt)
    const { filename, content } = file;
    const { overwritten } = destServer.writeToContentFile(filename, content);
    if (overwritten) Terminal.warn(`${filename} already existed on ${destHostname} and was overwritten`);
    else Terminal.print(`${filename} copied to ${destHostname}`);
  }
}
