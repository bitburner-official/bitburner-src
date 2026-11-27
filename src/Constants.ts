/**
 * Generic Game Constants
 *
 * Constants for specific mechanics or features will NOT be here.
 */
export const CONSTANTS = {
  VersionString: "3.0.2",
  isDevBranch: true,
  isInTestEnvironment: globalThis.process?.env?.JEST_WORKER_ID !== undefined,
  VersionNumber: 51,

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

  DiscordURL: "https://discord.gg/TFc3hKD",

  // Also update Documentation/doc/en/changelog.md when appropriate (when doing a release)
  LatestUpdate: `
## v3.0.2: Dev version. Last updated: 27 November 2026

### BREAKING CHANGES

- Rename ns.singularity.exportGameBonus() (#2986) (@catloversg)
- Change how ns.dnet.getServerDetails returns depth of lab server; return migration progress in ns.dnet.induceServerMigration (#3034) (@ficocelliguy)

### UI

- Show data file names when opening darknet cache files (#2766) (@catloversg)
- Improve visual effect of "SoA - Flood of Poseidon" augmentation (#2781) (@catloversg)
- Show alert if browser is too outdated (#2782) (@catloversg)
- Fix: nano and vim open and save files on wrong servers in edge cases (#2795) (@catloversg)
- Remove extra semicolon in Job page (#2796) (@Berdes)
- Fix: Autocompletion does not work on scripts when autocompleting a filepath (#2786) (@Olacken)
- Fix: Stock market UI crashes when using long currency symbol (#2808) (@catloversg)
- Correct text for kidnap crime description and update work header in CharacterOverview (#2816) (@E9cipher)
- Make tutorial content scrollable (#2834) (@catloversg)
- Show informational message in file diagnostic popup when there are no scripts on any server (#2824) (@E9cipher)
- Disable docs back button if empty history (#2850) (@srcreigh)
- Prevent accidental pastes when closing an editor tab with middle mouse button (#2852) (@PatPL)
- Add an easter egg to the glitch (#2863) (@d0sboots)
- Fix: Darknet UI draws connections between hidden servers (#2868) (@catloversg)
- Fix: Darknet UI allows authentication of hidden servers (#2869) (@catloversg)
- Improve script visibility and searchability in the darknet (#2886) (@ficocelliguy)
- Follow up to #2886 (#2888) (@catloversg)
- Disable docs home button if already on home (#2911) (@E9cipher)
- Fix: Darknet server connections are drawn incorrectly (#2928) (@catloversg)
- Always print result to terminal when manually solving contract succeeds (#2939) (@UltraGaming1001)
- Use theme colors instead of hardcoding in dnet UI; add icon and border for frozen servers; improve coloring of some servers (#2944) (@ficocelliguy)
- Wrap long strings in contract description onto multiple lines (#2940) (@catloversg)
- Replace hardcoded white text with theme color (#2950) (@catloversg)
- Move instability info to top left of darknet UI (#2955) (@catloversg)
- Remove duplicate border from tail box (#2962) (@davixx95)
- Add achievement for visiting The Void (#2960) (@E9cipher)
- Change how server summary displays dnet-specific information (#2956) (@catloversg)
- Account for ellipsis length when shortening hostnames in the Active Scripts page (#2991) (@aebabis)
- Add reminder for backing up save data (#2977) (@catloversg)
- Improve accessibility of wire cutter minigame (#2987) (@catloversg)
- Add clarifying message when running port openers on home (#3013) (@E9cipher)
- Add catppuccin mocha theme (#3020) (@Suniltwo)
- Rework RFA connection indicator and RFA setting page (#3050) (@catloversg)
- Do not show backup reminder if total play time is less than 1 day (#3055) (@catloversg)
- Fix: Cannot restore default augmentation order after sorting by cost or reputation (#3062) (@catloversg)
- Add price history chart to stock market (#3057) (@catloversg)
- Fix: Markdown renderer ignores specified code block language (#3106) (@catloversg)
- Attempt to establish RFA connection when pressing Enter key (#3070) (@E9cipher)
- Limit max width of Documentation page (#3045) (@branchtheory)
- Move search bar to the right of pagination controls in Active Scripts page (#3112) (@branchtheory)
- Add a :bd command to close the current file tab in vim mode in the in-game editor (#3114) (@ficocelliguy)
- Update Hacknet text (#3099) (@branchtheory)
- Fix log box size and borders (#3137) (@branchtheory)
- Revert #3137 (#3141) (@catloversg)
- Color rumours of banned factions with "disabled" theme color instead of "error" theme color (#3140) (@branchtheory)
- Fix issue with hack progress not showing 100% when hack is successful (#3190) (@jlyoungthe3rd)
- Add tooltip for "IPvGO Max Rep Converted to Favor" multiplier in Stats page (#3192) (@branchtheory)
- Update names of hacking-related multipliers (#3198) (@branchtheory)
- Remove unused code from #3198 (#3213) (@branchtheory)
- ELECTRON: Show confirmation dialog before leaving (#3230) (@catloversg)
- Limit error log content to a number of lines without requiring experimental flags (#3229) (@catloversg)
- Add option to skip many pop-ups on load (#3232) (@ficocelliguy)

### API

- Make ns.spawn return never instead of void (#2798) (@catloversg)
- Fix: Dnet.heartbleed shows wrong error message (#2802) (@catloversg)
- Specify more precise "data" typing for TotalPrimesInRange contract (#2803) (@Jojoseis)
- Expose cache reward details (#2807) (@catloversg)
- Add ns.ui.openCodeEditor() to open files in the script editor (#2830) (@ficocelliguy)
- Add ns.format.money (#2848) (@MageKing17)
- Follow up to #2830 (#2845) (@catloversg)
- Unify default color handling between ns.print and ns.tprint (#2847) (@MageKing17)
- Adds functions to set aliases programmatically (#2806) (@vivian-wei-008)
- Follow up to #2806 (#2874) (@catloversg)
- Add ns.ui.renderPage to render React node in main content area (#2875) (@catloversg)
- Always log charisma exp reward from ns.dnet.authenticate (#2923) (@catloversg)
- Add ns.dnet.freezeServer to "freeze" a server for testing (#2818) (@ficocelliguy)
- Disallow transferring Symbol via port APIs (#2929) (@NagaOuroboros)
- Add top-level Netscript Port APIs for empty and full checks (#2926) (@NagaOuroboros)
- Follow up to #2818 (#2936) (@catloversg)
- Make ns.dnet.promoteStock require TIX API access (#2973) (@catloversg)
- Add optional hostname argument to ns.getFileMetadata() (#2981) (@Core-27)
- Add ns.ui.createConnectLink to create clickable server links (#2948) (@hexagonrecursion)
- Improve how ns.print() and ns.tprint() print exceptions (#3016) (@hexagonrecursion)
- Allow closeTail for stopped scripts (#3060) (@BreezeDelegate)
- Add file size to metadata RFA API responses (#3065) (@catloversg)
- Add ns.formulas.dnet.getExpectedMigrationCharge (#3146) (@VashCowaii)
- Log successful attempts of dnet.induceServerMigration() regardless of depth change (#3169) (@VashCowaii)
- Create the ns.port namespace (#3184) (@NagaOuroboros)
- Unify method naming across both Port APIs (#3226) (@NagaOuroboros)

### MISC

- Allow exporting save data even if game fails to load (#2784) (@catloversg)
- Follow up to #2784 (#2788) (@catloversg)
- Allow killing scripts during tutorial (#2797) (@catloversg)
- Fix issues in MathML puzzle (#2804) (@ficocelliguy)
- Tweak charisma augments and exp gain; add dnet_money mult to NFG; fix script counts (#2792) (@ficocelliguy)
- Fix an edge case with ram rounding (#2817) (@d0sboots)
- Fix: Steam version fails to launch on Windows without VC++ and on old Linux distros (#2822) (@catloversg)
- Fix deprecated nFormat replacement text (#2829) (@Groxx)
- Use strict transaction durability when saving to IndexedDB (#2833) (@Evan109)
- Fix some typos and update some achievement descriptions (#2832) (@E9cipher)
- Change random server selection when generating coding contracts (#2835) (@catloversg)
- Fix: "The Void" location is not initialized properly (#2858) (@catloversg)
- Update tooltip of some exe programs (#2861) (@E9cipher)
- Use div instead of p for sidebar hooks (#2876) (@catloversg)
- Cover move RecoveryRoot cases with the newer version check (#2894) (@d0sboots)
- Check darknet API access for all dnet methods (#2909) (@ficocelliguy)
- Harden logic around darkweb connections to home to prevent errors (#2913) (@ficocelliguy)
- Add command line parameter to disable Steam integration (#2958) (@aef123)
- Fix: Stock symbol map is not initialized after loading in edge cases (#2966) (@catloversg)
- Fix: Stock market does not reset after prestige in edge cases (#2968) (@catloversg)
- Tighten RFA message definitions, update documentation, and add new community tools (#2976) (@catloversg)
- Close open ports of home on prestige (#2978) (@catloversg)
- Update MONEY_1Q achievement description (#2989) (@ndc)
- Add discoverable example scripts on npc servers (#2954) (@ficocelliguy)
- Add hints for debugging infinite loop (#3004) (@catloversg)
- Make scan-analyze less powerful (#2995) (@hexagonrecursion)
- Populate server logs with noise upon heartbleed (#3026) (@ficocelliguy)
- Fix typos in many files (#3021) (@E9cipher)
- Preserve generated logs during authentication (#3037) (@BreezeDelegate)
- Follow up to #3037 (#3047) (@catloversg)
- Fix: Solver for "Shortest Path in a Grid" contract accepts wrong answers (#3054) (@catloversg)
- Change how ls CLI command sorts its output (#3066) (@branchtheory)
- Update output of grow and weaken CLI commands (#3080) (@branchtheory)
- Format phishing money reward with money formatter instead of number formatter (#3131) (@Dobbykroket)
- Prevent errors when there are no movable darknet servers (#3149) (@ficocelliguy)
- Change "Largest Rectangle" example to show 1-wide rectangles can be valid answers (#3157) (@gmcew)
- Grow lab with bonus lab completions; replace bonus lab reward with new aug (#2827) (@ficocelliguy)
- Update warning about city faction enemies (#3172) (@branchtheory)
- Switch difficulties for "RLE compression" and "Total Ways to Sum 1" contracts (#3188) (@UltraGaming1001)
- ELECTRON: Use F11 as default shortcut to toggle fullscreen (#3181) (@catloversg)
- Improve discoverability of ns.dnet.heartbleed (#3221) (@catloversg)
- Add missing "to" in TotalWaysToSum description (#3220) (@bluestmango)
- Fix typo in Literatures.tsx (#3233) (@Thunderoux)
- Allow terminal input keydown errors to bubble up to global error handler (#3238) (@catloversg)
- Improve error check and handling when server.serversOnNetwork contains invalid data (#3239) (@catloversg)
- Remove accidental "$" in darknet literature file (#3245) (@catloversg)

### DOCUMENTATION

- Fixed trailing "}" in ns.formulas.weakenEffect (#2793) (@TrixTrl)
- Fix a few ram costs that are incorrect in the ns docs (#2831) (@ficocelliguy)
- Fix missing docs for members of SimpleOpponentStats in generated md files (#2837) (@catloversg)
- Use @example for examples (#2846) (@catloversg)
- Remove internal state type definitions and clarify CodingContractSignatures (#2881) (@catloversg)
- Update type definitions of ns.flags and AutocompleteData.flags (#2903) (@catloversg)
- Remove incorrect description of ns.spawn (#2904) (@catloversg)
- Clarify that port handle methods remain usable after the ns instance is dead (#2930) (@catloversg)
- Mark host parameter of ns.ls as optional (#2931) (@E9cipher)
- Document default property values of BasicHGWOptions (#2975) (@catloversg)
- Update temporary description in runOptions to reflect the script won't appear in Recently Killed tab (#2998) (@gmcew)
- Remove outdated info in ns.mv docs (#3017) (@hexagonrecursion)
- Fix incorrect description of "threads" parameter of ns.formulas.getHeartbleedTime (#3027) (@hexagonrecursion)
- Update ns.prompt documentation (#3102) (@branchtheory)
- Consistently use triple ticks when writing code blocks (#3107) (@catloversg)
- Document missing case when ns.getScriptRam returns 0 (#3116) (@slooker)
- Document Unstable Circadian Modulator augmentation quirks when installed on sleeves (#3098) (@catloversg)
- Add missing cases of returning -1 to TSDoc of ns.hackAnalyzeThreads() (#3121) (@N0pal3s)
- Update example code in TSDoc of ns.scan (#3133) (@UltraGaming1001)
- Update Hacking Algorithms document (#3132) (@gmcew)
- Use "const" instead of "let" in some documentation pages (#3148) (@UltraGaming1001)
- Fix typo in ns.formulas.dnet.getExpectedRamBlockRemoved (#3147) (@VashCowaii)
- Clarify ns.share and ns.getSharePower; update core purchase text (#3159) (@VashCowaii)
- Clarify ns.hackAnalyze return value range (#3164) (@gmcew)
- Remove unavailable JS learning resource (#3180) (@catloversg)
- Standardize darknet/darkweb terms, clarify dnet APIs, improve dnet main documentation (#3156) (@VashCowaii)
- Remove unnecessary whitespace in TSDoc (#3217) (@catloversg)
- Document MoneySource.darknet (#3234) (@catloversg)

### SPOILER CHANGES - UI

- Improve explanation of highest charge on Stanek fragment boost (#2811) (@Berdes)
- Add BN hint to special locations (#2823) (@E9cipher)
- Add hint for b1t_flum3.exe's "-q" option (#2838) (@catloversg)
- Show more accurate hints for special locations (#2879) (@catloversg)
- Fix wrong profit amount in sell division popup (#2898) (@TomasVaner)
- Allow access to grafting UI outside New Tokyo (#2946) (@catloversg)
- Update some aug texts; change labyrinth icon; show charisma requirement info for labyrinth (#2951) (@ficocelliguy)
- Do not show Entropy virus notice when grafting Congruity Implant (#2957) (@E9cipher)
- Fix several modal dialogues in corporation UI sometimes showing wrong values (#2972) (@hexagonrecursion)
- Fix: Sleeve "Take on contracts" option displays empty submenu (#2993) (@E9cipher)
- Fix: Corporation modals use duplicate React keys (#3023) (@catloversg)
- Consistently show relevant material data in warehouse's storage space tooltip (#3035) (@catloversg)
- Fix: Augmentations page crashes after grafting an aug if player has not installed any augs (#3094) (@catloversg)
- Update text of Church of the Machine God location (#3100) (@branchtheory)
- Tweak label of Bladeburner Field Analysis multiplier (#3194) (@branchtheory)

### SPOILER CHANGES - API

- Change log message when calling ns.stanek.acceptGift repeatedly (#2812) (@catloversg)
- Fix: ns.singularity.b1tflum3 does not validate nextBN (#2836) (@catloversg)
- Let singularity.destroyW0r1dD43m0n travel to Bitverse when nextBN is not specified (#2857) (@E9cipher)
- Fix: ns.singularity.destroyW0r1dD43m0n validates BN options too late (#2871) (@catloversg)
- Revert #2611 (wrong fix for ns.formulas.bladeburner.skillMaxUpgradeCount) (#2902) (@catloversg)
- Fix: getCompanyPositionInfo does not take BN-related mults into account when calculating salary (#2922) (@catloversg)
- Add GangTaskName to NSEnums (#2945) (@E9cipher)
- Avoid showing spoilers in error messages of Stock APIs (#2952) (@catloversg)
- Update BladeburnerCurAction (#3089) (@catloversg)
- Update SleeveBladeburnerTask (#3095) (@catloversg)
- Add ns.formulas.gang.reputationGain (#3179) (@hexagonrecursion)
- Add GangMemberUpgrade to NSEnums (#3202) (@E9cipher)
- Change RAM cost of ns.hacknet.getHashUpgrades to 0 (#3210) (@E9cipher)
- Add HacknetServerHashUpgrade to NSEnums (#3207) (@E9cipher)
- Use GangTaskName in gang APIs (#3218) (@E9cipher)
- Use GangMemberUpgradeName in gang APIs (#3214) (@E9cipher)

### SPOILER CHANGES - MISC

- Apply SF -1 bonus to dnet_money multiplier (#2813) (@catloversg)
- Stop using eval when parsing price and amount strings to prevent memory leaks (#2826) (@Sphyxis)
- Prevent material quality and other data from becoming NaN in edge cases (#2865) (@catloversg)
- Remove passive popularity decay (#2932) (@catloversg)
- Fix: Intelligence slows down darknet authentication (#2982) (@shrimpboom8)
- Clarify conditions for "BN9: Challenge" achievement (#3005) (@catloversg)
- Remove TRP from darknet in BN12 (#3025) (@ficocelliguy)
- Change a bunch of text (#3043) (@branchtheory)
- Change Bladeburner text (#3044) (@branchtheory)
- Apply the SF15.2 authentication speed bonus at SF level 2 (#3059) (@nobody0)
- Consistently choose contract type based on SF levels (#3101) (@catloversg)
- Mark COTMG as a banned faction when you are not a member and queueing or installing a non-NFG aug (#3142) (@branchtheory)
- Fix gang member level formula (#3195) (@hexagonrecursion)
- Fix incorrect Stanek fragment rotation for out-of-range values (#3183) (@VashCowaii)
- Include Darknet money in the stats affected by accepting Stanek's gift (#3222) (@gmcew)

### SPOILER CHANGES - DOCUMENTATION
- Fix incorrect namespace for getCheatSuccessChance in several function descriptions (#2810) (@Berdes)
- Mention b1t_flum3.exe in BitNode docs (#2839) (@catloversg)
- Clarify ns.singularity.getOwnedSourceFiles (#2880) (@catloversg)
- Improve bladeburner docs and use in-game location names for Bladeburner BlackOp descriptions (#2910) (@E9cipher)
- Rename DividendTax to TributeModifier in docs (#2934) (@hexagonrecursion)
- Fix formula in corporation docs (#2947) (@neutrino1911)
- Clarify ns.corporation.limitMaterialProduction() (#2953) (@hexagonrecursion)
- Explain how production scales due to insufficient storage space (#2974) (@catloversg)
- Clarify ns.singularity.softReset and soft reset button tooltip (#2999) (@branchtheory)
- Clarify grafting prerequisite and entropy rules (#3049) (@branchtheory)
- Add more docs to Stanek's Fragment and ActiveFragment (#3158) (@VashCowaii)
- Expand intelligence documentation (#3174) (@VashCowaii)
- Improve spoiler warnings on endgame API namespaces (#3216) (@VariableVixen)
- Clarify which servers can be connected to via "connect" CLI and API (#3242) (@catloversg)

### CODEBASE/REFACTOR/WORKFLOW/JEST/TOOL/DEPS
- Update dependencies (#2785) (@catloversg)
- Update swc (#2794) (@catloversg)
- DEVMENU: Add tool to set SF12 level (#2814) (@catloversg)
- Wrap BitNode SF text into a reusable function and edit BN8's description (#2841) (@E9cipher)
- Partially revert #2841 (#2844) (@catloversg)
- Replace expr-eval with expr-eval-fork due to security (#2842) (@mctylr-gh)
- Remove weakRef from moduleCache (#2843) (@Sphyxis)
- Override jsdom version of jest-environment-jsdom and update some other packages (#2856) (@mctylr-gh)
- Replace Terminal callbacks with Promises and restructure code (#2537) (@d0sboots)
- DEVMENU: Initialize dark net data when adding darknet program (#2864) (@catloversg)
- Remove WorkerScript.code (#2870) (@Sphyxis)
- Update @electron/packager (#2882) (@catloversg)
- Remove duplicate scriptKey (#2878) (@Sphyxis)
- Follow up to #2882 (#2884) (@catloversg)
- Remove permanent reference to the saveObject (#2885) (@d0sboots)
- Remove unused loadedFns property in WorkerScript (#2891) (@Sphyxis)
- Lazily create atExit on WorkerScripts (#2893) (@Sphyxis)
- Only create script title when needed (#2877) (@Sphyxis)
- Remove unused "output" property, convert "name" and "hostname" properties to getters in WorkerScript (#2890) (@Sphyxis)
- Configure allowScripts in package.json to prepare for npm v12 (#2895) (@mctylr-gh)
- Convert Electron packaging script to JS (#2901) (@catloversg)
- Flatten Environment properties into WorkerScript (#2896) (@Sphyxis)
- Follow up to #2864 (#2914) (@catloversg)
- Removed horizontal mirroring for IPvGo (#2933) (@Sphyxis)
- Rename an incorrect variable name, remove unused properties in Material and Product (#2925) (@hexagonrecursion)
- Remove optional filename parameter when generating contracts (#2935) (@catloversg)
- Add more tests for material production limit (#2967) (@catloversg)
- Improve CONTRIBUTING and README (#2959) (@E9cipher)
- Refactor Corporation and Gang dev tools (#2988) (@catloversg)
- Remove .script tests (#2983) (@hexagonrecursion)
- Update parameter name and comment in WHRNG constructor (#3001) (@catloversg)
- DEVMENU: Disable accordions instead of not displaying them (#2985) (@E9cipher)
- Delete unused src/ThirdParty/JSInterpreter.js (#3019) (@hexagonrecursion)
- Uncurry netscript InternalAPI (#2919) (@d0sboots)
- Use population helper functions in random Bladeburner events (#3032) (@gmcew)
- Add type checking task (#3053) (@catloversg)
- Add GitHub issue templates (#3052) (@catloversg)
- Delete .readthedocs.yaml (#3073) (@E9cipher)
- Refactor tutorial styling code (#3081) (@branchtheory)
- Add tests for save/load system (#3088) (@catloversg)
- Remove multiple OS selection from bug report template (#3077) (@E9cipher)
- Reduce redundant reviver references (#3022) (@d0sboots)
- Update bug report template (#3108) (@catloversg)
- Add typecheck to CONTRIBUTING (#3111) (@E9cipher)
- Mention not to force-push in CONTRIBUTING (#3117) (@E9cipher)
- Use ListItemButton instead of deprecated ListItem button (#3097) (@catloversg)
- Change Object.freeze usages and update comments (#3096) (@catloversg)
- Add tests for multiplier calculation (#3093) (@catloversg)
- Change Aug impl for greater sanity (#2992) (@d0sboots)
- Use a config key to set the Discord URL (#3127) (@kegpoison)
- Refactor header of Sleeve stats table (#3083) (@branchtheory)
- Reorder code and comments of offline production calculation (#3154) (@branchtheory)
- Update Electron (#3200) (@catloversg)
- Update dev dependencies (#3201) (@catloversg)
- Move Router object out of GameRoot to prevent every file that navigates from importing every game UI element on load (#3204) (@ficocelliguy)
- Lazily build Go tutorial examples to prevent go methods from being called before initialization (#3203) (@ficocelliguy)
- Extract faction invite checks, game cycle events, and netscript ports objects into more focused scopes (#3205) (@ficocelliguy)
- Improve typecheck task (#3209) (@catloversg)
- Instruct contributors to use "npm ci" instead of "npm install" (#3215) (@catloversg)
- Update comment of getMaxRep (#3208) (@catloversg)
- Upgrade to TypeScript 6 (#3227) (@catloversg)
- DEVMENU: Disconnect hacknet servers from home before removing them (#3237) (@catloversg)
- Add type utilities for NS API type validation (#3235) (@catloversg)
- ELECTRON: Remove wrong initialization of backgroundThrottling option (#3243) (@catloversg)
`,
} as const;
