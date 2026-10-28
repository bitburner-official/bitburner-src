import { AugmentationName } from "../Enums";

export const GangTaskNameEnum = {
  Unassigned: "Unassigned",

  Ransomware: "Ransomware",
  Phishing: "Phishing",
  IdentityTheft: "Identity Theft",
  DDoSAttacks: "DDoS Attacks",
  PlantVirus: "Plant Virus",
  FraudAndCounterfeiting: "Fraud & Counterfeiting",
  MoneyLaundering: "Money Laundering",
  Cyberterrorism: "Cyberterrorism",
  EthicalHacking: "Ethical Hacking",

  MugPeople: "Mug People",
  DealDrugs: "Deal Drugs",
  StrongarmCivilians: "Strongarm Civilians",
  RunACon: "Run a Con",
  ArmedRobbery: "Armed Robbery",
  TraffickIllegalArms: "Traffick Illegal Arms",
  ThreatenAndBlackmail: "Threaten & Blackmail",
  HumanTrafficking: "Human Trafficking",
  Terrorism: "Terrorism",
  VigilanteJustice: "Vigilante Justice",

  TrainCombat: "Train Combat",
  TrainHacking: "Train Hacking",
  TrainCharisma: "Train Charisma",
  TerritoryWarfare: "Territory Warfare",
} as const;

export const GangMemberUpgradeNameEnum = {
  Bat: "Baseball Bat",
  Katana: "Katana",
  Malorian: "Malorian-3516",
  Hansen: "Hansen-HA7",
  Arasaka: "Arasaka-HJSH18",
  Militech: "Militech-M251s",
  Nokota: "Nokota-D5",
  Techtronika: "Techtronika-SPT32",

  Vest: "Bulletproof Vest",
  FullArmor: "Full Body Armor",
  LiquidArmor: "Liquid Body Armor",
  GrapheneArmor: "Graphene Plating Armor",

  Herrera: "Herrera Outlaw GTS",
  Yaiba: "Yaiba ASM-R250 Muramasa",
  Rayfield: "Rayfield Caliburn",
  Quadra: "Quadra Sport R-7",

  NukeRootkit: "NUKE Rootkit",
  SoulstealerRootkit: "Soulstealer Rootkit",
  DemonRootkit: "Demon Rootkit",
  HmapNode: "Hmap Node",
  JackRipper: "Jack the Ripper",

  BionicArms: AugmentationName.BionicArms,
  BionicLegs: AugmentationName.BionicLegs,
  BionicSpine: AugmentationName.BionicSpine,
  BrachiBlades: AugmentationName.BrachiBlades,
  Nanofiber: AugmentationName.NanofiberWeave,
  SyntheticHeart: AugmentationName.SyntheticHeart,
  SynfibrilMuscle: AugmentationName.SynfibrilMuscle,
  BitWire: AugmentationName.BitWire,
  Neuralstimulator: AugmentationName.Neuralstimulator,
  DataJack: AugmentationName.DataJack,
  GrapheneBoneLacings: AugmentationName.GrapheneBoneLacings,
} as const;

export type GangMemberUpgradeName = (typeof GangMemberUpgradeNameEnum)[keyof typeof GangMemberUpgradeNameEnum];
