// General reusable tools for API breaks

import type { ScriptFilePath } from "../../Paths/ScriptFilePath";
import type { Script } from "../../Script/Script";
import { Player } from "@player";
import { GetAllServers } from "../../Server/AllServers";
import { resolveTextFilePath } from "../../Paths/TextFilePath";
import { dialogBoxCreate as dialogBoxCreateOriginal } from "../../ui/React/DialogBox";
import { Terminal } from "../../Terminal";
import { pluralize } from "../I18nUtils";

// Temporary until fixing alerts manager to store alerts outside of react scope
const dialogBoxCreate = (text: string) =>
  setTimeout(() => {
    dialogBoxCreateOriginal(text, { html: false, canBeDismissedEasily: false });
  }, 2000);

/** For a single server, map of script filepath to an array of line numbers where impacted functions were detected */
type ScriptImpactMap = Map<ScriptFilePath, number[]>;

/** For an overall API break, map of server hostnames to an array of impacted scripts */
type ImpactMap = Map<string, ScriptImpactMap>;

export interface VersionBreakingChange {
  additionalText?: string;
  apiBreakingChanges: APIBreakInfo[];
}

export interface APIBreakInfo {
  /** The API functions impacted by the API break */
  brokenAPIs: {
    name: string;
    migration?: {
      /** We may need to use a custom search value instead of name */
      searchValue: string | RegExp;
      replaceValue: string;
    };
  }[];
  /** Info that should be shown to the player, alongside the list of impacted scripts */
  info: string;
  /** If broken APIs can be safely migrated, we can skip displaying the warning */
  showWarning: boolean;
  /**
   * With a new version with breaking changes, the "showAPIBreaks" function checks all breaking changes and does 2
   * things with changes that affect the player's scripts:
   * - Write info of changes to a log file.
   * - Show a warning per change.
   * Note that we skip changes that do not affect the player's scripts. This is problematic with some breaking changes.
   *
   * With each breaking change in "brokenAPIs", we try to detect the affected code by using "name" or
   * "migration.searchValue". However, with some breaking changes, we cannot detect the affected code reliably via
   * "brokenAPIs". In this case, instead of skipping them, we always "process" that change (i.e., write info to the log
   * file and optionally show a warning that notifies the player about this change).
   */
  doNotSkip?: boolean;
}

function detectImpactAndMigrateLines(script: Script, brokenFunctions: APIBreakInfo["brokenAPIs"]): number[] | null {
  const impactedLines: number[] = [];
  const lines = script.content.split("\n");
  for (let i = 0; i < lines.length; ++i) {
    for (const brokenFunction of brokenFunctions) {
      if (
        !lines[i].includes(brokenFunction.name) &&
        (!brokenFunction.migration || !lines[i].match(brokenFunction.migration.searchValue))
      ) {
        continue;
      }
      impactedLines.push(i + 1);
      if (brokenFunction.migration) {
        lines[i] = lines[i].replaceAll(brokenFunction.migration.searchValue, brokenFunction.migration.replaceValue);
      }
    }
  }
  script.content = lines.join("\n");
  return impactedLines.length ? impactedLines : null;
}

/** Returns a map keyed by hostname */
function detectImpactAndMigrate(brokenFunctions: APIBreakInfo["brokenAPIs"]): {
  impactMap: ImpactMap;
  totalDetectedLines: number;
} {
  const returnMap = new Map<string, ScriptImpactMap>();
  let totalDetectedLines = 0;
  for (const server of GetAllServers()) {
    const impactedScripts = new Map<ScriptFilePath, number[]>();
    for (const [filename, script] of server.scripts) {
      const impactedLines = detectImpactAndMigrateLines(script, brokenFunctions);
      if (impactedLines) {
        totalDetectedLines += impactedLines.length;
        impactedScripts.set(filename, impactedLines);
      }
    }
    if (impactedScripts.size) {
      returnMap.set(server.hostname, impactedScripts);
    }
  }
  return { impactMap: returnMap, totalDetectedLines };
}

/** Show the player a dialog for their API breaks, and save an info file for the player to review later */
export function showAPIBreaks(version: string, { additionalText, apiBreakingChanges }: VersionBreakingChange) {
  const details: {
    apiBreakInfo: APIBreakInfo;
    text: string;
    totalDetectedLines: number;
    showWarning: boolean;
  }[] = [];
  let numberOfWarnings = 0;
  for (const breakInfo of apiBreakingChanges) {
    const scanResult = detectImpactAndMigrate(breakInfo.brokenAPIs);
    const impactMap = scanResult.impactMap;
    // Skip processing if we don't find any affected code and the breaking change does not enable the "doNotSkip" flag.
    if (impactMap.size === 0 && !breakInfo.doNotSkip) {
      continue;
    }
    let detailText = breakInfo.info;
    if (impactMap.size > 0) {
      detailText +=
        `\n\nUsage of the following functions may have been affected:\n${breakInfo.brokenAPIs
          .map((func) => func.name)
          .join("\n")}\n\n` +
        [...impactMap]
          .map(
            ([hostname, scriptImpactMap]) =>
              `Potentially affected files on server ${hostname} (with line numbers):\n` +
              [...scriptImpactMap]
                .map(
                  ([filename, lineNumbers]) =>
                    `${filename}: (${pluralize(lineNumbers.length, "Line number", undefined, true)}: ${lineNumbers.join(
                      ", ",
                    )})`,
                )
                .join("\n"),
          )
          .join("\n\n");
    }
    details.push({
      apiBreakInfo: breakInfo,
      text: detailText,
      totalDetectedLines: scanResult.totalDetectedLines,
      showWarning: breakInfo.showWarning,
    });
    if (breakInfo.showWarning) {
      ++numberOfWarnings;
    }
  }
  if (!details.length) {
    return;
  }
  const textFileName = resolveTextFilePath(`APIBreakInfo-${version}.txt`);
  if (!textFileName) {
    throw new Error("Version string created an invalid API break file name");
  }
  Player.getHomeComputer().writeToTextFile(
    textFileName,
    `API BREAK INFO FOR ${version}\n\n${details.map((detail) => detail.text).join("\n\n\n\n")}`,
  );
  Terminal.warn(`AN API BREAK FROM VERSION ${version} MAY HAVE AFFECTED SOME OF YOUR SCRIPTS.`);
  Terminal.warn(`INFORMATION ABOUT THIS POTENTIAL IMPACT HAS BEEN LOGGED IN ${textFileName} ON YOUR HOME COMPUTER.`);
  dialogBoxCreate(
    `SOME OF YOUR SCRIPTS HAVE POTENTIALLY BEEN IMPACTED BY AN API BREAK, DUE TO CHANGES IN VERSION ${version}\n\n` +
      "The following dialog boxes will provide details of the potential impact to your scripts.\n" +
      `A file with these details has also been saved on your home computer under filename ${textFileName}.` +
      (additionalText ? `\n\n${additionalText}` : ""),
  );
  let warningIndex = 0;
  for (const detail of details) {
    if (!detail.showWarning) {
      continue;
    }
    Terminal.warn(
      `\nAPI BREAK VERSION ${version} DETAILS ${warningIndex + 1} of ${numberOfWarnings}\n\n${
        detail.apiBreakInfo.info
      }` +
        /**
         * If we can detect the affected lines via apiBreakInfo.brokenAPIs, we will show the number of affected lines.
         * However, some breaking changes cannot be reliably detected, so we intentionally leave apiBreakInfo.brokenAPIs
         * empty. With these changes, the number of affected lines is always 0, but saying that there are no affected
         * lines is misleading, so we won't say anything about the number of affected lines.
         */
        (detail.apiBreakInfo.brokenAPIs.length > 0
          ? `\n\nWe found ${pluralize(detail.totalDetectedLines, "affected line")}.`
          : ""),
    );
    ++warningIndex;
  }
}
