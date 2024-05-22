import { CityName, CorpEmployeeJob } from "@enums";
import * as corpConstants from "./data/Constants";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { Division } from "./Division";
import { Corporation } from "./Corporation";
import { getRandomIntInclusive } from "../utils/helpers/getRandomIntInclusive";
import { createEnumKeyedRecord, getRecordKeys } from "../Types/Record";

interface IParams {
  city: CityName;
  size: number;
}

export class OfficeSpace {
  city = CityName.Sector12;
  size = 1;

  maxEnergy = 100;
  maxMorale = 100;

  avgEnergy = 75;
  avgMorale = 75;

  avgIntelligence = 75;
  avgCharisma = 75;
  avgCreativity = 75;
  avgEfficiency = 75;

  totalExperience = 0;
  numEmployees = 0;
  totalSalary = 0;

  autoTea = false;
  autoParty = false;
  teaPending = false;
  partyMult = 1;

  employeeProductionByJob = { total: 0, ...createEnumKeyedRecord(CorpEmployeeJob, () => 0) };
  employeeJobs = createEnumKeyedRecord(CorpEmployeeJob, () => 0);
  employeeNextJobs = createEnumKeyedRecord(CorpEmployeeJob, () => 0);

  constructor(params: IParams | null = null) {
    if (!params) return;
    this.city = params.city;
    this.size = params.size;
  }

  atCapacity(): boolean {
    return this.numEmployees >= this.size;
  }

  process(marketCycles = 1, corporation: Corporation, industry: Division): number {
    // HRBuddy AutoRecruitment and Interning
    if (industry.hasResearch("HRBuddy-Recruitment") && !this.atCapacity()) {
      this.hireRandomEmployee(
        industry.hasResearch("HRBuddy-Training") ? CorpEmployeeJob.Intern : CorpEmployeeJob.Unassigned,
      );
    }

    // Update employee jobs and job counts
    for (const [pos, jobCount] of Object.entries(this.employeeNextJobs) as [CorpEmployeeJob, number][]) {
      this.employeeJobs[pos] = jobCount;
    }

    // Process Office properties
    this.maxEnergy = 100;
    this.maxMorale = 100;

    if (industry.hasResearch("Go-Juice")) this.maxEnergy += 10;
    if (industry.hasResearch("Sti.mu")) this.maxMorale += 10;
    if (industry.hasResearch("AutoBrew")) this.autoTea = true;
    if (industry.hasResearch("AutoPartyManager")) this.autoParty = true;

    if (this.numEmployees > 0) {
      /** Multiplier for employee morale/energy based on company performance */
      let perfMult = 1.002;
      if (this.numEmployees >= 9) {
        perfMult = Math.pow(
          1 +
            0.002 * Math.min(1 / 9, this.employeeJobs.Intern / this.numEmployees - 1 / 9) * 9 -
            (corporation.funds < 0 && industry.lastCycleRevenue < industry.lastCycleExpenses ? 0.001 : 0),
          marketCycles,
        );
      }
      // Flat reduction per cycle.
      // This does not cause a noticable decrease (it's only -.001% per cycle).
      const reduction = 0.002 * marketCycles;

      if (this.autoTea) {
        this.avgEnergy = this.maxEnergy;
      } else {
        // Tea gives a flat +2 to energy
        this.avgEnergy = (this.avgEnergy - reduction * Math.random()) * perfMult + (this.teaPending ? 2 : 0);
      }

      if (this.autoParty) {
        this.avgMorale = this.maxMorale;
      } else {
        // Each 10% multiplier gives an extra flat +1 to morale to make recovering from low morale easier.
        const increase = this.partyMult > 1 ? (this.partyMult - 1) * 10 : 0;
        this.avgMorale = ((this.avgMorale - reduction * Math.random()) * perfMult + increase) * this.partyMult;
      }

      this.avgEnergy = Math.max(Math.min(this.avgEnergy, this.maxEnergy), corpConstants.minEmployeeDecay);
      this.avgMorale = Math.max(Math.min(this.avgMorale, this.maxMorale), corpConstants.minEmployeeDecay);

      this.teaPending = false;
      this.partyMult = 1;
    }

    // Get experience increase; unassigned employees do not contribute, interning employees contribute 10x
    this.totalExperience +=
      0.0015 *
      marketCycles *
      (this.numEmployees -
        this.employeeJobs[CorpEmployeeJob.Unassigned] +
        this.employeeJobs[CorpEmployeeJob.Intern] * 9);

    this.calculateEmployeeProductivity(corporation, industry);
    if (this.numEmployees === 0) {
      this.totalSalary = 0;
    } else {
      this.totalSalary =
        corpConstants.employeeSalaryMultiplier *
        marketCycles *
        this.numEmployees *
        (this.avgIntelligence +
          this.avgCharisma +
          this.totalExperience / this.numEmployees +
          this.avgCreativity +
          this.avgEfficiency);
    }
    return this.totalSalary;
  }

  calculateEmployeeProductivity(corporation: Corporation, industry: Division): void {
    const effCre = this.avgCreativity * corporation.getEmployeeCreMultiplier() * industry.getEmployeeCreMultiplier(),
      effCha = this.avgCharisma * corporation.getEmployeeChaMult() * industry.getEmployeeChaMultiplier(),
      effInt = this.avgIntelligence * corporation.getEmployeeIntMult() * industry.getEmployeeIntMultiplier(),
      effEff = this.avgEfficiency * corporation.getEmployeeEffMult() * industry.getEmployeeEffMultiplier();
    const prodBase = this.avgMorale * this.avgEnergy * 1e-4;

    let total = 0;
    const exp = this.totalExperience / this.numEmployees || 0;
    for (const name of getRecordKeys(this.employeeProductionByJob)) {
      let prodMult = 0;
      switch (name) {
        case CorpEmployeeJob.Operations:
          prodMult = 0.6 * effInt + 0.1 * effCha + exp + 0.5 * effCre + effEff;
          break;
        case CorpEmployeeJob.Engineer:
          prodMult = effInt + 0.1 * effCha + 1.5 * exp + effEff;
          break;
        case CorpEmployeeJob.Business:
          prodMult = 0.4 * effInt + effCha + 0.5 * exp;
          break;
        case CorpEmployeeJob.Management:
          prodMult = 2 * effCha + exp + 0.2 * effCre + 0.7 * effEff;
          break;
        case CorpEmployeeJob.RandD:
          prodMult = 1.5 * effInt + 0.8 * exp + effCre + 0.5 * effEff;
          break;
        case CorpEmployeeJob.Unassigned:
        case CorpEmployeeJob.Intern:
        case "total":
          continue;
        default:
          console.error(`Invalid employee position: ${name}`);
          break;
      }
      this.employeeProductionByJob[name] = this.employeeJobs[name] * prodMult * prodBase;
      total += this.employeeProductionByJob[name];
    }

    this.employeeProductionByJob.total = total;
  }

  hireRandomEmployee(position: CorpEmployeeJob): boolean {
    if (this.atCapacity()) return false;

    this.totalExperience += getRandomIntInclusive(50, 100);

    this.avgMorale = (this.avgMorale * this.numEmployees + getRandomIntInclusive(50, 100)) / (this.numEmployees + 1);
    this.avgEnergy = (this.avgEnergy * this.numEmployees + getRandomIntInclusive(50, 100)) / (this.numEmployees + 1);

    this.avgIntelligence =
      (this.avgIntelligence * this.numEmployees + getRandomIntInclusive(50, 100)) / (this.numEmployees + 1);
    this.avgCharisma =
      (this.avgCharisma * this.numEmployees + getRandomIntInclusive(50, 100)) / (this.numEmployees + 1);
    this.avgCreativity =
      (this.avgCreativity * this.numEmployees + getRandomIntInclusive(50, 100)) / (this.numEmployees + 1);
    this.avgEfficiency =
      (this.avgEfficiency * this.numEmployees + getRandomIntInclusive(50, 100)) / (this.numEmployees + 1);

    ++this.numEmployees;
    ++this.employeeJobs[position];
    ++this.employeeNextJobs[position];
    return true;
  }

  autoAssignJob(job: CorpEmployeeJob, target: number): boolean {
    if (job === CorpEmployeeJob.Unassigned) {
      throw new Error("internal autoAssignJob function called with EmployeePositions.Unassigned");
    }
    const diff = target - this.employeeNextJobs[job];

    if (diff === 0) return true;
    // We are already at the desired number
    else if (diff <= this.employeeNextJobs[CorpEmployeeJob.Unassigned]) {
      // This covers both a negative diff (reducing the amount of employees in position) and a positive (increasing and using up unassigned employees)
      this.employeeNextJobs[CorpEmployeeJob.Unassigned] -= diff;
      this.employeeNextJobs[job] = target;
      return true;
    }
    return false;
  }

  getTeaCost(): number {
    return corpConstants.teaCostPerEmployee * this.numEmployees;
  }

  setTea(): boolean {
    if (!this.teaPending && !this.autoTea && this.numEmployees > 0) {
      this.teaPending = true;
      return true;
    }
    return false;
  }

  setParty(mult: number): boolean {
    if (mult > 1 && this.partyMult === 1 && !this.autoParty && this.numEmployees > 0) {
      this.partyMult = mult;
      return true;
    }
    return false;
  }

  toJSON(): IReviverValue {
    return Generic_toJSON("OfficeSpace", this);
  }

  static fromJSON(value: IReviverValue): OfficeSpace {
    return Generic_fromJSON(OfficeSpace, value.data);
  }
}

constructorsForReviver.OfficeSpace = OfficeSpace;
