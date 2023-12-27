import type { Faction } from "../Faction/Faction";

import React from "react";
import { Work, WorkType } from "./Work";
import { constructorsForReviver, Generic_toJSON, Generic_fromJSON, IReviverValue } from "../utils/JSONReviver";
import { Player } from "@player";
import { FactionName, FactionWorkType } from "@enums";
import { Factions } from "../Faction/Factions";
import { applyWorkStats, scaleWorkStats, WorkStats } from "./WorkStats";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import { Reputation } from "../ui/React/Reputation";
import { calculateFactionExp, calculateFactionRep } from "./Formulas";
import { getEnumHelper } from "../utils/EnumHelper";

interface FactionWorkParams {
  singularity: boolean;
  factionWorkType: FactionWorkType;
  faction: FactionName;
}

export const isFactionWork = (w: Work | null): w is FactionWork => w !== null && w.type === WorkType.FACTION;

export class FactionWork extends Work {
  factionWorkType: FactionWorkType;
  factionName: FactionName;

  constructor(params?: FactionWorkParams) {
    super(WorkType.FACTION, params?.singularity ?? true);
    this.factionWorkType = params?.factionWorkType ?? FactionWorkType.hacking;
    this.factionName = params?.faction ?? FactionName.Sector12;
  }

  getFaction(): Faction {
    return Factions[this.factionName];
  }

  getReputationRate(): number {
    const focusBonus = Player.focusPenalty();
    return calculateFactionRep(Player, this.factionWorkType, this.getFaction().favor) * focusBonus;
  }

  getExpRates(): WorkStats {
    const focusBonus = Player.focusPenalty();
    const rate = calculateFactionExp(Player, this.factionWorkType);
    return scaleWorkStats(rate, focusBonus, false);
  }

  process(cycles: number): boolean {
    this.cyclesWorked += cycles;
    this.getFaction().playerReputation += this.getReputationRate() * cycles;

    const rate = this.getExpRates();
    applyWorkStats(Player, rate, cycles, "class");

    return false;
  }

  finish(cancelled: boolean, suppressDialog?: boolean): void {
    if (!this.singularity && !suppressDialog) {
      dialogBoxCreate(
        <>
          You worked for {this.getFaction().name}.
          <br />
          They now have a total of <Reputation reputation={this.getFaction().playerReputation} /> reputation.
        </>,
      );
    }
  }

  APICopy() {
    return {
      type: WorkType.FACTION as const,
      cyclesWorked: this.cyclesWorked,
      factionWorkType: this.factionWorkType,
      factionName: this.factionName,
    };
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("FactionWork", this);
  }

  /** Initializes a FactionWork object from a JSON save state. */
  static fromJSON(value: IReviverValue): FactionWork {
    const factionWork = Generic_fromJSON(FactionWork, value.data);
    factionWork.factionWorkType = getEnumHelper("FactionWorkType").getMember(factionWork.factionWorkType, {
      alwaysMatch: true,
    });
    factionWork.factionName = getEnumHelper("FactionName").getMember(factionWork.factionName, { alwaysMatch: true });
    return factionWork;
  }
}

constructorsForReviver.FactionWork = FactionWork;
