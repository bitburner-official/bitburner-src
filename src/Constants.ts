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
  NeuroFluxGovernorLevelMult: number;
  NumNetscriptPorts: number;
  MultipleAugMultiplier: number;
  TorRouterCost: number;
  HospitalCostPerHp: number;
  IntelligenceCrimeWeight: number;
  IntelligenceCrimeBaseExpGain: number;
  IntelligenceProgramBaseExpGain: number;
  IntelligenceGraftBaseExpGain: number;
  IntelligenceTerminalHackBaseExpGain: number;
  IntelligenceSingFnBaseExpGain: number;
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
  CodingContractBaseFactionRepGain: number;
  CodingContractBaseCompanyRepGain: number;
  CodingContractBaseMoneyGain: number;
  AugmentationGraftingCostMult: number;
  AugmentationGraftingTimeBase: number;
  SoACostMult: number;
  SoARepMult: number;
  EntropyEffect: number;
  Donations: number; // number of blood/plasma/palette donation the dev have verified., boosts NFG
  CompanyRequiredReputationMultiplier: number; // Only use this if a backdoor is installed in the company's server
  LatestUpdate: string;
} = {
  VersionString: "2.6.1dev",
  isDevBranch: true,
  VersionNumber: 38,

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
  IntelligenceTerminalHackBaseExpGain: 200, // Hacking exp divided by this to determine int exp gain
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

  Donations: 151,

  CompanyRequiredReputationMultiplier: 0.75,

  // Also update doc/source/changelog.rst
  LatestUpdate: `
## v2.6.1 dev - last updated 23 Apr 2024

See 2.6.0 changelog at https://github.com/bitburner-official/bitburner-src/blob/v2.6.0/src/Documentation/doc/changelog.md

### MAJOR CHANGES

- Exported savegames are now compressed. This means that savegames from 2.6.1dev will need to be manually converted before backloading into 2.6.0 (@catloversg)

### API

- (Corporation) Add a missing check on exportMaterial (@catloversg)
- (Corporation) Add ns.corporation.sellDivision (@catloversg)
- (Formulas) Add ns.formulas.hacking.growAmount (@d0sboots)
- (Go) Some changes to the Go API, including some minor breaking changes. Please refer to the API documentation in the script editor or at https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.go.md (@ficocelliguy)
- (Go) Fix a bug that allowed facing secret opponent early or with wrong board size (@ficoccelliguy)
- (Singularity) Added ns.singularity.getFactionEnemies function (@jaguardeer)
- (Sleeve) SleeveInfiltrationWork now has a nextCompletion promise (@Caldwell-74)
- Fixed an issue that caused ns.disableLog to work incorrectly for some functions (@ficocelliguy)

### UI

- (Corporation) More granular control of office size increases (@adeilt)
- (Gang) Fix inaccurate display of wanted reduction rate when performing "justice" tasks (@LJNeon)
- (Go) Fix an incorrect displayed max favor on Go history page (@ficocelliguy)
- Text files (.txt and .json) posted to the terminal from the ls command are now clickable (@catloversg)
- Fixed a display issue on the bitverse page (@LJNeon)
- Fixed a display issue on the stats page (@catloversg)

### MISC

- (Bladeburner) Internal code refactoring (@Snarling)
- (Corporation) Fix an issue that could cause incorrect average material prices via bulk purchases (@catloversg)
- (Go) "No AI" white player can now pass (@ficocelliguy)
- (Go) Reimplement superko rule, adjust save data (@ficocelliguy)
- (Go) Balance tweaks and other bugfixes (@ficocelliguy)
- (Hacknet) Fixed an issue in the engine loop that could cause offline earnings with hacknet to be inaccurate (@d0sboots)
- Update Credits page to show @d0sboots as an active maintainer (@Snarling)
- Miscellaneous documentation fixes (@adeilt, @User670, @catloversg, @gmcew, @jeek, @pontsuyo, @ficocelliguy, @d0sboots)
- Changed the name of an augmentation at the request of the original author (@hydroflame)
- Allow .json files (@shyguy1412)
- Remove jquery dependency (@catloversg)
- Disable text translation, which commonly causes crashes (@catloversg)
- Fix an incorrect unit in ns.spawn logs (@FoGsesipod)
- Servers that don't exist yet will not show up in autocomplete data (@catloversg)
- Add optional file for ignoring some specific commits with git blame (@adeilt)
- Remove some unnecessary data from save file (@Snarling)
- Remove an internal dependency and streamline code for downloading files (@catloversg)
- Remove some unused internal constants (@catloversg)
- Ensure lastNodeReset property is initialized correctly on the player object (@catloversg)
- The value of "this" within the main function will no longer be the script module itself (@d0sboots)
- Nerf noodle bar (various contributors)
`,
};
