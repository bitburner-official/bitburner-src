/**
 * Generic Game Constants
 *
 * Constants for specific mechanics or features will NOT be here.
 */
export const CONSTANTS = {
  VersionString: "2.8.1dev",
  isDevBranch: true,
  VersionNumber: 42,

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
  Donations: 179,

  // Only use this if a backdoor is installed in the company's server
  CompanyRequiredReputationMultiplier: 0.75,

  // Also update Documentation/doc/changelog.md when appropriate (when doing a release)
  LatestUpdate: `
## v2.8.1 Dev: Last updated 1 April 2025

### MAJOR CHANGES

### UI

- Increase width of each job in "Job" tab (#2017) (@catloversg)
- Fix: Cannot buy augmentations via UI when money is equal to cost (#2039) (@catloversg)
- Do not close scripts in editor when their servers are deleted (#2049) (@catloversg)
- Add button for exporting save file in recovery screen (#2060) (@catloversg)
- Show faction enemies even after joining (#2046) (@catloversg)

### MISC

- Correctly initialize board from save when there are no prior moves (#1995) (@ficocelliguy)
- Fix first-time Go initialization (#2012) (@d0sboots)
- Add support for getting the save file through the RFA (#2004) (@G4mingJon4s)
- ns.getServer("home").moneyAvailable returns player's money (#2024) (@NagaOuroboros)
- Fix: Game crashes when loading new save in edge cases (#2026) (@catloversg)
- Ensure that IPvGO promises are initialized correctly on a new save and on fluming (#2032) (@ficocelliguy)
- Ensure there is always at least one offline node (#2030) (@ficocelliguy)
- Fix: Player can manipulate internal state of coding contract (#2040) (@catloversg)
- Fix: Player can win more than casino's limit (#2042) (@catloversg)
- Add new analysis method to set a custom testing board state (#2029) (@ficocelliguy)
- IPvGO: Improve type checking and documentation (#2028) (@ficocelliguy)
- Restarting the tutorial doesn't soft reset your game (#1992) (@paulcdejean)
- Fix exploit where favor limit from IPvGO was removed on augmentation (#2050) (@ficocelliguy)
- Add support for highlighting nodes and adding small text (#1996) (@ficocelliguy)

### DOCUMENTATION

- Update TSDoc of ns.purchaseServer and CodingContract types (#2023) (@catloversg)
- IPvGO: Clarify how favor is gained from wins (#2051) (@ficocelliguy)
- Clarify AutocompleteData.server and ns.formatNumber (#2062) (@catloversg)

### SPOILER CHANGES - UI

- Make SF description in Augmentations tab and BitVerse always be the same (#2013) (@catloversg)
- Make BN-hint popups harder to be dismissed accidentally (#2021) (@catloversg)
- Warn player if they enable territory clash when gang power is too low (#2061) (@catloversg)

### SPOILER CHANGES - MISC

- Warn player that they cannot accept Stanek's Gift after joining Bladeburner with SF7.3 (#2005) (@catloversg)
- Disable effect of SF7.3 and SF10 if player disables them with advanced options (#2019) (@catloversg)
- Add ns.singularity.cat (#1999) (@NagaOuroboros)

### SPOILER CHANGES - DOCUMENTATION
- Clarify effect of Bladeburner augmentation and Stanek's Gift fragment (#2058) (@catloversg)
- Clarify conditions of activating Gang, Bladeburner, Stanek's Gift (#2053) (@catloversg)
- Clarify Market-TA1, Market-TA2, MaxSalesVolume (#2014) (@catloversg)

### CODEBASE/REFACTOR

- Suppress false-positive console errors caused by RamCalculation.test.ts (#2002) (@catloversg)
- Fix React warnings in BitVerse (#2020) (@catloversg)
- "getCornerMove" coordinates corrected (#2027) (@wasniahC)
- CI: Pin commit id of tj-actions/changed-files (#2031) (@catloversg)
- Add mathjax-full and csstype as direct dependencies (#2037) (@ficocelliguy)
`,
} as const;
