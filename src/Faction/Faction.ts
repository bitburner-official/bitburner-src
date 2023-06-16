import type { AugmentationName } from "@enums";
import { FactionInfo, FactionInfos } from "./FactionInfo";
import { favorToRep, repToFavor } from "./formulas/favor";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { getEnumHelper } from "../utils/EnumHelper";

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

  /** Name of faction */
  name = "";

  /** Amount of reputation player has with this faction */
  playerReputation = 0;

  constructor(name = "") {
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

  gainFavor(): void {
    if (this.favor == null) {
      this.favor = 0;
    }
    this.favor += this.getFavorGain();
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

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("Faction", this);
  }

  /** Initializes a Faction object from a JSON save state. */
  static fromJSON(value: IReviverValue): Faction {
    const faction = Generic_fromJSON(Faction, value.data);
    // Remove invalid augs from faction. Augs are repopulated with correct augs during any reset.
    const augHelper = getEnumHelper("AugmentationName");
    faction.augmentations = faction.augmentations.filter((augName) => augHelper.isMember(augName));
    return faction;
  }
}

constructorsForReviver.Faction = Faction;
