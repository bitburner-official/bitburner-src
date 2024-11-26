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
## v2.6.3 Dev: Last updated 15 August 2024

### MAJOR ADDITIONS

- BN options selection interface (@catloversg)
- Support JSX, TS, TSX script files (@catloversg)

### UI

- Tweak Hacknet summary (@catloversg)
- Only show relevant changes in "Purchased Augmentations" table (@catloversg)
- Fix: Correctly show remaining grafting/programming time left when cycles are skipped. (@tom.prince)
- Fix: Misleading favor numbers (@catloversg)
- Always show description of faction price multiplier (@catloversg)
- Add apostrophe to stanek's gift strings (@faenre)
- Notify players about documentation tab after getting SF1.1 (@catloversg)

### DOCUMENTATION

- Remove obsolete description of killall (@catloversg)
- Update description of source files (@catloversg)
- Add link to NS API documentation (@catloversg)
- Fix a typo in the hamming code problem statement (@jazzybones)
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
- Add scoring rules explanations to how to play page and score modal (@ficocelliguy)
- Fix wrong description of ns.singularity.applyToCompany (@catloversg)
- Fix errors and warnings shown by api-extractor (@catloversg)
- Remove wrong information in ns.weaken (@catloversg)

### MISC

- Fix: Wrong money source when traveling (@catloversg)
- Use ramOverride() to set compiled script RAM (@d0sboots)
- Provide type definitions for \`React\` and \`ReactDOM\` in in-game editor. (@tom.prince)
- Fix: "Router called before initialization" race (@d0sboots)
- Always include stack trace in Recovery Mode (@d0sboots)
- Don't spin forever if IDB can't be loaded (@d0sboots)
- Fix: Prevent runtime NotAllowedError on Safari (@robofinch)
- Enable strict typechecking of typescript, and several other typescript improvements in script editor (@tom.prince)
- Minor bugfix for minesweeper game: made rounding behavior for height, width and mine count consistent (@mmjr-x)
- Fix: Crash when accessing nonexistent files with file protocol in Electron app (@catloversg)
- Stop terminal scp from revealing and copying to unreachable servers (@yichizhng)
- Fix: Tab completion uses wrong command list (@catloversg)
- Fix: Prompt does not reset text value (@catloversg)
- Fix: Duplicated program in edge case (@catloversg)
- Improve rep calculation accuracy (@d0sboots)
- Fix: NaN Total Assets caused by bug in bulkPurchase API (@catloversg)
- Cancel infiltration when player is hospitalized (@catloversg)

### SPOILER CHANGES

- Change formula of Bladeburner skill cost (@catloversg)
- Fix: Wrong behavior of ns.bladeburner.getSkillUpgradeCost (@catloversg)
- Disable rumor of Bladeburners in BN8 (@catloversg)
- Fix: Stop current work when starting a program with Singularity (@TheAimMan)
- Fix: Cap Gang recruit member calculation (@TheAimMan)
- Fix: Allow upgrading bladeburner skill level over max safe integer (@catloversg)
- Fix: Wrong countdown of remaining time for Bladeburner action (@catloversg)
- Fix: Duplicated augmentation when buying after grafting (@catloversg)
- Fix: Wrong success range of Bladeburner general action (@catloversg)
- Add buyAmount and importAmount to Corporation Material API (@yichizhng)
- Add success chance of Bladeburner action to Sleeves UI (@catloversg)
- Allow filtering graftable augmentations (@catloversg)
- Fix: Wrong error message when failing to recruit gang member (@catloversg)

### CODEBASE/REFACTOR

- Update monaco-editor to 0.50.0 and work around a bug (@tom.prince, @catloversg)
- Sync UI updates to game updates. (@tom.prince)
- Use Autocomplete instead of Select in devmenu augmentation tool (@catloversg)
- Update caniuse-lite to latest version (@tom.prince)
- Remove redundant type of CONSTANTS (@catloversg)
- Add a type annotation to webpack configuration function. (@tom.prince)
- Remove testing code in ScriptTransformer (@catloversg)
- Use mathjax from npm, rather than vendored copy. Also fix mathjax path. (@tom.prince)
- Remove unused attributes of internal \`ScriptDeath\`. (@tom.prince)
- Add some more types to \`webpack.config.js\`. (@tom.prince)
- Refactor Person.ts and Sleeve.ts (@catloversg)
- Remove unnecessary dependency in Person class (@catloversg)
- Remove js-sha256 (@catloversg)
- Small change in devmenu augmentation tool (@catloversg)
- Update Electron to v29 (@catloversg)
- Update Node version in CI workflows (@catloversg)
`,
} as const;
