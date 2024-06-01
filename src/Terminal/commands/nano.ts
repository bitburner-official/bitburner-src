import { Settings } from "../../Settings/Settings";
import { BaseServer } from "../../Server/BaseServer";

import { commonEditor } from "./common/editor";

export function nano(args: (string | number | boolean)[], server: BaseServer): void {
  Settings.MonacoVim = false;
  return commonEditor("nano", { args, server });
}
