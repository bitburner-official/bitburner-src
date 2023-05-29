import { LiteratureName } from "../../Literature/data/LiteratureNames";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { GetServer } from "../../Server/AllServers";
import { BaseServer } from "../../Server/BaseServer";
import { Terminal } from "../../Terminal";
import { checkEnum } from "../../utils/helpers/enum";

export function scp(args: (string | number | boolean)[], server: BaseServer): void {
  if (args.length !== 2) {
    return Terminal.error("Incorrect usage of scp command. Usage: scp [source filename] [destination hostname]");
  }
  const [scriptname, destHostname] = args.map((arg) => arg + "");

  const path = Terminal.getFilepath(scriptname);
  if (!path) return Terminal.error(`Invalid file path: ${scriptname}`);

  const destServer = GetServer(destHostname);
  if (!destServer) return Terminal.error(`Invalid destination server: ${args[1]}`);

  // Lit files
  if (path.endsWith(".lit")) {
    if (!checkEnum(LiteratureName, path) || !server.messages.includes(path)) {
      return Terminal.error(`No file at path ${path}`);
    }
    if (destServer.messages.includes(path)) return Terminal.print(`${path} was already on ${destHostname}`);
    destServer.messages.push(path);
    return Terminal.print(`Copied ${path} to ${destHostname}`);
  }

  if (!hasScriptExtension(path) && !hasTextExtension(path)) {
    return Terminal.error("scp only works for scripts, text files (.txt), and literature files (.lit)");
  }
  // Text or script
  const source = server.getContentFile(path);
  if (!source) return Terminal.error(`No file at path ${path}`);
  const { overwritten } = destServer.writeToContentFile(path, source.content);
  if (overwritten) Terminal.warn(`${path} already exists on ${destHostname} and will be overwritten`);
  Terminal.print(`${path} copied to ${destHostname}`);
}
