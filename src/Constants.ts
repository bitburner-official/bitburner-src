/**
 * Generic Game Constants
 *
 * Constants for specific mechanics or features will NOT be here.
 */
export const CONSTANTS = {
  VersionString: "3.0.1Dev",
  isDevBranch: true,
  isInTestEnvironment: globalThis.process?.env?.JEST_WORKER_ID !== undefined,
  VersionNumber: 50,

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
  // If we change this constant, we must update the "RepDonation" value in src/Documentation/data/MathNotation.json
  DonateMoneyToRepDivisor: 1e6,

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
  IntelligenceCrimeBaseExpGain: 0.05,
  IntelligenceProgramBaseExpGain: 0.1, // Program required hack level divided by this to determine int exp gain
  IntelligenceGraftBaseExpGain: 0.05,
  IntelligenceSingFnBaseExpGain: 1.5,

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

  MillisecondsPerTenMinutes: 600000,

  MillisecondsPerFiveMinutes: 300000,
  GameCyclesPerFiveMinutes: 300000 / 200,

  // Player Work & Action
  BaseFocusBonus: 0.8,

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

  // Number of blood, plasma, or platelet donations the developer has verified. Boosts NFG.
  Donations: 262,

  // Only use this if a backdoor is installed in the company's server
  CompanyRequiredReputationMultiplier: 0.75,

  // Also update Documentation/doc/en/changelog.md when appropriate (when doing a release)
  LatestUpdate: `
## v3.0.1 Dev: 16 May 2026

### BREAKING CHANGES

- Change getServer return type; rename getServerAuthDetails and add missing dnet properties (#2746) (@ficocelliguy)

### MISC

- Cache reward fixes (#2731) (@ficocelliguy)
- Fix typo in darknet authentication response message (#2734) (@catloversg)
- Fix: Tutorial links to outdated faq url (#2733) (@catloversg)
- Fix: Player can switch tabs without losing focus on current work (#2724) (@catloversg)
- Add new command to upload a directory (#2659) (@hexagonrecursion)
- Add HJKL key mappings for infiltration arrows (#2742) (@mahlquistj)
- Prevent generating malformed darknet server hostname (#2744) (@catloversg)
- Support angle bracket type assertions in RAM calculation (#2751) (@catloversg)
- Fix typo in augmentation description (#2760) (@gmcew)
- Reduce the RAM cost of ns.rm() to match ns.scp() (#2761) (@NagaOuroboros)
- Temporarily remove darknet servers with unusual hostnames (#2757) (@catloversg)
- Fix: Duplicate .lit and .cache files can be generated in dnet (#2763) (@catloversg)
- Allow getFunctionRamCost to get base RAM cost for scripts (#2771) (@Mathekatze)

### DOCUMENTATION

- Remove TS type annotation from doc example script (#2721) (@ficocelliguy)
- Update list of RFA community tools (#2722) (@CTNOriginals)
- Fix incorrect cloud API example (#2738) (@catloversg)
- Remove non-existent influence namespace in Darknet documentation (#2748) (@Berdes)
- Remove spoiler for Offline scripts and bonus time page and make it accessible early-game (#2749) (@Berdes)
- Clarify ns.scp and ns.isRunning (#2769) (@catloversg)

### SPOILER CHANGES - UI

- Show hints of Gang mechanic in pre-endgame (#2723) (@catloversg)
- Break out Darknet BN and player mults as separate entries (#2745) (@gmcew)

### SPOILER CHANGES - MISC

- Cancel faction work instead of finishing it when creating gang (#2726) (@catloversg)
- Lower darknet BN money mults on hard nodes (#2743) (@ficocelliguy)
- Change getDarkwebPrograms return type to ProgramName[] (#2754) (@catloversg)
- Fix: getAugmentationBasePrice ignores bitnode mult for SoA augs (#2756) (@SAY-5)
- Rebalance hash base cost of generating coding contract (#2759) (@gmcew)
- Ensure induceServerMigration moves servers randomly (#2767) (@catloversg)
- Do not decrease player reputation when failing bladeburner actions (#2768) (@catloversg)

### CODEBASE/REFACTOR/WORKFLOW/JEST/TOOL/DEPS

- Update action versions (#2718) (@Snarling)
- Remove duplicate getStockFromSymbol function (#2725) (@catloversg)
- Update game version (#2732) (@catloversg)
- Harden saving to avoid save data corruption (#2755) (@catloversg)
`,
} as const;
