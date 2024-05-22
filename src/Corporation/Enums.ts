import type { Member } from "../types";

export enum IndustryType {
  Water = "Water Utilities",
  Spring = "Spring Water",
  Agriculture = "Agriculture",
  Fishing = "Fishing",
  Mining = "Mining",
  Refinery = "Refinery",
  Restaurant = "Restaurant",
  Tobacco = "Tobacco",
  Chemical = "Chemical",
  Pharmaceutical = "Pharmaceutical",
  Computers = "Computer Hardware",
  Robotics = "Robotics",
  Software = "Software",
  Healthcare = "Healthcare",
  RealEstate = "Real Estate",
}

export enum CorpEmployeeJob {
  Operations = "Operations",
  Engineer = "Engineer",
  Business = "Business",
  Management = "Management",
  RandD = "Research & Development",
  Intern = "Intern",
  Unassigned = "Unassigned",
}

export enum CorpUnlockName {
  Export = "Export",
  SmartSupply = "Smart Supply",
  MarketResearchDemand = "Market Research - Demand",
  MarketDataCompetition = "Market Data - Competition",
  VeChain = "VeChain",
  ShadyAccounting = "Shady Accounting",
  GovernmentPartnership = "Government Partnership",
  WarehouseAPI = "Warehouse API",
  OfficeAPI = "Office API",
}

export enum CorpUpgradeName {
  SmartFactories = "Smart Factories",
  SmartStorage = "Smart Storage",
  DreamSense = "DreamSense",
  WilsonAnalytics = "Wilson Analytics",
  NuoptimalNootropicInjectorImplants = "Nuoptimal Nootropic Injector Implants",
  SpeechProcessorImplants = "Speech Processor Implants",
  NeuralAccelerators = "Neural Accelerators",
  FocusWires = "FocusWires",
  ABCSalesBots = "ABC SalesBots",
  ProjectInsight = "Project Insight",
}

// As const + type for now, convert to enum later
export const CorpMaterialName = {
  Water: "Water",
  Ore: "Ore",
  Minerals: "Minerals",
  Food: "Food",
  Plants: "Plants",
  Metal: "Metal",
  Hardware: "Hardware",
  Chemicals: "Chemicals",
  Drugs: "Drugs",
  Robots: "Robots",
  AiCores: "AI Cores",
  RealEstate: "Real Estate",
} as const;
export type CorpMaterialName = Member<typeof CorpMaterialName>;

// As const + type for now, convert to enum later
export const SmartSupplyOption = {
  leftovers: "leftovers",
  imports: "imports",
  none: "none",
} as const;
export type SmartSupplyOption = Member<typeof SmartSupplyOption>;

// As const + type for now, convert to enum later
export const CorpBaseResearchName = {
  Lab: "Hi-Tech R&D Laboratory",
  AutoBrew: "AutoBrew",
  AutoParty: "AutoPartyManager",
  AutoDrug: "Automatic Drug Administration",
  CPH4Inject: "CPH4 Injections",
  Drones: "Drones",
  DronesAssembly: "Drones - Assembly",
  DronesTransport: "Drones - Transport",
  GoJuice: "Go-Juice",
  RecruitHR: "HRBuddy-Recruitment",
  TrainingHR: "HRBuddy-Training",
  MarketTa1: "Market-TA.I",
  MarketTa2: "Market-TA.II",
  Overclock: "Overclock",
  SelfCorrectAssemblers: "Self-Correcting Assemblers",
  Stimu: "Sti.mu",
} as const;
export type CorpBaseResearchName = Member<typeof CorpBaseResearchName>;

export const CorpProductResearchName = {
  Capacity1: "uPgrade: Capacity.I",
  Capacity2: "uPgrade: Capacity.II",
  Dashboard: "uPgrade: Dashboard",
  Fulcrum: "uPgrade: Fulcrum",
} as const;
export type CorpProductResearchName = Member<typeof CorpProductResearchName>;

export const CorpResearchName = { ...CorpProductResearchName, ...CorpBaseResearchName };
export type CorpResearchName = Member<typeof CorpResearchName>;
