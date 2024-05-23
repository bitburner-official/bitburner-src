import type { Augmentation } from "../Augmentation/Augmentation";
import type { Faction } from "./Faction";

import { Augmentations } from "../Augmentation/Augmentations";
import { PlayerOwnedAugmentation } from "../Augmentation/PlayerOwnedAugmentation";
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

export function purchaseAugmentation(aug: Augmentation, fac: Faction, sing = false): string {
  const hasPrereqs = hasAugmentationPrereqs(aug);
  const augCosts = getAugCost(aug);
  if (!hasPrereqs) {
    const txt = `You must first purchase or install ${aug.prereqs
      .filter((req) => !Player.hasAugmentation(req))
      .join(",")} before you can purchase this one.`;
    if (sing) {
      return txt;
    } else {
      dialogBoxCreate(txt);
    }
  } else if (augCosts.moneyCost !== 0 && Player.money < augCosts.moneyCost) {
    const txt = "You don't have enough money to purchase " + aug.name;
    if (sing) {
      return txt;
    }
    dialogBoxCreate(txt);
  } else if (fac.playerReputation < augCosts.repCost) {
    const txt = "You don't have enough faction reputation to purchase " + aug.name;
    if (sing) {
      return txt;
    }
    dialogBoxCreate(txt);
  } else if (augCosts.moneyCost === 0 || Player.money >= augCosts.moneyCost) {
    const queuedAugmentation = new PlayerOwnedAugmentation(aug.name);
    if (aug.name == AugmentationName.NeuroFluxGovernor) {
      queuedAugmentation.level = aug.getNextLevel();
    }
    Player.queuedAugmentations.push(queuedAugmentation);

    Player.loseMoney(augCosts.moneyCost, "augmentations");

    if (sing) {
      return "You purchased " + aug.name;
    } else if (!Settings.SuppressBuyAugmentationConfirmation) {
      dialogBoxCreate(
        `You purchased ${aug.name}. Its enhancements will not take effect until they are installed. ` +
          "To install your augmentations, go to the 'Augmentations' tab on the left-hand navigation menu. " +
          "Purchasing additional augmentations will now be more expensive.",
      );
    }
  } else {
    dialogBoxCreate(
      "Hmm, something went wrong when trying to purchase an Augmentation. " +
        "Please report this to the game developer with an explanation of how to " +
        "reproduce this.",
    );
  }
  return "";
}

export function processPassiveFactionRepGain(numCycles: number): void {
  if (Player.bitNodeN === 2) return;
  for (const name of getRecordKeys(Factions)) {
    if (isFactionWork(Player.currentWork) && name === Player.currentWork.factionName) continue;
    const faction = Factions[name];
    if (!faction.isMember) continue;
    // No passive rep for special factions
    const info = faction.getInfo();
    if (!info.offersWork()) continue;
    // No passive rep for gangs.
    if (Player.getGangName() === name) continue;
    // 0 favor = 1%/s
    // 50 favor = 6%/s
    // 100 favor = 11%/s
    const favorMult = Math.min(0.1, faction.favor / 1000 + 0.01);
    // Find the best of all possible favor gain, minimum 1 rep / 2 minute.
    const hRep = getHackingWorkRepGain(Player, faction.favor);
    const sRep = getFactionSecurityWorkRepGain(Player, faction.favor);
    const fRep = getFactionFieldWorkRepGain(Player, faction.favor);
    const rate = Math.max(hRep * favorMult, sRep * favorMult, fRep * favorMult, 1 / 120);

    faction.playerReputation += rate * numCycles * Player.mults.faction_rep * currentNodeMults.FactionPassiveRepGain;
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

    const rng = SFC32RNG(`BN${Player.bitNodeN}.${Player.sourceFileLvl(Player.bitNodeN)}`);
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
