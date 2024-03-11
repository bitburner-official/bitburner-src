import { AugmentationName, FactionName, FactionDiscovery } from "@enums";
import { FactionInfo, FactionInfos } from "./FactionInfo";
import { favorToRep, repToFavor } from "./formulas/favor";

export class Faction {
  /**
   * Flag signalling whether the player has already received an invitation
   * to this faction
   */
  alreadyInvited = false;

  /** Holds names of all augmentations that this Faction offers */
  augmentations: AugmentationName[] = [];

  /** Amount of favor the player has with this faction. */
  favor = 0;

  /** Flag signalling whether player has been banned from this faction */
  isBanned = false;

  /** Flag signalling whether player is a member of this faction */
  isMember = false;

  /** Level of player knowledge about this faction (unknown, rumored, known) */
  discovery: FactionDiscovery = FactionDiscovery.unknown;

  /** Name of faction */
  name: FactionName;

  /** Amount of reputation player has with this faction */
  playerReputation = 0;

  constructor(name: FactionName) {
    this.name = name;
  }

  getInfo(): FactionInfo {
    const info = FactionInfos[this.name];
    if (info == null) {
      throw new Error(
        `Missing faction from FactionInfos: ${this.name} this probably means the faction got corrupted somehow`,
      );
    }

    return info;
  }

  prestigeSourceFile() {
    // Reset favor, reputation, and flags
    this.favor = 0;
    this.playerReputation = 0;
    this.alreadyInvited = false;
    this.isMember = false;
    this.isBanned = false;
  }

  prestigeAugmentation(): void {
    // Gain favor
    if (this.favor == null) this.favor = 0;
    this.favor += this.getFavorGain();
    // Reset reputation and flags
    this.playerReputation = 0;
    this.alreadyInvited = false;
    this.isMember = false;
    this.isBanned = false;
  }

  /** Calculate the amount of favor that would be gained in a prestige. */
  getFavorGain(): number {
    const storedFavor = Math.max(0, this.favor || 0);
    const gainedFavor = repToFavor(this.playerReputation);

    const reducedBase = 1.00002;
    const storedRep = favorToRep(storedFavor, reducedBase);
    const gainedRep = favorToRep(gainedFavor, reducedBase);
    const totalRep = storedRep + gainedRep;
    if (totalRep < Number.MAX_VALUE) {
      const newFavor = repToFavor(totalRep, reducedBase);
      return newFavor - storedFavor;
    }
    else {
      // Above effectively-infinite favor levels, support gaining up to the max amount each prestige.
      return gainedFavor;
    }
  }
}
