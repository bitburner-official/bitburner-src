import { Person as IPerson } from "@nsdefs";
import { CONSTANTS } from "../Constants";
import { JobName, JobField } from "@enums";
import {
  agentJobs,
  businessConsultJobs,
  businessJobs,
  itJobs,
  netEngJobs,
  securityJobs,
  softwareConsultJobs,
  softwareJobs,
} from "./data/JobTracks";

export interface CompanyPositionCtorParams {
  nextPosition: JobName | null;
  field: JobField;
  baseSalary: number;
  repMultiplier: number;

  reqdHacking?: number;
  reqdStrength?: number;
  reqdDefense?: number;
  reqdDexterity?: number;
  reqdAgility?: number;
  reqdCharisma?: number;
  reqdReputation?: number;

  hackingEffectiveness?: number;
  strengthEffectiveness?: number;
  defenseEffectiveness?: number;
  dexterityEffectiveness?: number;
  agilityEffectiveness?: number;
  charismaEffectiveness?: number;

  hackingExpGain?: number;
  strengthExpGain?: number;
  defenseExpGain?: number;
  dexterityExpGain?: number;
  agilityExpGain?: number;
  charismaExpGain?: number;
}

export class CompanyPosition {
  /** Position title */
  name: JobName;

  /** Field type of the position (software, it, business, etc) */
  field: JobField;

  /** Title of next position to be promoted to */
  nextPosition: JobName | null;

  /**
   * Base salary for this position ($ per 200ms game cycle)
   * Will be multiplier by a company-specific multiplier for final salary
   */
  baseSalary: number;

  /** Reputation multiplier */
  repMultiplier: number;

  /** Required stats to earn this position */
  requiredAgility: number;
  requiredCharisma: number;
  requiredDefense: number;
  requiredDexterity: number;
  requiredHacking: number;
  requiredStrength: number;

  /** Required company reputation to earn this position */
  requiredReputation: number;

  /** Effectiveness of each stat time for job performance */
  hackingEffectiveness: number;
  strengthEffectiveness: number;
  defenseEffectiveness: number;
  dexterityEffectiveness: number;
  agilityEffectiveness: number;
  charismaEffectiveness: number;

  /** Experience gain for performing job (per 200ms game cycle) */
  hackingExpGain: number;
  strengthExpGain: number;
  defenseExpGain: number;
  dexterityExpGain: number;
  agilityExpGain: number;
  charismaExpGain: number;

  constructor(name: JobName, p: CompanyPositionCtorParams) {
    this.name = name;
    this.field = p.field;
    this.nextPosition = p.nextPosition;
    this.baseSalary = p.baseSalary;
    this.repMultiplier = p.repMultiplier;

    this.requiredHacking = p.reqdHacking != null ? p.reqdHacking : 0;
    this.requiredStrength = p.reqdStrength != null ? p.reqdStrength : 0;
    this.requiredDefense = p.reqdDefense != null ? p.reqdDefense : 0;
    this.requiredDexterity = p.reqdDexterity != null ? p.reqdDexterity : 0;
    this.requiredAgility = p.reqdAgility != null ? p.reqdAgility : 0;
    this.requiredCharisma = p.reqdCharisma != null ? p.reqdCharisma : 0;
    this.requiredReputation = p.reqdReputation != null ? p.reqdReputation : 0;

    this.hackingEffectiveness = p.hackingEffectiveness != null ? p.hackingEffectiveness : 0;
    this.strengthEffectiveness = p.strengthEffectiveness != null ? p.strengthEffectiveness : 0;
    this.defenseEffectiveness = p.defenseEffectiveness != null ? p.defenseEffectiveness : 0;
    this.dexterityEffectiveness = p.dexterityEffectiveness != null ? p.dexterityEffectiveness : 0;
    this.agilityEffectiveness = p.agilityEffectiveness != null ? p.agilityEffectiveness : 0;
    this.charismaEffectiveness = p.charismaEffectiveness != null ? p.charismaEffectiveness : 0;

    if (
      Math.round(
        this.hackingEffectiveness +
          this.strengthEffectiveness +
          this.defenseEffectiveness +
          this.dexterityEffectiveness +
          this.agilityEffectiveness +
          this.charismaEffectiveness,
      ) !== 100
    ) {
      console.error(`CompanyPosition ${this.name} parameters do not sum to 100`);
    }

    this.hackingExpGain = p.hackingExpGain != null ? p.hackingExpGain : 0;
    this.strengthExpGain = p.strengthExpGain != null ? p.strengthExpGain : 0;
    this.defenseExpGain = p.defenseExpGain != null ? p.defenseExpGain : 0;
    this.dexterityExpGain = p.dexterityExpGain != null ? p.dexterityExpGain : 0;
    this.agilityExpGain = p.agilityExpGain != null ? p.agilityExpGain : 0;
    this.charismaExpGain = p.charismaExpGain != null ? p.charismaExpGain : 0;
  }

  calculateJobPerformance(worker: IPerson): number {
    const hackRatio: number = (this.hackingEffectiveness * worker.skills.hacking) / CONSTANTS.MaxSkillLevel;
    const strRatio: number = (this.strengthEffectiveness * worker.skills.strength) / CONSTANTS.MaxSkillLevel;
    const defRatio: number = (this.defenseEffectiveness * worker.skills.defense) / CONSTANTS.MaxSkillLevel;
    const dexRatio: number = (this.dexterityEffectiveness * worker.skills.dexterity) / CONSTANTS.MaxSkillLevel;
    const agiRatio: number = (this.agilityEffectiveness * worker.skills.agility) / CONSTANTS.MaxSkillLevel;
    const chaRatio: number = (this.charismaEffectiveness * worker.skills.charisma) / CONSTANTS.MaxSkillLevel;

    let reputationGain: number =
      (this.repMultiplier * (hackRatio + strRatio + defRatio + dexRatio + agiRatio + chaRatio)) / 100;
    if (isNaN(reputationGain)) {
      console.error("Company reputation gain calculated to be NaN");
      reputationGain = 0;
    }
    reputationGain += worker.skills.intelligence / CONSTANTS.MaxSkillLevel;
    return reputationGain;
  }

  isSoftwareJob(): boolean {
    return softwareJobs.includes(this.name);
  }

  isITJob(): boolean {
    return itJobs.includes(this.name);
  }

  isSecurityEngineerJob(): boolean {
    return this.name === JobName.securityEng;
  }

  isNetworkEngineerJob(): boolean {
    return netEngJobs.includes(this.name);
  }

  isBusinessJob(): boolean {
    return businessJobs.includes(this.name);
  }

  isSecurityJob(): boolean {
    return securityJobs.includes(this.name);
  }

  isAgentJob(): boolean {
    return agentJobs.includes(this.name);
  }

  isSoftwareConsultantJob(): boolean {
    return softwareConsultJobs.includes(this.name);
  }

  isBusinessConsultantJob(): boolean {
    return businessConsultJobs.includes(this.name);
  }

  isPartTimeJob(): boolean {
    return [JobName.employeePT, JobName.waiterPT].includes(this.name);
  }
}
