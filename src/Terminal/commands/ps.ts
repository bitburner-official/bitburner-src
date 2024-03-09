import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { matchScriptPathUnanchored } from "../../utils/helpers/scriptKey";
import libarg from "arg";

export function ps(args: (string | number | boolean)[], server: BaseServer): void {
  let flags;
  try {
    flags = libarg(
      {
        "--grep": String,
        "-g": "--grep",
      },
      { argv: args },
    );
  } catch (e) {
    // catch passing only -g / --grep with no string to use as the search
    Terminal.error("Incorrect usage of ps command. Usage: ps [-g, --grep pattern]");
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
