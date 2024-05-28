import type { CompanyPosition } from "./CompanyPosition";

import { CompanyName, JobName, FactionName } from "@enums";
import { MaxFavor, calculateFavorAfterResetting } from "../Faction/formulas/favor";
import { clampNumber } from "../utils/helpers/clampNumber";

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

  #favor = 0;

  constructor(p: CompanyCtorParams) {
    this.name = p.name;
    if (p.info) this.info = p.info;
    p.companyPositions.forEach((jobName) => this.companyPositions.add(jobName));
    this.expMultiplier = p.expMultiplier;
    this.salaryMultiplier = p.salaryMultiplier;
    this.jobStatReqOffset = p.jobStatReqOffset;
    if (p.relatedFaction) this.relatedFaction = p.relatedFaction;
  }

  get favor() {
    return this.#favor;
  }

  /**
   * There is no setter for this.#favor. This is intentional. Performing arithmetic operations on `favor` may lead to
   * the overflow error of `playerReputation`, so anything that wants to change `favor` must explicitly do that through
   * `setFavor`.
   *
   * @param value
   */
  setFavor(value: number) {
    if (Number.isNaN(value)) {
      this.#favor = 0;
      return;
    }
    this.#favor = clampNumber(value, 0, MaxFavor);
  }

  hasPosition(pos: CompanyPosition | JobName): boolean {
    return this.companyPositions.has(typeof pos === "string" ? pos : pos.name);
  }

  prestigeAugmentation(): void {
    this.setFavor(calculateFavorAfterResetting(this.favor, this.playerReputation));
    this.playerReputation = 0;
  }

  prestigeSourceFile() {
    this.setFavor(0);
    this.playerReputation = 0;
  }
}
