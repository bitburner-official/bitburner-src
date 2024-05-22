import { CityName } from "@enums";
import { BladeburnerConstants } from "./data/Constants";
import { getRandomIntInclusive } from "../utils/helpers/getRandomIntInclusive";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { addOffset } from "../utils/helpers/addOffset";
import { clampInteger, clampNumber } from "../utils/helpers/clampNumber";

export class City {
  name: CityName;
  pop = 0; // Population
  popEst = 0; // Population estimate
  comms = 0; // Number of communities
  chaos = 0;

  constructor(name = CityName.Sector12) {
    this.name = name;

    // Synthoid population and estimate
    this.pop = getRandomIntInclusive(
      BladeburnerConstants.PopulationThreshold,
      1.5 * BladeburnerConstants.PopulationThreshold,
    );
    this.popEst = this.pop * (Math.random() + 0.5);

    // Number of Synthoid communities population and estimate
    this.comms = getRandomIntInclusive(5, 150);
    this.chaos = 0;
  }

  /** @param {number} p - the percentage change, not the multiplier. e.g. pass in p = 5 for 5% */
  changeChaosByPercentage(p: number): void {
    this.chaos = clampNumber(this.chaos * (1 + p / 100), 0);
  }

  improvePopulationEstimateByCount(n: number): void {
    n = clampInteger(n, 0);
    const diff = Math.abs(this.popEst - this.pop);
    // Chgnge would overshoot actual population -> make estimate accurate
    if (diff <= n) this.popEst = this.pop;
    // Otherwise make enstimate closer by n
    else if (this.popEst < this.pop) this.popEst += n;
    else this.popEst -= n;
  }

  /** @param {number} p - the percentage change, not the multiplier. e.g. pass in p = 5 for 5% */
  improvePopulationEstimateByPercentage(p: number, skillMult = 1): void {
    p = clampNumber((p * skillMult) / 100);
    const diff = Math.abs(this.popEst - this.pop);
    // Chgnge would overshoot actual population -> make estimate accurate
    if (diff <= p * this.popEst) this.popEst = this.pop;
    // Otherwise make enstimate closer by n
    else if (this.popEst < this.pop) this.popEst = clampNumber(this.popEst * (1 + p));
    else this.popEst = clampNumber(this.popEst * (1 - p));
  }

  /**
   * @param params.estChange - Number to change the estimate by
   * @param params.estOffset - Offset percentage to apply to estimate */
  changePopulationByCount(n: number, params = { estChange: 0, estOffset: 0 }): void {
    n = clampInteger(n);
    this.pop = clampInteger(this.pop + n, 0);
    if (params.estChange && !isNaN(params.estChange)) {
      this.popEst += params.estChange;
    }
    if (params.estOffset) {
      this.popEst = addOffset(this.popEst, params.estOffset);
    }
    this.popEst = clampInteger(this.popEst, 0);
  }

  /**
   * @param {number} p - the percentage change, not the multiplier. e.g. pass in p = 5 for 5%
   * @param {boolean} params.changeEstEqually - Whether to change the population estimate by an equal amount
   * @param {boolean} params.nonZero - Whether to ensure that population always changes by at least 1 */
  changePopulationByPercentage(p: number, params = { nonZero: false, changeEstEqually: false }): number {
    let change = clampInteger(this.pop * (p / 100));

    if (params.nonZero && change === 0) change = p > 0 ? 1 : -1;

    this.pop = clampInteger(this.pop + change, 0);
    if (params.changeEstEqually) this.popEst = clampInteger(this.popEst + change, 0);
    return change;
  }

  changeChaosByCount(n: number): void {
    this.chaos = clampNumber(this.chaos + n, 0);
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("City", this);
  }

  /** Initializes a City object from a JSON save state. */
  static fromJSON(value: IReviverValue): City {
    return Generic_fromJSON(City, value.data);
  }
}

constructorsForReviver.City = City;
