import type { TypedKeys } from "../types";

import { Generic_fromJSON, Generic_toJSON, constructorsForReviver, IReviverValue } from "./JSONReviver";

export type MoneySource = TypedKeys<MoneySourceTracker, number>;

export class MoneySourceTracker {
  bladeburner = 0;
  casino = 0;
  class = 0;
  codingcontract = 0;
  corporation = 0;
  crime = 0;
  charity = 0;
  gang = 0;
  gang_expenses = 0;
  hacking = 0;
  hacknet = 0;
  hacknet_expenses = 0;
  hospitalization = 0;
  infiltration = 0;
  lottery = 0;
  sleeves = 0;
  stock = 0;
  total = 0;
  work = 0;
  servers = 0;
  other = 0;
  augmentations = 0;

  // Record money earned
  record(amt: number, source: MoneySource): void {
    this[source] += amt;
    this.total += amt;
  }

  // Reset the money tracker by setting all stats to 0
  reset(): void {
    for (const prop in this) {
      if (typeof this[prop] === "number") {
        (this[prop] as number) = 0;
      }
    }
  }

  // Serialize the current object to a JSON save state.
  toJSON(): IReviverValue {
    return Generic_toJSON("MoneySourceTracker", this);
  }

  // Initializes a MoneySourceTracker object from a JSON save state.
  static fromJSON(value: IReviverValue): MoneySourceTracker {
    return Generic_fromJSON(MoneySourceTracker, value.data);
  }
}

constructorsForReviver.MoneySourceTracker = MoneySourceTracker;
