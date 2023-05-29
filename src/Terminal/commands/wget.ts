import $ from "jquery";

import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { BaseServer } from "../../Server/BaseServer";
import { Terminal } from "../../Terminal";

export function wget(args: (string | number | boolean)[], server: BaseServer): void {
  if (args.length !== 2) {
    Terminal.error("Incorrect usage of wget command. Usage: wget [url] [target file]");
    return;
  }

  const url = args[0] + "";
  const target = Terminal.getFilepath(args[1] + "");
  if (!target || (!hasScriptExtension(target) && !hasTextExtension(target))) {
    return Terminal.error(`wget failed: Invalid target file. Target file must be script or text file`);
  }
  $.get(
    url,
    function (data: unknown) {
      let res;
      if (hasTextExtension(target)) {
        res = server.writeToTextFile(target, String(data));
      } else {
        res = server.writeToScriptFile(target, String(data));
      }
      if (res.overwritten) {
        return Terminal.print(`wget successfully retrieved content and overwrote ${target}`);
      }
      return Terminal.print(`wget successfully retrieved content to new file ${target}`);
    },
    "text",
  ).fail(function (e) {
    return Terminal.error("wget failed: " + JSON.stringify(e));
  });
}
