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
import { defaultMultipliers, mergeMultipliers } from "../PersonObjects/Multipliers";
import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { prestigeWorkerScripts } from "../NetscriptWorker";
import { romanNumeralEncoder } from "../DarkNet/controllers/ServerGenerator";
import type { Multipliers } from "@nsdefs";

export const soaAugmentationNames = [
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

export const labAugmentationNames = [
  AugmentationName.TheBrokenWings,
  AugmentationName.TheBoots,
  AugmentationName.TheStaff,
  AugmentationName.TheHammer,
  AugmentationName.TheLaw,
  AugmentationName.TheSword,
  AugmentationName.TheThread,
];

export function getBaseAugmentationPriceMultiplier(): number {
  return CONSTANTS.MultipleAugMultiplier * [1, 0.96, 0.94, 0.93][Player.activeSourceFileLvl(11)];
}
export function getGenericAugmentationPriceMultiplier(): number {
  const queuedNonSoAAugmentationList = Player.queuedAugmentations.filter((augmentation) => {
    return !soaAugmentationNames.includes(augmentation.name) && !labAugmentationNames.includes(augmentation.name);
  });
  return Math.pow(getBaseAugmentationPriceMultiplier(), queuedNonSoAAugmentationList.length);
}

export function applyAugmentation(aug: PlayerOwnedAugmentation, reapply = false): void {
  // Apply multipliers
  Player.mults = mergeMultipliers(Player.mults, getAugmentMults(aug, !reapply));

  // Special logic for Congruity Implant
  if (aug.name === AugmentationName.CongruityImplant && !reapply) {
    Player.entropy = 0;
    Player.applyEntropy(Player.entropy);
  }

  // Recalculate skill levels after applying multipliers.
  Player.updateSkillLevels();

  // Special logic for NeuroFlux Governor
  const ownedNfg = Player.augmentations.find((pAug) => pAug.name === AugmentationName.NeuroFluxGovernor);
  if (aug.name === AugmentationName.NeuroFluxGovernor && !reapply && ownedNfg) {
    ownedNfg.level = aug.level;
    return;
  }
  if (aug.name === AugmentationName.TheThread && !reapply) {
    const ownedThread = Player.augmentations.find((pAug) => pAug.name === AugmentationName.TheThread);
    if (ownedThread) {
      ownedThread.level += aug.level;
    } else {
      const ownedAug = new PlayerOwnedAugmentation(aug.name);
      ownedAug.level = aug.level;
      Player.augmentations.push(ownedAug);
    }
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

  // We must kill all scripts before installing augmentations.
  prestigeWorkerScripts();

  let augmentationList = "";
  const nfgIndex = Player.queuedAugmentations.findLastIndex((aug) => aug.name === AugmentationName.NeuroFluxGovernor);
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
    } else if (ownedAug.name === AugmentationName.TheThread) {
      level = ` ${romanNumeralEncoder(getInstalledThreadAugCount())}`;
    }
    augmentationList += aug.name + level + "\n";
  }
  Player.queuedAugmentations = [];
  if (!force && augmentationList !== "") {
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

export function getAugName(augment: PlayerOwnedAugmentation, includeQueued = false): string {
  if (augment.name === AugmentationName.TheThread) {
    const count = includeQueued ? getTotalThreadAugCount() : getInstalledThreadAugCount();
    return `${augment.name} ${romanNumeralEncoder(count)}`;
  }
  return augment.name;
}

/**
 * Retrieves the mults for the given augmentation.
 * Has special handling for "The Thr3ad of Ariadne" since its mults are additive, not multiplicative, per level
 */
export function getAugmentMults(augment: Augmentation | PlayerOwnedAugmentation, delta = false): Multipliers {
  if (augment.name === AugmentationName.TheThread) {
    return getThreadAugmentMults(delta);
  }

  return Augmentations[augment.name].mults;
}

export function getInstalledThreadAugCount(): number {
  return Player.augmentations.find((aug) => aug.name === AugmentationName.TheThread)?.level ?? 0;
}

export function getTotalThreadAugCount(): number {
  const pendingThreadCount =
    Player.queuedAugmentations.find((aug) => aug.name == AugmentationName.TheThread)?.level ?? 0;
  return getInstalledThreadAugCount() + pendingThreadCount;
}

export function getThreadAugmentMults(delta = false): Multipliers {
  const existingMult = 1 + 0.01 * getInstalledThreadAugCount();
  const mult = delta ? (1 + 0.01 * getTotalThreadAugCount()) / existingMult : existingMult;
  return {
    ...defaultMultipliers(),
    hacking_chance: mult,
    hacking_speed: mult,
    hacking_money: mult,
    hacking_grow: mult,
    hacking: mult,
    strength: mult,
    defense: mult,
    dexterity: mult,
    agility: mult,
    charisma: mult,
    hacking_exp: mult,
    strength_exp: mult,
    defense_exp: mult,
    dexterity_exp: mult,
    agility_exp: mult,
    charisma_exp: mult,
    company_rep: mult,
    faction_rep: mult,
    crime_money: mult,
    crime_success: mult,
    dnet_money: mult,
    hacknet_node_money: mult,
    hacknet_node_purchase_cost: 1 / mult,
    hacknet_node_ram_cost: 1 / mult,
    hacknet_node_core_cost: 1 / mult,
    hacknet_node_level_cost: 1 / mult,
    work_money: mult,
  };
}
