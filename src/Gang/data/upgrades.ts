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
    name: "Baseball Bat",
    upgType: UpgradeType.Weapon,
  },
  {
    cost: 12e6,
    mults: { str: 1.08, def: 1.08, dex: 1.08 },
    name: "Katana",
    upgType: UpgradeType.Weapon,
  },
  {
    cost: 25e6,
    mults: { str: 1.1, def: 1.1, dex: 1.1, agi: 1.1 },
    name: "Malorian-3516",
    upgType: UpgradeType.Weapon,
  },
  {
    cost: 50e6,
    mults: { str: 1.12, def: 1.1, agi: 1.1 },
    name: "Hansen-HA7",
    upgType: UpgradeType.Weapon,
  },
  {
    cost: 60e6,
    mults: { str: 1.2, def: 1.15 },
    name: "Arasaka-HJSH18",
    upgType: UpgradeType.Weapon,
  },
  {
    cost: 100e6,
    mults: { str: 1.25, def: 1.2 },
    name: "Militech-M251s",
    upgType: UpgradeType.Weapon,
  },
  {
    cost: 150e6,
    mults: { str: 1.3, def: 1.25 },
    name: "Nokota-D5",
    upgType: UpgradeType.Weapon,
  },
  {
    cost: 225e6,
    mults: { str: 1.3, dex: 1.25, agi: 1.3 },
    name: "Techtronika-SPT32",
    upgType: UpgradeType.Weapon,
  },
  {
    cost: 2e6,
    mults: { def: 1.04 },
    name: "Bulletproof Vest",
    upgType: UpgradeType.Armor,
  },
  {
    cost: 5e6,
    mults: { def: 1.08 },
    name: "Full Body Armor",
    upgType: UpgradeType.Armor,
  },
  {
    cost: 25e6,
    mults: { def: 1.15, agi: 1.15 },
    name: "Liquid Body Armor",
    upgType: UpgradeType.Armor,
  },
  {
    cost: 40e6,
    mults: { def: 1.2 },
    name: "Graphene Plating Armor",
    upgType: UpgradeType.Armor,
  },
  {
    cost: 3e6,
    mults: { agi: 1.04, cha: 1.04 },
    name: "Herrera Outlaw GTS",
    upgType: UpgradeType.Vehicle,
  },
  {
    cost: 9e6,
    mults: { agi: 1.08, cha: 1.08 },
    name: "Yaiba ASM-R250 Muramasa",
    upgType: UpgradeType.Vehicle,
  },
  {
    cost: 18e6,
    mults: { agi: 1.12, cha: 1.12 },
    name: "Rayfield Caliburn",
    upgType: UpgradeType.Vehicle,
  },
  {
    cost: 30e6,
    mults: { agi: 1.16, cha: 1.16 },
    name: "Quadra Sport R-7",
    upgType: UpgradeType.Vehicle,
  },
  {
    cost: 5e6,
    mults: { hack: 1.05 },
    name: "NUKE Rootkit",
    upgType: UpgradeType.Rootkit,
  },
  {
    cost: 25e6,
    mults: { hack: 1.1 },
    name: "Soulstealer Rootkit",
    upgType: UpgradeType.Rootkit,
  },
  {
    cost: 75e6,
    mults: { hack: 1.15 },
    name: "Demon Rootkit",
    upgType: UpgradeType.Rootkit,
  },
  {
    cost: 40e6,
    mults: { hack: 1.12 },
    name: "Hmap Node",
    upgType: UpgradeType.Rootkit,
  },
  {
    cost: 75e6,
    mults: { hack: 1.15 },
    name: "Jack the Ripper",
    upgType: UpgradeType.Rootkit,
  },
  {
    cost: 10e9,
    mults: { str: 1.3, dex: 1.3 },
    name: "Bionic Arms",
    upgType: UpgradeType.Augmentation,
  },
  {
    cost: 10e9,
    mults: { agi: 1.6 },
    name: "Bionic Legs",
    upgType: UpgradeType.Augmentation,
  },
  {
    cost: 15e9,
    mults: { str: 1.15, def: 1.15, dex: 1.15, agi: 1.15 },
    name: "Bionic Spine",
    upgType: UpgradeType.Augmentation,
  },
  {
    cost: 20e9,
    mults: { str: 1.4, def: 1.4 },
    name: "BrachiBlades",
    upgType: UpgradeType.Augmentation,
  },
  {
    cost: 12e9,
    mults: { str: 1.2, def: 1.2 },
    name: "Nanofiber Weave",
    upgType: UpgradeType.Augmentation,
  },
  {
    cost: 25e9,
    mults: { str: 1.5, agi: 1.5 },
    name: "Synthetic Heart",
    upgType: UpgradeType.Augmentation,
  },
  {
    cost: 15e9,
    mults: { str: 1.3, def: 1.3 },
    name: "Synfibril Muscle",
    upgType: UpgradeType.Augmentation,
  },
  {
    cost: 5e9,
    mults: { hack: 1.05 },
    name: "BitWire",
    upgType: UpgradeType.Augmentation,
  },
  {
    cost: 10e9,
    mults: { hack: 1.15 },
    name: "Neuralstimulator",
    upgType: UpgradeType.Augmentation,
  },
  {
    cost: 7.5e9,
    mults: { hack: 1.1 },
    name: "DataJack",
    upgType: UpgradeType.Augmentation,
  },
  {
    cost: 50e9,
    mults: { str: 1.7, def: 1.7 },
    name: "Graphene Bone Lacings",
    upgType: UpgradeType.Augmentation,
  },
];
