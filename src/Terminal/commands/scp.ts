import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { GetReachableServer } from "../../Server/AllServers";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { isMember } from "../../utils/EnumHelper";
import { LiteratureName } from "@enums";
import { ContentFile } from "../../Paths/ContentFile";

export function scp(args: (string | number | boolean)[], server: BaseServer): undefined {
  if (args.length < 2) {
    Terminal.error("Incorrect usage of scp command. Usage: scp [source filename] [destination hostname]");
    return;
  }

  // Validate destination server
  const destHostname = String(args.pop());
  const destServer = GetReachableServer(destHostname);
  if (!destServer) {
    Terminal.error(`Invalid destination server: ${destHostname}`);
    return;
  }

  // Validate filepaths
  const filenames = args.map(String);
  const files: (LiteratureName | ContentFile)[] = [];

  // File validation loop, handle all errors before copying any files
  for (const filename of filenames) {
    const path = Terminal.getFilepath(filename);
    if (!path) {
      Terminal.error(`Invalid file path: ${filename}`);
      return;
    }
    // Validate .lit files
    if (path.endsWith(".lit")) {
      if (!isMember("LiteratureName", path) || !server.messages.includes(path)) {
        Terminal.error(`scp failed: ${path} does not exist on server ${server.hostname}`);
        return;
      }
      files.push(path);
      continue;
    }
    // Error for invalid filetype
    if (!hasScriptExtension(path) && !hasTextExtension(path)) {
      Terminal.error(
        `scp failed: ${path} has invalid extension. scp only works for scripts (.js, .jsx, .ts, .tsx), text files (.txt, .json, .css), and literature files (.lit)`,
      );
      return;
    }
    const sourceContentFile = server.getContentFile(path);
    if (!sourceContentFile) {
      Terminal.error(`scp failed: ${path} does not exist on server ${server.hostname}`);
      return;
    }
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
