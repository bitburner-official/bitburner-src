import type { Augmentation } from "../Augmentation/Augmentation";
import type { Faction } from "./Faction";

import { Augmentations } from "../Augmentation/Augmentations";
import { AugmentationName, FactionDiscovery } from "@enums";
import { currentNodeMults } from "../BitNode/BitNodeMultipliers";

import { Player } from "@player";
import { Factions } from "./Factions";
import { Settings } from "../Settings/Settings";
import {
  getHackingWorkRepGain,
  getFactionSecurityWorkRepGain,
  getFactionFieldWorkRepGain,
} from "../PersonObjects/formulas/reputation";

import { dialogBoxCreate } from "../ui/React/DialogBox";
import { FactionInvitationEvents } from "./ui/FactionInvitationManager";
import { SFC32RNG } from "../Casino/RNG";
import { isFactionWork } from "../Work/FactionWork";
import { getAugCost } from "../Augmentation/AugmentationHelpers";
import { getRecordKeys } from "../Types/Record";
import type { Result } from "../types";

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

  // Ban player from this faction's enemies
  for (const enemy of faction.getInfo().enemies) {
    if (Factions[enemy]) Factions[enemy].isBanned = true;
    Player.factionRumors.delete(enemy);
  }
  // Remove invalid invites and rumors
  Player.factionInvitations = Player.factionInvitations.filter((factionName) => {
    return !Factions[factionName].isMember && !Factions[factionName].isBanned;
  });
  Player.factionRumors.delete(faction.name);
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
      message: `You can't purchase augmentations from '${faction.name}' because you aren't a member.`,
    };
  }

  if (!getFactionAugmentationsFiltered(faction).includes(augmentation.name)) {
    return {
      success: false,
      message: `Faction '${faction.name}' does not have the '${augmentation.name}' augmentation.`,
    };
  }

  if (augmentation.name !== AugmentationName.NeuroFluxGovernor) {
    for (const queuedAugmentation of Player.queuedAugmentations) {
      if (queuedAugmentation.name === augmentation.name) {
        return { success: false, message: `You already purchased the '${augmentation.name}' augmentation.` };
      }
    }
    for (const installedAugmentation of Player.augmentations) {
      if (installedAugmentation.name === augmentation.name) {
        return { success: false, message: `You already installed the '${augmentation.name}' augmentation.` };
      }
    }
  }

  if (!hasAugmentationPrereqs(augmentation)) {
    return {
      success: false,
      message: `You must first purchase or install ${augmentation.prereqs
        .filter((req) => !Player.hasAugmentation(req))
        .join(",")} before you can purchase this one.`,
    };
  }

  const augCosts = getAugCost(augmentation);
  if (augCosts.moneyCost !== 0 && Player.money < augCosts.moneyCost) {
    return { success: false, message: `You don't have enough money to purchase ${augmentation.name}.` };
  }

  if (faction.playerReputation < augCosts.repCost) {
    return { success: false, message: `You don't have enough faction reputation to purchase ${augmentation.name}.` };
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
      `You purchased ${augmentation.name}. Its enhancements will not take effect until they are installed. ` +
        "To install your augmentations, go to the 'Augmentations' tab on the left-hand navigation menu. " +
        "Purchasing additional augmentations will now be more expensive.",
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

  return faction.augmentations.slice();
};
