// General reusable tools for API breaks

import type { ScriptFilePath } from "../../Paths/ScriptFilePath";
import type { Script } from "../../Script/Script";
import { Player } from "@player";
import { GetAllServers } from "../../Server/AllServers";
import { resolveTextFilePath } from "../../Paths/TextFilePath";
import { dialogBoxCreate as dialogBoxCreateOriginal } from "../../ui/React/DialogBox";
import { Terminal } from "../../Terminal";

// Temporary until fixing alerts manager to store alerts outside of react scope
const dialogBoxCreate = (text: string) => setTimeout(() => dialogBoxCreateOriginal(text), 2000);

/** For a single server, map of script filepath to an array of line numbers where impacted functions were detected */
type ScriptImpactMap = Map<ScriptFilePath, number[]>;

/** For an overall API break, map of server hostnames to an array of impacted scripts */
type ImpactMap = Map<string, ScriptImpactMap>;

export interface APIBreakInfo {
  /** The API functions impacted by the API break */
  brokenFunctions: string[];
  /** Info that should be shown to the player, alongside the list of impacted scripts */
  info: string;
}

function getImpactedLines(script: Script, brokenFunctions: string[]): number[] | null {
  const impactedLines: number[] = [];
  script.content.split("\n").forEach((line, i) => {
    for (const brokenFunction of brokenFunctions) {
      if (line.includes(brokenFunction)) return impactedLines.push(i + 1);
    }
  });
  return impactedLines.length ? impactedLines : null;
}

/** Returns a map keyed by all ser */
function getImpactMap(brokenFunctions: string[]): ImpactMap | null {
  const returnMap = new Map<string, ScriptImpactMap>();
  for (const server of GetAllServers()) {
    const impactedScripts = new Map<ScriptFilePath, number[]>();
    for (const [filename, script] of server.scripts) {
      const impactedLines = getImpactedLines(script, brokenFunctions);
      if (impactedLines) impactedScripts.set(filename, impactedLines);
    }
    if (impactedScripts.size) returnMap.set(server.hostname, impactedScripts);
  }
  return returnMap.size ? returnMap : null;
}

/** Show the player a dialog for their API breaks, and save an info file for the player to review later */
export function showAPIBreaks(version: string, ...breakInfos: APIBreakInfo[]) {
  const details = [];
  for (const breakInfo of breakInfos) {
    const impactMap = getImpactMap(breakInfo.brokenFunctions);
    if (!impactMap) continue;
    details.push(
      breakInfo.info +
        `\n\nUsage of the following functions may have been affected:\n${breakInfo.brokenFunctions.join("\n")}\n\n` +
        [...impactMap]
          .map(
            ([hostname, scriptImpactMap]) =>
              `Potentially affected files on server ${hostname} (with line numbers):\n` +
              [...scriptImpactMap]
                .map(
                  ([filename, lineNumbers]) =>
                    `${filename}: (Line number${lineNumbers.length > 1 ? "s" : ""}: ${lineNumbers.join(", ")})`,
                )
                .join("\n"),
          )
          .join("\n\n"),
    );
  }
  if (!details.length) return;
  const textFileName = resolveTextFilePath(`APIBreakInfo-${version}.txt`);
  if (!textFileName) throw new Error("Version string created an invalid API break file name");
  Player.getHomeComputer().writeToTextFile(
    textFileName,
    `API BREAK INFO FOR ${version}\n\n${details.join("\n\n\n\n")}`,
  );
  Terminal.warn(`AN API BREAK FROM VERSION ${version} MAY HAVE AFFECTED SOME OF YOUR SCRIPTS.`);
  Terminal.warn(`INFORMATION ABOUT THIS POTENTIAL IMPACT HAS BEEN LOGGED IN ${textFileName} ON YOUR HOME COMPUTER.`);
  dialogBoxCreate(
    `SOME OF YOUR SCRIPTS HAVE POTENTIALLY BEEN IMPACTED BY AN API BREAK, DUE TO CHANGES IN VERSION ${version}\n\n` +
      "The following dialog boxes will provide details of the potential impact to your scripts.\n" +
      `A file with these details has also been saved on your home computer under filename ${textFileName}.`,
  );
  details.forEach((detail, i) => {
    dialogBoxCreate(`API BREAK VERSION ${version} DETAILS ${i + 1} of ${details.length}\n\n${detail}`);
  });
}
