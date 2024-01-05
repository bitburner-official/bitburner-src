import React from "react";
import { constructorsForReviver, Generic_toJSON, Generic_fromJSON, IReviverValue } from "../utils/JSONReviver";
import { Player } from "@player";
import { Work, WorkType } from "./Work";
import { influenceStockThroughCompanyWork } from "../StockMarket/PlayerInfluencing";
import { CompanyName, JobName } from "@enums";
import { calculateCompanyWorkStats } from "./Formulas";
import { Companies } from "../Company/Companies";
import { applyWorkStats, scaleWorkStats, WorkStats } from "./WorkStats";
import { Company } from "../Company/Company";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import { Reputation } from "../ui/React/Reputation";
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

  getGainRates(job: JobName): WorkStats {
    const focusBonus = CompanyPositions[job].isPartTime ? 1 : Player.focusPenalty();
    const company = this.getCompany();
    return scaleWorkStats(calculateCompanyWorkStats(Player, company, CompanyPositions[job], company.favor), focusBonus);
  }

  process(cycles: number): boolean {
    this.cyclesWorked += cycles;
    const company = this.getCompany();
    const job = Player.jobs[this.companyName];
    if (!job) return true;
    const gains = this.getGainRates(job);
    applyWorkStats(Player, gains, cycles, "work");
    company.playerReputation += gains.reputation * cycles;
    influenceStockThroughCompanyWork(company, gains.reputation, cycles);
    return false;
  }
  finish(cancelled: boolean, suppressDialog?: boolean): void {
    if (!this.singularity && !suppressDialog) {
      dialogBoxCreate(
        <>
          You finished working for {this.companyName}
          <br />
          You have <Reputation reputation={this.getCompany().playerReputation} /> reputation with them.
        </>,
      );
    }
  }

  APICopy() {
    return {
      type: WorkType.COMPANY as const,
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
