/**
 * Generic Game Constants
 *
 * Constants for specific mechanics or features will NOT be here.
 */
export const CONSTANTS = {
  VersionString: "2.7.1dev",
  isDevBranch: true,
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
## v2.7.1 dev branch: Last updated 3 February 2025

### MAJOR CHANGES

- Grant Bladeburner API access to SF6 and "Blade's Simulacrum" augmentation to SF7.3 (@Sphyxis)
- Move tail-related APIs to ns.ui namespace (@catloversg)
- Support scripts playing against each other on "No AI" board (@ficocelliguy)

### UI

- Fix: Company name in Job tab is not updated when switching companies in edge cases (@Nerdpie)
- Make minor changes in buttons and error messages of tutorial (@catloversg)
- Infiltration remembers faction choice for reputation reward (@catloversg)
- Add filter tool to list of installed augmentations (@catloversg)
- Disable buttons when player cannot buy things in tech vendor (@catloversg)
- Show warning message for deprecated API Server feature (@catloversg)
- Change "overclock" to "Boosted by bonus time" in Sleeves tab (@catloversg)
- Hide spoiler content in Soft Reset popup (@catloversg)
- Change how hacking level requirement is shown in "Create program" tab (@catloversg)
- Fix: "Import Save Comparison" popup is shown after reloading (@catloversg)
- Fix: Editor shows "+1 overload" with all NS APIs (@catloversg)
- Fix: Editor becomes laggy and autocomplete may not work when player has too many scripts (@catloversg)
- Fix: Edited code disappears in editor after switching tab (@catloversg)
- Fix: Editor shows error popup when opening scripts on "." server (@catloversg)
- Add UI to share RAM to boost reputation gain (@catloversg)
- Fix: Sleeves UI shows and sets wrong task (@catloversg)
- Add Grafting tab to sidebar (@catloversg)
- Improve UX of Remote API setting page (@catloversg)
- Add reward info to intro page of infiltration (@catloversg)
- Fix: Wrong plural form in modal of coding contract (@catloversg)
- Show all jobs instead of only one in Job tab (@catloversg)

### MISC

- Fix: Tail log does not render multiline logs properly in edge cases (@catloversg)
- Fix: Game takes too long to process crime work with large number of cycles (@catloversg)
- API: Add "No AI" to GoOpponent type (@catloversg)
- Add raw command string to autocomplete data (@catloversg)
- Show user-friendly error message when running empty script (@catloversg)
- Fix: ns.weaken reports wrong result when server security is near min value (@nanogyth)
- Use same multiplier to calculate server's reduced money for all hacking methods (NS APIs and manual hack via UI) (@catloversg)
- Add ns.ui.setTailFontSize API to change tail font size (@G4mingJon4s)
- Fix: Running TypeScript scripts are not automatically started when game reloads (@catloversg)
- Clarify messages related to "buy" command (@catloversg)
- Remove RAM usage percentage in "free" CLI if it's NaN (@catloversg)
- Add more error info to error dialog and tail log (@catloversg)
- Fix: Grow log shows invalid values in edge cases (@catloversg)
- Log script kill immediately and identify the guilty script (@yichizhng)
- Add source map to transformed scripts (@catloversg)
- Fix: Static RAM calculator cannot process abstract methods (@catloversg)
- Include all executable types in error message of "run" command (@PerpetuaLux)
- Add ns.ui.renderTail API (@catloversg)
- Improve typing of coding contract API (@G4mingJon4s)
- Add ns.enums.FactionName API (@catloversg)
- Fix: Typo in API break notice of v2.6.1 (@catloversg)
- Clarify "Disable ASCII art" setting (@catloversg)
- Clarify availability of "buy" command (@catloversg)
- Allow using wss for RFA (@catloversg)

### DOCUMENTATION

- Fix typo in "Getting Started" page (@catloversg)
- Improve Infiltration docs (@catloversg)
- Clarify input and output of Square Root coding contract (@catloversg)
- Fix typo of CrimeStats (@catloversg)
- Add starter React documentation (@danielpza)
- Clarify return value of ns.getPurchasedServerCost and ns.getPurchasedServerUpgradeCost when input is invalid (@NagaOuroboros)
- Fix migration doc typo (@esainane)
- Clarify ns.exit (@Mathekatze)
- Make nuke and port opening functions return boolean (@catloversg)
- Document shorts in terms of actual finance terms (@d0sboots)
- Replace outdated links for v2 migration guide and changelog (@catloversg)

### SPOILER CHANGES - UI

- Add visual cues to warn player of dangerous actions and status of population, chaos (@catloversg)
- Allow empty string in amount and price fields in sell modals before confirming (@catloversg)
- Show production multiplier of product in research popup (@catloversg)
- Show operation description in tooltip of completed BlackOps (@catloversg)

### SPOILER CHANGES - MISC

- Allow passing 0 SkillPoints to ns.formulas.bladeburner.skillMaxUpgradeCount (@catloversg)
- Change description and add tooltip for HackMoney-related multipliers (@catloversg)
- Clarify "Company Favor" hash upgrade (@catloversg)
- Increase number of displayed digits for "Base Size Modifier" of Stanek's Gift (@catloversg)
- Remove mention of passive reputation gain when player is in BN2 (@catloversg)
- Fix: Wrong warning of sellAmt being negative (@catloversg)
- Add ns.singularity.getSaveData API (@catloversg)
- Reword description of "Operation Tyrell" and "Operation Wallace" BlackOps (@Hihahahalol)
- Standardize behavior of "connect" command and ns.singularity.connect API (@catloversg)
- Decrease interval of check for faction invitation (@TheAimMan)
- Change multiplier of defense level in BN14 (@ficocelliguy)
- Fix: Sleeve takes on contracts without checking availability (@catloversg)

### SPOILER CHANGES - DOCUMENTATION

- Clarify isBusy and stopAction Singularity APIs (@catloversg)
- Clarify ns.grafting.getGraftableAugmentations API (@catloversg)
- Clarify type of returned value of ns.gang.getOtherGangInformation (@catloversg)
- Clarify description of BN2 about gang and The Red Pill (@catloversg)
- Clarify returned value of ns.bladeburner.getActionCountRemaining (@catloversg)
- Fix incorrectly documented BusinessFactor (@esainane)
- Fix typo in proof of boost material optimizer (@catloversg)

### CODEBASE/REFACTOR

- Fix: React warning of missing keys in CovenantPurchasesRoot.tsx (@catloversg)
- Fix: Flaky stock market test (@catloversg)
- Convert Literature entries and helper functions to TSX (@NagaOuroboros)
- Update webpack and its plugins (@catloversg)
- Dockerize Bitburner (@romaswe)
- Change signature of interpolate function in Infiltration code (@catloversg)
- Validate theme, editor theme, and styles (@catloversg)
- Fix React warning when using StatsTable (@catloversg)
- Remove unused type of parameter of Favor component (@catloversg)
- Merge TypeAssertion files (@catloversg)
- Refactor ns.singularity.purchaseAugmentation (@catloversg)
- Refactor Player.applyForJob (@catloversg)
`,
} as const;
