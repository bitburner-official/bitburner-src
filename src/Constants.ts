/**
 * Generic Game Constants
 *
 * Constants for specific mechanics or features will NOT be here.
 */
export const CONSTANTS: {
  VersionString: string;
  isDevBranch: boolean;
  VersionNumber: number;
  MaxSkillLevel: number;
  MilliPerCycle: number;
  CorpFactionRepRequirement: number;
  BaseFocusBonus: number;
  BaseCostFor1GBOfRamHome: number;
  BaseCostFor1GBOfRamServer: number;
  TravelCost: number;
  BaseFavorToDonate: number;
  DonateMoneyToRepDivisor: number;
  FactionReputationToFavorBase: number;
  FactionReputationToFavorMult: number;
  CompanyReputationToFavorBase: number;
  CompanyReputationToFavorMult: number;
  NeuroFluxGovernorLevelMult: number;
  NumNetscriptPorts: number;
  HomeComputerMaxRam: number;
  ServerBaseGrowthRate: number;
  ServerMaxGrowthRate: number;
  ServerFortifyAmount: number;
  ServerWeakenAmount: number;
  PurchasedServerLimit: number;
  PurchasedServerMaxRam: number;
  MultipleAugMultiplier: number;
  TorRouterCost: number;
  HospitalCostPerHp: number;
  IntelligenceCrimeWeight: number;
  IntelligenceInfiltrationWeight: number;
  IntelligenceCrimeBaseExpGain: number;
  IntelligenceProgramBaseExpGain: number;
  IntelligenceGraftBaseExpGain: number;
  IntelligenceTerminalHackBaseExpGain: number;
  IntelligenceSingFnBaseExpGain: number;
  IntelligenceClassBaseExpGain: number;
  MillisecondsPer20Hours: number;
  GameCyclesPer20Hours: number;
  MillisecondsPer10Hours: number;
  GameCyclesPer10Hours: number;
  MillisecondsPer8Hours: number;
  GameCyclesPer8Hours: number;
  MillisecondsPer4Hours: number;
  GameCyclesPer4Hours: number;
  MillisecondsPer2Hours: number;
  GameCyclesPer2Hours: number;
  MillisecondsPerHour: number;
  GameCyclesPerHour: number;
  MillisecondsPerHalfHour: number;
  GameCyclesPerHalfHour: number;
  MillisecondsPerQuarterHour: number;
  GameCyclesPerQuarterHour: number;
  MillisecondsPerFiveMinutes: number;
  GameCyclesPerFiveMinutes: number;
  ClassDataStructuresBaseCost: number;
  ClassNetworksBaseCost: number;
  ClassAlgorithmsBaseCost: number;
  ClassManagementBaseCost: number;
  ClassLeadershipBaseCost: number;
  ClassGymBaseCost: number;
  ClassStudyComputerScienceBaseExp: number;
  ClassDataStructuresBaseExp: number;
  ClassNetworksBaseExp: number;
  ClassAlgorithmsBaseExp: number;
  ClassManagementBaseExp: number;
  ClassLeadershipBaseExp: number;
  CodingContractBaseFactionRepGain: number;
  CodingContractBaseCompanyRepGain: number;
  CodingContractBaseMoneyGain: number;
  AugmentationGraftingCostMult: number;
  AugmentationGraftingTimeBase: number;
  SoACostMult: number;
  SoARepMult: number;
  EntropyEffect: number;
  TotalNumBitNodes: number;
  InfiniteLoopLimit: number;
  Donations: number; // number of blood/plasma/palette donation the dev have verified., boosts NFG
  LatestUpdate: string;
} = {
  VersionString: "2.5.0",
  isDevBranch: false,
  VersionNumber: 35,

  /** Max level for any skill, assuming no multipliers. Determined by max numerical value in javascript for experience
   * and the skill level formula in Player.js. Note that all this means it that when experience hits MAX_INT, then
   * the player will have this level assuming no multipliers. Multipliers can cause skills to go above this.
   */
  MaxSkillLevel: 975,

  // Milliseconds per game cycle
  MilliPerCycle: 200,

  // How much reputation is needed to join a megacorporation's faction
  CorpFactionRepRequirement: 400e3,

  // Base RAM costs
  BaseCostFor1GBOfRamHome: 32000,
  BaseCostFor1GBOfRamServer: 55000, //1 GB of RAM

  // Cost to travel to another city
  TravelCost: 200e3,

  // Faction and Company favor-related things
  BaseFavorToDonate: 150,
  DonateMoneyToRepDivisor: 1e6,
  FactionReputationToFavorBase: 500,
  FactionReputationToFavorMult: 1.02,
  CompanyReputationToFavorBase: 500,
  CompanyReputationToFavorMult: 1.02,

  // NeuroFlux Governor Augmentation cost multiplier
  NeuroFluxGovernorLevelMult: 1.14,

  NumNetscriptPorts: Number.MAX_SAFE_INTEGER,

  // Server-related constants
  HomeComputerMaxRam: 1073741824, // 2 ^ 30
  ServerBaseGrowthRate: 1.03, // Unadjusted Growth rate
  ServerMaxGrowthRate: 1.0035, // Maximum possible growth rate (max rate accounting for server security)
  ServerFortifyAmount: 0.002, // Amount by which server's security increases when its hacked/grown
  ServerWeakenAmount: 0.05, // Amount by which server's security decreases when weakened

  PurchasedServerLimit: 25,
  PurchasedServerMaxRam: 1048576, // 2^20

  // Augmentation Constants
  MultipleAugMultiplier: 1.9,

  // TOR Router
  TorRouterCost: 200e3,

  // Hospital/Health
  HospitalCostPerHp: 100e3,

  // Intelligence-related constants
  IntelligenceCrimeWeight: 0.025, // Weight for how much int affects crime success rates
  IntelligenceInfiltrationWeight: 0.1, // Weight for how much int affects infiltration success rates
  IntelligenceCrimeBaseExpGain: 0.05,
  IntelligenceProgramBaseExpGain: 0.1, // Program required hack level divided by this to determine int exp gain
  IntelligenceGraftBaseExpGain: 0.05,
  IntelligenceTerminalHackBaseExpGain: 200, // Hacking exp divided by this to determine int exp gain
  IntelligenceSingFnBaseExpGain: 1.5,
  IntelligenceClassBaseExpGain: 0.01,

  // Time-related constants
  MillisecondsPer20Hours: 72000000,
  GameCyclesPer20Hours: 72000000 / 200,

  MillisecondsPer10Hours: 36000000,
  GameCyclesPer10Hours: 36000000 / 200,

  MillisecondsPer8Hours: 28800000,
  GameCyclesPer8Hours: 28800000 / 200,

  MillisecondsPer4Hours: 14400000,
  GameCyclesPer4Hours: 14400000 / 200,

  MillisecondsPer2Hours: 7200000,
  GameCyclesPer2Hours: 7200000 / 200,

  MillisecondsPerHour: 3600000,
  GameCyclesPerHour: 3600000 / 200,

  MillisecondsPerHalfHour: 1800000,
  GameCyclesPerHalfHour: 1800000 / 200,

  MillisecondsPerQuarterHour: 900000,
  GameCyclesPerQuarterHour: 900000 / 200,

  MillisecondsPerFiveMinutes: 300000,
  GameCyclesPerFiveMinutes: 300000 / 200,

  // Player Work & Action
  BaseFocusBonus: 0.8,

  ClassDataStructuresBaseCost: 40,
  ClassNetworksBaseCost: 80,
  ClassAlgorithmsBaseCost: 320,
  ClassManagementBaseCost: 160,
  ClassLeadershipBaseCost: 320,
  ClassGymBaseCost: 120,

  ClassStudyComputerScienceBaseExp: 0.5,
  ClassDataStructuresBaseExp: 1,
  ClassNetworksBaseExp: 2,
  ClassAlgorithmsBaseExp: 4,
  ClassManagementBaseExp: 2,
  ClassLeadershipBaseExp: 4,

  // Coding Contract
  // TODO: Move this into Coding contract implementation?
  CodingContractBaseFactionRepGain: 2500,
  CodingContractBaseCompanyRepGain: 4000,
  CodingContractBaseMoneyGain: 75e6,

  // Augmentation grafting multipliers
  AugmentationGraftingCostMult: 3,
  AugmentationGraftingTimeBase: 3600000,

  // SoA mults
  SoACostMult: 7,
  SoARepMult: 1.3,

  // Value raised to the number of entropy stacks, then multiplied to player multipliers
  EntropyEffect: 0.98,

  // BitNode/Source-File related stuff
  TotalNumBitNodes: 24,

  InfiniteLoopLimit: 2000,

  Donations: 113,

  // Also update doc/source/changelog.rst
  LatestUpdate: `
## v2.5.0 (10/2/2023)

### NOTES
(Corporation) Bugfixes in Corporation may cause a large balance shift for this mechanic.

### API CHANGES:
- ns.print and ns.tprint now handle printing Set and Map objects directly (@ficocelliguy)
- ns.spawn can now use a configurable delay instead of always 10 seconds (@muesli4brekkies)
- (Corporation) Added CorporationDivisions property to BitNodeMultipliers interface (@Caldwell-74)
- (Corporation) Added makesMaterials and makesProducts properties to CorpIndustryData interface (@Caldwell-74)
- (Corporation) Added issueNewSharesCooldown property to the CorporationInfo interface (@Caldwell-74)
- (Corporation) Significantly lowered ram cost of all corporation functions (@jjclark1982)
- (Gang) Added ns.gang.getRecruitsAvailable: Gets the number of additional gang members that can currently be recruited (@myCatsName)
- (Gang) Added ns.gang.respectForNextRecruit: Gets the respect threshold for recruiting the next gang member (@myCatsName)
- (Gang) Added ns.gang.renameMember: Renames a gang member (@myCatsName)

### BUGFIX
- Taking a university class no longer gives the player an achievement for working out in a gym (@myCatsName)
- Bash keybind ctrl-C clears an ongoing terminal history search (@ncharris93)
- (Corporation): Fix bug in valuation calculation (@yichizhng)
- (Corporation): Fix bug in share price calculation (@jjclark1982)
- (Corporation) "Same sell amount in all cities" works with Products again (@Caldwell-74)
- (Hashnet) Buying multiple company favor upgrades at the same time will actually apply them all instead of just one (@aschmider)

### OTHER CHANGES
- MISC: Improved handling of aliases in the Terminal (@ficocelliguy)
- MISC: Improved error messages for ns.getPurchasedServer (@ficocelliguy)
- MISC: ns.sleep and ns.asleep now show a formatted time in the script log. (@ficocelliguy)
- MISC: Fix an exploit that allowed over 100% utilization of a server's ram (@d0sboots)
- MISC: (Bladeburner / Sleeve) Bladeburner training action is available for sleeves (@Zelow79)
- MISC: (Gang) Renamed the Territory Warfare mechanic (now referred to as Territory Clashes) to deconflict with the Territory Warfare gang member task (@ficocelliguy)
- UI: Infiltration now hides tail windows instead of temporarily removing them from the page. This means position/size will remain as they were before the infiltration, and any React content will remain active instead of being unmounted/remounted (@ficocelliguy)
- UI: Faction augmentation page updates more reliably (@zerbosh)
- UI: Added a text filter on the Faction Augmentations page (@ficocelliguy)
- UI: Improved pagination of Active Scripts page (@Ookamiko, @ficocelliguy)
- UI: Icarus message no longer shows repeatedly for players that are in the endgame (@ficocelliguy)
- UI: Remove work completion dialogs when performing an augmentation install (@ficocelliguy)
- UI: Improve soft reset dialog, and always show dialog when soft resetting (@myCatsName)
- UI: While closing, modals no longer update displayed info and become inert (@Snarling)
- UI: (Bladeburner) Fix a possible NaN display value in Bladeburner (@zerbosh)
- UI: (Corporation) Multiple UI improvements for Corporation (@jjclark1982)
- UI: (Corporation) Tweaked some number formatting to look better in Corp and Stats page (@zerbosh)
- UI: (Corporation) Market TA no longer has its own dialog box, it's set in the normal sell dialog (@Caldwell-74)
- UI: (Corporation) Fix an incorrect value in the party dialog box (@aschmider)
- UI: (Corporation) Improved the descriptions for Corporation states (@Caldwell-74)
- UI: (Gang) Various UI improvements for Gang (@myCatsName)
- DOCS: Improve documentation for ports (@muesli4brekkies)
- DOCS: Updated documentation for ns.tail and ns.getScriptLogs to make it clear a PID can be used (@myCatsName)
- DOCS: Improve documentation for FilenameOrPID functions (@VictorS)
- DOCS: Improved various existing ingame documentation pages (@myCatsName)
- DOCS: (Bladeburner / Gang) Added initial ingame documentation for Bladeburner and Gang (@myCatsName)
- DOCS: (Bladeburner / Gang) Improve API documentation for Bladeburner and Gang functions (@myCatsName)
`,
};
