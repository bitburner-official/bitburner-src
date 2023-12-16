import { Player } from "@player";
import { CorpStateName, InvestmentOffer } from "@nsdefs";
import { CorpUnlockName, CorpUpgradeName, LiteratureName } from "@enums";
import { CorporationState } from "./CorporationState";
import { CorpUnlocks } from "./data/CorporationUnlocks";
import { CorpUpgrades } from "./data/CorporationUpgrades";
import * as corpConstants from "./data/Constants";
import { FundsSource, LongTermFundsSources } from "./data/FundsSource";
import { Division } from "./Division";
import { calculateUpgradeCost } from "./helpers";

import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { showLiterature } from "../Literature/LiteratureHelpers";

import { dialogBoxCreate } from "../ui/React/DialogBox";
import { constructorsForReviver, Generic_toJSON, Generic_fromJSON, IReviverValue } from "../utils/JSONReviver";
import { JSONMap, JSONSet } from "../Types/Jsonable";
import { formatMoney } from "../ui/formatNumber";
import { isPositiveInteger } from "../types";
import { createEnumKeyedRecord, getRecordValues } from "../Types/Record";

export const CorporationResolvers: ((prevState: CorpStateName) => void)[] = [];

interface ICorporationParams {
  name?: string;
  seedFunded?: boolean;
  shareSaleCooldown?: number;
}

export class Corporation {
  name = "The Corporation";

  /** Map keyed by division name */
  divisions = new JSONMap<string, Division>();
  maxDivisions = 20 * currentNodeMults.CorporationDivisions;

  //Financial stats
  funds = 150e9;
  revenue = 0;
  expenses = 0;
  fundingRound = 0;
  /** Publicly traded */
  public = false;
  /** Total existing shares */
  totalShares = corpConstants.initialShares;
  numShares = corpConstants.initialShares; // Total shares owned by player
  shareSalesUntilPriceUpdate = corpConstants.sharesPerPriceUpdate;
  shareSaleCooldown = 0; // Game cycles until player can sell shares again
  issueNewSharesCooldown = 0; // Game cycles until player can issue shares again
  dividendRate = 0;
  dividendTax = 1 - currentNodeMults.CorporationSoftcap + 0.15;
  investorShares = 0;
  issuedShares = 0;
  sharePrice = 0;
  storedCycles = 0;

  unlocks = new JSONSet<CorpUnlockName>();
  upgrades = createEnumKeyedRecord(CorpUpgradeName, (name) => ({
    level: 0,
    // For dreamsense, value is not a multiplier so it starts at 0
    value: name === CorpUpgradeName.DreamSense ? 0 : 1,
  }));

  previousTotalAssets = 150e9;
  totalAssets = 150e9;
  cycleValuation = 0;
  valuationsList = [0];
  valuation = 0;

  seedFunded: boolean;

  state = new CorporationState();

  constructor(params: ICorporationParams = {}) {
    this.name = params.name || "The Corporation";
    this.seedFunded = params.seedFunded ?? false;
    this.shareSaleCooldown = params.shareSaleCooldown ?? 0;
  }

  gainFunds(amt: number, source: FundsSource): void {
    if (!isFinite(amt)) {
      console.error("Trying to add invalid amount of funds. Please report to game developer.");
      return;
    }
    if (LongTermFundsSources.has(source)) {
      // This cycle's assets include the purchase price of a capital expenditure.
      // (It will likely depreciate in the following cycle.)
      // Or the value of some non-accounted item (equity, hashes) that was sold for a capital gain.
      // (It will remain as funds, with no effect on assetDelta.)
      this.totalAssets += Math.abs(amt);
    }
    this.funds += amt;
  }

  loseFunds(amt: number, source: FundsSource): void {
    return this.gainFunds(-amt, source);
  }

  getNextState(): CorpStateName {
    return this.state.nextName;
  }

  storeCycles(numCycles: number): void {
    this.storedCycles += numCycles;
  }

  process(): void {
    if (this.storedCycles < 0) this.storedCycles = 0;

    if (this.storedCycles >= corpConstants.gameCyclesPerCorpStateCycle) {
      const state = this.getNextState();
      const marketCycles = 1;
      const gameCycles = marketCycles * corpConstants.gameCyclesPerCorpStateCycle;
      this.storedCycles -= gameCycles;

      // Can't combine these loops, imports must be completely cleared before
      // we start processing exports of any division.
      for (const ind of this.divisions.values()) {
        ind.resetImports(state);
      }
      for (const ind of this.divisions.values()) {
        ind.process(marketCycles, this);
      }

      // Process cooldowns
      if (this.shareSaleCooldown > 0) {
        this.shareSaleCooldown -= gameCycles;
      }
      if (this.issueNewSharesCooldown > 0) {
        this.issueNewSharesCooldown -= gameCycles;
      }

      //At the start of a new cycle, calculate profits from previous cycle
      if (state === "START") {
        this.revenue = 0;
        this.expenses = 0;
        this.divisions.forEach((ind) => {
          if (ind.lastCycleRevenue === -Infinity || ind.lastCycleRevenue === Infinity) {
            return;
          }
          if (ind.lastCycleExpenses === -Infinity || ind.lastCycleExpenses === Infinity) {
            return;
          }
          this.revenue = this.revenue + ind.lastCycleRevenue;
          this.expenses = this.expenses + ind.lastCycleExpenses;
        });
        if (isNaN(this.funds) || this.funds === Infinity || this.funds === -Infinity) {
          dialogBoxCreate(
            "There was an error calculating your Corporations funds and they got reset to 0. " +
              "This is a bug. Please report to game developer.\n\n" +
              "(Your funds have been set to $150b for the inconvenience)",
          );
          this.funds = 150e9;
        }
        const cycleRevenue = this.revenue * (marketCycles * corpConstants.secondsPerMarketCycle);
        const cycleExpenses = this.expenses * (marketCycles * corpConstants.secondsPerMarketCycle);
        const cycleProfit = cycleRevenue - cycleExpenses;
        this.gainFunds(cycleRevenue, "operating revenue");
        this.loseFunds(cycleExpenses, "operating expenses");
        if (this.dividendRate > 0 && cycleProfit > 0) {
          // Validate input again, just to be safe
          if (isNaN(this.dividendRate) || this.dividendRate < 0 || this.dividendRate > corpConstants.dividendMaxRate) {
            console.error(`Invalid Corporation dividend rate: ${this.dividendRate}`);
          } else {
            const totalDividends = this.dividendRate * cycleProfit;
            Player.gainMoney(this.getCycleDividends(), "corporation");
            this.loseFunds(totalDividends, "dividends");
          }
        }
        this.updateTotalAssets();
        this.cycleValuation = this.determineCycleValuation();
        this.determineValuation();
        this.updateSharePrice();
      }

      this.state.incrementState();

      // Handle "nextUpdate" resolvers after this update
      for (const resolve of CorporationResolvers.splice(0)) {
        resolve(state);
      }
    }
  }

  getCycleDividends(): number {
    const profit = this.revenue - this.expenses;
    const cycleProfit = profit * corpConstants.secondsPerMarketCycle;
    const totalDividends = this.dividendRate * cycleProfit;
    const dividendsPerShare = totalDividends / this.totalShares;
    const dividends = this.numShares * dividendsPerShare;
    return Math.pow(dividends, 1 - this.dividendTax);
  }

  determineCycleValuation(): number {
    let val,
      assetDelta = (this.totalAssets - this.previousTotalAssets) / corpConstants.secondsPerMarketCycle;
    // Handle pre-totalAssets saves
    assetDelta ??= this.revenue - this.expenses;
    if (this.public) {
      // Account for dividends
      if (this.dividendRate > 0) {
        assetDelta *= 1 - this.dividendRate;
      }

      val = this.funds + assetDelta * 85e3;
      val *= Math.pow(1.1, this.divisions.size);
      val = Math.max(val, 0);
    } else {
      val = 10e9 + this.funds / 3;
      if (assetDelta > 0) {
        val += assetDelta * 315e3;
      }
      val *= Math.pow(1.1, this.divisions.size);
      val -= val % 1e6; //Round down to nearest million
    }
    if (val < 10e9) val = 10e9; // Base valuation
    return val * currentNodeMults.CorporationValuation;
  }

  determineValuation(): void {
    this.valuationsList.push(this.cycleValuation); //Add current valuation to the list
    if (this.valuationsList.length > corpConstants.valuationLength) this.valuationsList.shift();
    let val = this.valuationsList.reduce((a, b) => a + b); //Calculate valuations sum
    val /= this.valuationsList.length; //Calculate the average
    this.valuation = val;
  }

  updateTotalAssets(): void {
    let assets = this.funds;
    this.divisions.forEach((ind) => {
      assets += ind.calculateRecoupableValue();
      for (const warehouse of getRecordValues(ind.warehouses)) {
        for (const mat of getRecordValues(warehouse.materials)) {
          assets += mat.stored * mat.averagePrice;
        }
        for (const prod of ind.products.values()) {
          assets += prod.cityData[warehouse.city].stored * prod.cityData[warehouse.city].productionCost;
        }
      }
    });
    this.previousTotalAssets = this.totalAssets;
    this.totalAssets = assets;
  }

  getTargetSharePrice(ceoOwnership: number | null = null): number {
    // Share price is proportional to total corporation valuation.
    // When the CEO owns 0% of the company, market cap is 0.5x valuation.
    // When the CEO owns 25% of the company, market cap is 1.0x valuation.
    // When the CEO owns 100% of shares, market cap is 1.5x valuation.
    if (ceoOwnership === null) {
      ceoOwnership = this.numShares / this.totalShares;
    }
    const ceoConfidence = 0.5 + Math.sqrt(Math.max(0, ceoOwnership));
    const marketCap = this.valuation * ceoConfidence;
    return marketCap / this.totalShares;
  }

  updateSharePrice(): void {
    const targetPrice = this.getTargetSharePrice();
    if (this.sharePrice <= targetPrice) {
      this.sharePrice *= 1 + Math.random() * 0.01;
    } else {
      this.sharePrice *= 1 - Math.random() * 0.01;
    }
    if (this.sharePrice <= 0.01) {
      this.sharePrice = 0.01;
    }
  }

  calculateMaxNewShares(): number {
    const maxNewSharesUnrounded = Math.round(this.totalShares * 0.2);
    const maxNewShares = maxNewSharesUnrounded - (maxNewSharesUnrounded % 10e6);
    return maxNewShares;
  }

  // Calculates how much money will be made and what the resulting stock price
  // will be when the player sells their shares
  // @return - [Player profit, final stock price, end shareSalesUntilPriceUpdate property]
  calculateShareSale(numShares: number): [profit: number, sharePrice: number, sharesUntilUpdate: number] {
    let sharesRemaining = numShares;
    let sharesUntilUpdate = this.shareSalesUntilPriceUpdate;
    let sharePrice = this.sharePrice;
    let sharesSold = 0;
    let profit = 0;

    const sharesPerStep = Math.sign(numShares || 1) * corpConstants.sharesPerPriceUpdate;
    const maxIterations = Math.ceil(numShares / sharesPerStep);

    if (isNaN(maxIterations) || maxIterations > 10e6) {
      console.error(
        `Something went wrong or unexpected when calculating share sale. Max iterations calculated to be ${maxIterations}`,
      );
      return [0, 0, 0];
    }

    for (let i = 0; i < maxIterations; ++i) {
      if (Math.abs(sharesRemaining) < Math.abs(sharesUntilUpdate)) {
        profit += sharePrice * sharesRemaining;
        sharesUntilUpdate -= sharesRemaining;
        break;
      } else {
        profit += sharePrice * sharesPerStep;
        sharesRemaining -= sharesPerStep;
        sharesSold += sharesPerStep;

        // Update the share price
        const ceoOwnership = (this.numShares - sharesSold) / this.totalShares;
        const targetPrice = this.getTargetSharePrice(ceoOwnership);
        if (sharePrice <= targetPrice) {
          sharePrice *= 1 + 0.5 * 0.01;
        } else {
          sharePrice *= 1 - 0.5 * 0.01;
        }
        sharesUntilUpdate = corpConstants.sharesPerPriceUpdate;
      }
    }

    return [profit, sharePrice, sharesUntilUpdate];
  }

  calculateShareBuyback(numShares: number): [cost: number, sharePrice: number, sharesUntilUpdate: number] {
    const [profit, sharePrice, sharesUntilUpdate] = this.calculateShareSale(-numShares);
    const cost = -1.1 * profit;
    return [cost, sharePrice, sharesUntilUpdate];
  }

  getInvestmentOffer(): InvestmentOffer {
    if (
      this.fundingRound >= corpConstants.fundingRoundShares.length ||
      this.fundingRound >= corpConstants.fundingRoundMultiplier.length ||
      this.public
    )
      return {
        funds: 0,
        shares: 0,
        round: this.fundingRound + 1, // Make more readable
      }; // Don't throw an error here, no reason to have a second function to check if you can get investment.
    const val = this.valuation;
    const percShares = corpConstants.fundingRoundShares[this.fundingRound];
    const roundMultiplier = corpConstants.fundingRoundMultiplier[this.fundingRound];
    const funding = val * percShares * roundMultiplier;
    const investShares = Math.floor(corpConstants.initialShares * percShares);
    return {
      funds: funding,
      shares: investShares,
      round: this.fundingRound + 1, // Make more readable
    };
  }

  convertCooldownToString(cd: number): string {
    // The cooldown value is based on game cycles. Convert to a simple string
    const seconds = cd / 5;

    const SecondsPerMinute = 60;
    const SecondsPerHour = 3600;

    if (seconds > SecondsPerHour) {
      return `${Math.floor(seconds / SecondsPerHour)} hour(s)`;
    } else if (seconds > SecondsPerMinute) {
      return `${Math.floor(seconds / SecondsPerMinute)} minute(s)`;
    } else {
      return `${Math.floor(seconds)} second(s)`;
    }
  }

  /** Purchasing a one-time unlock
   * @returns A string on failure, indicating the reason for failure. */
  purchaseUnlock(unlockName: CorpUnlockName): string | void {
    if (this.unlocks.has(unlockName)) return `The corporation has already unlocked ${unlockName}`;
    const price = CorpUnlocks[unlockName].price;
    if (this.funds < price) return `Insufficient funds to purchase ${unlockName}, requires ${formatMoney(price)}`;
    this.loseFunds(price, "upgrades");
    this.unlocks.add(unlockName);

    // Apply effects for one-time unlocks
    if (unlockName === CorpUnlockName.ShadyAccounting) this.dividendTax -= 0.05;
    if (unlockName === CorpUnlockName.GovernmentPartnership) this.dividendTax -= 0.1;
  }

  /** Purchasing a levelable upgrade
   * @returns A string on failure, indicating the reason for failure. */
  purchaseUpgrade(upgradeName: CorpUpgradeName, amount = 1): string | void {
    if (!isPositiveInteger(amount)) {
      return `Number of upgrade levels purchased must be a positive integer (attempted: ${amount}).`;
    }
    const upgrade = CorpUpgrades[upgradeName];
    const totalCost = calculateUpgradeCost(this, upgrade, amount);
    if (this.funds < totalCost) return `Not enough funds to purchase ${amount} of upgrade ${upgradeName}.`;
    this.loseFunds(totalCost, "upgrades");
    this.upgrades[upgradeName].level += amount;
    this.upgrades[upgradeName].value += upgrade.benefit * amount;

    // Apply effects for upgrades
    if (upgradeName === CorpUpgradeName.SmartStorage) {
      for (const division of this.divisions.values()) {
        for (const warehouse of getRecordValues(division.warehouses)) {
          warehouse.updateSize(this, division);
        }
      }
    }
  }

  getProductionMultiplier(): number {
    return this.upgrades[CorpUpgradeName.SmartFactories].value;
  }

  getStorageMultiplier(): number {
    return this.upgrades[CorpUpgradeName.SmartStorage].value;
  }

  getDreamSenseGain(): number {
    return this.upgrades[CorpUpgradeName.DreamSense].value;
  }

  getAdvertisingMultiplier(): number {
    return this.upgrades[CorpUpgradeName.WilsonAnalytics].value;
  }

  getEmployeeCreMultiplier(): number {
    return this.upgrades[CorpUpgradeName.NuoptimalNootropicInjectorImplants].value;
  }

  getEmployeeChaMult(): number {
    return this.upgrades[CorpUpgradeName.SpeechProcessorImplants].value;
  }

  getEmployeeIntMult(): number {
    return this.upgrades[CorpUpgradeName.NeuralAccelerators].value;
  }

  getEmployeeEffMult(): number {
    return this.upgrades[CorpUpgradeName.FocusWires].value;
  }

  getSalesMult(): number {
    return this.upgrades[CorpUpgradeName.ABCSalesBots].value;
  }

  getScientificResearchMult(): number {
    return this.upgrades[CorpUpgradeName.ProjectInsight].value;
  }

  // Adds the Corporation Handbook (Starter Guide) to the player's home computer.
  // This is a lit file that gives introductory info to the player
  // This occurs when the player clicks the "Getting Started Guide" button on the overview panel
  getStarterGuide(): void {
    // Check if player already has Corporation Handbook
    const homeComp = Player.getHomeComputer();
    const handbook = LiteratureName.CorporationManagementHandbook;
    if (!homeComp.messages.includes(handbook)) homeComp.messages.push(handbook);
    showLiterature(handbook);
    return;
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("Corporation", this);
  }

  /** Initializes a Corporation object from a JSON save state. */
  static fromJSON(value: IReviverValue): Corporation {
    return Generic_fromJSON(Corporation, value.data);
  }
}

constructorsForReviver.Corporation = Corporation;
