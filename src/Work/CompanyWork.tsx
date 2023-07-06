import React from "react";
import { constructorsForReviver, Generic_toJSON, Generic_fromJSON, IReviverValue } from "../utils/JSONReviver";
import { Player } from "@player";
import { Work, WorkType } from "./Work";
import { influenceStockThroughCompanyWork } from "../StockMarket/PlayerInfluencing";
import { AugmentationName, CompanyName } from "@enums";
import { calculateCompanyWorkStats } from "./Formulas";
import { Companies } from "../Company/Companies";
import { applyWorkStats, scaleWorkStats, WorkStats } from "./WorkStats";
import { Company } from "../Company/Company";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import { Reputation } from "../ui/React/Reputation";
import { CONSTANTS } from "../Constants";
import { CompanyPositions } from "../Company/CompanyPositions";
import { isMember } from "../utils/EnumHelper";
import { invalidWork } from "./InvalidWork";

interface CompanyWorkParams {
  companyName: CompanyName;
  singularity: boolean;
}

export const isCompanyWork = (w: Work | null): w is CompanyWork => w !== null && w.type === WorkType.COMPANY;

export class CompanyWork extends Work {
  companyName: CompanyName;
  constructor(params?: CompanyWorkParams) {
    super(WorkType.COMPANY, params?.singularity ?? false);
    this.companyName = params?.companyName ?? CompanyName.NoodleBar;
  }

  getCompany(): Company {
    return Companies[this.companyName];
  }

  getGainRates(): WorkStats {
    let focusBonus = 1;
    if (!Player.hasAugmentation(AugmentationName.NeuroreceptorManager, true)) {
      focusBonus = Player.focus ? 1 : CONSTANTS.BaseFocusBonus;
    }
    const company = this.getCompany();
    return scaleWorkStats(
      calculateCompanyWorkStats(Player, company, CompanyPositions[Player.jobs[company.name]], company.favor),
      focusBonus,
    );
  }

  process(cycles: number): boolean {
    this.cyclesWorked += cycles;
    const company = this.getCompany();
    const gains = this.getGainRates();
    applyWorkStats(Player, gains, cycles, "work");
    company.playerReputation += gains.reputation * cycles;
    influenceStockThroughCompanyWork(company, gains.reputation, cycles);
    return false;
  }
  finish(): void {
    if (!this.singularity) {
      dialogBoxCreate(
        <>
          You finished working for {this.companyName}
          <br />
          You have <Reputation reputation={this.getCompany().playerReputation} /> reputation with them.
        </>,
      );
    }
  }

  APICopy(): Record<string, unknown> {
    return {
      type: this.type,
      cyclesWorked: this.cyclesWorked,
      companyName: this.companyName,
    };
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("CompanyWork", this);
  }

  /** Initializes a CompanyWork object from a JSON save state. */
  static fromJSON(value: IReviverValue): CompanyWork {
    const work = Generic_fromJSON(CompanyWork, value.data);
    if (!isMember("CompanyName", work.companyName)) return invalidWork();
    return work;
  }
}

constructorsForReviver.CompanyWork = CompanyWork;
