import { Augmentation } from "./Augmentation";
import { Augmentations } from "./Augmentations";
import { PlayerOwnedAugmentation } from "./PlayerOwnedAugmentation";
import { AugmentationName } from "@enums";

import { CONSTANTS } from "../Constants";
import { Player } from "@player";
import { prestigeAugmentation } from "../Prestige";

import { dialogBoxCreate } from "../ui/React/DialogBox";
import { Router } from "../ui/GameRoot";
import { Page } from "../ui/Router";
import { mergeMultipliers } from "../PersonObjects/Multipliers";
import { currentNodeMults } from "../BitNode/BitNodeMultipliers";

const soaAugmentationNames = [
  AugmentationName.BeautyOfAphrodite,
  AugmentationName.ChaosOfDionysus,
  AugmentationName.FloodOfPoseidon,
  AugmentationName.HuntOfArtemis,
  AugmentationName.KnowledgeOfApollo,
  AugmentationName.MightOfAres,
  AugmentationName.TrickeryOfHermes,
  AugmentationName.WKSharmonizer,
  AugmentationName.WisdomOfAthena,
];

export function getBaseAugmentationPriceMultiplier(): number {
  return CONSTANTS.MultipleAugMultiplier * [1, 0.96, 0.94, 0.93][Player.sourceFileLvl(11)];
}
export function getGenericAugmentationPriceMultiplier(): number {
  const queuedNonSoAAugmentationList = Player.queuedAugmentations.filter((augmentation) => {
    return !soaAugmentationNames.includes(augmentation.name);
  });
  return Math.pow(getBaseAugmentationPriceMultiplier(), queuedNonSoAAugmentationList.length);
}

export function applyAugmentation(aug: PlayerOwnedAugmentation, reapply = false): void {
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

export function installAugmentations(force?: boolean): boolean {
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

export function isRepeatableAug(aug: Augmentation | string): boolean {
  const augName = typeof aug === "string" ? aug : aug.name;
  return augName === AugmentationName.NeuroFluxGovernor;
}

export interface AugmentationCosts {
  moneyCost: number;
  repCost: number;
}

export function getAugCost(aug: Augmentation): AugmentationCosts {
  let moneyCost = aug.baseCost;
  let repCost = aug.baseRepRequirement;

  switch (aug.name) {
    // Special cost for NFG
    case AugmentationName.NeuroFluxGovernor: {
      const multiplier = Math.pow(CONSTANTS.NeuroFluxGovernorLevelMult, aug.getLevel());
      repCost = aug.baseRepRequirement * multiplier * currentNodeMults.AugmentationRepCost;
      moneyCost = aug.baseCost * multiplier * currentNodeMults.AugmentationMoneyCost;
      moneyCost *= getGenericAugmentationPriceMultiplier();
      break;
    }
    // SOA Augments use a unique cost method
    case AugmentationName.BeautyOfAphrodite:
    case AugmentationName.ChaosOfDionysus:
    case AugmentationName.FloodOfPoseidon:
    case AugmentationName.HuntOfArtemis:
    case AugmentationName.KnowledgeOfApollo:
    case AugmentationName.MightOfAres:
    case AugmentationName.TrickeryOfHermes:
    case AugmentationName.WKSharmonizer:
    case AugmentationName.WisdomOfAthena: {
      const soaAugCount = soaAugmentationNames.filter((augName) => Player.hasAugmentation(augName)).length;
      moneyCost = aug.baseCost * Math.pow(CONSTANTS.SoACostMult, soaAugCount);
      repCost = aug.baseRepRequirement * Math.pow(CONSTANTS.SoARepMult, soaAugCount);
      break;
    }
    // Standard cost
    default:
      moneyCost = aug.baseCost * getGenericAugmentationPriceMultiplier() * currentNodeMults.AugmentationMoneyCost;
      repCost = aug.baseRepRequirement * currentNodeMults.AugmentationRepCost;
  }
  return { moneyCost, repCost };
}
