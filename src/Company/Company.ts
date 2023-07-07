import type { CompanyPosition } from "./CompanyPosition";

import { CompanyName, JobName } from "@enums";
import * as posNames from "./data/JobTracks";
import { favorToRep, repToFavor } from "../Faction/formulas/favor";

import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";

export interface IConstructorParams {
  name: CompanyName;
  info: string;
  companyPositions: JobName[];
  expMultiplier: number;
  salaryMultiplier: number;
  jobStatReqOffset: number;
  hasFaction?: boolean;
}

export class Company {
  // Static info, initialized once at game load.

  name = CompanyName.NoodleBar;
  info = "";
  hasFaction = false;

  // Todo for current PR: convert this into a set of jobnames
  companyPositions: Record<string, boolean> = {};

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

  constructor(p?: IConstructorParams) {
    if (!p) return;
    this.name = p.name;
    this.info = p.info;
    p.companyPositions.forEach((jobName) => (this.companyPositions[jobName] = true));
    this.expMultiplier = p.expMultiplier;
    this.salaryMultiplier = p.salaryMultiplier;
    this.jobStatReqOffset = p.jobStatReqOffset;

    this.playerReputation = 1;
    this.favor = 0;
    this.hasFaction = false;
    if (p.hasFaction) this.hasFaction = true;
  }

  hasPosition(pos: CompanyPosition | string): boolean {
    return this.companyPositions[typeof pos === "string" ? pos : pos.name] != null;
  }

  hasAgentPositions(): boolean {
    return this.companyPositions[posNames.AgentCompanyPositions[0]] != null;
  }

  hasBusinessConsultantPositions(): boolean {
    return this.companyPositions[posNames.BusinessConsultantCompanyPositions[0]] != null;
  }

  hasBusinessPositions(): boolean {
    return this.companyPositions[posNames.BusinessCompanyPositions[0]] != null;
  }

  hasEmployeePositions(): boolean {
    return this.companyPositions[posNames.MiscCompanyPositions[1]] != null;
  }

  hasITPositions(): boolean {
    return this.companyPositions[posNames.ITCompanyPositions[0]] != null;
  }

  hasSecurityPositions(): boolean {
    return this.companyPositions[posNames.SecurityCompanyPositions[2]] != null;
  }

  hasSoftwareConsultantPositions(): boolean {
    return this.companyPositions[posNames.SoftwareConsultantCompanyPositions[0]] != null;
  }

  hasSoftwarePositions(): boolean {
    return this.companyPositions[posNames.SoftwareCompanyPositions[0]] != null;
  }

  hasWaiterPositions(): boolean {
    return this.companyPositions[posNames.MiscCompanyPositions[0]] != null;
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

  // Only these 3 keys are relevant to the save file
  static includedKeys = ["favor", "playerReputation"] as const;
}

constructorsForReviver.Company = Company;
