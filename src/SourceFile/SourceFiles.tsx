import React from "react";
import { SourceFile } from "./SourceFile";
import { initBitNodes } from "../BitNode/BitNode";
import { FactionName } from "@enums";

export const SourceFiles: Record<string, SourceFile> = {};
/** Engine initializer for SourceFiles, BitNodes, and BitNodeMultipliers. Run once at engine load. */
export function initSourceFiles() {
  initBitNodes();
  SourceFiles.SourceFile1 = new SourceFile(
    1,
    (
      <>
        This Source-File lets the player start with 32GB of RAM on their home computer when entering a new BitNode and
        increases all of the player's multipliers by:
        <ul>
          <li>Level 1: 16%</li>
          <li>Level 2: 24%</li>
          <li>Level 3: 28%</li>
        </ul>
      </>
    ),
  );
  SourceFiles.SourceFile2 = new SourceFile(
    2,
    (
      <>
        This Source-File allows you to form gangs in other BitNodes once your karma decreases to a certain value. It
        also increases your crime success rate, crime money, and charisma multipliers by:
        <ul>
          <li>Level 1: 24%</li>
          <li>Level 2: 36%</li>
          <li>Level 3: 42%</li>
        </ul>
      </>
    ),
  );
  SourceFiles.SourceFile3 = new SourceFile(
    3,
    (
      <>
        This Source-File lets you create corporations on other BitNodes (although some BitNodes will disable this
        mechanic) and level 3 permanently unlocks the full API. This Source-File also increases your charisma and
        company salary multipliers by:
        <ul>
          <li>Level 1: 8%</li>
          <li>Level 2: 12%</li>
          <li>Level 3: 14%</li>
        </ul>
      </>
    ),
  );
  SourceFiles.SourceFile4 = new SourceFile(
    4,
    (
      <>
        This Source-File lets you access and use the Singularity functions in other BitNodes. Each level of this
        Source-File reduces the RAM cost of singularity functions:
        <ul>
          <li>Level 1: 16x</li>
          <li>Level 2: 4x</li>
          <li>Level 3: 1x</li>
        </ul>
      </>
    ),
  );
  SourceFiles.SourceFile5 = new SourceFile(
    5,
    (
      <>
        This Source-File grants you a new stat called Intelligence. Intelligence is unique because it is permanent and
        persistent (it never gets reset back to 1). However, gaining Intelligence experience is much slower than other
        stats. Higher Intelligence levels will boost your production for many actions in the game.
        <br />
        <br />
        In addition, this Source-File will unlock:
        <ul>
          <li>
            <code>getBitNodeMultipliers()</code> Netscript function
          </li>
          <li>Permanent access to Formulas.exe</li>
          <li>
            Access to BitNode multiplier information on the <b>Stats</b> page
          </li>
        </ul>
        It will also raise all of your hacking-related multipliers by:
        <ul>
          <li>Level 1: 8%</li>
          <li>Level 2: 12%</li>
          <li>Level 3: 14%</li>
        </ul>
      </>
    ),
  );
  SourceFiles.SourceFile6 = new SourceFile(
    6,
    (
      <>
        This Source-File allows you to access the NSA's {FactionName.Bladeburners} division in other BitNodes. In
        addition, this Source-File will raise both the level and experience gain rate of all your combat stats by:
        <ul>
          <li>Level 1: 8%</li>
          <li>Level 2: 12%</li>
          <li>Level 3: 14%</li>
        </ul>
      </>
    ),
  );
  SourceFiles.SourceFile7 = new SourceFile(
    7,
    (
      <>
        This Source-File allows you to access the {FactionName.Bladeburners} Netscript API in other BitNodes. In
        addition, this Source-File will increase all of your {FactionName.Bladeburners} multipliers by:
        <ul>
          <li>Level 1: 8%</li>
          <li>Level 2: 12%</li>
          <li>Level 3: 14%</li>
        </ul>
      </>
    ),
  );
  SourceFiles.SourceFile8 = new SourceFile(
    8,
    (
      <>
        This Source-File grants the following benefits:
        <ul>
          <li>Level 1: Permanent access to WSE and TIX API</li>
          <li>Level 2: Ability to short stocks in other BitNodes</li>
          <li>Level 3: Ability to use limit/stop orders in other BitNodes</li>
        </ul>
        This Source-File also increases your hacking growth multipliers by:
        <ul>
          <li>Level 1: 12%</li>
          <li>Level 2: 18%</li>
          <li>Level 3: 21%</li>
        </ul>
      </>
    ),
  );
  SourceFiles.SourceFile9 = new SourceFile(
    9,
    (
      <>
        This Source-File grants the following benefits:
        <ul>
          <li>Level 1: Permanently unlocks the Hacknet Server in other BitNodes</li>
          <li>Level 2: You start with 128GB of RAM on your home computer when entering a new BitNode</li>
          <li>Level 3: Grants a highly-upgraded Hacknet Server when entering a new BitNode</li>
        </ul>
        (Note that the Level 3 effect of this Source-File only applies when entering a new BitNode, NOT when installing
        augmentations)
        <br />
        <br />
        This Source-File also increases hacknet production and reduces hacknet costs by:
        <ul>
          <li>Level 1: 12%</li>
          <li>Level 2: 18%</li>
          <li>Level 3: 21%</li>
        </ul>
      </>
    ),
  );
  SourceFiles.SourceFile10 = new SourceFile(
    10,
    (
      <>
        This Source-File unlocks Sleeve and Grafting API in other BitNodes. Each level of this Source-File also grants
        you a Sleeve.
      </>
    ),
  );
  SourceFiles.SourceFile11 = new SourceFile(
    11,
    (
      <>
        This Source-File makes it so that company favor increases BOTH the player's salary and reputation gain rate at
        that company by 1% per favor (rather than just the reputation gain). This Source-File also increases the
        player's company salary and reputation gain multipliers by:
        <ul>
          <li>Level 1: 32%</li>
          <li>Level 2: 48%</li>
          <li>Level 3: 56%</li>
        </ul>
        It also reduces the price increase for every augmentation bought by:
        <ul>
          <li>Level 1: 4%</li>
          <li>Level 2: 6%</li>
          <li>Level 3: 7%</li>
        </ul>
      </>
    ),
  );
  SourceFiles.SourceFile12 = new SourceFile(
    12,
    <>This Source-File lets the player start with Neuroflux Governor equal to the level of this Source-File.</>,
  );
  SourceFiles.SourceFile13 = new SourceFile(
    13,
    (
      <>
        This Source-File lets the {FactionName.ChurchOfTheMachineGod} appear in other BitNodes.
        <br />
        <br />
        Each level of this Source-File increases the size of Stanek's Gift.
      </>
    ),
  );
  SourceFiles.SourceFile14 = new SourceFile(
    14,
    (
      <>
        This Source-File grants the following benefits:
        <ul>
          <li>Level 1: 100% increased stat multipliers from Node Power</li>
          <li>Level 2: Permanently unlocks the go.cheat API</li>
          <li>Level 3: 25% additive increased success rate for the go.cheat API</li>
        </ul>
        This Source-File also increases the maximum favor you can gain for each faction from IPvGO to:
        <ul>
          <li>Level 1: 80</li>
          <li>Level 2: 100</li>
          <li>Level 3: 120</li>
        </ul>
      </>
    ),
  );
}
