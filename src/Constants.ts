/**
 * Generic Game Constants
 *
 * Constants for specific mechanics or features will NOT be here.
 */
export const CONSTANTS = {
  VersionString: "2.7.0",
  isDevBranch: false,
  VersionNumber: 41,

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
## v2.7.0: 8 December 2024

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
- Remove extra "label=" text from SmartSupply interface (@gmcew)
- Show more information about documentation in last step of tutorial (@catloversg)
- Change description of Documentation button in Script Editor (@catloversg)
- Fix: Wrong size of table cell in Import Save Comparison UI (@catloversg)
- Remove hacknet servers from hash upgrade server dropdowns (@yichizhng)
- Fix: Import paths cannot be resolved in script editor (@lucebac)
- Fix: Missing tooltip when doing faction work (@catloversg)
- Remove unnecessary newlines when augmentation does not have stats (@catloversg)
- Disable font ligatures by default (@catloversg)
- Fix: Crash in theme editor modal (@catloversg)
- Add the ability to change the font size (@G4mingJon4s)
- Change order of information in stats progress bar (@catloversg)
- Auto focus hashnet upgrade modal (@catloversg)
- Show error popup when there are errors instead of only writing to console (@catloversg)

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
- Make small tweaks in TSDoc of Corporation APIs (@catloversg)
- Add types for parameters of gym-university-bladeburner API (@catloversg)
- Correct function signature for hashUpgradeCost (@faenre)
- Fix wrong description of ns.corporation.createCorporation (@catloversg)
- Clarify experience gain of sleeves (@bupjae)
- Make small changes (capitalization) in index page of documentation (@catloversg)
- Improve ns.enableLog docs (@Fireball5939)
- Update description of multipliers in BitNodeMultipliers in NetscriptDefinitions.d.ts (@nobody0)
- Fix mangled NS API TSDoc (@catloversg)
- Fix incorrect description of "HammingCodes: Integer to Encoded Binary" contract (@zorbathut)
- Clarify condition of ns.corporation.bribe (@catloversg)
- Clarify "completion" property of GraftingTask (@catloversg)
- Clarify cyclesWorked of Task (@catloversg)
- Clarify ns.hackAnalyzeThreads (@JMack6490)
- Clarify ns.bladeburner.getSkillUpgradeCost and fix typo in BaseTask (@catloversg)
- Fix typo in Corporation documentation (@catloversg)
- Add more information for deprecated nFormat API (@catloversg)
- Clarify FactionWorkRepGain multiplier (@catloversg)

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
- Fix: Block hacking-related actions on player-owned servers (@catloversg)
- Rework disableLog for efficiency (@d0sboots)
- Improve several things relating to PID lookups (@d0sboots)
- Fix: ns.singularity.donateToFaction being able to donate to SoA (@Fireball5939)
- Throw error when player passes invalid hostname to some APIs (grow, weaken, singularity.installBackdoor) (@catloversg)
- Fix: upgradePurchasedServer API prints wrong error message (@Nolshine)
- Reduced RAM cost for ns.getPurchasedServers (@faenre)
- Fix: Autocomplete shows error popup in some cases (missing error handler when calling libarg) (@catloversg)
- Reduce cost of static information NS APIs to 0 (@faenre)
- Add ns.self() as a free info function (@G4mingJon4s)
- Change generation rate of CCTs for offline bonus (@catloversg)
- Add new Square Root coding contract (@d0sboots)
- Remove mention of Hacking Mission (@catloversg)
- Fix: Scripts are killed too late when prestiging (@catloversg)
- Fix: Typos in description of augmentations (@egg362)
- Fix: Typo in field work description (@Pimvgd)
- Fix: Fix dynamicRamUsage returned by getRunningScript() (@d0sboots)
- Add warning when installing backdoor on backdoored server (@catloversg)
- Expose more information of HiveMind augmentation (@catloversg)
- Improve tutorial, documentation and discoverability of NS API documentation (@catloversg)
- Improve exception alert (@catloversg)
- Improve built-in print APIs when printing Promise objects (@catloversg)
- Improve built-in print APIs when printing objects containing Map or Set (@catloversg)
- Validate hostname and port of RFA (@catloversg)
- Update blood donation (@hydroflame, @catloversg)
- Include React component stack in Recovery Mode report (@catloversg)
- Always add script's earnings to its parent (@catloversg)
- nano and vim use wrong template for text files (@catloversg)
- Add error cause to exception alert and Recovery mode UI (@catloversg)
- Fix ramOverride check (@jonhartnett)
- Accept "noscript" as parameter for skipping loading scripts (@catloversg)
- Fix: Multiple issues with migrating older savegames (@catloversg)

### SPOILER CHANGES

- Change formula of Bladeburner skill cost (@catloversg)
- Fix: Wrong behavior of ns.bladeburner.getSkillUpgradeCost (@catloversg)
- Disable rumor of Bladeburners in BN8 (@catloversg)
- Fix: Stop current work when starting a program with Singularity (@TheAimMan)
- Fix: Cap Gang recruit member calculation (@TheAimMan)
- Fix: Allow upgrading Bladeburner skill level over max safe integer (@catloversg)
- Fix: Wrong countdown of remaining time for Bladeburner action (@catloversg)
- Fix: Duplicated augmentation when buying after grafting (@catloversg)
- Fix: Wrong success range of Bladeburner general action (@catloversg)
- Add buyAmount and importAmount to Corporation Material API (@yichizhng)
- Add success chance of Bladeburner action to Sleeves UI (@catloversg)
- Allow filtering graftable augmentations (@catloversg)
- Fix: Wrong error message when failing to recruit gang member (@catloversg)
- Add API to calculate max upgrade count of Bladeburner skill (@catloversg)
- Fix: Bladeburner city chaos reaching Infinity/NaN (@faenre)
- Use indirect eval for terminal expr and corporation sell prices/amounts (@yichizhng)
- Fix: Wrong skill multipliers in Bladeburner (@catloversg)
- Fix: Crash in b1tflum3 and destroyW0r1dD43m0n API (@catloversg)
- Bladeburner: Est. pop improvement actions always improve est. pop by at least 1 (@faenre)
- Fix: Typo in description of Stanek's Gift (@Tahvohck)
- Prevent issues caused by resetting the board while the go AI is in flight (@ficocelliguy)
- Bladeburner: Use "grow" semantics for population estimate (@d0sboots)
- Fix: Wrong team size when all team members die in Bladeburner's action (@catloversg)
- Fix: Wrong parameter requirement of ns.bladeburner.setTeamSize (@catloversg)
- Make condition of ns.singularity.donateToFaction consistent (@catloversg)
- Fix: Wrong calculation in team casualties of Bladeburner action (@catloversg)
- Bladeburner UI shows tooltips on action success chance to indicate which stat it scales with (@Alpheus)
- Improve discoverability of Corporation documentation (@catloversg)
- Change type of skill name parameter of ns.formulas.bladeburner.skillMaxUpgradeCount API (@catloversg)
- Uncheck the 'show prior move' feature when a new Go game is started (@ficocelliguy)
- Add optional board state argument to the go analysis functions (@ficocelliguy)
- Add ns.go.cheat.getCheatCount (@ballardrog)
- Fix: Typo in Covenant's shop (@catloversg)
- Disable "+1" button when Bladeburner skill level reaches max safe integer and refactor some checks (@catloversg)
- Show confirmation popup if player enables territory clashes while being too weak (@catloversg)
- Expose valuation via ns.corporation.getCorporation (@catloversg)
- Return active SF levels in ns.singularity.getOwnedSourceFiles and ResetInfo.ownedSF (@catloversg)
- Fix: Negative stored material in Corporation (@catloversg)
- Remove WD from Hashnet server list if TRP not installed (@gmcew)
- Deduct karma when successfully completing action involving killing (@catloversg)
- Fix: Hashserver UI shows wrong server list when purchasing upgrades (@catloversg)
- Fix wrong initial productionMult of new division (@catloversg)

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
- Increase minimum Node version (@catloversg)
- Rename getRandomArbitrary (@catloversg)
- Expose internal data in dev build (@catloversg)
- Don't make dynamicLoadedFns entries for free functions (@yichizhng)
- Use Autocomplete instead of Select in more devmenu tools (@catloversg)
- Reduce number of random tests for testing calculateMaxUpgradeCount (@cmfrydos)
- Improve performance of Jest tests by removing barrels (@cmfrydos)
- Refactor Bladeburner Identifier Lookup (@Alpheus)
- Refactor coding contracts for type safety (@d0sboots)
- Update version of babel-plugin-transform-barrels (@cmfrydos)
- Move Bladeburner team losses to Casualties (@Alpheus)
- Add tests to cover Bladeburner console commands (@Alpheus)
- Remove google analytics config (@shyguy1412)
- Add stopFlag check before running main (@Caldwell-74)
- Update ScriptDeath to extend Error (@alainbryden)
- Add tests to cover Bladeburner action completion (@Alpheus)
- Reset other gangs when leaving gang by using devmenu (@catloversg)
- Fix lint errors (@catloversg, @ficocelliguy)
- Remove duplicate getRecruitmentSuccessChance in Bladeburner code (@catloversg)
- Change sleeveSize from property to getter (@catloversg)
- Minor code change in SkillElem.tsx (@catloversg)
- Add generic type as returned type for action and checking (@catloversg)
- Add proper type check to AST walking code (@catloversg)
- Update monaco-editor to 0.52.0 (using this version fixes "loadForeignModule" error) (@catloversg)
- Rewrite validation code for strings of price and quantity (@catloversg)
- Add comments to Generic_fromJSON (@catloversg)
- Better casting in JSONReviver.ts (@d0sboots)
- Remove duplicate usages of special server's hostname (@catloversg)
- Recheck all usages of typecasting with JSON.parse (@catloversg)
- Fix: Missing migration code for v0.56.0 (@catloversg)
- Fix: Wrong usage of delete operator in Settings.load (@catloversg)
- Mitigate cyclic dependency between Jsonable classes (@catloversg)
- Fix: Generic Reviver does not handle Message class (@catloversg)
- Add tests for b1tflum3 and destroyW0r1dD43m0n API (@catloversg)
- Multiple large refactors to savegame loading for better validation and safety (@catloversg)
`,
} as const;
