import { Terminal } from "../../Terminal";
import { type TerminalAction, Cancellation } from "../TerminalAction";
import { BaseServer } from "../../Server/BaseServer";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { StdIO } from "../StdIO/StdIO";

// TODO-FICO: unit tests
export function wget(
  args: (string | number | boolean)[],
  server: BaseServer,
  stdIO: StdIO,
): undefined | TerminalAction {
  if (args.length === 2 && stdIO.stdout) {
    Terminal.fatal(
      "Incorrect use of wget command. Either specify a destination file or redirect the output with a pipe, not both.",
      stdIO,
    );
    return;
  }
  const [source, fileName] = args;

  const argCountIsValid = (args.length === 1 && stdIO.stdout) || args.length === 2;
  const arg1IsValid = typeof source === "string";
  const arg2IsValid = (args.length === 1 && stdIO.stdout) || typeof fileName === "string";
  if (!argCountIsValid || !arg1IsValid || !arg2IsValid) {
    Terminal.fatal("Incorrect usage of wget command. Usage: wget [url] [target file]", stdIO);
    return;
  }
  const target = Terminal.getFilepath(`${fileName}`);
  if (args.length === 2 && (!target || (!hasScriptExtension(target) && !hasTextExtension(target)))) {
    Terminal.fatal(`wget failed: Invalid target file. Target file must be a script file or a text file.`, stdIO);
    return;
  }

  const abort = new AbortController();
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
    abort.abort("Request cancelled");
  };

  const p = fetch(source, { signal: abort.signal })
    .then(async (response) => {
      if (response.status !== 200) {
        Terminal.fatal(`wget failed. HTTP code: ${response.status}.`, stdIO);
        return;
      }
      const content = await response.text();
      if (stdIO.stdout) {
        Terminal.printAndBypassPipes(`wget successfully retrieved content`);
        stdIO.write(content);
        stdIO.close();
        return;
      }

      if (target && (hasScriptExtension(target) || hasTextExtension(target))) {
        const writeResult = server.writeToContentFile(target, content);
        if (writeResult.overwritten) {
          Terminal.printAndBypassPipes(`wget successfully retrieved content and overwrote ${target}`);
        } else {
          Terminal.printAndBypassPipes(`wget successfully retrieved content to new file ${target}`);
        }
      }
    })
    .catch((reason) => {
      // Check the comment in wget of src\NetscriptFunctions.ts to see why we use Object.getOwnPropertyNames.
      Terminal.fatal(`wget failed: ${JSON.stringify(reason, Object.getOwnPropertyNames(reason))}`, stdIO);
      if (cancelled) {
        // We need to propogate a Cancellation error to abort any chained
        // commands higher up.
        throw new Cancellation("wget");
      }
    });

  let state = 0;
  return {
    cancel: cancel,
    finished: p,
    getProgressText: () => {
      const spinChar = "\\|/-"[state];
      state = (state + 1) % 4;
      return `[${spinChar.repeat(50)}]`;
    },
    stdIO,
  };
}
