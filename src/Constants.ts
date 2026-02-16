/**
 * Generic Game Constants
 *
 * Constants for specific mechanics or features will NOT be here.
 */
export const CONSTANTS = {
  VersionString: "3.0.0dev",
  isDevBranch: true,
  isInTestEnvironment: globalThis.process?.env?.JEST_WORKER_ID !== undefined,
  VersionNumber: 45,

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
## v3.0.0 development version: last updated 1 February 2026

### BREAKING CHANGES

- Remove API server (#2084) (@catloversg)
- Remove support for running NS1 scripts (#2083) (@catloversg)
- Enforce stricter param check on ns.getBitNodeMultipliers and ns.hacknet.spendHashes (#2085) (@catloversg)
- Remove APIs that were deprecated a long time ago (#2088) (@catloversg)
- Moved formatting functions to their own interface (#1635) (@G4mingJon4s)
- Remove fuzzy matching when checking params (#2091) (@catloversg)
- Remove deprecated tail-related APIs (#2143) (@catloversg)
- Rename setAutoJobAssignment API to setJobAssignment (#2146) (@catloversg)
- Make nuke and port cracking APIs return false instead of throwing error (#1023, #2153) (@Hydrogeniouss, @catloversg)
- Standardize names of Stock APIs (#2173) (@catloversg)
- Rename BN multiplier RepToDonateToFaction to FavorToDonateToFaction (#2178) (@catloversg)
- Make ns.bladeburner.getActionRepGain return the expected reputation gain (#2186) (@catloversg)
- Rename FactionName.BachmanAssociates to FactionName.BachmanAndAssociates (#2048, #2183) (@masarakki, @catloversg)
- Remove DreamSense upgrade (#2232) (@catloversg)
- Use different term for dividend modifier instead of tax (#2237) (@catloversg)
- Remove Spring Water industry (#2240) (@catloversg)
- Remove VeChain (#2245) (@catloversg)
- Make some APIs throw error when server is invalid (#2261) (@catloversg)
- Rename equipment that uses real brand names (#2293) (@catloversg)
- Make TIX access independent from WSE account (#2342) (@catloversg)
- Move and rename purchased server functions to cloud API (#2367) (@gmcew)
- Fix: Coding contracts may have duplicate names (#2399) (@aaaa-imcute)
- Generate test contracts on executing host by default. Add support for optional parameter to specify the server (#2417) (@1337JiveTurkey)

### MAJOR CHANGES

- Balance change: IPvGO: Improve favor gain from wins to balance around the rep value of favor (#2131) (@ficocelliguy)
- Search and read NS API docs in editor tab and documentation tab (#2163) (@catloversg)
- Balance change: Infiltration: Rebalance rewards, add min stat requirement, add market demand (#2210) (@ficocelliguy, @d0sboots, @catloversg)

### UI

- Fix: Hacknet's RAM upgrade button is off-by-one (#2093) (@catloversg)
- Add visual indicators for tooltips of reputation/favor (#2092) (@catloversg)
- Mitigate crash in Terminal page in edge cases (#2099) (@catloversg)
- Update favicon files (#2122) (@catloversg)
- Add option to enable/disable syncing Steam achievements (#2117) (@catloversg)
- Change min and step value of "Tail render interval" setting (#2129) (@catloversg)
- Realign and update text in achievement icons (#2127) (@catloversg)
- Show achievement lists in grids (#2109) (@catloversg)
- Fix styling of IPvGO score modal (#2166) (@ficocelliguy)
- Add RAM usage and file size to "ls -l" output (#2135) (@HansLuft778)
- Fix: Coding contract UI does not handle error properly when answer format is invalid (#2171) (@catloversg)
- Improve Recovery Mode screen (#2206) (@catloversg)
- Add "Recent Errors" tab and improved error modal (#2169) (@ficocelliguy)
- Validate bet input of casino mini games (#1694) (@catloversg)
- Scroll to top when opening new NS API doc page in popup mode (#2181) (@catloversg)
- Fix nbsp rendering as text rather than a space (#2225) (@gmcew)
- Show terminal warning instead of popup for breaking changes (#2244) (@catloversg)
- Show money in exponential form instead of "0.000" for dividends when it's > 0 but still too small (#2243) (@catloversg)
- Place tooltips and popups in front of log windows (#2253) (@catloversg)
- Fix: Go history page shows favor bonus instead of reputation bonus (#2251) (@catloversg)
- Fix: Error message shows blob URL instead of script name (#2265) (@catloversg)
- Add tooltip for reputation/favor in page of faction's augmentation list (#2268) (@catloversg)
- Fix: Dropdown list appears behind modal when it's used in modal (#2282) (@catloversg)
- Close coding contract popup on prestige (#2285) (@catloversg)
- Add "Run Beautify on Save" option for built-in editor (#2287) (@TheCleric)
- Add configurable option for auto-reconnecting to RFA client (#2297) (@catloversg)
- Fix: Active Scripts page may mix up UI after prestige (#2303) (@catloversg)
- Better status bar animations (#2317) (@d0sboots)
- Prevent text from overflowing when script's args are too long in Active Scripts page (#2324) (@catloversg)
- Print error detail to terminal if script cannot be compiled or there is runtime error while autocompleting (#2328) (@catloversg)
- Fix: Color picker appears behind theme editor (#2321) (@catloversg)
- Allow automatically hiding the top menu in Electron (#2325) (@femboyfireball)
- Clarify why you can't buy 4S when disabled (#2311) (@femboyfireball)
- Warn player if they run no-arg programs with arguments (#2338) (@catloversg)
- Show server's money in exponential form if it's too small (#2343) (@catloversg)
- Format the shared RAM multipler on the factions (#2355) (@mctylr-gh)
- Fix: Electron app does not show achievement icons (#2362) (@catloversg)
- Reword tutorial steps to distinguish between instruction and example (#2370) (@catloversg)
- Prevent showing redundant error toasts on failed RFA auto connect attempts (#2381) (@shyguy1412)
- Fix: Company's job list shows wrong starting jobs (#2391) (@catloversg)
- Improve instructions in recovery mode (#2394) (@catloversg)
- Add option to set fractional digits (#2419) (@CTNOriginals)
- Add links to documentation pages in tutorial's last step (#2424) (@catloversg)
- Show useful error messages when loading unsupported save data from newer versions (#2425) (@catloversg)
- Change notice for breaking changes in v2 (#2426) (@catloversg)
- Do not show error popup related to Stanek's Gift data when loading save files from pre-v1.1.0 (#2429) (@catloversg)
- Add Script Editor toggle for Sticky Scroll (#2431) (@gmcew)
- Display contract answers on completely failed contracts (#2440) (@TheCleric)
- Remove BitNode's difficulty in BitNode selection popup (#2454) (@catloversg)
- Add settings to change currency symbol and whether to show it after money value (#2453) (@kaoticengineering)

### MISC

- Ensure IPvGO board has at least 1 offline node (#2072) (@ficocelliguy)
- Fix: Game crashes when generating CCT in weird case (#2077) (@catloversg)
- Add ns.dynamicImport() to dynamically import a script (#2036) (@shyguy1412)
- Add functionality and support to fully allow Players to use IP addresses in place of hostnames (#1990) (@NagaOuroboros)
- Fix: IPvGO tutorial was getting stuck if you left the tab and returned (#2071) (@ficocelliguy)
- Fix: Passive faction reputation gain applies Player.mults.faction_rep twice (#2125) (@catloversg)
- Fix: Electron app does not run on Linux due to incompatible glibc version and wrong usage of net.fetch (#2114) (@catloversg)
- Change how enums are exposed in NetscriptDefinitions.d.ts (#1998) (@catloversg)
- Add formulas API for calculating share power and move UI of sharing RAM (#2126) (@catloversg)
- Use FactionName enum in relevant APIs (#2101) (@catloversg)
- Prevent running multiple instances of Electron app (#2095) (@catloversg)
- Tweak "The Covenant" faction's rumor condition (#2110) (@catloversg)
- Export crash report when a fatal error occurs (#2106) (@catloversg)
- Correctly end game & winstreak if a cheat attempt critically fails (#2130) (@ficocelliguy)
- Show custom error message when player imports decompressed save file (#2108) (@catloversg)
- Add "Total Number of Primes" contract (#2116) (@gmcew)
- Make IP addresses use the full 32 bit space (#2113) (@whiskeyfur)
- Add "--tail" to default autocomplete options (#2103) (@catloversg)
- Update blood donation (#2151, #2216) (@catloversg, @hydroflame)
- Fix typo in sector-12-crime.lit (#2159) (@Boingostarr)
- Add versionNumber to ns.ui.getGameInfo() (#2155) (@catloversg)
- Fix typos in literature files (#2164) (@catloversg)
- Add more enums to ns.enums (#2165) (@catloversg)
- Add removal of fuzzy matching to list of breaking changes (#2149) (@catloversg)
- Fix: API break detector does not detect affected code in some cases (#2172) (@catloversg)
- Mention bug-report channel on Discord for reporting bugs (#2201) (@catloversg)
- Add file metadata (timestamps) (#1271, #2199) (@Hoekstraa, @catloversg)
- Allow using E notation in expr CLI (#2209) (@catloversg)
- Fix: Current work is not shown in edge cases (#2208) (@catloversg)
- Make ns.codingcontract.createDummyContract throw error if type is invalid (#2188) (@catloversg)
- Fix: Documentation navigator does not handle external URL properly (#2202) (@catloversg)
- Detect circular dependencies when generating modules (#2194) (@catloversg)
- Fix: Running scripts may be loaded before main UI (#1726) (@catloversg)
- Fix: Autocomplete of "connect" command does not list purchased servers (#2229) (@gmcew)
- Expose difficulty value of coding contract in NS API (#2230) (@gmcew)
- Fix: Exporting game via menu of Steam app does not give export bonus (#2241) (@catloversg)
- Update migration instruction for breaking change of ns.nFormat (#2247) (@catloversg)
- Fix: Loading code discards entire Go data due to missing migration code for favor/rep (#2252) (@catloversg)
- Add removal of API server to list of breaking changes (#2205) (@catloversg)
- Fix typo in KARMA_1000000 achievement (#2264) (@UncleCeiling)
- Clarify the reason of failure when trying to move a running script (#2160) (@UncleCeiling)
- Fix: ns.mv writes to destination file even if it cannot delete source file (#2267) (@catloversg)
- Update messages related to text files (#2266) (@catloversg)
- Fix calculateExp so that it won't return a too small result (#2274) (@d0sboots)
- Change ns.alert to accept multiple args as other print functions (#2278) (@vamo89)
- Fix: Coding contract can be solved manually via UI after it is removed on prestige (#2281) (@TheCleric)
- Ensure ns.go.analysis.getValidMoves correctly handles playing as white (#2292) (@ficocelliguy)
- Ensure that player's promises are changed to "gameOver" once the game is over (#2198) (@ficocelliguy)
- Export save data before migrating to v3 (#2304) (@catloversg)
- Prevent tiny islands surrounded by offline nodes during initial board generation (#2310) (@ficocelliguy)
- Add FragmentType to NS Enums (#2341) (@TheCleric)
- Do not round down amount of hacked money in "hack" CLI (#2344, #2345) (@catloversg)
- Rename "TIX" interface to "Stock" (#2351) (@catloversg)
- Add --temporary flag to run command (#2354) (@catloversg)
- Let ServerProfiler.exe autocomplete servers (#2356) (@rladenson)
- Correct phrasing in SmartSonar description (#2368) (@The-Chaddeus)
- Make ActiveFragment extend Fragment (#2373) (@catloversg)
- Expose theme as css custom props (#2380) (@shyguy1412)
- Support css file type (#2378) (@shyguy1412)
- Do not update captures on passed analysis boards (#2415) (@ficocelliguy)
- Update error message when backdooring without admin rights (#2435) (@CicaProductions)
- Add literature expanding the augment prestige lore (#2433) (@Nick-Colclasure)
- Improve script args validation message (#2451) (@ficocelliguy)
- Add sleeve commands to purchase sleeves and memory via the API (#2443) (@TheAimMan)
- Allow ns.read to read .msg and .lit files (#2455) (@catloversg)

### DOCUMENTATION

- Fix wrong links in some docs pages (#2082) (@mizmantle)
- Add getContractTypes to Coding Contracts documentation page (#2089) (@gmcew)
- Clarify applicability of wiki entry in Hamming contracts (#2087) (@gmcew)
- Make minor improvements in "Getting Started" page (#2112) (@catloversg)
- Remove mention of Netscript 1.0/2.0/JS in NetscriptDefinitions.d.ts (#2150) (@catloversg)
- Clarify ns.go.getGameState (#2158) (@Arjan-akkermans)
- Remove unnecessary br tag in scripts.md (#2204) (@catloversg)
- Fix minor problem in old changelog (#2203) (@catloversg)
- Remove mention of NS2 in NetscriptDefinitions.d.ts (#2200) (@catloversg)
- Move CONTRIBUTING.md (#2191) (@catloversg)
- Specify parameter types of of ns.go.analysis.highlightPoint and ns.go.analysis.clearPointHighlight (#2175) (@kevinsandow)
- Fix warnings when generating NS API docs (#2189) (@kevinsandow)
- Support showing images in markdown docs (#2207) (@catloversg)
- Update links to CONTRIBUTING.md (#2213) (@catloversg)
- Update contribution guide (#2214) (@emmanuel-ferdman)
- Clarify condition of joining Daedalus faction (#2234) (@catloversg)
- Update infiltration docs (#2259) (@catloversg)
- Mention TypeScript support and update example in React docs (#2263) (@catloversg)
- Update Remote API docs (#2258) (@catloversg)
- Change ns.tail to ns.ui.openTail in example code (#2270) (@gmcew)
- Clarify description of ArrayJumpingGame contract (#2277) (@acidduk)
- Update 'Hacking Algorithms' page (#2288) (@gmcew)
- Reword HammingCode contracts and mention dummy contract API (#2296) (@gmcew)
- Clarify cross-host characteristic of PID and port (#2336) (@Thaccus)
- Fix wrong commands in getting_started.md (#2349) (@catloversg)
- Use alternative fix for newline issue in IPvGO docs (#2350) (@catloversg)
- Fix missing/wrong TSDoc of APIs having optional host parameter (#2371) (@catloversg)
- Fix typo in README.md (#2375) (@HolyNaet)
- Improve wording around host argument of getScriptRam (#2374) (@nickmshelley)
- Remove references to defunct wiki from Hack/Weaken/Grow (#2404) (@maglinvinn)
- Clarify behavior of NS.getScriptLogs() for running scripts (#2408) (@sg673)
- Add instructions to troubleshoot common issues for contributors to CONTRIBUTING.md (#2420) (@catloversg)
- Add FAQ and another JIT batcher illustration to documentation (#2400) (@HolyNaet)
- Change wording in Singularity.installAugmentation (#2439) (@HolyNaet)
- Update README.md to correct Frequently Asked Questions link. (#2444) (@jonathonchase)
- Add a question and a grammatical fix in faq.md (#2446) (@HolyNaet)

### SPOILER CHANGES - UI

- Fix: BitVerse does not show all BN multipliers in some cases (#2045) (@catloversg)
- Add UI hint about scripting tea/party and using Intern (#2179) (@catloversg)
- Fix: Bladeburner console prints main body's HP instead of sleeve's HP (#2390) (@catloversg)
- Reduce threshold of showing warning of low population (#2450) (@catloversg)

### SPOILER CHANGES - MISC

- Add achievement for acquiring SF13.1 (#2107) (@catloversg)
- Add achievement for completing all BNs (#2128) (@catloversg)
- Renamed Division.type to Division.industry (#2079, #2152) (@whiskeyfur, @catloversg)
- Make ns.hacknet.spendHashes handle invalid targets in same way as UI (#2102) (@catloversg)
- Add achievements for BN14 (#2140) (@catloversg)
- Print logs when ns.hacknet.spendHashes fails and update param type of APIs using hash upgrade (#2145) (@catloversg)
- Add ns.singularity.getUnlockedAchievements (#2156) (@UncleCeiling)
- Remove mention of unusable research "sudo.Assist" (#2187) (@catloversg)
- Change message of Singularity error and uncaught promise error (#2174) (@catloversg)
- Add ns.singularity.getHackingLevelRequirementOfProgram (#2271) (@catloversg)
- Expose gang's discount rate (#2272) (@catloversg)
- Prevent purchasing product-only research for material industries (#2283) (@catloversg)
- Fix: Stat levels are not recalculated after grafting augs or accepting Stanek's Gift (#2322) (@catloversg)
- Expose production limit of material and product (#2330) (@AnteIndustrial)
- Make some editorial changes in Black Operations' description (#2449) (@catloversg)
- Add warning when installing backdoor on backdoored server with Singularity API (#2458) (@catloversg)

### SPOILER CHANGES - DOCUMENTATION

- Update rewards of SF14 (#2142) (@catloversg)
- Fix missing and outdated info of optional parameter (#2176) (@catloversg)
- Specify param type of many Corporation APIs (#2190) (@catloversg)
- Fix typo in bitnodes.md (#2221) (@catloversg)
- Add short guide of BitNode recommendation (#2041) (@1337JiveTurkey)
- Add comprehensive guide of BitNode recommendation (#2044) (@catloversg)
- Fix outdated description of Bladeburner interface (#2226) (@catloversg)
- Clarify advice about Smart Supply in round 1 (#2233) (@catloversg)
- Fix wrong param/return type and clarify ns.sleep, ns.asleep, ns.singularity.exportGame (#2242) (@catloversg)
- Clarify ns.gang.getOtherGangInformation (#2289) (@acidduk)
- Update type of Player.factions, GangGenInfo.faction and CorpMaterialConstantData.name (#2347) (@catloversg)
- Clarification of Singularity costs inside BN4 (#2403) (@gmcew)
- Update math notations in corporation docs (#2452) (@catloversg)

### CODEBASE/REFACTOR/WORKFLOW/JEST/TOOL/DEPS

- Electron: Use steamworks.js to integrate with Steamworks SDK (#1563) (@catloversg)
- Electron: Replace deprecated protocol.interceptFileProtocol with protocol.handle (#2100) (@catloversg)
- Dev menu: Add tools to set stat level and queue augmentations of faction (#2118) (@catloversg)
- Remove wrong and irrelevant comments/code (#2111) (@catloversg)
- Refactor: Change repNeededToDonate to favorNeededToDonate (#2134) (@d0sboots)
- Workflow: Build artifacts and upload to release (#2120) (@catloversg)
- Configure .editorconfig to not trim trailing whitespace in NetscriptDefinitions.d.ts (#2137) (@G4mingJon4s)
- Fix typo of "CorruptableText" (#2144) (@catloversg)
- Dev menu: Fix bugs in WD tools (#2141) (@catloversg)
- Make prettier ignore src/Documentation/pages.ts (#2185) (@catloversg)
- Workflow: Allow enabling dev mode when deploying dev build (#2184) (@catloversg)
- Refactor: Refactor message handler of Remote API (#2211) (@catloversg)
- Dev menu: Auto expand last opened tools (#2182) (@catloversg)
- Update build script to avoid unnecessary newline in generated script (#2224) (@catloversg)
- Fix inconsistent generated pages.ts (#2236) (@catloversg)
- Dev menu: Reset hacknet server list properly when setting level of SF9 (#2177) (@catloversg)
- Update dev dependencies (#2246) (@catloversg)
- Move all docs into en/ subdirectory (#1505) (@d0sboots)
- Fix ctrl-clicking after the doc_en refactor (#2256) (@d0sboots)
- Electron: Specify mime type when loading wasm files (#2262) (@catloversg)
- Electron: Build universal macOS binary (#2306) (@Snarling)
- Add Jest test to test migration from v2 to v3 (#2305) (@catloversg)
- Workflow: Split build-artifacts.yml into 2 workflows (#2309) (@catloversg)
- Workflow: Update NodeJs version in workflows (#2319) (@catloversg)
- Update NodeJS to v22 (#2318) (@mctylr-gh)
- Update api-documentor and api-extractor (#2320) (@mctylr-gh)
- Improve dev menu for augmentations (#2315) (@d0sboots)
- Add more debug info for troubleshooting corporation issues (#2327) (@catloversg)
- Update doc.sh (#2331) (@catloversg)
- Enable restoreMocks option and fix lint errors (#2333) (@catloversg)
- Workflow: Add new job to check generated docs (#2329) (@catloversg)
- Quiet Jest tests output on expected failures (#2332) (@mctylr-gh)
- Standardize error handling in netscriptGoImplementation.ts (#2335) (@ficocelliguy)
- Enable linting in test folder (#2337) (@catloversg)
- Update minor version of material UI and Emotion packages (#2339) (@mctylr-gh)
- Refactor Stanek's Gift UI code and change internal FragmentType enum (#2346) (@catloversg)
- Minor React related packages update (#2353) (@mctylr-gh)
- Remove redundant check in getServer utility function and serverExists API (#2357) (@catloversg)
- Refactor tests that add home server manually (#2358) (@catloversg)
- Update Electron version (#2360) (@catloversg)
- Prepare for save data migration of next beta version (#2369) (@catloversg)
- Rewrite infiltration to pull state out of React (#2316, #2393) (@d0sboots)
- Use getCoreBonus function when calculating server growth (#2387) (@aaaa-imcute)
- Refactor implementation of ports (#2396) (@d0sboots)
- Avoid re-entrancy issues with EventEmitter (#2397) (@d0sboots)
- Update packages-lock.json to not use vulnerable versions (#2405) (@mctylr-gh)
- Allow specifying migrator when migrating player's scripts (#2418) (@catloversg)
- Refactor code related to in-game documentation link (#2422) (@catloversg)
- Clean up "doc" folder (#2427) (@catloversg)
- Update dependencies related to monaco (#2432) (@catloversg)
- Fix typos and duplicating ms per cycle constant (#2436) (@gmcew)
- Update dependencies to fix vulnerability warnings (#2445) (@catloversg)
- Move Result to the public API (#2398) (@d0sboots)
- Generate display data for math notation at built time and remove runtime mathjax dependency (#2447) (@catloversg)
- Update SaveData type to be compatible with TS 5.9 and upgrade TS (#2457) (@catloversg)
- Update NodeJS to v24 (#2456) (@catloversg)
`,
} as const;
