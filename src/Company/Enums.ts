import type { Member } from "../types";

// Imported from Locations and not from the main enums file to avoid circular dependency
import { LocationName } from "../Locations/Enums";

// CompanyName is essentially a sub-enum of LocationName
export const CompanyName = {
  ECorp: LocationName.AevumECorp,
  MegaCorp: LocationName.Sector12MegaCorp,
  BachmanAndAssociates: LocationName.AevumBachmanAndAssociates,
  BladeIndustries: LocationName.Sector12BladeIndustries,
  NWO: LocationName.VolhavenNWO,
  ClarkeIncorporated: LocationName.AevumClarkeIncorporated,
  OmniTekIncorporated: LocationName.VolhavenOmniTekIncorporated,
  FourSigma: LocationName.Sector12FourSigma,
  KuaiGongInternational: LocationName.ChongqingKuaiGongInternational,
  FulcrumTechnologies: LocationName.AevumFulcrumTechnologies,
  StormTechnologies: LocationName.IshimaStormTechnologies,
  DefComm: LocationName.NewTokyoDefComm,
  HeliosLabs: LocationName.VolhavenHeliosLabs,
  VitaLife: LocationName.NewTokyoVitaLife,
  IcarusMicrosystems: LocationName.Sector12IcarusMicrosystems,
  UniversalEnergy: LocationName.Sector12UniversalEnergy,
  GalacticCybersystems: LocationName.AevumGalacticCybersystems,
  AeroCorp: LocationName.AevumAeroCorp,
  OmniaCybersystems: LocationName.VolhavenOmniaCybersystems,
  SolarisSpaceSystems: LocationName.ChongqingSolarisSpaceSystems,
  DeltaOne: LocationName.Sector12DeltaOne,
  GlobalPharmaceuticals: LocationName.NewTokyoGlobalPharmaceuticals,
  NovaMedical: LocationName.IshimaNovaMedical,
  CIA: LocationName.Sector12CIA,
  NSA: LocationName.Sector12NSA,
  WatchdogSecurity: LocationName.AevumWatchdogSecurity,
  LexoCorp: LocationName.VolhavenLexoCorp,
  RhoConstruction: LocationName.AevumRhoConstruction,
  AlphaEnterprises: LocationName.Sector12AlphaEnterprises,
  Police: LocationName.AevumPolice,
  SysCoreSecurities: LocationName.VolhavenSysCoreSecurities,
  CompuTek: LocationName.VolhavenCompuTek,
  NetLinkTechnologies: LocationName.AevumNetLinkTechnologies,
  CarmichaelSecurity: LocationName.Sector12CarmichaelSecurity,
  FoodNStuff: LocationName.Sector12FoodNStuff,
  JoesGuns: LocationName.Sector12JoesGuns,
  OmegaSoftware: LocationName.IshimaOmegaSoftware,
  NoodleBar: LocationName.NewTokyoNoodleBar,
} as const;
export type CompanyName = Member<typeof CompanyName>;
