/**
 * Generic Game Constants
 *
 * Constants for specific mechanics or features will NOT be here.
 */
export const CONSTANTS = {
  VersionString: "2.6.3dev",
  isDevBranch: true,
  VersionNumber: 40,

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
  Donations: 151,

  // Only use this if a backdoor is installed in the company's server
  CompanyRequiredReputationMultiplier: 0.75,

  // Also update Documentation/doc/changelog.md when appropriate (when doing a release)
  LatestUpdate: `
## v2.6.3 Dev: Last updated 15 August 2024

### MAJOR ADDITIONS

- BN options selection interface (@catloversg)
- Support JSX, TS, TSX script files (@catloversg)

### UI

- Tweak Hacknet summary (@catloversg)
- Only show relevant changes in "Purchased Augmentations" table (@catloversg)
- Correctly show remaining grafting/programming time left when cycles are skipped. (@tom.prince)
- Update monaco-editor to 0.50.0 and work around a bug (@tom.prince, @catloversg)
- Fix misleading favor numbers (@catloversg)
- Sync UI updates to game updates. (@tom.prince)
- Always show description of faction price multiplier (@catloversg)
- Add apostrophe to stanek's gift strings (@nicole)
- Use Autocomplete instead of Select in augmentation tool (@catloversg)
- Notify players about documentation tab after getting SF1.1 (@catloversg)

### DOCUMENTATION

- Remove obsolete description of killall (@catloversg)
- Update description of source files (@catloversg)
- Add link to NS API documentation (@catloversg)
- fix a typo in the hamming code problem statement (@jazzybones)
- Fix broken link in README.md (@ngcthao)
- Remove "&nbsp;"s from .getDescription() result (@gmcew)
- Typo in ns2 migration doc (@mctylr-gh)
- Remove unmaintained VS Code extension from docs (@catloversg)
- Fix link to non-existing page (@BaxoPlenty)
- Add help text for changelog command (@catloversg)
- Clarify deprecation warning of ns.getTimeSinceLastAug() (@catloversg)
- Fix typos in NetscriptDefinitions.d.ts (@catloversg)
- Add GoAnalysis and GoCheat doc namespaces (@catloversg)
- Hamming Code parity sentence clarification, "Find All Valid Math Expressions" missing line breaks added, example formatting made consistent (@gmcew)
- Outdated formula of favor in tooltip (@catloversg)
- add scoring rules explanations to how to play page and score modal (@ficocelliguy)
- Fix wrong description of ns.singularity.applyToCompany (@catloversg)
- Fix errors and warnings shown by api-extractor (@catloversg)
- Remove wrong information in ns.weaken (@catloversg)

### MISC

- Fix wrong money source when traveling (@catloversg)
- Update caniuse-lite to latest version (@tom.prince)
- Use ramOverride() to set compiled script RAM (@d0sboots)
- Remove redundant type of CONSTANTS (@catloversg)
- Add threshold for warning about system clock (@catloversg)
- Provide type definitions for \`React\` and \`ReactDOM\` in in-game editor. (@tom.prince)
- Fix "Router called before initialization" race (@d0sboots)
- Always include stack trace in Recovery Mode (@d0sboots)
- Add a type annotation to webpack configuration function. (@tom.prince)
- Remove testing code in ScriptTransformer (@catloversg)
- Use mathjax from npm, rather than vendored copy. Also fix mathjax path. (@tom.prince)
- Don't spin forever if IDB can't be loaded (@d0sboots)
- Prevent runtime NotAllowedError on Safari (@robofinch)
- Remove unsed attribues of internal \`ScriptDeath\`. (@tom.prince)
- Enable strict typechecking of typescript, and several other typescript improvements (@tom.prince)
- Add some more types to \`webpack.config.js\`. (@tom.prince)
- Minesweepergame minor bugfix, made rounding behavior for height, width and mine count consistent (@mmjr-x)
- Refactor Person.ts and Sleeve.ts (@catloversg)
- Fix crash when accessing nonexist files with file protocol (@catloversg)
- Stop terminal scp from revealing and copying to unreachable servers (@yichizhng)
- Tab completion uses wrong command list (@catloversg)
- Fix: prompt does not reset text value (@catloversg)
- Remove unnecessary dependency in Person class (@catloversg)
- Remove js-sha256 (@catloversg)
- Duplicated program in edge case (@catloversg)
- Small change in devmenu augmentation tool (@catloversg)
- Update Electron to v29 (@catloversg)
- Improve rep calculation accuracy (@d0sboots)
- CORPORATION: Fix NaN Total Assets caused by bug in bulkPurchase API (#1573) (@catloversg)
- Cancel infiltration when player is hospitalized (@catloversg)
- Update Node version (@catloversg)

### SPOILER CHANGES

- Change formula of bladeburner skill cost (@catloversg)
- Fix wrong behavior of ns.bladeburner.getSkillUpgradeCost (@catloversg)
- Disable rumor of Bladeburners in BN8 (@catloversg)
- Stop current work when starting a program with Singularity (@TheAimMan)
- Cap Gang recruit member calculation (@TheAimMan)
- Allow upgrading bladeburner skill level over max safe integer (@catloversg)
- Wrong countdown of remaining time for Bladeburner action (@catloversg)
- Duplicated augmentation when buying after grafting (@catloversg)
- Wrong success range of Bladeburner general action (@catloversg)
- Add buyAmount and importAmount to Corporation Material API (@yichizhng)
- Add success chance of Bladeburner action to Sleeves UI (@catloversg)
- Allow filtering graftable augmentations (@catloversg)
- Wrong error message when failing to recruit gang member (@catloversg)
`,
} as const;
