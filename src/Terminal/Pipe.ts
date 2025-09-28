import { TerminalEvents } from "./TerminalEvents";
import { Terminal } from "../Terminal";

TerminalEvents.subscribe(() => {
  if (Terminal.outputToBeProcessed.length === 0 || Terminal.action) {
    return;
  }

  // TODO: handle echo

  // TODO: handle grep

  // TODO: handle run / script

  // TODO: handle file

  // TODO: handle downstream pipe(s)
});
