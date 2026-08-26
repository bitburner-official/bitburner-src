import type { Augmentation } from "../Augmentation/Augmentation";
import type { Faction } from "./Faction";

import { Augmentations } from "../Augmentation/Augmentations";
import { AugmentationName, FactionDiscovery, FactionName } from "@enums";
import { currentNodeMults } from "../BitNode/BitNodeMultipliers";

import { Player } from "@player";
import { Factions } from "./Factions";
import { Settings } from "../Settings/Settings";
import {
  getFactionFieldWorkRepGain,
  getFactionSecurityWorkRepGain,
  getHackingWorkRepGain,
} from "../PersonObjects/formulas/reputation";

import { dialogBoxCreate } from "../ui/React/DialogBox";
import { FactionInvitationEvents } from "./ui/FactionInvitationManager";
import { SFC32RNG } from "../Casino/RNG";
import { isFactionWork } from "../Work/FactionWork";
import { getAugCost } from "../Augmentation/AugmentationHelpers";
import { getRecordKeys } from "../Types/Record";
import type { Result } from "@nsdefs";

export function inviteToFaction(faction: Faction): void {
  if (faction.alreadyInvited || faction.isMember) return;
  Player.receiveInvite(faction.name);
  faction.alreadyInvited = true;
  faction.discovery = FactionDiscovery.known;
  if (!Settings.SuppressFactionInvites) {
    FactionInvitationEvents.emit({ type: "New", factionName: faction.name });
  }
}

export function joinFaction(faction: Faction): void {
  if (faction.isMember) return;
  faction.isMember = true;
  faction.alreadyInvited = true;
  faction.discovery = FactionDiscovery.known;

  // Add this faction to player's faction list, keeping it in standard order
  Player.factions = getRecordKeys(Factions).filter((facName) => Factions[facName].isMember);

  // Ban player from joining this faction's enemies
  for (const enemy of faction.getInfo().enemies) {
    if (Factions[enemy]) Factions[enemy].isBanned = true;
  }
  // Remove invalid invites
  Player.factionInvitations = Player.factionInvitations.filter((factionName) => {
    return !Factions[factionName].isMember && !Factions[factionName].isBanned;
  });
}

//Returns a boolean indicating whether the player has the prerequisites for the
//specified Augmentation
export function hasAugmentationPrereqs(aug: Augmentation): boolean {
  return aug.prereqs.every((aug) => Player.hasAugmentation(aug));
}

function checkIfPlayerCanPurchaseAugmentation(faction: Faction, augmentation: Augmentation): Result {
  if (!Player.factions.includes(faction.name)) {
    return {
      success: false,
      message: `你不是 '${faction.name}' 的成员，无法从该派系购买强化。`,
    };
  }

  if (!getFactionAugmentationsFiltered(faction).includes(augmentation.name)) {
    return {
      success: false,
      message: `派系 '${faction.name}' 没有 '${augmentation.name}' 这个强化。`,
    };
  }

  if (augmentation.name !== AugmentationName.NeuroFluxGovernor) {
    for (const queuedAugmentation of Player.queuedAugmentations) {
      if (queuedAugmentation.name === augmentation.name) {
        return { success: false, message: `你已经购买过 '${augmentation.name}' 强化。` };
      }
    }
    for (const installedAugmentation of Player.augmentations) {
      if (installedAugmentation.name === augmentation.name) {
        return { success: false, message: `你已经安装过 '${augmentation.name}' 强化。` };
      }
    }
  }

  if (!hasAugmentationPrereqs(augmentation)) {
    return {
      success: false,
      message: `你必须先购买或安装 ${augmentation.prereqs
        .filter((req) => !Player.hasAugmentation(req))
        .join("、")}，才能购买这个强化。`,
    };
  }

  const augCosts = getAugCost(augmentation);
  if (augCosts.moneyCost !== 0 && Player.money < augCosts.moneyCost) {
    return { success: false, message: `你没有足够的资金购买 ${augmentation.name}。` };
  }

  if (faction.playerReputation < augCosts.repCost) {
    return { success: false, message: `你的派系声望不足以购买 ${augmentation.name}。` };
  }

  return { success: true };
}

export function purchaseAugmentation(faction: Faction, augmentation: Augmentation, singularity = false): Result {
  const result = checkIfPlayerCanPurchaseAugmentation(faction, augmentation);
  if (!result.success) {
    if (!singularity) {
      dialogBoxCreate(result.message);
    }
    return { success: false, message: result.message };
  }

  const augCosts = getAugCost(augmentation);
  Player.queueAugmentation(augmentation.name);
  Player.loseMoney(augCosts.moneyCost, "augmentations");

  if (!singularity && !Settings.SuppressBuyAugmentationConfirmation) {
    dialogBoxCreate(
      `你购买了 ${augmentation.name}。其增强效果将在安装后才会生效。` +
        `要安装强化，请进入左侧导航菜单中的“强化”页面。` +
        `此后再购买其他强化，价格会更高。`,
    );
  }
  return { success: true };
}

export function processPassiveFactionRepGain(numCycles: number): void {
  // Passive gain is disabled in some BitNodes (e.g., BN2).
  if (currentNodeMults.FactionPassiveRepGain === 0) {
    return;
  }
  for (const name of getRecordKeys(Factions)) {
    if (isFactionWork(Player.currentWork) && name === Player.currentWork.factionName) {
      continue;
    }
    const faction = Factions[name];
    if (!faction.isMember) {
      continue;
    }
    // No passive rep for special factions.
    const info = faction.getInfo();
    if (info.special) {
      continue;
    }
    // No passive rep for gangs.
    if (Player.getGangName() === name) {
      continue;
    }
    // 0 favor = 1%/s
    // 50 favor = 6%/s
    // 100 favor = 11%/s
    const favorMult = Math.min(0.1, faction.favor / 1000 + 0.01);
    // Find the best of all possible favor gain, minimum 1 rep / 2 minute.
    const hRep = getHackingWorkRepGain(Player, faction.favor);
    const sRep = getFactionSecurityWorkRepGain(Player, faction.favor);
    const fRep = getFactionFieldWorkRepGain(Player, faction.favor);
    const rate = Math.max(hRep * favorMult, sRep * favorMult, fRep * favorMult, 1 / 120);

    /**
     * Do not apply Player.mults.faction_rep here. That multiplier was applied in getHackingWorkRepGain and similar
     * functions.
     */
    faction.playerReputation += rate * numCycles * currentNodeMults.FactionPassiveRepGain;
  }
}

export const getFactionAugmentationsFiltered = (faction: Faction): AugmentationName[] => {
  // If player has a gang with this faction, return (almost) all augmentations
  if (Player.hasGangWith(faction.name)) {
    let augs = Object.values(Augmentations);

    // Remove special augs
    augs = augs.filter((a) => !a.isSpecial && a.name !== AugmentationName.CongruityImplant);

    if (Player.bitNodeN === 2) {
      // TRP is not available outside of BN2 for Gangs
      augs.push(Augmentations[AugmentationName.TheRedPill]);
    }

    const rng = SFC32RNG(`BN${Player.bitNodeN}.${Player.activeSourceFileLvl(Player.bitNodeN)}`);
    // Remove faction-unique augs that don't belong to this faction
    const uniqueFilter = (a: Augmentation): boolean => {
      // Keep all the non-unique one
      if (a.factions.length > 1) {
        return true;
      }
      // Keep all the ones that this faction has anyway.
      if (faction.augmentations.includes(a.name)) {
        return true;
      }

      return rng() >= 1 - currentNodeMults.GangUniqueAugs;
    };
    augs = augs.filter(uniqueFilter);

    return augs.map((a) => a.name);
  }

  // Remove TRP from daedalus in BN15
  if (Player.bitNodeN === 15 && faction.name == FactionName.Daedalus) {
    return faction.augmentations.filter((aug) => aug !== AugmentationName.TheRedPill);
  }

  return faction.augmentations.slice();
};
