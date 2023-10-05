// Direct import from Locations instead of the barrel file, to avoid circular dependency
import { LocationName } from "@enums";

// Does not need an enum helper for now
export enum OrderType {
  LimitBuy = "Limit Buy Order",
  LimitSell = "Limit Sell Order",
  StopBuy = "Stop Buy Order",
  StopSell = "Stop Sell Order",
}

export enum PositionType {
  Long = "L",
  Short = "S",
}

//Enum-like object because some keys are created via code and have spaces. Still works with an EnumHelper.
export const StockSymbol = {
  // Stocks for companies at which you can work
  [LocationName.AevumECorp]: "ECP",
  [LocationName.Sector12MegaCorp]: "MGCP",
  [LocationName.Sector12BladeIndustries]: "BLD",
  [LocationName.AevumClarkeIncorporated]: "CLRK",
  [LocationName.VolhavenOmniTekIncorporated]: "OMTK",
  [LocationName.Sector12FourSigma]: "FSIG",
  [LocationName.ChongqingKuaiGongInternational]: "KGI",
  [LocationName.AevumFulcrumTechnologies]: "FLCM",
  [LocationName.IshimaStormTechnologies]: "STM",
  [LocationName.NewTokyoDefComm]: "DCOMM",
  [LocationName.VolhavenHeliosLabs]: "HLS",
  [LocationName.NewTokyoVitaLife]: "VITA",
  [LocationName.Sector12IcarusMicrosystems]: "ICRS",
  [LocationName.Sector12UniversalEnergy]: "UNV",
  [LocationName.AevumAeroCorp]: "AERO",
  [LocationName.VolhavenOmniaCybersystems]: "OMN",
  [LocationName.ChongqingSolarisSpaceSystems]: "SLRS",
  [LocationName.NewTokyoGlobalPharmaceuticals]: "GPH",
  [LocationName.IshimaNovaMedical]: "NVMD",
  [LocationName.AevumWatchdogSecurity]: "WDS",
  [LocationName.VolhavenLexoCorp]: "LXO",
  [LocationName.AevumRhoConstruction]: "RHOC",
  [LocationName.Sector12AlphaEnterprises]: "APHE",
  [LocationName.VolhavenSysCoreSecurities]: "SYSC",
  [LocationName.VolhavenCompuTek]: "CTK",
  [LocationName.AevumNetLinkTechnologies]: "NTLK",
  [LocationName.IshimaOmegaSoftware]: "OMGA",
  [LocationName.Sector12FoodNStuff]: "FNS",
  [LocationName.Sector12JoesGuns]: "JGN",

  // Stocks for other companies
  ["Sigma Cosmetics"]: "SGC",
  ["Catalyst Ventures"]: "CTYS",
  ["Microdyne Technologies"]: "MDYN",
  ["Titan Laboratories"]: "TITN",
} as const;
export type StockSymbol = (typeof StockSymbol)[keyof typeof StockSymbol];
