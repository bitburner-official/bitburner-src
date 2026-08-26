import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { matchScriptPathUnanchored } from "../../utils/helpers/scriptKey";
import libarg from "arg";

export function ps(args: (string | number | boolean)[], server: BaseServer): undefined {
  let flags: {
    "--grep": string;
  };
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    flags = libarg(
      {
        "--grep": String,
        "-g": "--grep",
      },
      { argv: args },
    );
  } catch (e) {
    // catch passing only -g / --grep with no string to use as the search
    Terminal.error("ps 命令用法不正确。用法：ps [-g, --grep pattern]");
    return;
  }
  let pattern = flags["--grep"];
  if (!pattern) {
    pattern = ".*"; // Match anything
  }
  const re = matchScriptPathUnanchored(pattern);
  for (const [k, byPid] of server.runningScriptMap) {
    if (!re.test(k)) continue;
    for (const rsObj of byPid.values()) {
      const res = `(PID - ${rsObj.pid}) ${rsObj.filename} ${rsObj.args.join(" ")}`;
      Terminal.print(res);
    }
  }
}
