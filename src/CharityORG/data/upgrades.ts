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
  {
    cost: 5e6,
    mults: { str: 1.05 },
    name: "CrowBar",
    upgType: UpgradeType.Tools,
  },
  {
    cost: 5e6,
    mults: { agi: 1.05 },
    name: "Platforms",
    upgType: UpgradeType.Shoes,
  },
  {
    cost: 5e6,
    mults: { cha: 1.05 },
    name: "Silk Shirt",
    upgType: UpgradeType.Suits,
  },
  {
    cost: 5e6,
    mults: { def: 1.05 },
    name: "Karate",
    upgType: UpgradeType.SelfDefence,
  },
  {
    cost: 5e6,
    mults: { dex: 1.05 },
    name: "Tumbling",
    upgType: UpgradeType.Practice,
  },
  {
    cost: 5e6,
    mults: { hack: 1.05 },
    name: "Read Java Booklet",
    upgType: UpgradeType.Underground,
  },
  {
    cost: 1e8,
    mults: { str: 1.06 },
    name: "Shovel",
    upgType: UpgradeType.Tools,
  },
  {
    cost: 1e7,
    mults: { agi: 1.06 },
    name: "Leather Shoes",
    upgType: UpgradeType.Shoes,
  },
  {
    cost: 1e7,
    mults: { cha: 1.06 },
    name: "Stylish Shirt",
    upgType: UpgradeType.Suits,
  },
  {
    cost: 1e7,
    mults: { def: 1.06 },
    name: "Judo",
    upgType: UpgradeType.SelfDefence,
  },
  {
    cost: 1e7,
    mults: { dex: 1.06 },
    name: "Reaction Training",
    upgType: UpgradeType.Practice,
  },
  {
    cost: 1e7,
    mults: { hack: 1.06 },
    name: "Write Scripts",
    upgType: UpgradeType.Underground,
  },
  {
    cost: 5e7,
    mults: { str: 1.07 },
    name: "ToolBox",
    upgType: UpgradeType.Tools,
  },
  {
    cost: 5e7,
    mults: { agi: 1.07 },
    name: "Sandals",
    upgType: UpgradeType.Shoes,
  },
  {
    cost: 5e7,
    mults: { cha: 1.07 },
    name: "Hawaiian Shirt",
    upgType: UpgradeType.Suits,
  },
  {
    cost: 5e7,
    mults: { def: 1.07 },
    name: "TaiChi",
    upgType: UpgradeType.SelfDefence,
  },
  {
    cost: 5e7,
    mults: { dex: 1.07 },
    name: "Balance on 1 foot",
    upgType: UpgradeType.Practice,
  },
  {
    cost: 5e7,
    mults: { hack: 1.07 },
    name: "Hacking Trials",
    upgType: UpgradeType.Underground,
  },
  {
    cost: 1e8,
    mults: { str: 1.08 },
    name: "Bucket",
    upgType: UpgradeType.Tools,
  },
  {
    cost: 1e8,
    mults: { agi: 1.08 },
    name: "Slippers",
    upgType: UpgradeType.Shoes,
  },
  {
    cost: 1e8,
    mults: { cha: 1.08 },
    name: "TieDye Shirt",
    upgType: UpgradeType.Suits,
  },
  {
    cost: 1e8,
    mults: { def: 1.08 },
    name: "Muitai",
    upgType: UpgradeType.SelfDefence,
  },
  {
    cost: 1e8,
    mults: { dex: 1.08 },
    name: "Hand Stand",
    upgType: UpgradeType.Practice,
  },
  {
    cost: 1e8,
    mults: { hack: 1.08 },
    name: "Take University Course",
    upgType: UpgradeType.Underground,
  },
  {
    cost: 1e9,
    mults: { str: 1.09 },
    name: "Bricks",
    upgType: UpgradeType.Tools,
  },
  {
    cost: 1e9,
    mults: { agi: 1.09 },
    name: "Socks",
    upgType: UpgradeType.Shoes,
  },
  {
    cost: 1e9,
    mults: { cha: 1.09 },
    name: "Overshirt",
    upgType: UpgradeType.Suits,
  },
  {
    cost: 1e9,
    mults: { def: 1.09 },
    name: "Judo",
    upgType: UpgradeType.SelfDefence,
  },
  {
    cost: 1e9,
    mults: { dex: 1.09 },
    name: "Stretching",
    upgType: UpgradeType.Practice,
  },
  {
    cost: 1e9,
    mults: { hack: 1.09 },
    name: "Advanced Booklet",
    upgType: UpgradeType.Underground,
  },
  {
    cost: 1e10,
    mults: { str: 1.15 },
    name: "Sledge Hammer",
    upgType: UpgradeType.Tools,
  },
  {
    cost: 1e10,
    mults: { agi: 1.15 },
    name: "Agility Course",
    upgType: UpgradeType.Shoes,
  },
  {
    cost: 1e10,
    mults: { cha: 1.15 },
    name: "Lucky Mirror",
    upgType: UpgradeType.Suits,
  },
  {
    cost: 1e10,
    mults: { def: 1.15 },
    name: "Kung-Fu",
    upgType: UpgradeType.SelfDefence,
  },
  {
    cost: 1e10,
    mults: { dex: 1.15 },
    name: "Walk on water",
    upgType: UpgradeType.Practice,
  },
  {
    cost: 1e10,
    mults: { hack: 1.15 },
    name: "Contrubute to Bitburner",
    upgType: UpgradeType.Underground,
  },
];
