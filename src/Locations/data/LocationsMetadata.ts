/**
 * Metadata for constructing Location objects for all Locations
 * in the game
 */
import { CityNames, LocationNames } from "../../Enums";
import { IConstructorParams } from "../Location";
import { LocationType } from "../LocationTypeEnum";

export const LocationsMetadata: IConstructorParams[] = [
  {
    city: CityNames.Aevum,
    infiltrationData: {
      maxClearanceLevel: 12,
      startingSecurityLevel: 8.18,
    },
    name: LocationNames.AevumAeroCorp,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Aevum,
    infiltrationData: {
      maxClearanceLevel: 15,
      startingSecurityLevel: 8.19,
    },
    name: LocationNames.AevumBachmanAndAssociates,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Aevum,
    infiltrationData: {
      maxClearanceLevel: 18,
      startingSecurityLevel: 9.55,
    },
    name: LocationNames.AevumClarkeIncorporated,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Aevum,
    costMult: 3,
    expMult: 2,
    name: LocationNames.AevumCrushFitnessGym,
    types: [LocationType.Gym],
  },
  {
    city: CityNames.Aevum,
    infiltrationData: {
      maxClearanceLevel: 37,
      startingSecurityLevel: 17.02,
    },
    name: LocationNames.AevumECorp,
    types: [LocationType.Company, LocationType.TechVendor],
    techVendorMaxRam: 512,
    techVendorMinRam: 128,
  },
  {
    city: CityNames.Aevum,
    infiltrationData: {
      maxClearanceLevel: 25,
      startingSecurityLevel: 15.54,
    },
    name: LocationNames.AevumFulcrumTechnologies,
    types: [LocationType.Company, LocationType.TechVendor],
    techVendorMaxRam: 1024,
    techVendorMinRam: 256,
  },
  {
    city: CityNames.Aevum,
    infiltrationData: {
      maxClearanceLevel: 12,
      startingSecurityLevel: 7.89,
    },
    name: LocationNames.AevumGalacticCybersystems,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Aevum,
    infiltrationData: {
      maxClearanceLevel: 6,
      startingSecurityLevel: 3.29,
    },
    name: LocationNames.AevumNetLinkTechnologies,
    types: [LocationType.Company, LocationType.TechVendor],
    techVendorMaxRam: 64,
    techVendorMinRam: 8,
  },
  {
    city: CityNames.Aevum,
    infiltrationData: {
      maxClearanceLevel: 6,
      startingSecurityLevel: 5.35,
    },
    name: LocationNames.AevumPolice,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Aevum,
    infiltrationData: {
      maxClearanceLevel: 5,
      startingSecurityLevel: 5.02,
    },
    name: LocationNames.AevumRhoConstruction,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Aevum,
    costMult: 10,
    expMult: 5,
    name: LocationNames.AevumSnapFitnessGym,
    types: [LocationType.Gym],
  },
  {
    city: CityNames.Aevum,
    costMult: 4,
    expMult: 3,
    name: LocationNames.AevumSummitUniversity,
    types: [LocationType.University],
  },
  {
    city: CityNames.Aevum,
    infiltrationData: {
      maxClearanceLevel: 7,
      startingSecurityLevel: 5.85,
    },
    name: LocationNames.AevumWatchdogSecurity,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Aevum,
    name: LocationNames.AevumCasino,
    types: [LocationType.Casino],
  },
  {
    city: CityNames.Chongqing,
    infiltrationData: {
      maxClearanceLevel: 25,
      startingSecurityLevel: 16.25,
    },
    name: LocationNames.ChongqingKuaiGongInternational,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Chongqing,
    infiltrationData: {
      maxClearanceLevel: 18,
      startingSecurityLevel: 12.59,
    },
    name: LocationNames.ChongqingSolarisSpaceSystems,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Ishima,
    infiltrationData: {
      maxClearanceLevel: 12,
      startingSecurityLevel: 5.02,
    },
    name: LocationNames.IshimaNovaMedical,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Ishima,
    infiltrationData: {
      maxClearanceLevel: 10,
      startingSecurityLevel: 3.2,
    },
    name: LocationNames.IshimaOmegaSoftware,
    types: [LocationType.Company, LocationType.TechVendor],
    techVendorMaxRam: 128,
    techVendorMinRam: 4,
  },
  {
    city: CityNames.Ishima,
    infiltrationData: {
      maxClearanceLevel: 25,
      startingSecurityLevel: 5.38,
    },
    name: LocationNames.IshimaStormTechnologies,
    types: [LocationType.Company, LocationType.TechVendor],
    techVendorMaxRam: 512,
    techVendorMinRam: 32,
  },
  {
    city: CityNames.NewTokyo,
    infiltrationData: {
      maxClearanceLevel: 17,
      startingSecurityLevel: 7.18,
    },
    name: LocationNames.NewTokyoDefComm,
    types: [LocationType.Company],
  },
  {
    city: CityNames.NewTokyo,
    infiltrationData: {
      maxClearanceLevel: 20,
      startingSecurityLevel: 5.9,
    },
    name: LocationNames.NewTokyoGlobalPharmaceuticals,
    types: [LocationType.Company],
  },
  {
    city: CityNames.NewTokyo,
    infiltrationData: {
      maxClearanceLevel: 5,
      startingSecurityLevel: 2.5,
    },
    name: LocationNames.NewTokyoNoodleBar,
    types: [LocationType.Company, LocationType.Special],
  },
  {
    city: CityNames.NewTokyo,
    infiltrationData: {
      maxClearanceLevel: 25,
      startingSecurityLevel: 5.52,
    },
    name: LocationNames.NewTokyoVitaLife,
    types: [LocationType.Company, LocationType.Special],
  },
  {
    city: CityNames.NewTokyo,
    name: LocationNames.NewTokyoArcade,
    types: [LocationType.Special],
  },
  {
    city: CityNames.Sector12,
    infiltrationData: {
      maxClearanceLevel: 10,
      startingSecurityLevel: 3.62,
    },
    name: LocationNames.Sector12AlphaEnterprises,
    types: [LocationType.Company, LocationType.TechVendor],
    techVendorMaxRam: 8,
    techVendorMinRam: 2,
  },
  {
    city: CityNames.Sector12,
    infiltrationData: {
      maxClearanceLevel: 25,
      startingSecurityLevel: 10.59,
    },
    name: LocationNames.Sector12BladeIndustries,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Sector12,
    name: LocationNames.Sector12CIA,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Sector12,
    infiltrationData: {
      maxClearanceLevel: 15,
      startingSecurityLevel: 4.66,
    },
    name: LocationNames.Sector12CarmichaelSecurity,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Sector12,
    name: LocationNames.Sector12CityHall,
    types: [LocationType.Special],
  },
  {
    city: CityNames.Sector12,
    infiltrationData: {
      maxClearanceLevel: 12,
      startingSecurityLevel: 5.9,
    },
    name: LocationNames.Sector12DeltaOne,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Sector12,
    name: LocationNames.Sector12FoodNStuff,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Sector12,
    infiltrationData: {
      maxClearanceLevel: 25,
      startingSecurityLevel: 8.18,
    },
    name: LocationNames.Sector12FourSigma,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Sector12,
    infiltrationData: {
      maxClearanceLevel: 17,
      startingSecurityLevel: 6.02,
    },
    name: LocationNames.Sector12IcarusMicrosystems,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Sector12,
    expMult: 1,
    costMult: 1,
    name: LocationNames.Sector12IronGym,
    types: [LocationType.Gym],
  },
  {
    city: CityNames.Sector12,
    infiltrationData: {
      maxClearanceLevel: 5,
      startingSecurityLevel: 3.13,
    },
    name: LocationNames.Sector12JoesGuns,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Sector12,
    infiltrationData: {
      maxClearanceLevel: 31,
      startingSecurityLevel: 16.36,
    },
    name: LocationNames.Sector12MegaCorp,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Sector12,
    name: LocationNames.Sector12NSA,
    types: [LocationType.Company, LocationType.Special],
  },
  {
    city: CityNames.Sector12,
    costMult: 20,
    expMult: 10,
    name: LocationNames.Sector12PowerhouseGym,
    types: [LocationType.Gym],
  },
  {
    city: CityNames.Sector12,
    costMult: 3,
    expMult: 2,
    name: LocationNames.Sector12RothmanUniversity,
    types: [LocationType.University],
  },
  {
    city: CityNames.Sector12,
    infiltrationData: {
      maxClearanceLevel: 12,
      startingSecurityLevel: 5.9,
    },
    name: LocationNames.Sector12UniversalEnergy,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Volhaven,
    infiltrationData: {
      maxClearanceLevel: 15,
      startingSecurityLevel: 3.59,
    },
    name: LocationNames.VolhavenCompuTek,
    types: [LocationType.Company, LocationType.TechVendor],
    techVendorMaxRam: 256,
    techVendorMinRam: 8,
  },
  {
    city: CityNames.Volhaven,
    infiltrationData: {
      maxClearanceLevel: 18,
      startingSecurityLevel: 7.28,
    },
    name: LocationNames.VolhavenHeliosLabs,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Volhaven,
    infiltrationData: {
      maxClearanceLevel: 15,
      startingSecurityLevel: 4.35,
    },
    name: LocationNames.VolhavenLexoCorp,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Volhaven,
    costMult: 7,
    expMult: 4,
    name: LocationNames.VolhavenMilleniumFitnessGym,
    types: [LocationType.Gym],
  },
  {
    city: CityNames.Volhaven,
    infiltrationData: {
      maxClearanceLevel: 50,
      startingSecurityLevel: 8.53,
    },
    name: LocationNames.VolhavenNWO,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Volhaven,
    infiltrationData: {
      maxClearanceLevel: 25,
      startingSecurityLevel: 7.74,
    },
    name: LocationNames.VolhavenOmniTekIncorporated,
    types: [LocationType.Company, LocationType.TechVendor],
    techVendorMaxRam: 1024,
    techVendorMinRam: 128,
  },
  {
    city: CityNames.Volhaven,
    infiltrationData: {
      maxClearanceLevel: 22,
      startingSecurityLevel: 6,
    },
    name: LocationNames.VolhavenOmniaCybersystems,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Volhaven,
    infiltrationData: {
      maxClearanceLevel: 18,
      startingSecurityLevel: 4.77,
    },
    name: LocationNames.VolhavenSysCoreSecurities,
    types: [LocationType.Company],
  },
  {
    city: CityNames.Volhaven,
    costMult: 5,
    expMult: 4,
    name: LocationNames.VolhavenZBInstituteOfTechnology,
    types: [LocationType.University],
  },
  {
    city: null,
    name: LocationNames.Hospital,
    types: [LocationType.Hospital],
  },
  {
    city: null,
    name: LocationNames.Slums,
    types: [LocationType.Slums],
  },
  {
    city: null,
    name: LocationNames.TravelAgency,
    types: [LocationType.TravelAgency],
  },
  {
    city: null,
    name: LocationNames.WorldStockExchange,
    types: [LocationType.StockMarket],
  },
  {
    city: CityNames.Chongqing,
    name: LocationNames.ChongqingChurchOfTheMachineGod,
    types: [LocationType.Special],
  },
  {
    city: CityNames.Ishima,
    name: LocationNames.IshimaGlitch,
    types: [LocationType.Special],
  },
];
