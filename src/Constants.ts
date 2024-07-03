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
  VersionString: "2.6.2",
  isDevBranch: false,
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

  Donations: 151,

  CompanyRequiredReputationMultiplier: 0.75,

  // Also update doc/source/changelog.rst
  LatestUpdate: `
## v2.6.2 Release: 3 July 2024

### CHANGES

- Hotfix (also backported to 2.6.1): Fixed an issue with invalid format on steam cloud save (@catloversg)
- Augmentations: Augmentations that affect starting money now add money instead of replacing it (@jjclark1982)
- API: ns.spawn can now be used with 0 delay for a synchronous effect (@d0sboots)
- API: Added the ns.ramOverride function, which allows altering the ram usage of a script at runtime (@d0sboots)
- Coding Contracts: Improved the performance of the All Valid Math Expressions contract checker (@yichizhng)
- Coding Contracts: Simplified the Shortest Path contract checker (@gmcew)
- Documentation: Various improvements (@mrsimo, @catloversg, @ficocelliguy, @gmcew, @otac0n)
- Electron: Game can now load correctly when the path includes symbolic links (@catloversg)
- Faction: Fixed some edge cases around Favor overflow (@catloversg)
- Faction: All available invites are sent at once (@catloversg)
- Faction UI: show which skills are relevant for each type of Faction work (@gmcew)
- Font: Embedded the JetBrains Mono font as "JetBrainsMono" (@catloversg)
- Go: Can now play manually as white against your own scripts (@ficocelliguy)
- Go: Save a full game history to prevent repeat moves (@ficocelliguy)
- Go: Support offline time / bonus cycles to allow less time between AI moved (@ficocelliguy)
- Hacking: Clamp hack success chance to prevent issues with infinity (@Caldwell-74)
- Hacknet: Fix an issue that caused inaccurate level base cost (@JamesWilcox-git)
- Hacknet: UI improvements (@jjclark1982)
- Hospital: Can now be hospitalized even when busy performing a work task (@catloversg)
- Infiltration: Automating infiltration is now more difficult (@catloversg)
- Infiltration: Wire game shows wire colors on wires (@muesli4brekkies)
- Misc: Changed how negative changes in system time are handled (@catloversg)
- Programs UI: Now displays time remaining (@TheAimMan)
- Servers: Existing servers can now have more than 1 core (@TheAimMan)
- Scripts: Relative imports can now be used (@Caldwell-74)
- Script Editor: Improved detection of possible infinite loops (@G4mingJon4s)
- Script Editor: Cursor location is remembered when switching tabs or game pages (@catloversg)
- Script Editor: Improvements to vim mode (@G4mingJon4s)
- Script Editor: Individual script tabs can be in separate editor modes (@G4mingJon4s)
- Skills: Fix an inconsistency in experience needed to level a skill from 1 to 2 (@catloversg)
- Terminal: Add more options to the rm command (@G4mingJon4s, @d0sboots)
- Terminal: Added grep command (@muesli4brekkies)
- Terminal: Improved autocompletion for mixed case strings (@yichizhng)
- Codebase: Partial migration away from outdated mui/styles (@Caldwell-74)
- Codebase: Cleanup / refactoring (@catloversg, @Caldwell-74, @Snarling, @ficocelliguy, @tomprince)

### SPOILER CHANGES

- Bladeburner: Added a button to stop the current action (@Kelenius, @catloversg)
- Bladeburner: Improved logging of information in the Bladeburner console (@Kelenius, @catloversg)
- Bladeburner: Black Operations show in the expected order again (@catloversg)
- Bitnode 5: Show bitnode multipliers while in BN5.1 (@catloversg)
- Bitverse: Spawned scripts will no longer launch from the bitverse screen (@catloversg)
- Corporation: Refactor markup multiplier (@catloversg)
- Corporation: Allow mass discarding products by selling for 0 (@gmcew)
- Corporation: Allow access to constants even when API access is not available (@ilkecan)
- Gang: Show equipment even when it cannot be purchased yet (@catloversg)
- Gang: Fix an issue with wanted gain rate (@catloversg)
- Gang: Show effective gain rates when bonus time in effect (@G4mingJon4s)
- Grafting: Fixed a spacing issue (@Sphyxis)
- Grafting: Fixed an issue that could cause hacknet node production to be inaccurrate when combined with Grafting (@catloversg)
- Grafting: Fixed an issue that could cause inaccurate HP after Grafting (@catloversg)
- Grafting: Added ns.grafting.waitForOngoingGrafting (@catloversg)
- Intelligence: Changed scaling for intelligence gain from manual hacking (@catloversg)
- Sleeve: Sleeve travel can no longer be performed if the player has insufficient funds (@gmcew)
- Sleeve: It's no longer possible to install an unavailable augmentation on a sleeve (@yichizhng)
- Sleeve: No longer show a dialog message if a sleeve is working at a job while quitting that company (@Kelenius)
- Sleeve: ns.sleeve.setToBladeburnerAction works again for setting sleeves to Bladeburner contract work (@Sphyxis)
- Singularity: Add ns.singularity.getFactionWorkTypes (@catloversg)
- Singularity: Fix an edge case issue with ns.singularity.getAugmentationFactions (@catloversg)

### OTHER
- Nerf noodle bar
`,
};
