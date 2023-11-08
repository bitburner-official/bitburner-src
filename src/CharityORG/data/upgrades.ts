export interface IMults {
  hack?: number;
  str?: number;
  def?: number;
  dex?: number;
  agi?: number;
  cha?: number;
}

// Does not need an enum helper, not in an enums file
export enum UpgradeType {
  Suits = "s", //Cha
  Shoes = "h", //Agi
  Tools = "t", //Str
  SelfDefence = "d", //Def
  Practice = "x", //Dex
  Underground = "u", // hacking
}

/**
 * Defines the parameters that can be used to initialize and describe a GangMemberUpgrade
 * (defined in Gang.js)
 */
interface ICharityVolunteerUpgradeMetadata {
  cost: number;
  mults: IMults;
  name: string;
  upgType: UpgradeType;
}

/**
 * Array of metadata for all Gang Member upgrades. Used to construct the global GangMemberUpgrade
 * objects in Gang.js
 */
export const charityVolunteerUpgradesMetadata: ICharityVolunteerUpgradeMetadata[] = [
  {
    cost: 1e6,
    mults: { str: 1.04 },
    name: "Hammer",
    upgType: UpgradeType.Tools,
  },
  {
    cost: 1e6,
    mults: { agi: 1.04 },
    name: "Crocks",
    upgType: UpgradeType.Shoes,
  },
  {
    cost: 1e6,
    mults: { cha: 1.04 },
    name: "Button up shirt",
    upgType: UpgradeType.Suits,
  },
  {
    cost: 1e6,
    mults: { def: 1.04 },
    name: "Basic self defence class",
    upgType: UpgradeType.SelfDefence,
  },
  {
    cost: 1e6,
    mults: { dex: 1.04 },
    name: "Learn to walk a tightrope",
    upgType: UpgradeType.Practice,
  },
  {
    cost: 1e6,
    mults: { hack: 1.04 },
    name: "Play Bitburner",
    upgType: UpgradeType.Underground,
  },
];
