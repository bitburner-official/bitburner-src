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
  WSEAccountCost: number;
  TIXAPICost: number;
  MarketData4SCost: number;
  MarketDataTixApi4SCost: number;
  StockMarketCommission: number;
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
  VersionString: "2.3.0",
  isDevBranch: false,
  VersionNumber: 31,

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

  // Stock market
  WSEAccountCost: 200e6,
  TIXAPICost: 5e9,
  MarketData4SCost: 1e9,
  MarketDataTixApi4SCost: 25e9,
  StockMarketCommission: 100e3,

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

  Donations: 79,

  // Also update doc/source/changelog.rst
  LatestUpdate: `
v2.3.0 - SF3 rework and performance improvements (25 May 2023)
----------------------------------------------------------------

HOTFIXES:

* Prevent scripts from loading during intial migration to 2.3.0 save format, to prevent a crash that could occur.
* Fix scp logging (hostname was being logged incorrectly in multiple places and showing as [Object object])

BREAKING CHANGES: These changes may require changes to your scripts.

* Major changes to the SF3 mechanic. See the related section below for more detailed info on the changes.
* The same script filename can now be ran multiple times with the same args. If running a script from another script (ns.run/ns.exec/etc), this limitation can be re-imposed with the preventDuplicates RunOption (see general section for info on RunOptions).
* The same .js script will now be the same js module whether the script was ran directly or used as an import. This means top-level variables (variables defined outside of any function) are shared across all instances of the script.
* The js module for a script will also be reused by any script that has the exact same compiled text, even if that script is on another server or has a different filename. This can lead to unexpected results when using top-level variables.
* Some properties removed from ns.getPlayer and added to a separate function ns.getResetInfo. These are still accessible from getPlayer but will produce a warning message the first time they are accessed per game session.
* hackAnalyzeThreads now returns -1, instead of 0, when no money can be hacked from the targeted server.
* ns.iKnowWhatImDoing has been removed, replaced by ns.tprintRaw for printing custom react content to the terminal (limited support).

PERFORMANCE:

* Minimize impact of unavoidable memory leak when modules are created, by reusing modules as much as possible (@d0sboots)
* Internal data structure changes (@d0sboots, @Snarling)
* Fix memory leak when initializing large number of netscript ports (@Snarling)
* Improve performance while on the Active Scripts page if many scripts are starting/ending. (@d0sboots)

NETSCRIPT GENERAL:

* Remove requirement for script args to be unique. This was also related to performance improvements. (@d0sboots)
* ns.hackAnalyzeThreads no longer indicates infinity any time a single thread would hack less than $1 (@Snarling)
* ns.renamePurchasedServer no longer crashes if player is connected to the server being renamed (@Snarling)
* ns.hackAnalyzeThreads now return -1 (instead of 0) if no money can be hacked from the targeted server. (@d0sboots)
* Fix a possible infinite atExit loop if a script killed itself. (@Snarling)
* Static timestamps of last resets can be obtained via ns.getResetInfo, replacing playtimeSinceLastX from ns.getPlayer (@G4mingJon4s)
* Improved support for printing react content directly to the terminal (ns.tprintRaw) or to a script log (ns.printRaw).
* Added RunOptions, which can optionally replace the "threads" argument for ns.run/ns.exec/ns.spawn. (@d0sboots)
  * RunOptions.threads: Provide a thread count (since RunOptions can replace the threads argument)
  * RunOptions.temporary: Prevents the script execution from being included in the save file.
  * RunOptions.ramOverride: Provide a static ram cost for the script to override what is calculated by the game. Dynamic ram checking is still enforced.
  * RunOptions.preventDuplicates: Fail to launch the script if the args are identical to a script already running.

GENERAL / MISC:

* Fixed a bug that could cause the overview skill bars to become desynced (@d0sboots)
* There is now an autoexec setting to specify a script on home to automatically run when loading the game. (@d0sboots)
* Monaco script editor updated to a newer version and has more config options available now. (@Snarling)
* Improve Electron's handling of external links (@Snarling) 
* Improved support for ANSI color codes (@d0sboots)
* Improved consistency of file paths. Correct names for files no longer start with a / even if they are in a directory. (@Snarling)
* All Math Expressions contract no longer accepts wrong answers (@Snarling)
* Faction invites now trigger immediately when backdooring a server. (@Snarling)
* Fixed issue where duplicate programs could be created. (@Minzenkatze)
* UI improvements to create program page (@Minzenkatze)
* Fix inconsistency in skill xp to skill level conversion (@hydroflame)
* Updated blood donation counter to reflect number of confirmed blood donations. (@hydroflame)
* Minor improvements to ram calculation process (@Snarling)
* Improved terminal arguments detection (@Snarling)
* Improved display for ls terminal command. (@Snarling)
* Added more internal tests and improved test quality (@d0sboots)
* Various codebase improvements (@Snarling, @d0sboots)
* Documentation improvements (Many contributors)
* Nerf noodle bar

SPOILER SECTIONS:

SF2:

* Corrected the "Next equipment unlock" text for member upgrades. (@LiamGeorge1999)

SF3:

* Many Corporation API changes, due to functionality changes and due to property name changes. See documentation for correct usage.
* Can now have multiple divisions within the same industry. (@Mughur)
* Can now sell a division or sell the entire corporation. (@Mughur)
* Product quality now depends on material quality (@Mughur)
* Product price can be set separately per-city (@Mughur)
* Exports can be set relative to inventory or production (@Mughur)
* ns.corporation.getProduct is city-specific (@Mughur)
* Bulk purchasing is available from the start (@Mughur)
* Can buy multiple upgrades at a time, similar to hacknet node upgrades (@Mughur)
* Various UI changes (@Mughur)
* Removed happiness from employees (@Mughur)
* Coffee renamed to tea (@Mughur)
* Training position renamed to intern (@Mughur)
* More options for SmartSupply (@Mughur)
* Advertising nerf (@Mughur)
* Nerfed investors and reduced effectiveness of "fraud" (@Mughur)
* Fixed React errors, renamed most corp object properties (@Snarling)
* Various other changes (@Mughur, @Snarling)

SF4:

* Faction invites trigger immediately when running ns.singularity.getFactionInvitations (@Snarling)
* Added ns.singularity.getCompanyPositionInfo (@jeek)

SF6:

* Failing a contract or operation now consumes the action (@Zelow79)

SF9:

* The SF9.3 bonus is also given to the player when inside of BN9. (@Zelow79)
* Adjusted the SF1 bonus for hacknet costs (slight nerf), and raised the SF9 bonus to compensate. (@d0sboots)
* Added option to purchase company favor using hashes. (@jeek)

SF10:

* Sleeve shock recovery now scales with intelligence. (@Tyasuh)
* Sleeve kills during crimes count towards numPeopleKilled (@Zelow79)
* Fix a misspelled moneySourceTracker call for sleeves (@zerbosh)
* ns.sleeve.getTask return value now includes cyclesNeeded where applicable (@Snarling)
* Internal type refactoring on Sleeve Work. (@Snarling)

SF12:

* Fix inconsistency in how BN12 multipliers were calculated

SF13:

* Improve performance of Stanek's gift update cycle, and rework (buff) bonus time handling. (@Snarling)
`,
};
