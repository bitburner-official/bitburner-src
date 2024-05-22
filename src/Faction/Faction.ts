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

  //Returns an array with [How much favor would be gained, how much rep would be left over]
  getFavorGain(): number {
    if (this.favor == null) {
      this.favor = 0;
    }
    const storedRep = Math.max(0, favorToRep(this.favor));
    const totalRep = storedRep + this.playerReputation;
    const newFavor = repToFavor(totalRep);
    return newFavor - this.favor;
  }
}
