import type { ReactNode } from "react";

/** Object representing an upgrade that can be purchased with hashes */
export interface HashUpgradeParams {
  cost?: number;
  costPerLevel: number;
  desc: ReactNode;
  hasTargetServer?: boolean;
  hasTargetCompany?: boolean;
  name: string;
  value: number;
  effectText?: (level: number) => JSX.Element | null;
}

export class HashUpgrade {
  /**
   * If the upgrade has a flat cost (never increases), it goes here
   * Otherwise, this property should be undefined
   *
   * This property overrides the 'costPerLevel' property
   */
  cost?: number;

  /**
   * Base cost for this upgrade. Every time the upgrade is purchased,
   * its cost increases by this same amount (so its 1x, 2x, 3x, 4x, etc.)
   */
  costPerLevel = 0;

  /** Description of what the upgrade does */
  desc: ReactNode = "";

  /**
   * Boolean indicating that this upgrade's effect affects a single server,
   * the "target" server
   */
  hasTargetServer = false;

  /**
   * Boolean indicating that this upgrade's effect affects a single company,
   * the "target" company
   */
  hasTargetCompany = false;

  /** Name of upgrade */
  name = "";

  // Generic value used to indicate the potency/amount of this upgrade's effect
  // The meaning varies between different upgrades
  value = 0;

  constructor(p: HashUpgradeParams) {
    if (p.cost != null) {
      this.cost = p.cost;
    }
    if (p.effectText != null) {
      this.effectText = p.effectText;
    }

    this.costPerLevel = p.costPerLevel;
    this.desc = p.desc;
    this.hasTargetServer = p.hasTargetServer ? p.hasTargetServer : false;
    this.hasTargetCompany = p.hasTargetCompany ? p.hasTargetCompany : false;
    this.name = p.name;
    this.value = p.value;
  }

  // Functions that returns the UI element to display the effect of this upgrade.
  effectText: (level: number) => JSX.Element | null = () => null;

  getCost(currentLevel: number, count = 1): number {
    if (typeof this.cost === "number") {
      return this.cost * count;
    }

    //This formula is equivalent to
    //(currentLevel + 1) * this.costPerLevel
    //being performed repeatedly
    const collapsedSum = 0.5 * count * (count + 2 * currentLevel + 1);
    return this.costPerLevel * collapsedSum;
  }
}
