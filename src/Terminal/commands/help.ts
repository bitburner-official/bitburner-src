import { Terminal } from "../../Terminal";
import { TerminalHelpText, HelpTexts } from "../HelpText";

export function help(args: (string | number | boolean)[]): undefined {
  if (args.length !== 0 && args.length !== 1) {
    Terminal.error("Incorrect usage of help command. Usage: help");
    return;
  }
  if (args.length === 0) {
    joinParagraphsIntoSingleLines(TerminalHelpText).forEach((line) => Terminal.print(line));
  } else {
    const cmd = args[0] + "";
    const txt = HelpTexts[cmd];
    if (txt == null) {
      Terminal.error("No help topics match '" + cmd + "'");
      return;
    }
    joinParagraphsIntoSingleLines(txt).forEach((t) => Terminal.print(t));
  }
}

/**
 * Concatenates sequences of lines that begin with alphanumerics into single lines. That way, the
 * browser window handles paragraph splitting and wrapping, rather than us doing it manually.
 * Splits paragraphs if a line begins with a space. If a line begins with a non-space and
 * non-alphanumeric (like a paragraph that starts with "--grep"), this only hoovers it into the
 * lines above if a subsequent line starts with an alphanumeric and no intervening lines begin with
 * a space. If no subsequent line starts with an alphanumeric before the next paragraph beginning
 * with a space, it just treats the line as a stand-alone paragraph.
 */

export function joinParagraphsIntoSingleLines(lines: string[]): string[] {
  const startsWithAlphanumeric = /^[0-9a-zA-Z]/;
  const startsWithSpace = /^\s/;

  const result: string[] = [];

  for (let i = 0; i < lines.length; ) {
    if (!startsWithAlphanumeric.test(lines[i])) {
      result.push(lines[i]);
      i++;
      continue;
    }

    let lastLineOfParagraph = i;
    let j = i + 1;
    while (lines[j] !== "" && !startsWithSpace.test(lines[j])) {
      if (startsWithAlphanumeric.test(lines[j])) lastLineOfParagraph = j;
      j++;
    }

    result.push(
      lines
        .slice(i, lastLineOfParagraph + 1)
        .map((line) => line.trim())
        .join(" ")
        .replace(/\s+/g, " "),
    );

    i = lastLineOfParagraph + 1;
  }

  return result;
}
