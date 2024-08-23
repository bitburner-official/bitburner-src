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

function giveSourceFile(bitNodeNumber: number): void {
  const sourceFileKey = "SourceFile" + bitNodeNumber.toString();
  const sourceFile = SourceFiles[sourceFileKey];
  if (!sourceFile) {
    console.error(`Could not find source file for Bit node: ${bitNodeNumber}`);
    return;
  }

  // Check if player already has this source file
  let lvl = Player.sourceFileLvl(bitNodeNumber);

  if (lvl > 0) {
    if (lvl >= 3 && bitNodeNumber !== 12) {
      dialogBoxCreate(
        `The Source-File for the BitNode you just destroyed, ${sourceFile.name}, is already at max level!`,
      );
    } else {
      lvl++;
      Player.sourceFiles.set(bitNodeNumber, lvl);
      dialogBoxCreate(`${sourceFile.name} was upgraded to level ${lvl} for destroying its corresponding BitNode!`);
    }
  } else {
    Player.sourceFiles.set(bitNodeNumber, 1);
    if (bitNodeNumber === 5 && Player.skills.intelligence === 0) {
      Player.skills.intelligence = 1;
    }
    dialogBoxCreate(
      <>
        You received a Source-File for destroying a BitNode!
        <br />
        <br />
        {sourceFile.name}
        <br />
        <br />
        {sourceFile.info}
      </>,
    );
  }
}

export function enterBitNode(
  isFlume: boolean,
  destroyedBitNode: number,
  newBitNode: number,
  bitNodeOptions: BitNodeOptions,
): void {
  if (!isFlume) {
    giveSourceFile(destroyedBitNode);
  } else if (Player.sourceFileLvl(5) === 0 && newBitNode !== 5) {
    Player.skills.intelligence = 0;
    Player.exp.intelligence = 0;
  }
  if (newBitNode === 5 && Player.skills.intelligence === 0) {
    Player.skills.intelligence = 1;
  }
  // Set new Bit Node
  Player.bitNodeN = newBitNode;

  // Set BitNode options
  try {
    setBitNodeOptions(bitNodeOptions);
  } catch (error) {
    dialogBoxCreate(
      <>
        Invalid BitNode options. This is a bug. Please report it to developers.
        <br />
        <br />
        {error instanceof Error ? error.stack : String(error)}
      </>,
    );
    // Use default options
    setBitNodeOptions(getDefaultBitNodeOptions());
  }

  prestigeSourceFile(isFlume);

  if (newBitNode === 6) {
    Router.toPage(Page.BladeburnerCinematic);
  } else {
    Router.toPage(Page.Terminal);
  }
}
