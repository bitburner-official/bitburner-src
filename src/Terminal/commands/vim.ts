import type { BaseServer } from "../../Server/BaseServer";

import { commonEditor } from "./common/editor";

export function vim(args: (string | number | boolean)[], server: BaseServer): undefined {
  commonEditor("vim", { args, server, vim: true });
}
