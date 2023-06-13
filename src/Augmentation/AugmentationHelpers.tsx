import { Augmentation, AugmentationCtorParams } from "./Augmentation";
import { Augmentations } from "./Augmentations";
import { PlayerOwnedAugmentation } from "./PlayerOwnedAugmentation";
import { AugmentationName } from "@enums";

import { CONSTANTS } from "../Constants";
import { Factions } from "../Faction/Factions";
import { Player } from "@player";
import { prestigeAugmentation } from "../Prestige";

import { dialogBoxCreate } from "../ui/React/DialogBox";
import { Router } from "../ui/GameRoot";
import { Page } from "../ui/Router";
import { mergeMultipliers } from "../PersonObjects/Multipliers";
import { getUnstableCircadianModulatorParams } from "./CircadianModulator";
import { getRecordValues } from "../Types/Record";

function initCircadianModulator() {
  const params = getUnstableCircadianModulatorParams() as AugmentationCtorParams;
  params.name = AugmentationName.UnstableCircadianModulator;
  Augmentations[AugmentationName.UnstableCircadianModulator] = new Augmentation(params);
}

function initAugmentations(): void {
  initCircadianModulator();
  for (const faction of getRecordValues(Factions)) faction.augmentations = [];
  for (const aug of getRecordValues(Augmentations)) aug.addToFactions(aug.factions);
  Player.reapplyAllAugmentations();
}

export function getBaseAugmentationPriceMultiplier(): number {
  return CONSTANTS.MultipleAugMultiplier * [1, 0.96, 0.94, 0.93][Player.sourceFileLvl(11)];
}
export function getGenericAugmentationPriceMultiplier(): number {
  return Math.pow(getBaseAugmentationPriceMultiplier(), Player.queuedAugmentations.length);
}

function applyAugmentation(aug: PlayerOwnedAugmentation, reapply = false): void {
  const staticAugmentation = Augmentations[aug.name];

  // Apply multipliers
  Player.mults = mergeMultipliers(Player.mults, staticAugmentation.mults);

  // Special logic for Congruity Implant
  if (aug.name === AugmentationName.CongruityImplant && !reapply) {
    Player.entropy = 0;
    Player.applyEntropy(Player.entropy);
  }

  // Special logic for NeuroFlux Governor
  const ownedNfg = Player.augmentations.find((pAug) => pAug.name === AugmentationName.NeuroFluxGovernor);
  if (aug.name === AugmentationName.NeuroFluxGovernor && !reapply && ownedNfg) {
    ownedNfg.level = aug.level;
    return;
  }

  // Push onto Player's Augmentation list
  if (!reapply) {
    const ownedAug = new PlayerOwnedAugmentation(aug.name);

    Player.augmentations.push(ownedAug);
  }
}

function installAugmentations(force?: boolean): boolean {
  if (Player.queuedAugmentations.length == 0 && !force) {
    dialogBoxCreate("You have not purchased any Augmentations to install!");
    return false;
  }
  let augmentationList = "";
  let nfgIndex = -1;
  for (let i = Player.queuedAugmentations.length - 1; i >= 0; i--) {
    if (Player.queuedAugmentations[i].name === AugmentationName.NeuroFluxGovernor) {
      nfgIndex = i;
      break;
    }
  }
  for (let i = 0; i < Player.queuedAugmentations.length; ++i) {
    const ownedAug = Player.queuedAugmentations[i];
    const aug = Augmentations[ownedAug.name];
    if (aug == null) {
      console.error(`Invalid augmentation: ${ownedAug.name}`);
      continue;
    }

    applyAugmentation(Player.queuedAugmentations[i]);
    if (ownedAug.name === AugmentationName.NeuroFluxGovernor && i !== nfgIndex) continue;

    let level = "";
    if (ownedAug.name === AugmentationName.NeuroFluxGovernor) {
      level = ` - ${ownedAug.level}`;
    }
    augmentationList += aug.name + level + "\n";
  }
  Player.queuedAugmentations = [];
  if (!force) {
    dialogBoxCreate(
      "You slowly drift to sleep as scientists put you under in order " +
        "to install the following Augmentations:\n" +
        augmentationList +
        "\nYou wake up in your home...you feel different...",
    );
  }
  prestigeAugmentation();
  Router.toPage(Page.Terminal);
  return true;
}

function augmentationExists(name: string): boolean {
  return Object.hasOwn(Augmentations, name);
}

export function isRepeatableAug(aug: Augmentation | string): boolean {
  const augName = typeof aug === "string" ? aug : aug.name;
  return augName === AugmentationName.NeuroFluxGovernor;
}

export { installAugmentations, initAugmentations, applyAugmentation, augmentationExists };
