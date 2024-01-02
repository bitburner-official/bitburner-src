import { Terminal } from "../../../Terminal";

export function sendDeprecationNotice() {
  return Terminal.warn(
    "NOTICE: NS1 (.script) scripts are deprecated and will be removed in a future update." +
    " Migrate to NS2 (.js) scripts instead."
  );
}
