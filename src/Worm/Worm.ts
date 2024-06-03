import { Player } from "@player";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, Reviver, constructorsForReviver } from "../utils/JSONReviver";
import { BonusSpecialMults, BonusType, applySpecialBonus, bonuses } from "./BonusType";
import { WormEvents } from "./WormEvents";
import { updateWormMults } from "./calculations";

export class Worm {
  bonus: BonusType;
  completions = 0;

  specialMults: BonusSpecialMults = {
    gameTickSpeed: 1,
    stockMarketMult: 1,
    bladeburnerMult: 1,
    intelligenceMult: 1,
    crimeMult: 1,
  };

  constructor() {
    this.bonus = bonuses[0];
  }

  resetSpecialMults() {
    this.specialMults.gameTickSpeed = 1;
    this.specialMults.stockMarketMult = 1;
    this.specialMults.bladeburnerMult = 1;
    this.specialMults.intelligenceMult = 1;
    this.specialMults.crimeMult = 1;
  }

  process() {
    this.updateMults();

    WormEvents.emit();
  }

  updateMults() {
    this.resetSpecialMults();
    updateWormMults();
    applySpecialBonus(this);
  }

  toJSON(): IReviverValue {
    return Generic_toJSON("Worm", this);
  }

  static fromJSON(value: IReviverValue): Worm {
    return Generic_fromJSON(Worm, value.data);
  }
}

export let worm: Worm | null = null;

export function resetWorm() {
  if (canAccessWorm()) worm = new Worm();
  else worm = null;
}

export function loadWorm(saveString: string) {
  if (saveString) {
    worm = JSON.parse(saveString, Reviver);
  } else {
    worm = null;
  }
}

export function canAccessWorm() {
  return Player.bitNodeN === 16 || Player.sourceFileLvl(16) > 0;
}

constructorsForReviver.Worm = Worm;
