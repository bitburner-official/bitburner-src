import type { CompanyPosition } from "./CompanyPosition";

import { CompanyName } from "@enums";
import * as posNames from "./data/JobTracks";
import { favorToRep, repToFavor } from "../Faction/formulas/favor";

import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";

export interface IConstructorParams {
  name: CompanyName;
  info: string;
  companyPositions: Record<string, boolean>;
  expMultiplier: number;
  salaryMultiplier: number;
  jobStatReqOffset: number;
  isMegacorp?: boolean;
}

export class Company {
  // Type explicitly defined because CompanyName isn't a real enum.
  name: CompanyName = CompanyName.NoodleBar;

  /** Description and general information about company */
  info = "";

  /** Has faction associated. */
  isMegacorp = false;

  /**
   * Object that holds all available positions in this Company.
   * Position names are held in keys.
   * The values for the keys don't matter, but we'll make them booleans
   *
   * Must match names of Company Positions, defined in data/companypositionnames.ts
   */
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

  /** Properties to track the player's progress in this company */
  isPlayerEmployed = false;
  playerReputation = 0;
  favor = 0;

  constructor(p?: IConstructorParams) {
    if (!p) return;
    this.name = p.name;
    this.info = p.info;
    this.companyPositions = p.companyPositions;
    this.expMultiplier = p.expMultiplier;
    this.salaryMultiplier = p.salaryMultiplier;
    this.jobStatReqOffset = p.jobStatReqOffset;

    this.isPlayerEmployed = false;
    this.playerReputation = 1;
    this.favor = 0;
    this.isMegacorp = false;
    if (p.isMegacorp) this.isMegacorp = true;
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
