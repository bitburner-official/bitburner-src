import { FactionNames } from "../../Faction/data/FactionNames";
// tslint:disable:max-file-line-count

// This could actually be a JSON file as it should be constant metadata to be imported...
import { IMinMaxRange } from "../../types";
import { LocationNames } from "../../Enums";
import { LiteratureNames } from "../../Literature/data/LiteratureNames";
import { SpecialServers } from "./SpecialServers";

/**
 * The metadata describing the base state of servers on the network.
 * These values will be adjusted based on Bitnode multipliers when the Server objects are built out.
 */
interface IServerMetadata {
  /** When populated, the base security level of the server. */
  hackDifficulty?: number | IMinMaxRange;

  /** The DNS name of the server. */
  hostname: string;

  /** When populated, the files will be added to the server when created. */
  literature?: string[];

  /**
   * When populated, the exponent of 2^x amount of RAM the server has.
   * This should be in the range of 1-20, to match the Player's max RAM.
   */
  maxRamExponent?: number | IMinMaxRange;

  /** How much money the server starts out with. */
  moneyAvailable: number | IMinMaxRange;

  /**
   * The number of network layers away from the `home` server.
   * This value is between 1 and 15.
   * If this is not populated, @specialName should be.
   */
  networkLayer?: number | IMinMaxRange;

  /** The number of ports that must be opened before the player can execute NUKE. */
  numOpenPortsRequired: number;

  /** The organization that the server belongs to. */
  organizationName: string;

  /** The minimum hacking level before the player can run NUKE. */
  requiredHackingSkill: number | IMinMaxRange;

  /** The growth factor for the server. */
  serverGrowth?: number | IMinMaxRange;

  /** A "unique" server that has special implications when the player manually hacks it. */
  specialName?: string;
}

/** The metadata for building up the servers on the network. */
export const serverMetadata: IServerMetadata[] = [
  {
    hackDifficulty: 99,
    hostname: LocationNames.AevumECorp.toLowerCase(),
    moneyAvailable: {
      max: 70e9,
      min: 30e9,
    },
    networkLayer: 15,
    numOpenPortsRequired: 5,
    organizationName: LocationNames.AevumECorp,
    requiredHackingSkill: {
      max: 1400,
      min: 1050,
    },
    serverGrowth: 99,
    specialName: LocationNames.AevumECorp,
  },
  {
    hackDifficulty: 99,
    hostname: LocationNames.Sector12MegaCorp.toLowerCase(),
    moneyAvailable: {
      max: 60e9,
      min: 40e9,
    },
    networkLayer: 15,
    numOpenPortsRequired: 5,
    organizationName: LocationNames.Sector12MegaCorp,
    requiredHackingSkill: {
      max: 1350,
      min: 1100,
    },
    serverGrowth: 99,
    specialName: LocationNames.Sector12MegaCorp,
  },
  {
    hackDifficulty: {
      max: 88,
      min: 72,
    },
    hostname: "b-and-a",
    moneyAvailable: {
      max: 30e9,
      min: 15e9,
    },
    networkLayer: 14,
    numOpenPortsRequired: 5,
    organizationName: LocationNames.AevumBachmanAndAssociates,
    requiredHackingSkill: {
      max: 1150,
      min: 900,
    },
    serverGrowth: {
      max: 80,
      min: 60,
    },
    specialName: LocationNames.AevumBachmanAndAssociates,
  },
  {
    hackDifficulty: {
      max: 97,
      min: 88,
    },
    hostname: "blade",
    literature: [LiteratureNames.BeyondMan],
    maxRamExponent: {
      max: 9,
      min: 5,
    },
    moneyAvailable: {
      max: 40e9,
      min: 10e9,
    },
    networkLayer: 14,
    numOpenPortsRequired: 5,
    organizationName: LocationNames.Sector12BladeIndustries,
    requiredHackingSkill: {
      max: 1200,
      min: 900,
    },
    serverGrowth: {
      max: 85,
      min: 55,
    },
    specialName: LocationNames.Sector12BladeIndustries,
  },
  {
    hackDifficulty: 99,
    hostname: LocationNames.VolhavenNWO.toLowerCase(),
    literature: [LiteratureNames.TheHiddenWorld],
    moneyAvailable: {
      max: 40e9,
      min: 20e9,
    },
    networkLayer: 14,
    numOpenPortsRequired: 5,
    organizationName: LocationNames.VolhavenNWO,
    requiredHackingSkill: {
      max: 1300,
      min: 950,
    },
    serverGrowth: {
      max: 95,
      min: 65,
    },
    specialName: LocationNames.VolhavenNWO,
  },
  {
    hackDifficulty: {
      max: 65,
      min: 45,
    },
    hostname: "clarkinc",
    literature: [LiteratureNames.BeyondMan, LiteratureNames.CostOfImmortality],
    moneyAvailable: {
      max: 25e9,
      min: 15e9,
    },
    networkLayer: 14,
    numOpenPortsRequired: 5,
    organizationName: LocationNames.AevumClarkeIncorporated,
    requiredHackingSkill: {
      max: 1250,
      min: 950,
    },
    serverGrowth: {
      max: 75,
      min: 45,
    },
    specialName: LocationNames.AevumClarkeIncorporated,
  },
  {
    hackDifficulty: {
      max: 99,
      min: 90,
    },
    hostname: "omnitek",
    literature: [LiteratureNames.CodedIntelligence, LiteratureNames.HistoryOfSynthoids],
    maxRamExponent: {
      max: 9,
      min: 7,
    },
    moneyAvailable: {
      max: 22e9,
      min: 13e9,
    },
    networkLayer: 13,
    numOpenPortsRequired: 5,
    organizationName: LocationNames.VolhavenOmniTekIncorporated,
    requiredHackingSkill: {
      max: 1100,
      min: 900,
    },
    serverGrowth: {
      max: 99,
      min: 95,
    },
    specialName: LocationNames.VolhavenOmniTekIncorporated,
  },
  {
    hackDifficulty: {
      max: 75,
      min: 55,
    },
    hostname: "4sigma",
    moneyAvailable: {
      max: 25e9,
      min: 15e9,
    },
    networkLayer: 13,
    numOpenPortsRequired: 5,
    organizationName: LocationNames.Sector12FourSigma,
    requiredHackingSkill: {
      max: 1250,
      min: 900,
    },
    serverGrowth: {
      max: 99,
      min: 75,
    },
    specialName: LocationNames.Sector12FourSigma,
  },
  {
    hackDifficulty: {
      max: 99,
      min: 95,
    },
    hostname: "kuai-gong",
    moneyAvailable: {
      max: 30e9,
      min: 20e9,
    },
    networkLayer: 13,
    numOpenPortsRequired: 5,
    organizationName: LocationNames.ChongqingKuaiGongInternational,
    requiredHackingSkill: {
      max: 1300,
      min: 950,
    },
    serverGrowth: {
      max: 99,
      min: 90,
    },
    specialName: LocationNames.ChongqingKuaiGongInternational,
  },
  {
    hackDifficulty: {
      max: 97,
      min: 83,
    },
    hostname: "fulcrumtech",
    literature: [LiteratureNames.SimulatedReality],
    maxRamExponent: {
      max: 11,
      min: 7,
    },
    moneyAvailable: {
      max: 1800e6,
      min: 1400e6,
    },
    networkLayer: 12,
    numOpenPortsRequired: 5,
    organizationName: LocationNames.AevumFulcrumTechnologies,
    requiredHackingSkill: {
      max: 1250,
      min: 950,
    },
    serverGrowth: {
      max: 99,
      min: 80,
    },
    specialName: LocationNames.AevumFulcrumTechnologies,
  },
  {
    hackDifficulty: 99,
    hostname: "fulcrumassets",
    moneyAvailable: 1e6,
    networkLayer: 15,
    numOpenPortsRequired: 5,
    organizationName: LocationNames.AevumFulcrumTechnologies,
    requiredHackingSkill: {
      max: 1600,
      min: 1100,
    },
    serverGrowth: 1,
    specialName: SpecialServers.FulcrumSecretTechnologies,
  },
  {
    hackDifficulty: {
      max: 92,
      min: 78,
    },
    hostname: "stormtech",
    moneyAvailable: {
      max: 1200e6,
      min: 1000e6,
    },
    networkLayer: 12,
    numOpenPortsRequired: 5,
    organizationName: LocationNames.IshimaStormTechnologies,
    requiredHackingSkill: {
      max: 1075,
      min: 875,
    },
    serverGrowth: {
      max: 92,
      min: 68,
    },
    specialName: LocationNames.IshimaStormTechnologies,
  },
  {
    hackDifficulty: {
      max: 96,
      min: 84,
    },
    hostname: "defcomm",
    moneyAvailable: {
      max: 950e6,
      min: 800e6,
    },
    networkLayer: 9,
    numOpenPortsRequired: 5,
    organizationName: LocationNames.NewTokyoDefComm,
    requiredHackingSkill: {
      max: 1050,
      min: 850,
    },
    serverGrowth: {
      max: 73,
      min: 47,
    },
    specialName: LocationNames.NewTokyoDefComm,
  },
  {
    hackDifficulty: {
      max: 90,
      min: 70,
    },
    hostname: "infocomm",
    moneyAvailable: {
      max: 900e6,
      min: 600e6,
    },
    networkLayer: 10,
    numOpenPortsRequired: 5,
    organizationName: "InfoComm",
    requiredHackingSkill: {
      max: 950,
      min: 875,
    },
    serverGrowth: {
      max: 75,
      min: 35,
    },
  },
  {
    hackDifficulty: {
      max: 95,
      min: 85,
    },
    hostname: "helios",
    literature: [LiteratureNames.BeyondMan],
    maxRamExponent: {
      max: 8,
      min: 5,
    },
    moneyAvailable: {
      max: 750e6,
      min: 550e6,
    },
    networkLayer: 12,
    numOpenPortsRequired: 5,
    organizationName: LocationNames.VolhavenHeliosLabs,
    requiredHackingSkill: {
      max: 900,
      min: 800,
    },
    serverGrowth: {
      max: 80,
      min: 70,
    },
    specialName: LocationNames.VolhavenHeliosLabs,
  },
  {
    hackDifficulty: {
      max: 90,
      min: 80,
    },
    hostname: LocationNames.NewTokyoVitaLife.toLowerCase(),
    literature: [LiteratureNames.AGreenTomorrow],
    maxRamExponent: {
      max: 7,
      min: 4,
    },
    moneyAvailable: {
      max: 800e6,
      min: 700e6,
    },
    networkLayer: 12,
    numOpenPortsRequired: 5,
    organizationName: LocationNames.NewTokyoVitaLife,
    requiredHackingSkill: {
      max: 900,
      min: 775,
    },
    serverGrowth: {
      max: 80,
      min: 60,
    },
    specialName: LocationNames.NewTokyoVitaLife,
  },
  {
    hackDifficulty: {
      max: 95,
      min: 85,
    },
    hostname: "icarus",
    moneyAvailable: {
      max: 1000e6,
      min: 900e6,
    },
    networkLayer: 9,
    numOpenPortsRequired: 5,
    organizationName: LocationNames.Sector12IcarusMicrosystems,
    requiredHackingSkill: {
      max: 925,
      min: 850,
    },
    serverGrowth: {
      max: 95,
      min: 85,
    },
    specialName: LocationNames.Sector12IcarusMicrosystems,
  },
  {
    hackDifficulty: {
      max: 90,
      min: 80,
    },
    hostname: "univ-energy",
    maxRamExponent: {
      max: 7,
      min: 4,
    },
    moneyAvailable: {
      max: 1200e6,
      min: 1100e6,
    },
    networkLayer: 9,
    numOpenPortsRequired: 4,
    organizationName: LocationNames.Sector12UniversalEnergy,
    requiredHackingSkill: {
      max: 900,
      min: 800,
    },
    serverGrowth: {
      max: 90,
      min: 80,
    },
    specialName: LocationNames.Sector12UniversalEnergy,
  },
  {
    hackDifficulty: {
      max: 80,
      min: 70,
    },
    hostname: "titan-labs",
    literature: [LiteratureNames.CodedIntelligence],
    maxRamExponent: {
      max: 7,
      min: 4,
    },
    moneyAvailable: {
      max: 900000000,
      min: 750000000,
    },
    networkLayer: 11,
    numOpenPortsRequired: 5,
    organizationName: "Titan Laboratories",
    requiredHackingSkill: {
      max: 875,
      min: 800,
    },
    serverGrowth: {
      max: 80,
      min: 60,
    },
  },
  {
    hackDifficulty: {
      max: 75,
      min: 65,
    },
    hostname: "microdyne",
    literature: [LiteratureNames.SyntheticMuscles],
    maxRamExponent: {
      max: 6,
      min: 4,
    },
    moneyAvailable: {
      max: 700000000,
      min: 500000000,
    },
    networkLayer: 11,
    numOpenPortsRequired: 5,
    organizationName: "Microdyne Technologies",
    requiredHackingSkill: {
      max: 875,
      min: 800,
    },
    serverGrowth: {
      max: 90,
      min: 70,
    },
  },
  {
    hackDifficulty: {
      max: 80,
      min: 70,
    },
    hostname: "taiyang-digital",
    literature: [LiteratureNames.AGreenTomorrow, LiteratureNames.BrighterThanTheSun],
    moneyAvailable: {
      max: 900000000,
      min: 800000000,
    },
    networkLayer: 10,
    numOpenPortsRequired: 5,
    organizationName: "Taiyang Digital",
    requiredHackingSkill: {
      max: 950,
      min: 850,
    },
    serverGrowth: {
      max: 80,
      min: 70,
    },
  },
  {
    hackDifficulty: {
      max: 65,
      min: 55,
    },
    hostname: "galactic-cyber",
    moneyAvailable: {
      max: 850000000,
      min: 750000000,
    },
    networkLayer: 7,
    numOpenPortsRequired: 5,
    organizationName: LocationNames.AevumGalacticCybersystems,
    requiredHackingSkill: {
      max: 875,
      min: 825,
    },
    serverGrowth: {
      max: 90,
      min: 70,
    },
    specialName: LocationNames.AevumGalacticCybersystems,
  },
  {
    hackDifficulty: {
      max: 90,
      min: 80,
    },
    hostname: LocationNames.AevumAeroCorp.toLowerCase(),
    literature: [LiteratureNames.ManAndMachine],
    moneyAvailable: {
      max: 1200000000,
      min: 1000000000,
    },
    networkLayer: 7,
    numOpenPortsRequired: 5,
    organizationName: LocationNames.AevumAeroCorp,
    requiredHackingSkill: {
      max: 925,
      min: 850,
    },
    serverGrowth: {
      max: 65,
      min: 55,
    },
    specialName: LocationNames.AevumAeroCorp,
  },
  {
    hackDifficulty: {
      max: 95,
      min: 85,
    },
    hostname: "omnia",
    literature: [LiteratureNames.HistoryOfSynthoids],
    maxRamExponent: {
      max: 6,
      min: 4,
    },
    moneyAvailable: {
      max: 1000000000,
      min: 900000000,
    },
    networkLayer: 8,
    numOpenPortsRequired: 5,
    organizationName: LocationNames.VolhavenOmniaCybersystems,
    requiredHackingSkill: {
      max: 950,
      min: 850,
    },
    serverGrowth: {
      max: 70,
      min: 60,
    },
    specialName: LocationNames.VolhavenOmniaCybersystems,
  },
  {
    hackDifficulty: {
      max: 65,
      min: 55,
    },
    hostname: "zb-def",
    literature: [LiteratureNames.SyntheticMuscles],
    moneyAvailable: {
      max: 1100000000,
      min: 900000000,
    },
    networkLayer: 10,
    numOpenPortsRequired: 4,
    organizationName: "ZB Defense Industries",
    requiredHackingSkill: {
      max: 825,
      min: 775,
    },
    serverGrowth: {
      max: 75,
      min: 65,
    },
  },
  {
    hackDifficulty: {
      max: 80,
      min: 60,
    },
    hostname: "applied-energetics",
    moneyAvailable: {
      max: 1000000000,
      min: 700000000,
    },
    networkLayer: 11,
    numOpenPortsRequired: 4,
    organizationName: "Applied Energetics",
    requiredHackingSkill: {
      max: 850,
      min: 775,
    },
    serverGrowth: {
      max: 75,
      min: 70,
    },
  },
  {
    hackDifficulty: {
      max: 80,
      min: 70,
    },
    hostname: "solaris",
    literature: [LiteratureNames.AGreenTomorrow, LiteratureNames.TheFailedFrontier],
    maxRamExponent: {
      max: 7,
      min: 4,
    },
    moneyAvailable: {
      max: 900000000,
      min: 700000000,
    },
    networkLayer: 9,
    numOpenPortsRequired: 5,
    organizationName: LocationNames.ChongqingSolarisSpaceSystems,
    requiredHackingSkill: {
      max: 850,
      min: 750,
    },
    serverGrowth: {
      max: 80,
      min: 70,
    },
    specialName: LocationNames.ChongqingSolarisSpaceSystems,
  },
  {
    hackDifficulty: {
      max: 85,
      min: 75,
    },
    hostname: LocationNames.Sector12DeltaOne.toLowerCase(),
    moneyAvailable: {
      max: 1700000000,
      min: 1300000000,
    },
    networkLayer: 8,
    numOpenPortsRequired: 5,
    organizationName: LocationNames.Sector12DeltaOne,
    requiredHackingSkill: {
      max: 900,
      min: 800,
    },
    serverGrowth: {
      max: 70,
      min: 50,
    },
    specialName: LocationNames.Sector12DeltaOne,
  },
  {
    hackDifficulty: {
      max: 85,
      min: 75,
    },
    hostname: "global-pharm",
    literature: [LiteratureNames.AGreenTomorrow],
    maxRamExponent: {
      max: 6,
      min: 3,
    },
    moneyAvailable: {
      max: 1750000000,
      min: 1500000000,
    },
    networkLayer: 7,
    numOpenPortsRequired: 4,
    organizationName: LocationNames.NewTokyoGlobalPharmaceuticals,
    requiredHackingSkill: {
      max: 850,
      min: 750,
    },
    serverGrowth: {
      max: 90,
      min: 80,
    },
    specialName: LocationNames.NewTokyoGlobalPharmaceuticals,
  },
  {
    hackDifficulty: {
      max: 80,
      min: 60,
    },
    hostname: "nova-med",
    moneyAvailable: {
      max: 1250000000,
      min: 1100000000,
    },
    networkLayer: 10,
    numOpenPortsRequired: 4,
    organizationName: LocationNames.IshimaNovaMedical,
    requiredHackingSkill: {
      max: 850,
      min: 775,
    },
    serverGrowth: {
      max: 85,
      min: 65,
    },
    specialName: LocationNames.IshimaNovaMedical,
  },
  {
    hackDifficulty: {
      max: 90,
      min: 70,
    },
    hostname: "zeus-med",
    moneyAvailable: {
      max: 1500000000,
      min: 1300000000,
    },
    networkLayer: 9,
    numOpenPortsRequired: 5,
    organizationName: "Zeus Medical",
    requiredHackingSkill: {
      max: 850,
      min: 800,
    },
    serverGrowth: {
      max: 80,
      min: 70,
    },
  },
  {
    hackDifficulty: {
      max: 80,
      min: 70,
    },
    hostname: "unitalife",
    maxRamExponent: {
      max: 6,
      min: 4,
    },
    moneyAvailable: {
      max: 1100000000,
      min: 1000000000,
    },
    networkLayer: 8,
    numOpenPortsRequired: 4,
    organizationName: "UnitaLife Group",
    requiredHackingSkill: {
      max: 825,
      min: 775,
    },
    serverGrowth: {
      max: 80,
      min: 70,
    },
  },
  {
    hackDifficulty: {
      max: 80,
      min: 60,
    },
    hostname: "lexo-corp",
    maxRamExponent: {
      max: 7,
      min: 4,
    },
    moneyAvailable: {
      max: 800000000,
      min: 700000000,
    },
    networkLayer: 6,
    numOpenPortsRequired: 4,
    organizationName: LocationNames.VolhavenLexoCorp,
    requiredHackingSkill: {
      max: 750,
      min: 650,
    },
    serverGrowth: {
      max: 65,
      min: 55,
    },
    specialName: LocationNames.VolhavenLexoCorp,
  },
  {
    hackDifficulty: {
      max: 60,
      min: 40,
    },
    hostname: "rho-construction",
    maxRamExponent: {
      max: 6,
      min: 4,
    },
    moneyAvailable: {
      max: 700000000,
      min: 500000000,
    },
    networkLayer: 6,
    numOpenPortsRequired: 3,
    organizationName: LocationNames.AevumRhoConstruction,
    requiredHackingSkill: {
      max: 525,
      min: 475,
    },
    serverGrowth: {
      max: 60,
      min: 40,
    },
    specialName: LocationNames.AevumRhoConstruction,
  },
  {
    hackDifficulty: {
      max: 70,
      min: 50,
    },
    hostname: "alpha-ent",
    literature: [LiteratureNames.Sector12Crime],
    maxRamExponent: {
      max: 7,
      min: 4,
    },
    moneyAvailable: {
      max: 750000000,
      min: 600000000,
    },
    networkLayer: 6,
    numOpenPortsRequired: 4,
    organizationName: LocationNames.Sector12AlphaEnterprises,
    requiredHackingSkill: {
      max: 600,
      min: 500,
    },
    serverGrowth: {
      max: 60,
      min: 50,
    },
    specialName: LocationNames.Sector12AlphaEnterprises,
  },
  {
    hackDifficulty: {
      max: 80,
      min: 70,
    },
    hostname: "aevum-police",
    maxRamExponent: {
      max: 6,
      min: 4,
    },
    moneyAvailable: {
      max: 400000000,
      min: 200000000,
    },
    networkLayer: 6,
    numOpenPortsRequired: 4,
    organizationName: LocationNames.AevumPolice,
    requiredHackingSkill: {
      max: 450,
      min: 400,
    },
    serverGrowth: {
      max: 50,
      min: 30,
    },
    specialName: LocationNames.AevumPolice,
  },
  {
    hackDifficulty: {
      max: 55,
      min: 45,
    },
    hostname: "rothman-uni",
    literature: [
      LiteratureNames.SecretSocieties,
      LiteratureNames.TheFailedFrontier,
      LiteratureNames.TensionsInTechRace,
    ],
    maxRamExponent: {
      max: 7,
      min: 4,
    },
    moneyAvailable: {
      max: 250000000,
      min: 175000000,
    },
    networkLayer: 5,
    numOpenPortsRequired: 3,
    organizationName: LocationNames.Sector12RothmanUniversity,
    requiredHackingSkill: {
      max: 430,
      min: 370,
    },
    serverGrowth: {
      max: 45,
      min: 35,
    },
    specialName: LocationNames.Sector12RothmanUniversity,
  },
  {
    hackDifficulty: {
      max: 85,
      min: 65,
    },
    hostname: "zb-institute",
    maxRamExponent: {
      max: 7,
      min: 4,
    },
    moneyAvailable: {
      max: 1100000000,
      min: 800000000,
    },
    networkLayer: 5,
    numOpenPortsRequired: 5,
    organizationName: LocationNames.VolhavenZBInstituteOfTechnology,
    requiredHackingSkill: {
      max: 775,
      min: 725,
    },
    serverGrowth: {
      max: 85,
      min: 75,
    },
    specialName: LocationNames.VolhavenZBInstituteOfTechnology,
  },
  {
    hackDifficulty: {
      max: 65,
      min: 45,
    },
    hostname: "summit-uni",
    literature: [LiteratureNames.SecretSocieties, LiteratureNames.TheFailedFrontier, LiteratureNames.SyntheticMuscles],
    maxRamExponent: {
      max: 6,
      min: 4,
    },
    moneyAvailable: {
      max: 350000000,
      min: 200000000,
    },
    networkLayer: 5,
    numOpenPortsRequired: 3,
    organizationName: LocationNames.AevumSummitUniversity,
    requiredHackingSkill: {
      max: 475,
      min: 425,
    },
    serverGrowth: {
      max: 60,
      min: 40,
    },
    specialName: LocationNames.AevumSummitUniversity,
  },
  {
    hackDifficulty: {
      max: 80,
      min: 60,
    },
    hostname: "syscore",
    moneyAvailable: {
      max: 600000000,
      min: 400000000,
    },
    networkLayer: 5,
    numOpenPortsRequired: 4,
    organizationName: LocationNames.VolhavenSysCoreSecurities,
    requiredHackingSkill: {
      max: 650,
      min: 550,
    },
    serverGrowth: {
      max: 70,
      min: 60,
    },
    specialName: LocationNames.VolhavenSysCoreSecurities,
  },
  {
    hackDifficulty: {
      max: 70,
      min: 60,
    },
    hostname: "catalyst",
    literature: [LiteratureNames.TensionsInTechRace],
    maxRamExponent: {
      max: 7,
      min: 4,
    },
    moneyAvailable: {
      max: 550000000,
      min: 300000000,
    },
    networkLayer: 5,
    numOpenPortsRequired: 3,
    organizationName: "Catalyst Ventures",
    requiredHackingSkill: {
      max: 450,
      min: 400,
    },
    serverGrowth: {
      max: 55,
      min: 25,
    },
  },
  {
    hackDifficulty: {
      max: 45,
      min: 35,
    },
    hostname: "the-hub",
    maxRamExponent: {
      max: 6,
      min: 3,
    },
    moneyAvailable: {
      max: 200000000,
      min: 150000000,
    },
    networkLayer: 4,
    numOpenPortsRequired: 2,
    organizationName: "The Hub",
    requiredHackingSkill: {
      max: 325,
      min: 275,
    },
    serverGrowth: {
      max: 55,
      min: 45,
    },
  },
  {
    hackDifficulty: {
      max: 65,
      min: 55,
    },
    hostname: LocationNames.VolhavenCompuTek.toLowerCase(),
    literature: [LiteratureNames.ManAndMachine],
    moneyAvailable: {
      max: 250000000,
      min: 220000000,
    },
    networkLayer: 4,
    numOpenPortsRequired: 3,
    organizationName: LocationNames.VolhavenCompuTek,
    requiredHackingSkill: {
      max: 400,
      min: 300,
    },
    serverGrowth: {
      max: 65,
      min: 45,
    },
    specialName: LocationNames.VolhavenCompuTek,
  },
  {
    hackDifficulty: {
      max: 80,
      min: 60,
    },
    hostname: "netlink",
    literature: [LiteratureNames.SimulatedReality],
    maxRamExponent: {
      max: 7,
      min: 4,
    },
    moneyAvailable: 275000000,
    networkLayer: 4,
    numOpenPortsRequired: 3,
    organizationName: LocationNames.AevumNetLinkTechnologies,
    requiredHackingSkill: {
      max: 425,
      min: 375,
    },
    serverGrowth: {
      max: 75,
      min: 45,
    },
    specialName: LocationNames.AevumNetLinkTechnologies,
  },
  {
    hackDifficulty: {
      max: 65,
      min: 35,
    },
    hostname: "johnson-ortho",
    moneyAvailable: {
      max: 85000000,
      min: 70000000,
    },
    networkLayer: 4,
    numOpenPortsRequired: 2,
    organizationName: "Johnson Orthopedics",
    requiredHackingSkill: {
      max: 300,
      min: 250,
    },
    serverGrowth: {
      max: 65,
      min: 35,
    },
  },
  {
    hackDifficulty: 1,
    hostname: "n00dles",
    literature: [],
    maxRamExponent: 2,
    moneyAvailable: 70000,
    networkLayer: 1,
    numOpenPortsRequired: 0,
    organizationName: LocationNames.NewTokyoNoodleBar,
    requiredHackingSkill: 1,
    serverGrowth: 3000,
    specialName: LocationNames.NewTokyoNoodleBar,
  },
  {
    hackDifficulty: 10,
    hostname: LocationNames.Sector12FoodNStuff.toLowerCase(),
    literature: [LiteratureNames.Sector12Crime],
    maxRamExponent: 4,
    moneyAvailable: 2000000,
    networkLayer: 1,
    numOpenPortsRequired: 0,
    organizationName: LocationNames.Sector12FoodNStuff,
    requiredHackingSkill: 1,
    serverGrowth: 5,
    specialName: LocationNames.Sector12FoodNStuff,
  },
  {
    hackDifficulty: 10,
    hostname: "sigma-cosmetics",
    maxRamExponent: 4,
    moneyAvailable: 2300000,
    networkLayer: 1,
    numOpenPortsRequired: 0,
    organizationName: "Sigma Cosmetics",
    requiredHackingSkill: 5,
    serverGrowth: 10,
  },
  {
    hackDifficulty: 15,
    hostname: "joesguns",
    maxRamExponent: 4,
    moneyAvailable: 2500000,
    networkLayer: 1,
    numOpenPortsRequired: 0,
    organizationName: LocationNames.Sector12JoesGuns,
    requiredHackingSkill: 10,
    serverGrowth: 20,
    specialName: LocationNames.Sector12JoesGuns,
  },
  {
    hackDifficulty: 25,
    hostname: "zer0",
    maxRamExponent: 5,
    moneyAvailable: 7500000,
    networkLayer: 2,
    numOpenPortsRequired: 1,
    organizationName: "ZER0 Nightclub",
    requiredHackingSkill: 75,
    serverGrowth: 40,
  },
  {
    hackDifficulty: 20,
    hostname: "nectar-net",
    maxRamExponent: 4,
    moneyAvailable: 2750000,
    networkLayer: 2,
    numOpenPortsRequired: 0,
    organizationName: "Nectar Nightclub Network",
    requiredHackingSkill: 20,
    serverGrowth: 25,
  },
  {
    hackDifficulty: 25,
    hostname: "neo-net",
    literature: [LiteratureNames.TheHiddenWorld],
    maxRamExponent: 5,
    moneyAvailable: 5000000,
    networkLayer: 3,
    numOpenPortsRequired: 1,
    organizationName: "Neo Nightclub Network",
    requiredHackingSkill: 50,
    serverGrowth: 25,
  },
  {
    hackDifficulty: 30,
    hostname: "silver-helix",
    literature: [LiteratureNames.NewTriads],
    maxRamExponent: 6,
    moneyAvailable: 45000000,
    networkLayer: 3,
    numOpenPortsRequired: 2,
    organizationName: "Silver Helix",
    requiredHackingSkill: 150,
    serverGrowth: 30,
  },
  {
    hackDifficulty: 15,
    hostname: "hong-fang-tea",
    literature: [LiteratureNames.BrighterThanTheSun],
    maxRamExponent: 4,
    moneyAvailable: 3000000,
    networkLayer: 1,
    numOpenPortsRequired: 0,
    organizationName: "HongFang Teahouse",
    requiredHackingSkill: 30,
    serverGrowth: 20,
  },
  {
    hackDifficulty: 15,
    hostname: "harakiri-sushi",
    maxRamExponent: 4,
    moneyAvailable: 4000000,
    networkLayer: 1,
    numOpenPortsRequired: 0,
    organizationName: "HaraKiri Sushi Bar Network",
    requiredHackingSkill: 40,
    serverGrowth: 40,
  },
  {
    hackDifficulty: 20,
    hostname: "phantasy",
    maxRamExponent: 5,
    moneyAvailable: 24000000,
    networkLayer: 3,
    numOpenPortsRequired: 2,
    organizationName: "Phantasy Club",
    requiredHackingSkill: 100,
    serverGrowth: 35,
  },
  {
    hackDifficulty: 15,
    hostname: "max-hardware",
    maxRamExponent: 5,
    moneyAvailable: 10000000,
    networkLayer: 2,
    numOpenPortsRequired: 1,
    organizationName: "Max Hardware Store",
    requiredHackingSkill: 80,
    serverGrowth: 30,
  },
  {
    hackDifficulty: {
      max: 35,
      min: 25,
    },
    hostname: "omega-net",
    literature: [LiteratureNames.TheNewGod],
    maxRamExponent: 5,
    moneyAvailable: {
      max: 70000000,
      min: 60000000,
    },
    networkLayer: 3,
    numOpenPortsRequired: 2,
    organizationName: LocationNames.IshimaOmegaSoftware,
    requiredHackingSkill: {
      max: 220,
      min: 180,
    },
    serverGrowth: {
      max: 40,
      min: 30,
    },
    specialName: LocationNames.IshimaOmegaSoftware,
  },
  {
    hackDifficulty: {
      max: 45,
      min: 35,
    },
    hostname: "crush-fitness",
    moneyAvailable: {
      max: 60000000,
      min: 40000000,
    },
    networkLayer: 4,
    numOpenPortsRequired: 2,
    organizationName: "Crush Fitness",
    requiredHackingSkill: {
      max: 275,
      min: 225,
    },
    serverGrowth: {
      max: 33,
      min: 27,
    },
    specialName: LocationNames.AevumCrushFitnessGym,
  },
  {
    hackDifficulty: 30,
    hostname: "iron-gym",
    maxRamExponent: 5,
    moneyAvailable: 20000000,
    networkLayer: 1,
    numOpenPortsRequired: 1,
    organizationName: `${LocationNames.Sector12IronGym} Network`,
    requiredHackingSkill: 100,
    serverGrowth: 20,
    specialName: LocationNames.Sector12IronGym,
  },
  {
    hackDifficulty: {
      max: 55,
      min: 45,
    },
    hostname: "millenium-fitness",
    maxRamExponent: {
      max: 8,
      min: 4,
    },
    moneyAvailable: 250000000,
    networkLayer: 6,
    numOpenPortsRequired: 3,
    organizationName: "Millenium Fitness Network",
    requiredHackingSkill: {
      max: 525,
      min: 475,
    },
    serverGrowth: {
      max: 45,
      min: 25,
    },
    specialName: LocationNames.VolhavenMilleniumFitnessGym,
  },
  {
    hackDifficulty: {
      max: 65,
      min: 55,
    },
    hostname: "powerhouse-fitness",
    maxRamExponent: {
      max: 6,
      min: 4,
    },
    moneyAvailable: 900000000,
    networkLayer: 14,
    numOpenPortsRequired: 5,
    organizationName: "Powerhouse Fitness",
    requiredHackingSkill: {
      max: 1100,
      min: 950,
    },
    serverGrowth: {
      max: 60,
      min: 50,
    },
    specialName: LocationNames.Sector12PowerhouseGym,
  },
  {
    hackDifficulty: {
      max: 60,
      min: 40,
    },
    hostname: "snap-fitness",
    moneyAvailable: 450000000,
    networkLayer: 7,
    numOpenPortsRequired: 4,
    organizationName: "Snap Fitness",
    requiredHackingSkill: {
      max: 800,
      min: 675,
    },
    serverGrowth: {
      max: 60,
      min: 40,
    },
    specialName: LocationNames.AevumSnapFitnessGym,
  },
  {
    hackDifficulty: 0,
    hostname: "run4theh111z",
    literature: [LiteratureNames.SimulatedReality, LiteratureNames.TheNewGod],
    maxRamExponent: {
      max: 9,
      min: 5,
    },
    moneyAvailable: 0,
    networkLayer: 11,
    numOpenPortsRequired: 4,
    organizationName: "The Runners",
    requiredHackingSkill: {
      max: 550,
      min: 505,
    },
    serverGrowth: 0,
    specialName: SpecialServers.BitRunnersServer,
  },
  {
    hackDifficulty: 0,
    hostname: "I.I.I.I",
    literature: [LiteratureNames.DemocracyIsDead],
    maxRamExponent: {
      max: 8,
      min: 4,
    },
    moneyAvailable: 0,
    networkLayer: 5,
    numOpenPortsRequired: 3,
    organizationName: "I.I.I.I",
    requiredHackingSkill: {
      max: 365,
      min: 340,
    },
    serverGrowth: 0,
    specialName: SpecialServers.TheBlackHandServer,
  },
  {
    hackDifficulty: 0,
    hostname: "avmnite-02h",
    literature: [LiteratureNames.DemocracyIsDead],
    maxRamExponent: {
      max: 7,
      min: 4,
    },
    moneyAvailable: 0,
    networkLayer: 4,
    numOpenPortsRequired: 2,
    organizationName: FactionNames.NiteSec,
    requiredHackingSkill: {
      max: 220,
      min: 202,
    },
    serverGrowth: 0,
    specialName: SpecialServers.NiteSecServer,
  },
  {
    hackDifficulty: 0,
    hostname: ".",
    maxRamExponent: 4,
    moneyAvailable: 0,
    networkLayer: 13,
    numOpenPortsRequired: 4,
    organizationName: ".",
    requiredHackingSkill: {
      max: 550,
      min: 505,
    },
    serverGrowth: 0,
    specialName: SpecialServers.TheDarkArmyServer,
  },
  {
    hackDifficulty: 0,
    hostname: "CSEC",
    literature: [LiteratureNames.DemocracyIsDead],
    maxRamExponent: 3,
    moneyAvailable: 0,
    networkLayer: 2,
    numOpenPortsRequired: 1,
    organizationName: FactionNames.CyberSec,
    requiredHackingSkill: {
      max: 60,
      min: 51,
    },
    serverGrowth: 0,
    specialName: SpecialServers.CyberSecServer,
  },
  {
    hackDifficulty: 0,
    hostname: "The-Cave",
    literature: [LiteratureNames.AlphaOmega],
    moneyAvailable: 0,
    networkLayer: 15,
    numOpenPortsRequired: 5,
    organizationName: "Helios",
    requiredHackingSkill: 925,
    serverGrowth: 0,
    specialName: SpecialServers.DaedalusServer,
  },
  {
    hackDifficulty: 0,
    hostname: "w0r1d_d43m0n",
    moneyAvailable: 0,
    numOpenPortsRequired: 5,
    organizationName: "w0r1d_d43m0n",
    requiredHackingSkill: 3000,
    serverGrowth: 0,
    specialName: SpecialServers.WorldDaemon,
  },
  {
    hostname: SpecialServers.DarkWeb,
    moneyAvailable: 0,
    numOpenPortsRequired: 5,
    organizationName: SpecialServers.DarkWeb,
    requiredHackingSkill: 1,
    specialName: SpecialServers.DarkWeb,
  },
];
