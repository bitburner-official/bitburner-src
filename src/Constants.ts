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
  OfflineHackingIncome: number;
  CorpFactionRepRequirement: number;
  BaseFocusBonus: number;
  TravelCost: number;
  BaseFavorToDonate: number;
  DonateMoneyToRepDivisor: number;
  FactionReputationToFavorBase: number;
  FactionReputationToFavorMult: number;
  CompanyReputationToFavorBase: number;
  CompanyReputationToFavorMult: number;
  NeuroFluxGovernorLevelMult: number;
  NumNetscriptPorts: number;
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
  VersionString: "2.6.0dev",
  isDevBranch: true,
  VersionNumber: 37,

  /** Max level for any skill, assuming no multipliers. Determined by max numerical value in javascript for experience
   * and the skill level formula in Player.js. Note that all this means it that when experience hits MAX_INT, then
   * the player will have this level assuming no multipliers. Multipliers can cause skills to go above this.
   */
  MaxSkillLevel: 975,

  // Milliseconds per game cycle
  MilliPerCycle: 200,

  // Multiplier for hacking income earned from offline scripts
  OfflineHackingIncome: 0.75,

  // How much reputation is needed to join a megacorporation's faction
  CorpFactionRepRequirement: 400e3,

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
## v2.6.0 dev - Changelog last updated 10 Feb 2024

### MAJOR ADDITIONS

- A new minigame IPvGO, based on the game Go. Visit DefComm in New Tokyo or the CIA in Sector-12 for access. Documentation for the mechanic is available ingame under "How to Play" once the mechanic is available. (@ficocelliguy)
- A new BitNode has been added which focuses on the IPvGO mechanic (@ficocelliguy)

### API

- (Bladeburner) ns.bladeburner.getSkillUpgradeCost now returns infinity if requesting a cost above the maximum skill level (@Semanual)
- (CodingContract) Fixed an issue where ns.codingcontract.getData was leaking internal arrays when contract data was a 2-d array (@LJNeon)
- (Go) Added the ns.go API, which allows interaction with the new IPvGO mechanic. While this is in development, the API may undergo changes (@ficocelliguy)
- (Ports) Added ns.nextPortWrite, which allows waiting for the next write to a port without creating a port handle object (@LJNeon)
- (Singularity) Add type information for ns.singularity.getCurrentWork return value (@Semanual)
- (Stanek) Fix ns.stanek.acceptGift which was not working in 2.5.2 (@jjclark1982)
- Improved the efficiency and accuracy of growth formulas (@d0sboots)
- ns.formatNumber now throws an error if specifying a suffixStart less than 1000 (@TheAimMan)
- HGWOptions now accepts a non-integer number of threads (@Caldwell-74)
- Fixed ns.serverExists returning incorrect value for an endgame server (@cigarmemr)

### UI

- (Augmentations) Fixed some missing description text for Hacknet multipliers (@jjclark1982)
- (Corporation) Align columns correctly in warehouse breakdown table (@jjclark1982)
- (Corporation) Several typo fixes in Corporation modals (@cigarmemr)
- (Documentation) Ingame documentation now displays line breaks inside tables correctly (@Snarling)
- (Documentation) Added a documentation page for converting .script to .js (@LJNeon, @jjclark1982, @Snarling)
- (Hashnet) Hash upgrade descriptions use proper number formatting options (@Snarling)
- (Hacknet) Hacknet display shows a dynamic amount of columns based on screen width (@shyguy1412)
- (Infiltration) Changed how the CheatCodeGame is displayed (@alutman, @Snarling)
- (Sleeve) If intelligence is unlocked, sleeve intelligence is shown in the UI (@Caldwell-74)
- (Stockmarket) Changed color of stocks increasing in value (@Semanual)
- (Terminal) Improved scroll behavior on the Terminal (@Snarling)
- Reorganization of some content on the Active Scripts page (@Snarling) 
- "Disable Text Effects" option also disables the corrupted text display (@draughtnyan)
- fl1ght.exe now displays the related requirements in a more readable way (@TheAimMan, @LJNeon)
- Miscellaneous wording fixes (@cigarmemr)

### MISC

- (CodingContract) Improve parsing of player input for arrays in coding contracts (@rocket3989)
- (Corporation) Fix an incorrect demand range for Minerals (@catloversg)
- (Corporation) Divisions impact on corporation valuation is now based on number of offices and warehouses (@catloversg)
- (Gang) Add separate money tracking for gang expenses (@deansvendsen)
- (Ports) Port objects no longer track a separate promise for every use of nextWrite (@Snarling)
- (Ports) Fixed a crashing bug related to the changes above (@Jman420)
- (RemoteAPI) Remote API can be targeted to a remote device instead of the default of localhost (@Specker)
- (RemoteAPI) Added a getAllServers method (@shyguy1412)
- (ScriptEditor) When importing from other files that are also open in the editor, type information is now available in the IDE (@shyguy1412)
- (ScriptEditor) Script "models" in the script editor are now properly disposed (@Caldwell-74)
- All running scripts are killed upon entering the BitVerse (@LJNeon)
- Scripts with the "temporary" flag set do not populate the Recently Killed script list on script death (@TheAimMan)
 - Fix an issue with offline income for scripts (@Caldwell-74)
- Various "nextUpdate" promises are not tracked internally as a single promise instead of an array of promises (@Caldwell-74, @LJNeon)
- Fix inconsistent importing of the arg library (@catloversg)
- Clarify some information in the CONTRIBUTING.md file (@deansvendsen)
- Internal changes to method used for cloning objects (@LJNeon)
- Rearrange some internal constants (@Caldwell-74)
- b1t_flum3.exe can be ran in "quick" mode (@TheAimMan)
- Nerf noodle bar (various)
`,
};
