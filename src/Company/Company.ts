import type { CompanyPosition } from "./CompanyPosition";

import { CompanyName, JobName, FactionName } from "@enums";
import { favorToRep, repToFavor } from "../Faction/formulas/favor";

import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";

export interface CompanyCtorParams {
  name: CompanyName;
  info?: string;
  companyPositions: JobName[];
  expMultiplier: number;
  salaryMultiplier: number;
  jobStatReqOffset: number;
  relatedFaction?: FactionName | undefined;
}

export class Company {
  // Static info, initialized once at game load.

  name = CompanyName.NoodleBar;
  info = "";
  relatedFaction: FactionName | undefined;

  companyPositions = new Set<JobName>();

  /** Company-specific multiplier for earnings */
  expMultiplier = 1;
  salaryMultiplier = 1;

  /**
   * The additional levels of stats you need to quality for a job
   * in this company.
   *
   * For example, the base stat requirement for an intern position is 1.
   * But if a company has a offset of 200, then you would need stat(s) of 201
   */
  jobStatReqOffset = 0;

  // Dynamic info, loaded from save and updated during game.
  playerReputation = 0;
  favor = 0;

  constructor(p?: CompanyCtorParams) {
    if (!p) return;
    this.name = p.name;
    if (p.info) this.info = p.info;
    p.companyPositions.forEach((jobName) => this.companyPositions.add(jobName));
    this.expMultiplier = p.expMultiplier;
    this.salaryMultiplier = p.salaryMultiplier;
    this.jobStatReqOffset = p.jobStatReqOffset;
    if (p.relatedFaction) this.relatedFaction = p.relatedFaction;
  }

  hasPosition(pos: CompanyPosition | JobName): boolean {
    return this.companyPositions.has(typeof pos === "string" ? pos : pos.name);
  }

  prestigeAugmentation(): void {
    if (this.favor == null) this.favor = 0;
    this.favor += this.getFavorGain();
    this.playerReputation = 0;
  }

  prestigeSourceFile() {
    this.favor = 0;
    this.playerReputation = 0;
  }

  getFavorGain(): number {
    if (this.favor == null) this.favor = 0;
    const storedRep = Math.max(0, favorToRep(this.favor));
    const totalRep = storedRep + this.playerReputation;
    const newFavor = repToFavor(totalRep);
    return newFavor - this.favor;
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("Company", this, Company.includedKeys);
  }

  /** Initializes a Company from a JSON save state. */
  static fromJSON(value: IReviverValue): Company {
    return Generic_fromJSON(Company, value.data, Company.includedKeys);
  }

  // Only these 2 keys are relevant to the save file
  static includedKeys = ["favor", "playerReputation"] as const;
}

constructorsForReviver.Company = Company;
