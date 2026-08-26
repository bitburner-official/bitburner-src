import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { formatRam } from "../../ui/formatNumber";

export function top(args: (string | number | boolean)[], server: BaseServer): undefined {
  if (args.length !== 0) {
    Terminal.error("top 命令用法不正确。用法：top");
    return;
  }

  // Headers
  const scriptWidth = 40;
  const pidWidth = 10;
  const threadsWidth = 16;

  const scriptTxt = "脚本";
  const pidTxt = "PID";
  const threadsTxt = "线程";
  const ramTxt = "RAM 占用";

  const spacesAfterScriptTxt = " ".repeat(scriptWidth - scriptTxt.length);
  const spacesAfterPidTxt = " ".repeat(pidWidth - pidTxt.length);
  const spacesAfterThreadsTxt = " ".repeat(threadsWidth - threadsTxt.length);

  const headers = `${scriptTxt}${spacesAfterScriptTxt}${pidTxt}${spacesAfterPidTxt}${threadsTxt}${spacesAfterThreadsTxt}${ramTxt}`;

  Terminal.print(headers);

  const currRunningScripts = server.runningScriptMap;
  // Iterate through scripts on current server
  for (const byPid of currRunningScripts.values()) {
    for (const script of byPid.values()) {
      // Calculate name padding
      const numSpacesScript = Math.max(0, scriptWidth - script.filename.length);
      const spacesScript = " ".repeat(numSpacesScript);

      // Calculate PID padding
      const numSpacesPid = Math.max(0, pidWidth - (script.pid + "").length);
      const spacesPid = " ".repeat(numSpacesPid);

      // Calculate thread padding
      const numSpacesThread = Math.max(0, threadsWidth - (script.threads + "").length);
      const spacesThread = " ".repeat(numSpacesThread);

      // Calculate and transform RAM usage
      const ramUsage = formatRam(script.ramUsage * script.threads);

      const entry = [script.filename, spacesScript, script.pid, spacesPid, script.threads, spacesThread, ramUsage].join(
        "",
      );
      Terminal.print(entry);
    }
  }
}
