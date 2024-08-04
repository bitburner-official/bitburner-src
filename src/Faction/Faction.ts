import { AugmentationName, FactionName, FactionDiscovery } from "@enums";
import { FactionInfo, FactionInfos } from "./FactionInfo";
import { MaxFavor, calculateFavorAfterResetting } from "./formulas/favor";
import { clampNumber } from "../utils/helpers/clampNumber";

export class Faction {
  /**
   * Flag signalling whether the player has already received an invitation
   * to this faction
   */
  alreadyInvited = false;

  /** Holds names of all augmentations that this Faction offers */
  augmentations: AugmentationName[] = [];

  /** Amount of favor the player has with this faction. */
  #favor = 0;

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

  get favor() {
    return this.#favor;
  }

  /**
   * There is no setter for this.#favor. This is intentional. Performing arithmetic operations on `favor` may lead to
   * the overflow error of `playerReputation`, so anything that wants to change `favor` must explicitly do that through
   * `setFavor`.
   *
   * @param value
   */
  setFavor(value: number) {
    if (Number.isNaN(value)) {
      this.#favor = 0;
      return;
    }
    this.#favor = clampNumber(value, 0, MaxFavor);
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
    this.setFavor(0);
    this.playerReputation = 0;
    this.alreadyInvited = false;
    this.isMember = false;
    this.isBanned = false;
  }

  prestigeAugmentation(): void {
    // Gain favor
    this.setFavor(calculateFavorAfterResetting(this.favor, this.playerReputation));
    // Reset reputation and flags
    this.playerReputation = 0;
    this.alreadyInvited = false;
    this.isMember = false;
    this.isBanned = false;
  }
}
