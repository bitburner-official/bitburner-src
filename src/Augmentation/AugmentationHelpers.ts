import { Augmentation } from "./Augmentation";
import { Augmentations } from "./Augmentations";
import { PlayerOwnedAugmentation } from "./PlayerOwnedAugmentation";
import { AugmentationName } from "@enums";

import { CONSTANTS } from "../Constants";
import { Player } from "@player";
import type { Multipliers } from "@nsdefs";
import { prestigeAugmentation } from "../Prestige";

import { FactionName } from "@enums";
import { Factions } from "../Faction/Factions";

import { dialogBoxCreate } from "../ui/React/DialogBox";
import { Router } from "../ui/GameRoot";
import { Page } from "../ui/Router";
import { defaultMultipliers, mergeMultipliers } from "../PersonObjects/Multipliers";
import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { prestigeWorkerScripts } from "../NetscriptWorker";
import { romanNumeralEncoder } from "../DarkNet/controllers/ServerGenerator";

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

// When effectOnly == true, the augmentation is not actually added to the
// Player, only its effect is added to their mults.
export function applyAugmentation(aug: PlayerOwnedAugmentation, effectOnly = false): void {
  let previousLevel = 0;
  if (!effectOnly) {
    // Update current level, or add a new Aug if it didn't exist
    for (const pAug of Player.augmentations) {
      if (pAug.name === aug.name) {
        previousLevel = pAug.level;
        pAug.level = aug.level;
        break;
      }
    }
    if (!previousLevel) {
      const ownedAug = new PlayerOwnedAugmentation(aug.name);
      ownedAug.level = aug.level;
      Player.augmentations.push(ownedAug);
    }
  }

  // Apply multipliers
  updateMultipliers(Player.mults, aug, previousLevel);

  // Special logic for Congruity Implant
  if (aug.name === AugmentationName.CongruityImplant && !effectOnly) {
    Player.entropy = 0;
    // This ends up recursively calling this function, but with
    // effectOnly=true, so it doesn't loop. However, it does mean it's
    // important that everything is in the proper state by this point.
    Player.applyEntropy(Player.entropy);
  }

  // CotMG is unavailable after accepting any other aug
  if (!Player.factions.includes(FactionName.ChurchOfTheMachineGod) && aug.name !== AugmentationName.NeuroFluxGovernor) {
    Factions[FactionName.ChurchOfTheMachineGod].isBanned = true;
  }

  // Recalculate skill levels after applying multipliers.
  Player.updateSkillLevels();
}

// Update the multipliers in "mults" from previousLevel to aug.level. This should be used in most cases
// instead of mergeMultipliers, since it handles special cases like NFG uniformly. (It works for both
// queued and installed augs.)
export function updateMultipliers(mults: Multipliers, aug: PlayerOwnedAugmentation, previousLevel: number): void {
  if (aug.level <= previousLevel) {
    throw new Error(`Trying to downlevel/relevel aug ${aug.name} from ${previousLevel} to ${aug.level}!`);
  }
  if (
    aug.name !== AugmentationName.NeuroFluxGovernor &&
    aug.name !== AugmentationName.TheThread &&
    (aug.level !== 1 || previousLevel !== 0)
  ) {
    throw new Error(`Unexpected levels for ${aug.name}: Leveling ${previousLevel} to ${aug.level}!`);
  }
  if (aug.name === AugmentationName.TheThread) {
    const augMults = getThreadAugmentMults(aug.level, previousLevel);
    mergeMultipliers(mults, augMults);
    return;
  }
  for (let i = previousLevel; i < aug.level; ++i) {
    const augMults = getAugmentMults(aug, i);
    mergeMultipliers(mults, augMults);
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
        "\nYou wake up in your home... you feel different...",
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

/** Get the current level (installed + queued) of an augmentation before buying. */
export function getAugLevel(aug: Augmentation): number {
  let level = 0;
  for (const pAug of Player.augmentations) {
    if (pAug.name === aug.name) {
      // There shouldn't be duplicates here, but use the last if there are.
      level = pAug.level;
    }
  }
  for (const pAug of Player.queuedAugmentations) {
    if (pAug.name === aug.name) {
      // There *definitely* can be duplicates here, and we want the last (most powerful) one.
      // Note that queued levels will always be higher than installed levels, if they exist.
      level = pAug.level;
    }
  }
  return level;
}

export function getAugCost(aug: Augmentation): AugmentationCosts {
  let moneyCost = aug.baseCost;
  let repCost = aug.baseRepRequirement;

  switch (aug.name) {
    // Special cost for NFG
    case AugmentationName.NeuroFluxGovernor: {
      const multiplier = Math.pow(CONSTANTS.NeuroFluxGovernorLevelMult, getAugLevel(aug));
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
export function getAugmentMults(augment: Augmentation | PlayerOwnedAugmentation, level = 1): Multipliers {
  if (augment.name === AugmentationName.TheThread) {
    return getThreadAugmentMults(level);
  }

  return Augmentations[augment.name].mults;
}

export function getInstalledThreadAugCount(): number {
  return Player.augmentations.find((aug) => aug.name === AugmentationName.TheThread)?.level ?? 0;
}

export function getTotalThreadAugCount(): number {
  const pendingThreadCount =
    Player.queuedAugmentations.findLast((aug) => aug.name == AugmentationName.TheThread)?.level ?? 0;
  return getInstalledThreadAugCount() + pendingThreadCount;
}

export function getThreadAugmentMults(level = 1, previousLevel = 0): Multipliers {
  const mult = (1 + 0.01 * level) / (1 + 0.01 * previousLevel);
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
