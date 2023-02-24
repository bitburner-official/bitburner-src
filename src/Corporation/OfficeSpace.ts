import { EmployeePositions } from "./data/Enums";
import * as corpConstants from "./data/Constants";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, Reviver } from "../utils/JSONReviver";
import { Industry } from "./Industry";
import { Corporation } from "./Corporation";
import { getRandomInt } from "../utils/helpers/getRandomInt";
import { CityName } from "../Enums";

interface IParams {
  loc?: CityName;
  size?: number;
}

export class OfficeSpace {
  loc: CityName;
  size: number;

  maxEne = 100;
  maxMor = 100;

  avgEne = 75;
  avgMor = 75;

  avgInt = 75;
  avgCha = 75;
  totalExp = 0;
  avgCre = 75;
  avgEff = 75;

  totalEmployees = 0;
  totalSalary = 0;

  autoTea = false;
  autoParty = false;
  teaPending = false;
  partyMult = 1;

  employeeProd: Record<EmployeePositions | "total", number> = {
    [EmployeePositions.Operations]: 0,
    [EmployeePositions.Engineer]: 0,
    [EmployeePositions.Business]: 0,
    [EmployeePositions.Management]: 0,
    [EmployeePositions.RandD]: 0,
    [EmployeePositions.Intern]: 0,
    [EmployeePositions.Unassigned]: 0,
    total: 0,
  };
  employeeJobs: Record<EmployeePositions, number> = {
    [EmployeePositions.Operations]: 0,
    [EmployeePositions.Engineer]: 0,
    [EmployeePositions.Business]: 0,
    [EmployeePositions.Management]: 0,
    [EmployeePositions.RandD]: 0,
    [EmployeePositions.Intern]: 0,
    [EmployeePositions.Unassigned]: 0,
  };
  employeeNextJobs: Record<EmployeePositions, number> = {
    [EmployeePositions.Operations]: 0,
    [EmployeePositions.Engineer]: 0,
    [EmployeePositions.Business]: 0,
    [EmployeePositions.Management]: 0,
    [EmployeePositions.RandD]: 0,
    [EmployeePositions.Intern]: 0,
    [EmployeePositions.Unassigned]: 0,
  };

  constructor(params: IParams = {}) {
    this.loc = params.loc ? params.loc : CityName.Sector12;
    this.size = params.size ? params.size : 1;
  }

  atCapacity(): boolean {
    return this.totalEmployees >= this.size;
  }

  process(marketCycles = 1, corporation: Corporation, industry: Industry): number {
    // HRBuddy AutoRecruitment and Interning
    if (industry.hasResearch("HRBuddy-Recruitment") && !this.atCapacity()) {
      this.hireRandomEmployee(
        industry.hasResearch("HRBuddy-Training") ? EmployeePositions.Intern : EmployeePositions.Unassigned,
      );
    }

    // Update employee jobs and job counts
    for (const [pos, jobCount] of Object.entries(this.employeeNextJobs) as [EmployeePositions, number][]) {
      this.employeeJobs[pos] = jobCount;
    }

    // Process Office properties
    this.maxEne = 100;
    this.maxMor = 100;

    if (industry.hasResearch("Go-Juice")) this.maxEne += 10;
    if (industry.hasResearch("Sti.mu")) this.maxMor += 10;
    if (industry.hasResearch("AutoBrew")) this.autoTea = true;
    if (industry.hasResearch("AutoPartyManager")) this.autoParty = true;

    if (this.totalEmployees > 0) {
      /** Multiplier for employee morale/energy based on company performance */
      let perfMult = 1.002;
      if (this.totalEmployees >= 9) {
        perfMult = Math.pow(
          1 +
            0.002 * Math.min(1 / 9, this.employeeJobs.Intern / this.totalEmployees - 1 / 9) * 9 -
            (corporation.funds < 0 && industry.lastCycleRevenue < industry.lastCycleExpenses ? 0.001 : 0),
          marketCycles,
        );
      }
      // Flat reduction per cycle.
      // This does not cause a noticable decrease (it's only -.001% per cycle).
      const reduction = 0.002 * marketCycles;

      if (this.autoTea) {
        this.avgEne = this.maxEne;
      } else {
        // Tea gives a flat +2 to energy
        this.avgEne = (this.avgEne - reduction * Math.random()) * perfMult + (this.teaPending ? 2 : 0);
      }

      if (this.autoParty) {
        this.avgMor = this.maxMor;
      } else {
        // Each 5% multiplier gives an extra flat +1 to morale to make recovering from low morale easier.
        const increase = this.partyMult > 1 ? (this.partyMult - 1) * 10 : 0;
        this.avgMor = ((this.avgMor - reduction * Math.random()) * perfMult + increase) * this.partyMult;
      }

      this.avgEne = Math.max(Math.min(this.avgEne, this.maxEne), corpConstants.minEmployeeDecay);
      this.avgMor = Math.max(Math.min(this.avgMor, this.maxMor), corpConstants.minEmployeeDecay);

      this.teaPending = false;
      this.partyMult = 1;
    }

    // Get experience increase; unassigned employees do not contribute, interning employees contribute 10x
    this.totalExp +=
      0.0015 *
      marketCycles *
      (this.totalEmployees -
        this.employeeJobs[EmployeePositions.Unassigned] +
        this.employeeJobs[EmployeePositions.Intern] * 9);

    this.calculateEmployeeProductivity(corporation, industry);
    if (this.totalEmployees === 0) {
      this.totalSalary = 0;
    } else {
      this.totalSalary =
        corpConstants.employeeSalaryMultiplier *
        marketCycles *
        this.totalEmployees *
        (this.avgInt + this.avgCha + this.totalExp / this.totalEmployees + this.avgCre + this.avgEff);
    }
    return this.totalSalary;
  }

  calculateEmployeeProductivity(corporation: Corporation, industry: Industry): void {
    const effCre = this.avgCre * corporation.getEmployeeCreMultiplier() * industry.getEmployeeCreMultiplier(),
      effCha = this.avgCha * corporation.getEmployeeChaMultiplier() * industry.getEmployeeChaMultiplier(),
      effInt = this.avgInt * corporation.getEmployeeIntMultiplier() * industry.getEmployeeIntMultiplier(),
      effEff = this.avgEff * corporation.getEmployeeEffMultiplier() * industry.getEmployeeEffMultiplier();
    const prodBase = this.avgMor * this.avgEne * 1e-4;

    let total = 0;
    const exp = this.totalExp / this.totalEmployees || 0;
    for (const name of Object.keys(this.employeeProd) as (EmployeePositions | "total")[]) {
      let prodMult = 0;
      switch (name) {
        case EmployeePositions.Operations:
          prodMult = 0.6 * effInt + 0.1 * effCha + exp + 0.5 * effCre + effEff;
          break;
        case EmployeePositions.Engineer:
          prodMult = effInt + 0.1 * effCha + 1.5 * exp + effEff;
          break;
        case EmployeePositions.Business:
          prodMult = 0.4 * effInt + effCha + 0.5 * exp;
          break;
        case EmployeePositions.Management:
          prodMult = 2 * effCha + exp + 0.2 * effCre + 0.7 * effEff;
          break;
        case EmployeePositions.RandD:
          prodMult = 1.5 * effInt + 0.8 * exp + effCre + 0.5 * effEff;
          break;
        case EmployeePositions.Unassigned:
        case EmployeePositions.Intern:
        case "total":
          continue;
        default:
          console.error(`Invalid employee position: ${name}`);
          break;
      }
      this.employeeProd[name] = this.employeeJobs[name] * prodMult * prodBase;
      total += this.employeeProd[name];
    }

    this.employeeProd.total = total;
  }

  hireRandomEmployee(position: EmployeePositions): boolean {
    if (this.atCapacity()) return false;
    if (document.getElementById("cmpy-mgmt-hire-employee-popup") != null) return false;

    ++this.totalEmployees;
    ++this.employeeJobs[position];
    ++this.employeeNextJobs[position];

    this.totalExp += getRandomInt(50, 100);

    this.avgMor = (this.avgMor * this.totalEmployees + getRandomInt(50, 100)) / (this.totalEmployees + 1);
    this.avgEne = (this.avgEne * this.totalEmployees + getRandomInt(50, 100)) / (this.totalEmployees + 1);

    this.avgInt = (this.avgInt * this.totalEmployees + getRandomInt(50, 100)) / (this.totalEmployees + 1);
    this.avgCha = (this.avgCha * this.totalEmployees + getRandomInt(50, 100)) / (this.totalEmployees + 1);
    this.avgCre = (this.avgCre * this.totalEmployees + getRandomInt(50, 100)) / (this.totalEmployees + 1);
    this.avgEff = (this.avgEff * this.totalEmployees + getRandomInt(50, 100)) / (this.totalEmployees + 1);
    return true;
  }

  autoAssignJob(job: EmployeePositions, target: number): boolean {
    if (job === EmployeePositions.Unassigned) {
      throw new Error("internal autoAssignJob function called with EmployeePositions.Unassigned");
    }
    const diff = target - this.employeeNextJobs[job];

    if (diff === 0) return true;
    // We are already at the desired number
    else if (diff <= this.employeeNextJobs[EmployeePositions.Unassigned]) {
      // This covers both a negative diff (reducing the amount of employees in position) and a positive (increasing and using up unassigned employees)
      this.employeeNextJobs[EmployeePositions.Unassigned] -= diff;
      this.employeeNextJobs[job] = target;
      return true;
    }
    return false;
  }

  getTeaCost(): number {
    return corpConstants.teaCostPerEmployee * this.totalEmployees;
  }

  setTea(): boolean {
    if (!this.teaPending && !this.autoTea && this.totalEmployees > 0) {
      this.teaPending = true;
      return true;
    }
    return false;
  }

  setParty(mult: number): boolean {
    if (mult > 1 && this.partyMult === 1 && !this.autoParty && this.totalEmployees > 0) {
      this.partyMult = mult;
      return true;
    }
    return false;
  }

  toJSON(): IReviverValue {
    return Generic_toJSON("OfficeSpace", this);
  }

  static fromJSON(value: IReviverValue): OfficeSpace {
    // Convert employees from the old version
    if (value.data.hasOwnProperty("employees")) {
      const empCopy: [{ data: { mor: number; ene: number; exp: number } }] = value.data.employees;
      delete value.data.employees;
      const ret = Generic_fromJSON(OfficeSpace, value.data);
      ret.totalEmployees = empCopy.length;
      ret.avgMor = empCopy.reduce((a, b) => a + b.data.mor, 0) / ret.totalEmployees || 75;
      ret.avgEne = empCopy.reduce((a, b) => a + b.data.ene, 0) / ret.totalEmployees || 75;
      ret.totalExp = empCopy.reduce((a, b) => a + b.data.exp, 0);
      return ret;
    }
    return Generic_fromJSON(OfficeSpace, value.data);
  }
}

Reviver.constructors.OfficeSpace = OfficeSpace;
