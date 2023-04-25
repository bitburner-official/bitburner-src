import { CompanyPosition } from "./CompanyPosition";
import * as posNames from "./data/JobTracks";
import { favorToRep, repToFavor } from "../Faction/formulas/favor";

import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { JobName, LocationName } from "../data/Enums";
import { JSONSet } from "src/Types/Jsonable";

export interface IConstructorParams {
  name: LocationName;
  info: string;
  companyPositions: JobName[][];
  expMultiplier: number;
  salaryMultiplier: number;
  jobStatReqOffset: number;
  isMegacorp?: boolean;
}

const DefaultConstructorParams: IConstructorParams = {
  name: LocationName.NewTokyoNoodleBar,
  info: "",
  companyPositions: [],
  expMultiplier: 1,
  salaryMultiplier: 1,
  jobStatReqOffset: 0,
};

export class Company {
  /** Company name, which is also the associated location name */
  name: LocationName;

  /** Description and general information about company */
  info: string;

  /** Has faction associated. */
  isMegacorp: boolean;

  /**
   * Object that holds all available positions in this Company.
   * Position names are held in keys.
   * The values for the keys don't matter, but we'll make them booleans
   *
   * Must match names of Company Positions, defined in data/companypositionnames.ts
   */
  companyPositions: JSONSet<JobName> = new JSONSet();

  /** Company-specific multiplier for earnings */
  expMultiplier: number;
  salaryMultiplier: number;

  /**
   * The additional levels of stats you need to quality for a job
   * in this company.
   *
   * For example, the base stat requirement for an intern position is 1.
   * But if a company has a offset of 200, then you would need stat(s) of 201
   */
  jobStatReqOffset: number;

  /** Properties to track the player's progress in this company */
  isPlayerEmployed: boolean;
  playerReputation: number;
  favor: number;

  constructor(p: IConstructorParams = DefaultConstructorParams) {
    this.name = p.name;
    this.info = p.info;

    for (const jobArray of p.companyPositions) {
      for (const job of jobArray) this.companyPositions.add(job);
    }
    this.expMultiplier = p.expMultiplier;
    this.salaryMultiplier = p.salaryMultiplier;
    this.jobStatReqOffset = p.jobStatReqOffset;

    this.isPlayerEmployed = false;
    this.playerReputation = 1;
    this.favor = 0;
    this.isMegacorp = false;
    if (p.isMegacorp) this.isMegacorp = true;
  }

  hasPosition(jobName: JobName): boolean {
    return this.companyPositions.has(jobName);
  }

  hasAgentPositions(): boolean {
    return this.companyPositions.has(posNames.AgentCompanyPositions[0]);
  }

  hasBusinessConsultantPositions(): boolean {
    return this.companyPositions.has(posNames.BusinessConsultantCompanyPositions[0]);
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

  gainFavor(): void {
    if (this.favor == null) {
      this.favor = 0;
    }
    this.favor += this.getFavorGain();
  }

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
    return Generic_toJSON("Company", this);
  }

  /** Initializes a Company from a JSON save state. */
  static fromJSON(value: IReviverValue): Company {
    return Generic_fromJSON(Company, value.data);
  }
}

constructorsForReviver.Company = Company;
