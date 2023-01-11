import { LocationNames } from "../../Enums";

//Enum-like object because some keys are created via code and have spaces. Membership can still be checked with checkEnum.
export const StockSymbols = {
  // Stocks for companies at which you can work
  [LocationNames.AevumECorp]: "ECP",
  [LocationNames.Sector12MegaCorp]: "MGCP",
  [LocationNames.Sector12BladeIndustries]: "BLD",
  [LocationNames.AevumClarkeIncorporated]: "CLRK",
  [LocationNames.VolhavenOmniTekIncorporated]: "OMTK",
  [LocationNames.Sector12FourSigma]: "FSIG",
  [LocationNames.ChongqingKuaiGongInternational]: "KGI",
  [LocationNames.AevumFulcrumTechnologies]: "FLCM",
  [LocationNames.IshimaStormTechnologies]: "STM",
  [LocationNames.NewTokyoDefComm]: "DCOMM",
  [LocationNames.VolhavenHeliosLabs]: "HLS",
  [LocationNames.NewTokyoVitaLife]: "VITA",
  [LocationNames.Sector12IcarusMicrosystems]: "ICRS",
  [LocationNames.Sector12UniversalEnergy]: "UNV",
  [LocationNames.AevumAeroCorp]: "AERO",
  [LocationNames.VolhavenOmniaCybersystems]: "OMN",
  [LocationNames.ChongqingSolarisSpaceSystems]: "SLRS",
  [LocationNames.NewTokyoGlobalPharmaceuticals]: "GPH",
  [LocationNames.IshimaNovaMedical]: "NVMD",
  [LocationNames.AevumWatchdogSecurity]: "WDS",
  [LocationNames.VolhavenLexoCorp]: "LXO",
  [LocationNames.AevumRhoConstruction]: "RHOC",
  [LocationNames.Sector12AlphaEnterprises]: "APHE",
  [LocationNames.VolhavenSysCoreSecurities]: "SYSC",
  [LocationNames.VolhavenCompuTek]: "CTK",
  [LocationNames.AevumNetLinkTechnologies]: "NTLK",
  [LocationNames.IshimaOmegaSoftware]: "OMGA",
  [LocationNames.Sector12FoodNStuff]: "FNS",
  [LocationNames.Sector12JoesGuns]: "JGN",

  // Stocks for other companies
  ["Sigma Cosmetics"]: "SGC",
  ["Catalyst Ventures"]: "CTYS",
  ["Microdyne Technologies"]: "MDYN",
  ["Titan Laboratories"]: "TITN",
} as const;
