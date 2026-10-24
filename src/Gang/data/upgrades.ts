import { GangMemberUpgradeEnum } from "../Enums";

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
  Weapon = "w",
  Armor = "a",
  Vehicle = "v",
  Rootkit = "r",
  Augmentation = "g",
}

/**
 * Defines the parameters that can be used to initialize and describe a GangMemberUpgrade
 * (defined in Gang.js)
 */
interface IGangMemberUpgradeMetadata {
  cost: number;
  mults: IMults;
  name: string;
  upgType: UpgradeType;
}

/**
 * Array of metadata for all Gang Member upgrades. Used to construct the global GangMemberUpgrade
 * objects in Gang.js
 */
export const gangMemberUpgradesMetadata: IGangMemberUpgradeMetadata[] = [
  {
    cost: 1e6,
    mults: { str: 1.04, def: 1.04 },
    name: GangMemberUpgradeEnum.Bat,
    upgType: UpgradeType.Weapon,
  },
  {
    cost: 12e6,
    mults: { str: 1.08, def: 1.08, dex: 1.08 },
    name: GangMemberUpgradeEnum.Katana,
    upgType: UpgradeType.Weapon,
  },
  {
    cost: 25e6,
    mults: { str: 1.1, def: 1.1, dex: 1.1, agi: 1.1 },
    name: GangMemberUpgradeEnum.Malorian,
    upgType: UpgradeType.Weapon,
  },
  {
    cost: 50e6,
    mults: { str: 1.12, def: 1.1, agi: 1.1 },
    name: GangMemberUpgradeEnum.Hansen,
    upgType: UpgradeType.Weapon,
  },
  {
    cost: 60e6,
    mults: { str: 1.2, def: 1.15 },
    name: GangMemberUpgradeEnum.Arasaka,
    upgType: UpgradeType.Weapon,
  },
  {
    cost: 100e6,
    mults: { str: 1.25, def: 1.2 },
    name: GangMemberUpgradeEnum.Militech,
    upgType: UpgradeType.Weapon,
  },
  {
    cost: 150e6,
    mults: { str: 1.3, def: 1.25 },
    name: GangMemberUpgradeEnum.Nokota,
    upgType: UpgradeType.Weapon,
  },
  {
    cost: 225e6,
    mults: { str: 1.3, dex: 1.25, agi: 1.3 },
    name: GangMemberUpgradeEnum.Techtronika,
    upgType: UpgradeType.Weapon,
  },
  {
    cost: 2e6,
    mults: { def: 1.04 },
    name: GangMemberUpgradeEnum.Vest,
    upgType: UpgradeType.Armor,
  },
  {
    cost: 5e6,
    mults: { def: 1.08 },
    name: GangMemberUpgradeEnum.FullArmor,
    upgType: UpgradeType.Armor,
  },
  {
    cost: 25e6,
    mults: { def: 1.15, agi: 1.15 },
    name: GangMemberUpgradeEnum.LiquidArmor,
    upgType: UpgradeType.Armor,
  },
  {
    cost: 40e6,
    mults: { def: 1.2 },
    name: GangMemberUpgradeEnum.GrapheneArmor,
    upgType: UpgradeType.Armor,
  },
  {
    cost: 3e6,
    mults: { agi: 1.04, cha: 1.04 },
    name: GangMemberUpgradeEnum.Herrera,
    upgType: UpgradeType.Vehicle,
  },
  {
    cost: 9e6,
    mults: { agi: 1.08, cha: 1.08 },
    name: GangMemberUpgradeEnum.Yaiba,
    upgType: UpgradeType.Vehicle,
  },
  {
    cost: 18e6,
    mults: { agi: 1.12, cha: 1.12 },
    name: GangMemberUpgradeEnum.Rayfield,
    upgType: UpgradeType.Vehicle,
  },
  {
    cost: 30e6,
    mults: { agi: 1.16, cha: 1.16 },
    name: GangMemberUpgradeEnum.Quadra,
    upgType: UpgradeType.Vehicle,
  },
  {
    cost: 5e6,
    mults: { hack: 1.05 },
    name: GangMemberUpgradeEnum.NukeRootkit,
    upgType: UpgradeType.Rootkit,
  },
  {
    cost: 25e6,
    mults: { hack: 1.1 },
    name: GangMemberUpgradeEnum.SoulstealerRootkit,
    upgType: UpgradeType.Rootkit,
  },
  {
    cost: 75e6,
    mults: { hack: 1.15 },
    name: GangMemberUpgradeEnum.DemonRootkit,
    upgType: UpgradeType.Rootkit,
  },
  {
    cost: 40e6,
    mults: { hack: 1.12 },
    name: GangMemberUpgradeEnum.HmapNode,
    upgType: UpgradeType.Rootkit,
  },
  {
    cost: 75e6,
    mults: { hack: 1.15 },
    name: GangMemberUpgradeEnum.JackRipper,
    upgType: UpgradeType.Rootkit,
  },
  {
    cost: 10e9,
    mults: { str: 1.3, dex: 1.3 },
    name: GangMemberUpgradeEnum.BionicArms,
    upgType: UpgradeType.Augmentation,
  },
  {
    cost: 10e9,
    mults: { agi: 1.6 },
    name: GangMemberUpgradeEnum.BionicLegs,
    upgType: UpgradeType.Augmentation,
  },
  {
    cost: 15e9,
    mults: { str: 1.15, def: 1.15, dex: 1.15, agi: 1.15 },
    name: GangMemberUpgradeEnum.BionicSpine,
    upgType: UpgradeType.Augmentation,
  },
  {
    cost: 20e9,
    mults: { str: 1.4, def: 1.4 },
    name: GangMemberUpgradeEnum.BrachiBlades,
    upgType: UpgradeType.Augmentation,
  },
  {
    cost: 12e9,
    mults: { str: 1.2, def: 1.2 },
    name: GangMemberUpgradeEnum.Nanofiber,
    upgType: UpgradeType.Augmentation,
  },
  {
    cost: 25e9,
    mults: { str: 1.5, agi: 1.5 },
    name: GangMemberUpgradeEnum.SyntheticHeart,
    upgType: UpgradeType.Augmentation,
  },
  {
    cost: 15e9,
    mults: { str: 1.3, def: 1.3 },
    name: GangMemberUpgradeEnum.SynfibrilMuscle,
    upgType: UpgradeType.Augmentation,
  },
  {
    cost: 5e9,
    mults: { hack: 1.05 },
    name: GangMemberUpgradeEnum.BitWire,
    upgType: UpgradeType.Augmentation,
  },
  {
    cost: 10e9,
    mults: { hack: 1.15 },
    name: GangMemberUpgradeEnum.Neuralstimulator,
    upgType: UpgradeType.Augmentation,
  },
  {
    cost: 7.5e9,
    mults: { hack: 1.1 },
    name: GangMemberUpgradeEnum.DataJack,
    upgType: UpgradeType.Augmentation,
  },
  {
    cost: 50e9,
    mults: { str: 1.7, def: 1.7 },
    name: GangMemberUpgradeEnum.GrapheneBoneLacings,
    upgType: UpgradeType.Augmentation,
  },
];
