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

export enum EmployeePosition {
  Operations = "Operations",
  Engineer = "Engineer",
  Business = "Business",
  Management = "Management",
  RandD = "Research & Development",
  Intern = "Intern",
  Unassigned = "Unassigned",
}

export enum MaterialName {
  water = "Water",
  ore = "Ore",
  minerals = "Minerals",
  food = "Food",
  plants = "Plants",
  metal = "Metal",
  hardware = "Hardware",
  chemicals = "Chemicals",
  drugs = "Drugs",
  robots = "Robots",
  aiCores = "AI Cores",
  realEstate = "Real Estate",
}

export enum ResearchBase {
  hiTechLab = "Hi-Tech R&D Laboratory",
  autoBrew = "AutoBrew",
  autoParty = "AutoPartyManager",
  autoDrug = "Automatic Drug Administration",
  bulkPurchase = "Bulk Purchasing",
  cph4Injections = "CPH4 Injections",
  drones = "Drones",
  dronesAssembly = "Drones - Assembly",
  dronesTransport = "Drones - Transport",
  goJuice = "Go-Juice",
  hrRecruitment = "HRBuddy-Recruitment",
  hrTraining = "HRBuddy-Training",
  marketTA1 = "Market-TA.I",
  marketTA2 = "Market-TA.II",
  overclock = "Overclock",
  selfCorrectingAssemblers = "Self-Correcting Assemblers",
  stimu = "Sti.mu",
}

export enum ResearchProductSpecific {
  capacity1 = "uPgrade: Capacity.I",
  capacity2 = "uPgrade: Capacity.II",
  dashboard = "uPgrade: Dashboard",
  fulcrum = "uPgrade: Fulcrum",
}

type Research = ResearchBase | ResearchProductSpecific;
export const allResearch: Research[] = [...Object.values(ResearchBase), ...Object.values(ResearchProductSpecific)];
