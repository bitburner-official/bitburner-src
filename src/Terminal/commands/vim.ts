import { Settings } from "../../Settings/Settings";
import { BaseServer } from "../../Server/BaseServer";

import { commonEditor } from "./common/editor";

export function vim(args: (string | number | boolean)[], server: BaseServer): void {
  Settings.MonacoVim = true;
  return commonEditor("vim", { args, server });
}
