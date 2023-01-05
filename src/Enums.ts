import { buildEnum } from "./utils/helpers/enum";

/** Job for company work */
const jobNames = {
  software0: "Software Engineering Intern",
  software1: "Junior Software Engineer",
  software2: "Senior Software Engineer",
  software3: "Lead Software Developer",
  software4: "Head of Software",
  software5: "Head of Engineering",
  software6: "Vice President of Technology",
  software7: "Chief Technology Officer",
  IT0: "IT Intern",
  IT1: "IT Analyst",
  IT2: "IT Manager",
  IT3: "Systems Administrator",
  securityEng: "Security Engineer",
  networkEng0: "Network Engineer",
  networkEng1: "Network Administrator",
  business0: "Business Intern",
  business1: "Business Analyst",
  business2: "Business Manager",
  business3: "Operations Manager",
  business4: "Chief Financial Officer",
  business5: "Chief Executive Officer",
  security0: "Police Officer",
  security1: "Police Chief",
  security2: "Security Guard",
  security3: "Security Officer",
  security4: "Security Supervisor",
  security5: "Head of Security",
  agent0: "Field Agent",
  agent1: "Secret Agent",
  agent2: "Special Operative",
  waiter: "Waiter",
  employee: "Employee",
  softwareConsult0: "Software Consultant",
  softwareConsult1: "Senior Software Consultant",
  businessConsult0: "Business Consultant",
  businessConsult1: "Senior Business Consultant",
  waiterPT: "Part-time Waiter",
  employeePT: "Part-time Employee",
} as const;

export type JobName = typeof jobNames[keyof typeof jobNames];
export const JobNames = buildEnum<typeof jobNames, JobName>(jobNames);

/** Crime names */
const crimeType = {
  shoplift: "Shoplift",
  robStore: "Rob Store",
  mug: "Mug",
  larceny: "Larceny",
  dealDrugs: "Deal Drugs",
  bondForgery: "Bond Forgery",
  traffickArms: "Traffick Arms",
  homicide: "Homicide",
  grandTheftAuto: "Grand Theft Auto",
  kidnap: "Kidnap",
  assassination: "Assassination",
  heist: "Heist",
} as const;

export type CrimeType = typeof crimeType[keyof typeof crimeType];
export const CrimeTypes = buildEnum<typeof crimeType, CrimeType>(crimeType);

const factionWorkType = {
  hacking: "hacking",
  field: "field",
  security: "security",
} as const;

export type FactionWorkType = typeof factionWorkType[keyof typeof factionWorkType];
export const FactionWorkTypes = buildEnum<typeof factionWorkType, FactionWorkType>(factionWorkType);

const universityClassType = {
  computerScience: "Computer Science",
  dataStructures: "Data Structures",
  networks: "Networks",
  algorithms: "Algorithms",
  management: "Management",
  leadership: "Leadership",
} as const;

export type UniversityClassType = typeof universityClassType[keyof typeof universityClassType];
export const UniversityClassTypes = buildEnum<typeof universityClassType, UniversityClassType>(universityClassType);

//Uses skill short codes to allow easier fuzzy matching with player input
const gymType = {
  strength: "str",
  defense: "def",
  dexterity: "dex",
  agility: "agi",
} as const;

export type GymType = typeof gymType[keyof typeof gymType];
export const GymTypes = buildEnum<typeof gymType, GymType>(gymType);

/** Names of all cities */
const cityName = {
  Aevum: "Aevum",
  Chongqing: "Chongqing",
  Sector12: "Sector-12",
  NewTokyo: "New Tokyo",
  Ishima: "Ishima",
  Volhaven: "Volhaven",
} as const;

export type CityName = typeof cityName[keyof typeof cityName];
export const CityNames = buildEnum<typeof cityName, CityName>(cityName);

/** Names of all locations */
const locationName = {
  AevumAeroCorp: "AeroCorp",
  AevumBachmanAndAssociates: "Bachman & Associates",
  AevumClarkeIncorporated: "Clarke Incorporated",
  AevumCrushFitnessGym: "Crush Fitness Gym",
  AevumECorp: "ECorp",
  AevumFulcrumTechnologies: "Fulcrum Technologies",
  AevumGalacticCybersystems: "Galactic Cybersystems",
  AevumNetLinkTechnologies: "NetLink Technologies",
  AevumPolice: "Aevum Police Headquarters",
  AevumRhoConstruction: "Rho Construction",
  AevumSnapFitnessGym: "Snap Fitness Gym",
  AevumSummitUniversity: "Summit University",
  AevumWatchdogSecurity: "Watchdog Security",
  AevumCasino: "Iker Molina Casino",

  ChongqingKuaiGongInternational: "KuaiGong International",
  ChongqingSolarisSpaceSystems: "Solaris Space Systems",
  ChongqingChurchOfTheMachineGod: "Church of the Machine God",

  Sector12AlphaEnterprises: "Alpha Enterprises",
  Sector12BladeIndustries: "Blade Industries",
  Sector12CIA: "Central Intelligence Agency",
  Sector12CarmichaelSecurity: "Carmichael Security",
  Sector12CityHall: "Sector-12 City Hall",
  Sector12DeltaOne: "DeltaOne",
  Sector12FoodNStuff: "FoodNStuff",
  Sector12FourSigma: "Four Sigma",
  Sector12IcarusMicrosystems: "Icarus Microsystems",
  Sector12IronGym: "Iron Gym",
  Sector12JoesGuns: "Joe's Guns",
  Sector12MegaCorp: "MegaCorp",
  Sector12NSA: "National Security Agency",
  Sector12PowerhouseGym: "Powerhouse Gym",
  Sector12RothmanUniversity: "Rothman University",
  Sector12UniversalEnergy: "Universal Energy",

  NewTokyoDefComm: "DefComm",
  NewTokyoGlobalPharmaceuticals: "Global Pharmaceuticals",
  NewTokyoNoodleBar: "Noodle Bar",
  NewTokyoVitaLife: "VitaLife",
  NewTokyoArcade: "Arcade",

  IshimaNovaMedical: "Nova Medical",
  IshimaOmegaSoftware: "Omega Software",
  IshimaStormTechnologies: "Storm Technologies",
  IshimaGlitch: "0x6C1",

  VolhavenCompuTek: "CompuTek",
  VolhavenHeliosLabs: "Helios Labs",
  VolhavenLexoCorp: "LexoCorp",
  VolhavenMilleniumFitnessGym: "Millenium Fitness Gym",
  VolhavenNWO: "NWO",
  VolhavenOmniTekIncorporated: "OmniTek Incorporated",
  VolhavenOmniaCybersystems: "Omnia Cybersystems",
  VolhavenSysCoreSecurities: "SysCore Securities",
  VolhavenZBInstituteOfTechnology: "ZB Institute of Technology",

  Hospital: "Hospital",
  Slums: "The Slums",
  TravelAgency: "Travel Agency",
  WorldStockExchange: "World Stock Exchange",

  Void: "The Void",
} as const;

export type LocationName = typeof locationName[keyof typeof locationName];
export const LocationNames = buildEnum<typeof locationName, LocationName>(locationName);
