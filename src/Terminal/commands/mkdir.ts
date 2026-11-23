import { Terminal } from "../../Terminal";
import { mkdirHelpText } from "../HelpText";

export function mkdir(): undefined {
  Terminal.warn(mkdirHelpText);
}
