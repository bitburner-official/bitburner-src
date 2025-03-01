/**
 * Generic Game Constants
 *
 * Constants for specific mechanics or features will NOT be here.
 */
export const CONSTANTS = {
  VersionString: "2.8.0dev",
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
## v2.8.0 dev branch: Last updated 01 March 2025

### MAJOR CHANGES

- Grant Bladeburner API access to SF6 and "Blade's Simulacrum" augmentation to SF7.3 (#1926) (@Sphyxis)
- Move tail-related APIs to ns.ui namespace (#1935) (@catloversg)
- Support scripts playing against each other on "No AI" board (#1917) (@ficocelliguy)
- Add key binding feature (#1830) (@catloversg)

### UI

- Fix: Company name in Job tab is not updated when switching companies in edge cases (#1828) (@Nerdpie)
- Make minor changes in buttons and error messages of tutorial (#1837) (@catloversg)
- Infiltration remembers faction choice for reputation reward (#1860) (@catloversg)
- Add filter tool to list of installed augmentations (#1833) (@catloversg)
- Disable buttons when player cannot buy things in tech vendor (#1881) (@catloversg)
- Show warning message for deprecated API Server feature (#1903) (@catloversg)
- Change "overclock" to "Boosted by bonus time" in Sleeves tab (#1901) (@catloversg)
- Hide spoiler content in Soft Reset popup (#1898) (@catloversg)
- Change how hacking level requirement is shown in "Create program" tab (#1900) (@catloversg)
- Fix: "Import Save Comparison" popup is shown after reloading (#1659) (@catloversg)
- Fix: Editor shows "+1 overload" with all NS APIs (#1883) (@catloversg)
- Fix multiple problems with editor (#1893) (@catloversg)
  - Editor becomes laggy and autocomplete may not work when player has too many scripts
  - Edited code disappears in editor after switching tab
  - Editor shows error popup when opening scripts on "." server
- Add UI to share RAM to boost reputation gain (#1862) (@catloversg)
- Fix: Sleeves UI shows and sets wrong task (#1807) (@catloversg)
- Add Grafting tab to sidebar (#1809) (@catloversg)
- Improve UX of Remote API setting page (#1870) (@catloversg)
- Add reward info to intro page of infiltration (#1835) (@catloversg)
- Fix: Wrong plural form in modal of coding contract (#1939) (@catloversg)
- Show all jobs instead of only one in Job tab (#1945) (@catloversg)
- Fix: Cursor position in editor is moved undesirably in edge cases (#1952) (@catloversg)
- Show Save ID in Options tab (#1964) (@catloversg)
- Warn player if they are editing and saving files on non-home servers (#1968) (@catloversg)
- Improve performance of April Fools Easter egg (#1977) (@catloversg)
- Add disambiguation to the confusing "1s / ls" tutorial step (#1972) (@ficocelliguy)

### MISC

- Fix: Tail log does not render multiline logs properly in edge cases (#1838) (@catloversg)
- Fix: Game takes too long to process crime work with large number of cycles (#1821) (@catloversg)
- API: Add "No AI" to GoOpponent type (#1845) (@catloversg)
- Add raw command string to autocomplete data (#1846) (@catloversg)
- Show user-friendly error message when running empty script (#1848) (@catloversg)
- Fix: ns.weaken reports wrong result when server security is near min value (#1887) (@nanogyth)
- Use same multiplier to calculate server's reduced money for all hacking methods (NS APIs and manual hack via UI) (#1868) (@catloversg)
- Add ns.ui.setTailFontSize API to change tail font size (#1852) (@G4mingJon4s)
- Fix: Running TypeScript scripts are not automatically started when game reloads (#1857) (@catloversg)
- Clarify messages related to "buy" command (#1902) (@catloversg)
- Remove RAM usage percentage in "free" CLI if it's NaN (#1897) (@catloversg)
- Add more error info to error dialog and tail log (#1813) (@catloversg)
- Fix: Grow log shows invalid values in edge cases (#1872) (@catloversg)
- Log script kill immediately and identify the guilty script (#1907) (@yichizhng)
- Add source map to transformed scripts (#1812) (@catloversg)
- Fix: Static RAM calculator cannot process abstract methods (#1921) (@catloversg)
- Include all executable types in error message of "run" command (#1918) (@PerpetuaLux)
- Add ns.ui.renderTail API (#1815) (@catloversg)
- Improve typing of coding contract API (#1892) (@G4mingJon4s)
- Add ns.enums.FactionName API (#1457) (@catloversg)
- Fix: Typo in API break notice of v2.6.1 (#1936) (@catloversg)
- Clarify "Disable ASCII art" setting (#1937) (@catloversg)
- Clarify availability of "buy" command (#1940) (@catloversg)
- Allow using wss for RFA (#1942) (@catloversg)
- Support non-Steam achievements (#1953) (@femboyfireball)
- Add ns.formulas.reputation.donationForRep API (#1141, #1960) (@LJNeon)
- Clarify advanced options (#1962) (@catloversg)
- Fix invalid filenames upon loading save (#1147) (@LJNeon)
- Show user-friendly error message when there is syntax error in scripts (#1963) (@catloversg)
- Do not round return value of getBonusTime APIs (#1961) (@catloversg)
- JetBrains Mono font shows wrong glyphs (#1971) (@catloversg)

### DOCUMENTATION

- Fix typo in "Getting Started" page (#1836) (@catloversg)
- Improve Infiltration docs (#1842) (@catloversg)
- Clarify input and output of Square Root coding contract (#1839) (@catloversg)
- Fix typo of CrimeStats (#1850) (@catloversg)
- Add starter React documentation (#1888) (@danielpza)
- Clarify return value of ns.getPurchasedServerCost and ns.getPurchasedServerUpgradeCost when input is invalid (#1884) (@NagaOuroboros)
- Fix migration doc typo (#1896) (@esainane)
- Clarify ns.exit (#1916) (@Mathekatze)
- Make nuke and port opening functions return boolean (#1923) (@catloversg)
- Document shorts in terms of actual finance terms (#1908) (@d0sboots)
- Replace outdated links for v2 migration guide and changelog (#1934) (@catloversg)
- Clarify ns.nuke (#1969) (@catloversg)
- Clarify ns.scan (#1965) (@catloversg)

### SPOILER CHANGES - UI

- Add visual cues to warn player of dangerous actions and status of population, chaos (#1856) (@catloversg)
- Allow empty string in amount and price fields in sell modals before confirming (#1847) (@catloversg)
- Show production multiplier of product in research popup (#1919) (@catloversg)
- Show operation description in tooltip of completed BlackOps (#1941) (@catloversg)
- Show exact reasons why player cannot bribe factions (#1967) (@catloversg)

### SPOILER CHANGES - MISC

- Allow passing 0 SkillPoints to ns.formulas.bladeburner.skillMaxUpgradeCount (#1844) (@catloversg)
- Change description and add tooltip for HackMoney-related multipliers (#1823) (@catloversg)
- Clarify "Company Favor" hash upgrade (#1861) (@catloversg)
- Increase number of displayed digits for "Base Size Modifier" of Stanek's Gift (#1871) (@catloversg)
- Remove mention of passive reputation gain when player is in BN2 (#1859) (@catloversg)
- Fix: Wrong warning of sellAmt being negative (#1819) (@catloversg)
- Add ns.singularity.getSaveData API (#1390) (@catloversg)
- Reword description of "Operation Tyrell" and "Operation Wallace" BlackOps (#1931) (@Hihahahalol)
- Standardize behavior of "connect" command and ns.singularity.connect API (#1933) (@catloversg)
- Decrease interval of check for faction invitation (#1943) (@TheAimMan)
- Change multiplier of defense level in BN14 (#1927) (@ficocelliguy)
- Fix: Sleeve takes on contracts without checking availability (#1946) (@catloversg)
- Fix: ns.corporation.bribe can bribe faction that player is not member of (#1966) (@catloversg)
- Return experience gain rate of gang member in GangMemberInfo.expGain (#1955) (@AdamAndreatta)

### SPOILER CHANGES - DOCUMENTATION

- Clarify isBusy and stopAction Singularity APIs (#1822) (@catloversg)
- Clarify ns.grafting.getGraftableAugmentations API (#1858) (@catloversg)
- Clarify type of returned value of ns.gang.getOtherGangInformation (#1882) (@catloversg)
- Clarify description of BN2 about gang and The Red Pill (#1878) (@catloversg)
- Clarify returned value of ns.bladeburner.getActionCountRemaining (#1873) (@catloversg)
- Fix incorrectly documented BusinessFactor (#1915) (@esainane)
- Fix typo in proof of boost material optimizer (#1938) (@catloversg)
- Clarify ns.singularity.softReset (#1980) (@catloversg)
- Clarify ns.singularity.quitJob (#1979) (@catloversg)

### CODEBASE/REFACTOR

- Fix: React warning of missing keys in CovenantPurchasesRoot.tsx (#1824) (@catloversg)
- Fix: Flaky stock market test (#1834) (@catloversg)
- Convert Literature entries and helper functions to TSX (#1854) (@NagaOuroboros)
- Update webpack and its plugins (#1825) (@catloversg)
- Dockerize Bitburner (#1891) (@romaswe)
- Change signature of interpolate function in Infiltration code (#1843) (@catloversg)
- Validate theme, editor theme, and styles (#1789) (@catloversg)
- Fix React warning when using StatsTable (#1875) (@catloversg)
- Remove unused type of parameter of Favor component (#1874) (@catloversg)
- Merge TypeAssertion files (#1922) (@catloversg)
- Refactor ns.singularity.purchaseAugmentation (#1879) (@catloversg)
- Refactor Player.applyForJob (#1947) (@catloversg)
- Move coding contract code to a separate folder (#1932) (@G4mingJon4s)
- Update webpack and katex (#1975) (@catloversg)
- Update api-extractor (#1982) (@catloversg)
`,
} as const;
