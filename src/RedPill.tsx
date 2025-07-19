/** Implementation for what happens when you destroy a BitNode */
import React from "react";
import { Player } from "@player";
import { type BitNodeOptions } from "@nsdefs";
import { SourceFiles } from "./SourceFile/SourceFiles";

import { dialogBoxCreate } from "./ui/React/DialogBox";
import { Router } from "./ui/GameRoot";
import { Page } from "./ui/Router";
import { prestigeSourceFile } from "./Prestige";
import { getDefaultBitNodeOptions, setBitNodeOptions } from "./BitNode/BitNodeUtils";
import { prestigeWorkerScripts } from "./NetscriptWorker";
import { exceptionAlert } from "./utils/helpers/exceptionAlert";

function giveSourceFile(bitNodeNumber: number): void {
  const sourceFileKey = "SourceFile" + bitNodeNumber.toString();
  const sourceFile = SourceFiles[sourceFileKey];

  if (!sourceFile) {
    console.error(`Could not find source file for BitNode: ${bitNodeNumber}`);
    return;
  }

  const currentLevel = Player.sourceFileLvl(bitNodeNumber);

  if (currentLevel > 0) {
    if (currentLevel >= 3 && bitNodeNumber !== 12) {
      dialogBoxCreate(
        `The Source-File for the BitNode you just destroyed, ${sourceFile.name}, is already at max level!`,
      );
    } else {
      const upgradedLevel = currentLevel + 1;
      Player.sourceFiles.set(bitNodeNumber, upgradedLevel);
      dialogBoxCreate(
        `🎖️ ${sourceFile.name} was upgraded to level ${upgradedLevel} for destroying its corresponding BitNode!`,
      );
    }
  } else {
    Player.sourceFiles.set(bitNodeNumber, 1);

    if (bitNodeNumber === 5 && Player.skills.intelligence === 0) {
      Player.skills.intelligence = 1;
    }

    dialogBoxCreate(
      <>
        <strong>🎉 You received a Source-File for destroying a BitNode!</strong>
        <br />
        <br />
        <strong>{sourceFile.name}</strong>
        <br />
        <br />
        {sourceFile.info}
      </>,
    );
  }
}

function resetIntelligenceIfNeeded(isFlume: boolean, destroyedBitNode: number, newBitNode: number): void {
  if (!isFlume) return;

  // Remove intelligence if the player is fluming and hasn't earned SourceFile 5
  if (Player.sourceFileLvl(5) === 0 && newBitNode !== 5) {
    Player.skills.intelligence = 0;
    Player.exp.intelligence = 0;
  }

  // If entering BitNode 5, give them 1 intelligence point
  if (newBitNode === 5 && Player.skills.intelligence === 0) {
    Player.skills.intelligence = 1;
  }
}

function navigateAfterPrestige(newBitNode: number): void {
  if (newBitNode === 6) {
    Router.toPage(Page.BladeburnerCinematic);
  } else {
    Router.toPage(Page.Terminal);
  }
}

export function enterBitNode(
  isFlume: boolean,
  destroyedBitNode: number,
  newBitNode: number,
  bitNodeOptions: BitNodeOptions,
): void {
  // Kill all running scripts before prestige
  prestigeWorkerScripts();

  if (!isFlume) {
    giveSourceFile(destroyedBitNode);
  }

  resetIntelligenceIfNeeded(isFlume, destroyedBitNode, newBitNode);

  // Set the new BitNode
  Player.bitNodeN = newBitNode;

  // Set BitNode options with error fallback
  try {
    setBitNodeOptions(bitNodeOptions);
  } catch (error) {
    exceptionAlert(error);
    setBitNodeOptions(getDefaultBitNodeOptions());
  }

  // Apply prestige
  prestigeSourceFile(isFlume);

  // Navigate to next page
  navigateAfterPrestige(newBitNode);
}
