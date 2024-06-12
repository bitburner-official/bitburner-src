# Changelog

## v2.6.1 - 21 May 2024

### MAJOR CHANGES

- Exported savegames are now compressed. This means that savegames from 2.6.1dev will need to be manually converted before backloading into 2.6.0 (@catloversg)
- There was a small API change related to Bladeburner. If your save file is affected by the API change, a file APIBreakInfo-2.6.1.txt will be created on your home computer, which should assist in updating your scripts.
- Some Go scripts may also require updates, please reference the current documentation to troubleshoot any issues.

### API

- (Bladeburner) !API Break! ns.bladeburner.getCurrentAction now returns null when not performing an action (@Snarling)
- (Corporation) Add a missing check on exportMaterial (@catloversg)
- (Corporation) Add ns.corporation.sellDivision (@catloversg)
- (Formulas) Add ns.formulas.hacking.growAmount (@d0sboots)
- (Go) Some changes to the Go API, including some minor breaking changes. Please refer to the API documentation in the script editor or at https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.go.md (@ficocelliguy)
- (Go) Added ns.go.analysis.getStats (@ficocelliguy)
- (Go) Fix a bug that allowed facing secret opponent early or with wrong board size (@ficoccelliguy)
- (Infiltration) More information is provided on ns.infiltration.getInfiltration (@catloversg)
- (Singularity) Added ns.singularity.getFactionEnemies function (@jaguardeer)
- (Sleeve) SleeveInfiltrationWork now has a nextCompletion promise (@Caldwell-74)
- ns.getRunningScipt().tailProperties now updates x/y positions while the tail window is being moved (@catloversg)
- Fixed an issue that caused ns.disableLog to work incorrectly for some functions (@ficocelliguy)

### UI

- (Bladeburner) Console now uses the timestamp formatting from Settings if it is set (@gmcew)
- (Corporation) More granular control of office size increases (@adeilt)
- (Corporation) Adjustments on storage space tooltips (@catlovers)
- (Electron) Fixed an issue where the zoom level would not be updated correctly (@catloversg
- (Gang) Fix inaccurate display of wanted reduction rate when performing "justice" tasks (@LJNeon)
- (Go) Fix an incorrect displayed max favor on Go history page (@ficocelliguy)
- (Hashnet) Show more digits when hashrate is very low (@catloversg)
- (Infiltration) Intro screen now shows how much damage will be taken for each failure (@catloversg)
- (Tutorial) Change display of the buttons in the Tutorial (@catloversg)
- Fixed an issue that could cause wrong RAM value displayed in script editor (@gmcew)
- Tweak display of very large multipliers on the Augmentations screen (@catloversg)
- Active scripts screen will now wrap text when there is a very long list of arguments with no spaces (@catloversg)
- Text files (.txt and .json) posted to the terminal from the ls command are now clickable (@catloversg)
- Fixed a display issue on the bitverse page (@LJNeon)
- Fixed a display issue on the stats page (@catloversg)
- Fixed a display issue with CorruptableText (@catloversg)
- Add "arguments" to list for special highlighting in script editor (@catloversg)

### MISC

- (Bladeburner) Internal code refactoring (@Snarling)
- (Corporation) Fix an issue that could cause incorrect average material prices via bulk purchases (@catloversg)\
- (Corporation) Refactored bribery
- (Docs) Various doc fixes (@adeilt, @User670, @catloversg, @gmcew, @jeek, @pontsuyo, @ficocelliguy, @d0sboot, @Vilsol)
- (Electron) Fixed an issue that could cause ghost processes on the Steam version (@catloversg
- (Go) "No AI" white player can now pass (@ficocelliguy)
- (Go) Reimplement superko rule, adjust save data (@ficocelliguy)
- (Go) Balance tweaks and other bugfixes (@ficocelliguy)
- (Go) Fix an issue that could cause the AI to try taking two turns simultaneously (@Snarling)
- (Go) Bonus from Tetrads now applies to all combat stats (@gmcew)
- (Go) Internally streamlined some Go code (@d0sboots, @Snarling)
- (Hacknet) Fixed an issue in the engine loop that could cause offline earnings with hacknet to be inaccurate (@d0sboots)
- (Inflitration) Rework and tuning for Slash game (@catloversg)
- (Inflitration) Fix an "invalid location" crash (@catloversg)
- (Sleeve) Fix incorrect starting shock values while in BN10
- New internal implementation for getRandomInt (@catloversg)
- Improved the description text for the Hamming Code contract (@gmcew)
- Fixed a bug in the useRerender hook, which could occasionally cause UI bugs (@catloversg)
- Added error handling in cases where a savegame cannot be loaded (@catloversg)
- 'buy -a' command will now partially buy programs even if not all can be bought (@TheAimMan)
- Tweaked the interaction between backdoored servers and reputation requirements (@catloversg)
- Update Credits page to show @d0sboots as an active maintainer (@Snarling)
- Changed the name of an augmentation at the request of the original author (@hydroflame)
- Allow .json files (@shyguy1412)
- Remove jquery dependency (@catloversg)
- Disable text translation, which commonly causes crashes (@catloversg)
- Fix an incorrect unit in ns.spawn logs (@FoGsesipod)
- Servers that don't exist yet will not show up in autocomplete data (@catloversg)
- Add optional file for ignoring some specific commits with git blame (@adeilt)
- Remove some unnecessary data from save file (@Snarling)
- Added general API break utilities for future use (@Snarling)
- Remove an internal dependency and streamline code for downloading files (@catloversg)
- Remove some unused internal constants (@catloversg)
- Ensure lastNodeReset property is initialized correctly on the player object (@catloversg)
- The value of "this" within the main function will no longer be the script module itself (@d0sboots)
- Fixed an incorrect file mode (@mctylr-gh)
- Nerf noodle bar (various contributors)

## v2.6.0 - IPvGO: 5 Mar 2024

### MAJOR ADDITIONS

- A new minigame IPvGO, based on the game Go. Visit DefComm in New Tokyo or the CIA in Sector-12 for access. Documentation for the mechanic is available ingame under "How to Play" once the mechanic is available. (@ficocelliguy)
- A new BitNode has been added which focuses on the IPvGO mechanic (@ficocelliguy)

### HOTFIXES

- 6 Mar 2024: Fixed an issue that could result in invalid Go board states (@ficocelliguy)

### API

- (Bladeburner) ns.bladeburner.getSkillUpgradeCost now returns infinity if requesting a cost above the maximum skill level (@Semanual)
- (CodingContract) Fixed an issue where ns.codingcontract.getData was leaking internal arrays when contract data was a 2-d array (@LJNeon)
- (CodingContract) ns.codingcontract.createDummyContract now returns the filename of the created contract (@Spartelfant)
- (Gang) Added ns.gang.getInstallResult for determining the effect an augmentation install will have on gang member ascension multipliers (@LJNeon)
- (Go) Added the ns.go API, which allows interaction with the new IPvGO mechanic. While this is in development, the API may undergo changes (@ficocelliguy)
- (Hashnet) Fixed a bug that allowed spending negative hashes (@yichizhng)
- (Ports) Added ns.nextPortWrite, which allows waiting for the next write to a port without creating a port handle object (@LJNeon)
- (Ports) Ports now support all clonable data (@LJNeon)
- (Singularity) Add type information for ns.singularity.getCurrentWork return value (@Semanual)
- (Stanek) Fix ns.stanek.acceptGift which was not working in 2.5.2 (@jjclark1982)
- ns.getPlayer now also provides the player's karma. ns.heart.break is no longer a hidden function (@LJNeon)
- ns.atExit can be provided a string id as a second parameter, to set multiple atExit callbacks for the same script (@shyguy1412)
- Improved the efficiency and accuracy of growth formulas (@d0sboots)
- ns.formatNumber now throws an error if specifying a suffixStart less than 1000 (@TheAimMan)
- HGWOptions now accepts a non-integer number of threads (@Caldwell-74)
- Fixed outdated docs for ns.spawn() (@adeilt)
- Fixed ns.serverExists returning incorrect value for an endgame server (@cigarmemr)
- Refactored weaken effect calculation (@Caldwell-74)

### UI

- (Augmentations) Fixed some missing description text for Hacknet multipliers (@jjclark1982)
- (Corporation) Align columns correctly in warehouse breakdown table (@jjclark1982)
- (Corporation) Several typo fixes in Corporation modals (@cigarmemr)
- (Documentation) Ingame documentation now displays line breaks inside tables correctly (@Snarling)
- (Documentation) Added a documentation page for converting .script to .js (@LJNeon, @jjclark1982, @Snarling)
- (Documentation) Script editor doc button points to correct docs (@LJNeon)
- (Hashnet) Hash upgrade descriptions use proper number formatting options (@Snarling)
- (Hacknet) Hacknet display shows a dynamic amount of columns based on screen width (@shyguy1412)
- (Infiltration) Changed how the CheatCodeGame is displayed (@alutman, @Snarling)
- (Infiltration) If currently performing faction work, UI defaults to trading info for rep with that faction (@LJNeon)
- (Sleeve) If intelligence is unlocked, sleeve intelligence is shown in the UI (@Caldwell-74)
- (Stockmarket) Changed color of stocks increasing in value (@Semanual)
- (Terminal) Improved scroll behavior on the Terminal (@Snarling)
- (Theme) Added 3 new theme elements to properly support light themes (@adeilt)
- Added a tail render interval setting, changing how frequently tail windows redraw their contents (@Caldwell-74)
- Reorganization of some content and sorting of scripts on the Active Scripts page (@Snarling, @TheAimMan)
- "Disable Text Effects" option also disables the corrupted text display (@draughtnyan)
- fl1ght.exe now displays the related requirements in a more readable way (@TheAimMan, @LJNeon)
- Miscellaneous wording fixes (@cigarmemr)

### MISC

- (CodingContract) Improve parsing of player input for arrays in coding contracts (@rocket3989)
- (Corporation) Fix an incorrect demand range for Minerals (@catloversg)
- (Corporation) Added ingame documentation (@catloversg)
- (Corporation) Divisions impact on corporation valuation is now based on number of offices and warehouses (@catloversg)
- (Corporation) Improve performance of calculations (@catloversg)
- (Bladeburner) Band-aid fix Blops count and action stopping (@Caldwell-74)
- (Gang) Add separate money tracking for gang expenses (@deansvendsen)
- (Ports) Port objects no longer track a separate promise for every use of nextWrite (@Snarling)
- (Ports) Fixed a crashing bug related to the changes above (@Jman420)
- (RemoteAPI) Remote API can be targeted to a remote device instead of the default of localhost (@Specker)
- (RemoteAPI) Added a getAllServers method (@shyguy1412)
- (ScriptEditor) When importing from other files that are also open in the editor, type information is now available in the IDE (@shyguy1412)
- (ScriptEditor) Links from "ls" are now tied to that host, instead of your connected machine (@LJNeon)
- (ScriptEditor) Script "models" in the script editor are now properly disposed (@Caldwell-74)
- (Terminal) Add --ram-override flag to the run command (@LJNeon)
- (Terminal) Fix incorrect help text for rm command (@LJNeon)
- Add a helper for clamping numbers to an allowable range, and use this for player skill formulas (@Caldwell-74)
- Protect against renaming servers to invalid names (@LJNeon)
- All running scripts are killed upon entering the BitVerse (@LJNeon)
- Scripts with the "temporary" flag set do not populate the Recently Killed script list on script death (@TheAimMan)
- Fix an issue with offline income for scripts (@Caldwell-74)
- Various "nextUpdate" promises are not tracked internally as a single promise instead of an array of promises (@Caldwell-74, @LJNeon)
- Fix inconsistent importing of the arg library (@catloversg)
- Clarify some information in the CONTRIBUTING.md file (@deansvendsen)
- Internal changes to method used for cloning objects (@LJNeon)
- Rearrange some internal constants (@Caldwell-74)
- b1t_flum3.exe can be ran in "quick" mode (@TheAimMan)
- Nerf noodle bar (various)
- Nerf noodle bar moar (@Caldwell-74)

## v2.5.2 - 26 December 2023

### API

- Added limit of 1e9 for additionalMsec property of HGWOptions (@d0sboots)
- ns.share effect is now boosted by host server core count (@TheAimMan)
- Fix a bug with HGWOptions that caused the default value to be 1 thread even for scripts running multiple threads (@DJMatch3000)
- (Singularity) ns.singularity.applyToCompany now returns the JobName if a job was obtained, or null otherwise - previously was boolean (@jjclark1982)
- (Singularity) ns.singularity.getCurrentWork now requires access to the singularity API (@TheAimMan)
- (Singularity) Added ns.singularity.getFactionInviteRequirements (@jjclark1982)
- (Stanek) ns.stanek.chargeFragment is now boosted by host server core count (@TheAimMan)

### BUGFIX

- (Bladeburner) Operation team size modal now handles keyboard submission correctly (@Snarling)
- (Corporation) Fixed an issue with Warehouse size being out of sync following prduct sale (@Kelenius)
- (Factions) Fixed some display order issues, and possible multiple entries for a faction (@jjclark1982)
- (Factions) Fixed an issue with certain factions not becoming "known" when joining them (@jjclark1982)
- (Grafting) Entropy now has the correct negative effect on hacknet multipliers (@TheAimMan)
- (Hashnet) Fixed an issue where the SF9.3 reward server had an incorrect number of cores (@cigarmemr)
- (Terminal) Fixed a bug with script autocompletion when the script is inside a subdirectory (@draughtnyan)

### MISC

- Added basic protection for certain global values that could cause a recovery screen if reassigned (@Snarling)
- Fixed conditions for an easter egg message (@cigarmemr)
- (Bitverse) Changed listed difficulty for BN3 to "hard"
- (CodingContract) Reduce incidence of \$0 coding contract rewards in circumstances where the reward would be \$0 (@trambelus)
- (Corporation) Added better accounting of funds transactions (@jjclark1982)
- (Corporation) Remove cooldown on starting over corporation, but maintain remaining cooldown for selling shares (@jjclark1982)
- (Corporation) Removed some legacy code that was not doing anything (@catloversg)
- (DevMenu) Added the ability to add/remove sleeves from the dev menu (@Sphyxis, @Snarling)
- (Docs) Fixed various typos in documentation (@tdpeuter)
- (Factions) Added a documentation page for faction join requirements (@jjclark1982)
- (Formulas) Added clarification for the unit of time returned by hackTime, growTime, and weakenTime functions (@d0sboots)
- (Ports) Promises from port.nextWrite resolve in the same order they were created, instead of reverse order (@LJNeon)
- (Sleeve) Add task counters for Crime and Bladeburner tasks (@TheAimMan)
- (Stock) Add some randomization to timing for stockmarket forecast change events (@Caldwell-74)
- (Terminal) Added the --all option for unalias, to allow removing all aliases (@Sphyxis)
- Nerf noodle bar (various contributors)

### UI

- Message for buying TOR router no longer implies the need to connect to darkweb (@Kelenius)
- (Company) Rework of the job location details (@jjclark1982)
- (Company) Added previous/next buttons for job location if the player has multiple jobs (@Kelenius)
- (Factions) Only show warning about enemy factions for factions with enemies (@jjclark1982)
- (Stanek) Improved the display of the Stanek grid (@Kelenius)

## v2.5.1 - 30 November 2023 Update

### NOTES

For the Steam version, any special options you have enabled in the File menu may need to be reselected after this update, due to a change in how these settings are stored.

### MAJOR ADDITIONS

- Added a faction rumors system, to learn the requirements for joining factions ingame (@jjclark1982)

### API

- (Bladeburner) Added ns.bladeburner.nextUpdate, which allows waiting for the next update of the bladeburner mechanic (@jjclark1982)
- (Bladeburner) Added ns.bladeburner.getNextBlackOp, which provides name and rank info for the next Black Operation that can be completed (@myCatsName)
- (Corporation) Added ns.corporation.nextUpdate, which allows waiting for the next update of the corporation mechanic (@jjclark1982)
- (Corporation) Added a size property to the return value of getProduct (@Caldwell-74)
- (Corporation) ns.corporation.getCorporation return value: 'state' property is deprecated. Added 'prevState' and 'nextState' properties. (@Caldwell-74)
- (Gang) Added ns.gang.nextUpdate, which allows waiting for the next update of the gang mechanic (@jjclark1982)
- (Singularity) Added a JobField enum, and used this for the ns.singularity.applyToCompany function (@alutman)
- (Singularity) ns.singularity.purchaseProgram now returns true for programs that are already owned even if the player doesn't have enough money to re-buy the program (@ncharris93)
- (Sleeve) Added nextCompletion promise as a property of sleeve bladeburner work tasks (@Snarling)
- (Stanek) Added an effect property to getFragment (@TheAimMan)
- (Stock) Added ns.stock.nextUpdate, which allows waiting for the next update of the stock mechanic (@jjclark1982)

### BUGFIX

- (Bladeburner) Fixed a bug that could allow reaching -1 contracts available (@TheAimMan)
- (Corporation) Fix an incorrect calculation when adding more employees to an office (@Caldwell-74)
- (Corporation) Bulk purchase can no longer be used to exceed maximum warehouse capacity (@TheAimMan)
- (Corporation) Fixed a bug that allowed out-of-order research (@TheAimMan)
- (Corporation) Product production cost is stored separately for each city (@Caldwell-74)
- (Sleeve) Sleeve crime work can no longer cause an overflow of %completion when performing quick crimes during bonus time (@TheAimMan)
- (Stanek) Multipliers from Stanek are now calculated correctly even if the player has Entropy (@yichizhng)
- (Stanek) Fix a bug where Stanek bonuses were not being removed correctly after a reset (@TheAimMan)
- Fix an error that would occur in some cases when using gymGains or universityGains (@cigarmemr)
- Fix tab autocompletion when running a sceript without the run command (@mytskine)
- Fix a bug that could cause the wrong coding contract to be deleted when using rm (@TheAimMan)
- Scripts no longer show \$0 for offline money income (@alutman)
- Faction invitations are now cleared properly when performing a reset (@alutman)
- API functions that work on a hostname no longer work on servers that have not been added to the network. (@TheAimMan)
- Fix an issue where the "True Recursion" achievement could be granted incorrectly (@jjclark1982)

### MISC

- (Sleeve) Added ability to set a sleeve to idle through the UI (@Sphyxis)
- Updated lots of dependencies (@Caldwell-74)
- Updated electron to the latest version (Steam version only) (@Snarling)
- Various spelling / grammar / wording fixes (@ficocelliguy, @Squirlll, @Warrobot10)
- Minor reorganization and streamlining in Script Editor code (@Snarling)
- Tweaked the .lit file referencing Illuminati to give a better idea about joining requirements (@d0sboots)
- (Steam version) Replaced outdated electron-config with electron-store (@tiziodcaio)

### UI

- (Corporation) Improved the display of corporation state. (@Caldwell-74)
- (Corporation) Improved various Corporation UIs (@jjclark1982)
- (Gang) Removed the territory warfare toggle from the main Gang screen (@Tyasuh)
- Added number of exploits to import savegame comparison (@myCatsName)
- Dev menu improvements (@myCatsName, @Snarling)
- Added a credits button on the options page (@myCatsName)

## v2.5.0 (10/2/2023)

### NOTES

(Corporation) Bugfixes in Corporation may cause a large balance shift for this mechanic.

### HOTFIXES

- 10/4/23: Fixed an issue that caused popups (like faction invitations) to still appear during infiltration (@Snarling)

### API CHANGES:

- ns.print and ns.tprint now handle printing Set and Map objects directly (@ficocelliguy)
- ns.spawn can now use a configurable delay instead of always 10 seconds (@muesli4brekkies)
- (Corporation) Added CorporationDivisions property to BitNodeMultipliers interface (@Caldwell-74)
- (Corporation) Added makesMaterials and makesProducts properties to CorpIndustryData interface (@Caldwell-74)
- (Corporation) Added issueNewSharesCooldown property to the CorporationInfo interface (@Caldwell-74)
- (Corporation) Significantly lowered ram cost of all corporation functions (@jjclark1982)
- (Gang) Added ns.gang.getRecruitsAvailable: Gets the number of additional gang members that can currently be recruited (@myCatsName)
- (Gang) Added ns.gang.respectForNextRecruit: Gets the respect threshold for recruiting the next gang member (@myCatsName)
- (Gang) Added ns.gang.renameMember: Renames a gang member (@myCatsName)

### BUGFIX

- Taking a university class no longer gives the player an achievement for working out in a gym (@myCatsName)
- Bash keybind ctrl-C clears an ongoing terminal history search (@ncharris93)
- (Corporation): Fix bug in valuation calculation (@yichizhng)
- (Corporation): Fix bug in share price calculation (@jjclark1982)
- (Corporation) "Same sell amount in all cities" works with Products again (@Caldwell-74)
- (Hashnet) Buying multiple company favor upgrades at the same time will actually apply them all instead of just one (@aschmider)

### OTHER CHANGES

- MISC: Improved handling of aliases in the Terminal (@ficocelliguy)
- MISC: Improved error messages for ns.getPurchasedServer (@ficocelliguy)
- MISC: ns.sleep and ns.asleep now show a formatted time in the script log. (@ficocelliguy)
- MISC: Fix an exploit that allowed over 100% utilization of a server's ram (@d0sboots)
- MISC: (Bladeburner / Sleeve) Bladeburner training action is available for sleeves (@Zelow79)
- MISC: (Gang) Renamed the Territory Warfare mechanic (now referred to as Territory Clashes) to deconflict with the Territory Warfare gang member task (@ficocelliguy)
- UI: Infiltration now hides tail windows instead of temporarily removing them from the page. This means position/size will remain as they were before the infiltration, and any React content will remain active instead of being unmounted/remounted (@ficocelliguy)
- UI: Faction augmentation page updates more reliably (@zerbosh)
- UI: Added a text filter on the Faction Augmentations page (@ficocelliguy)
- UI: Improved pagination of Active Scripts page (@Ookamiko, @ficocelliguy)
- UI: Icarus message no longer shows repeatedly for players that are in the endgame (@ficocelliguy)
- UI: Remove work completion dialogs when performing an augmentation install (@ficocelliguy)
- UI: Improve soft reset dialog, and always show dialog when soft resetting (@myCatsName)
- UI: While closing, modals no longer update displayed info and become inert (@Snarling)
- UI: (Bladeburner) Fix a possible NaN display value in Bladeburner (@zerbosh)
- UI: (Corporation) Multiple UI improvements for Corporation (@jjclark1982)
- UI: (Corporation) Tweaked some number formatting to look better in Corp and Stats page (@zerbosh)
- UI: (Corporation) Market TA no longer has its own dialog box, it's set in the normal sell dialog (@Caldwell-74)
- UI: (Corporation) Fix an incorrect value in the party dialog box (@aschmider)
- UI: (Corporation) Improved the descriptions for Corporation states (@Caldwell-74)
- UI: (Gang) Various UI improvements for Gang (@myCatsName)
- DOCS: Improve documentation for ports (@muesli4brekkies)
- DOCS: Updated documentation for ns.tail and ns.getScriptLogs to make it clear a PID can be used (@myCatsName)
- DOCS: Improve documentation for FilenameOrPID functions (@VictorS)
- DOCS: Improved various existing ingame documentation pages (@myCatsName)
- DOCS: (Bladeburner / Gang) Added initial ingame documentation for Bladeburner and Gang (@myCatsName)
- DOCS: (Bladeburner / Gang) Improve API documentation for Bladeburner and Gang functions (@myCatsName)

## v2.4.1 Update (8/26/23)

### FEATURE ADDITIONS:

- Added "Enable terminal history search with arrow keys" option in Misc options category, inspired by similar functionality in shells like zsh. (@ficocelliguy)

### BUGFIX:

- Fixed a bug where buying NeuroFlux Governor would buy one less level than expected (@zerbosh)
- Fixed an issue that could cause the Coding Contract UI to become unreachable (@myCatsName)
- Infiltration: Knowledge of Apollo aug no longer highlights the incorrect wires (@Snarling)

### CODEBASE / DOCS / MISC:

- Added a new theme "zerenity" (@Zelow79)
- Reorganize game constants (@zerbosh)
- Reorganize ingame documentation folder structure, simplify documentation bundling (@Snarling)
- IP Address coding contract accepts single-quoted entries (@myCatsName)
- Updated an outdated message on ns.killall logs (@myCatsName)
- Updated documentation for ns.share and ns.getSharePower (@myCatsName)
- Removed functions (like ns.getServerRam) are no longer shown when enumerating ns entries. (@Snarling)
- Removed more references to ReadTheDocs that remained after 2.4.0 (@hydroflame)
- Fixed some typos/spacing (@myCatsName)
- Fixed an issue with incorrect React keys in active scripts page (@zornlemma)

### API CHANGES (NON-SPOILER)

- Added ns.stock.getConstants (@Snarling)
- Added ownedAugs and ownedSF properties to return data of ns.getResetInfo (@Snarling)

### API CHANGES (SPOILERS):

- Added ns.singularity.getAugmentationFactions to provide a list of factions that have a given augmentation (@myCatsName)
- ns.corporation.getConstants now has a ram cost of 0 (@Snarling)

### OTHER CHANGES (SPOILERS):

- Successes for next level is now accurate in the UI for Bladeburner operations (@myCatsName)
- ns.sleeve.setToFactionWork no longer allows working for factions the player has not joined (@Snarling)

## v2.4.0 - Death to readthedocs

NETSCRIPT:

- Added ns.getFunctionRamCost
- Added run and install identifier

CORP:

- Add product investment info to API
- Prevent issues with invalid materials in warehouse
- Update exportMaterial amount to `number | string`
- Validate city with office for starting product development

DOCUMENTATION:

- readthedoc.bitburner.whatever has been fully deprecated.
  That documentation is now available in-game. This will make
  documentation easier to maintain and easier to keep locked
  with the specific version of the game you're playing.
  It's also in `.md`, which is more common than `.rst`
- Add `printRaw` and `tprintRaw` docs
- Better docs for `ascension` result
- Complete the spec for hamming codes enhancement
- Fix example code for `scp`

MISC.

- Fixed a bug where RAM calculation would be innacurate for near copy of scripts on different servers
- Fix mislead error message about ram miscalculation when script contains syntax errors.
- Fix bug in calculating faction donation amount
- Fix bug where Sleeve would have difficulty doing certain University activities.
- Fix regression for crime in progress
- Prevent log scrolling on Active Script window drag
- show all skills in import save comparison tool
- Fix extremely minor calculation error where money drained after hack was being floor()
- Fix ram evaluation to include more edge-cases
- Fix potential double-free in atExit()

CODEBASE:

- Work on Enum Helper + Reorganise
- enforce eslint react checks
- corp code style improvement
- Added a lot of typesafety

## v2.3.1 - Bugfixes 7 June 2023

NETSCRIPT:

- Added ns.setTitle, which sets the titlebar of a script's tail window (@d0sboots)
- Added ns.getFunctionRamCost, which gets the ramcost of a function (@G4mingJon4s)
- ns.ls results will filter as if the filenames have a leading slash (@Snarling)

GENERAL / MISC:

- Changed tail window buttons into icon buttons, allow setting custom title, and tail window bugfixes. (@d0sboots)
- Terminal no longer scrolls to the bottom constantly while an action is being performed (@bezrodnov)
- Added a close button to modals (@bezrodnov)
- Fixed several issues with script editor tabs (@bezrodnov)
- scp terminal command can copy multiple files at once, like help text indicates (@Snarling)
- Root directory is no longer displayed as ~ in the terminal prompt, it is displayed as / (@Snarling)
- cd with no arguments will change to the root directory (@Snarling)
- Documentation updates (various)
- Nerf noodle bar

HOTFIXES (these were already backported to 2.3.0 before 2.3.1 release):

- Several important fixes for savegame migration issues from older version (@d0sboots)
- Prevent scripts from loading during intial migration to 2.3.0 save format, to prevent a crash that could occur. (@Snarling)
- Fix scp logging (hostname was being logged incorrectly in multiple places and showing as [Object object]) (@Snarling)
- Update terminal parsing logic so that the old syntax for alias works again. (@Snarling)
- Fix clickable script links from ls command not working outside root directory (@Snarling)
- Fix an issue with Find All Valid Math Expressions not accepting empty array when that was the solution. (@Snarling)
- Fix an issue with scan-analyze display when the player had AutoLink.exe (@Snarling)
- Reverted undocumented change that program filenames were case sensitive for ns.fileExists. They are case insensitive again. (@Snarling)
- An issue from pre-2.3 could cause scripts to have the wrong "server" property. This caused issues in 2.3, and a fix now repairs any scripts with a mismatched server property. (@Snarling)
- More fixes to help old savegames load correctly (@Snarling)
- Servers can no longer have infinite time-to-hack. (@Snarling)

SPOILER SECTIONS:

SF2:

- Overall gang respect gain rate now reads accurately, instead of showing ~10x. (@Snarling)

SF3:

- Added "maxProducts" property to ns.corporation.getDivision return value (@kateract)
- Fixed an issue with sell price parsing for materials (@zerbosh)
- Fixed display of market price for materials and products (@zerbosh)
- Fixes for Corp import/export issues, such as -IPROD and Smart Supply not working right (@d0sboots)
- Improvements to the max-affordable-upgrades calculation (@bezrodnov)
- Perform additional validation when setting up an export. Exports are now unique per targeted division+city. (@Snarling)
- ns.corporation.cancelExport no longer requires the exported amount (@Snarling)
- Fix NaN bug that could impact Robot material in Robotics division (@Snarling, @kateract)
- Can no longer commence product development in a city with no office (which would immediately error out the game loop) (@Snarling)
- (Hotfix) Fix issue that could lead to SF3 research desync. (@Snarling)
- (Hotfix) Fix SF3 "Spring Water" industry (@Snarling)

SF4:

- Fixed an issue that could cause singularity run-after-reset callback scripts to not launch correctly (@Snarling)

## v2.3.0 - SF3 rework and performance improvements (25 May 2023)

BREAKING CHANGES: These changes may require changes to your scripts.

- Major changes to the SF3 mechanic. See the related section below for more detailed info on the changes.
- The same script filename can now be ran multiple times with the same args. If running a script from another script (ns.run/ns.exec/etc), this limitation can be re-imposed with the preventDuplicates RunOption (see general section for info on RunOptions).
- The same .js script will now be the same js module whether the script was ran directly or used as an import. This means top-level variables (variables defined outside of any function) are shared across all instances of the script.
- The js module for a script will also be reused by any script that has the exact same compiled text, even if that script is on another server or has a different filename. This can lead to unexpected results when using top-level variables.
- Some properties removed from ns.getPlayer and added to a separate function ns.getResetInfo. These are still accessible from getPlayer but will produce a warning message the first time they are accessed per game session.
- hackAnalyzeThreads now returns -1, instead of 0, when no money can be hacked from the targeted server.
- ns.iKnowWhatImDoing has been removed, replaced by ns.tprintRaw for printing custom react content to the terminal (limited support).

PERFORMANCE:

- Minimize impact of unavoidable memory leak when modules are created, by reusing modules as much as possible (@d0sboots)
- Internal data structure changes (@d0sboots, @Snarling)
- Fix memory leak when initializing large number of netscript ports (@Snarling)
- Improve performance while on the Active Scripts page if many scripts are starting/ending. (@d0sboots)

NETSCRIPT GENERAL:

- Remove requirement for script args to be unique. This was also related to performance improvements. (@d0sboots)
- ns.hackAnalyzeThreads no longer indicates infinity any time a single thread would hack less than \$1 (@Snarling)
- ns.renamePurchasedServer no longer crashes if player is connected to the server being renamed (@Snarling)
- ns.hackAnalyzeThreads now return -1 (instead of 0) if no money can be hacked from the targeted server. (@d0sboots)
- Fix a possible infinite atExit loop if a script killed itself. (@Snarling)
- Static timestamps of last resets can be obtained via ns.getResetInfo, replacing playtimeSinceLastX from ns.getPlayer (@G4mingJon4s)
- Improved support for printing react content directly to the terminal (ns.tprintRaw) or to a script log (ns.printRaw).
- Added RunOptions, which can optionally replace the "threads" argument for ns.run/ns.exec/ns.spawn. (@d0sboots)
  - RunOptions.threads: Provide a thread count (since RunOptions can replace the threads argument)
  - RunOptions.temporary: Prevents the script execution from being included in the save file.
  - RunOptions.ramOverride: Provide a static ram cost for the script to override what is calculated by the game. Dynamic ram checking is still enforced.
  - RunOptions.preventDuplicates: Fail to launch the script if the args are identical to a script already running.

GENERAL / MISC:

- Fixed a bug that could cause the overview skill bars to become desynced (@d0sboots)
- There is now an autoexec setting to specify a script on home to automatically run when loading the game. (@d0sboots)
- Monaco script editor updated to a newer version and has more config options available now. (@Snarling)
- Improve Electron's handling of external links (@Snarling)
- Improved support for ANSI color codes (@d0sboots)
- Improved consistency of file paths. Correct names for files no longer start with a / even if they are in a directory. (@Snarling)
- All Math Expressions contract no longer accepts wrong answers (@Snarling)
- Faction invites now trigger immediately when backdooring a server. (@Snarling)
- Fixed issue where duplicate programs could be created. (@Minzenkatze)
- UI improvements to create program page (@Minzenkatze)
- Fix inconsistency in skill xp to skill level conversion (@hydroflame)
- Updated blood donation counter to reflect number of confirmed blood donations. (@hydroflame)
- Minor improvements to ram calculation process (@Snarling)
- Improved terminal arguments detection (@Snarling)
- Improved display for ls terminal command. (@Snarling)
- Added more internal tests and improved test quality (@d0sboots)
- Various codebase improvements (@Snarling, @d0sboots)
- Documentation improvements (Many contributors)
- Nerf noodle bar

SPOILER SECTIONS:

SF2:

- Corrected the "Next equipment unlock" text for member upgrades. (@LiamGeorge1999)

SF3:

- Many Corporation API changes, due to functionality changes and due to property name changes. See documentation for correct usage.
- Can now have multiple divisions within the same industry. (@Mughur)
- Can now sell a division or sell the entire corporation. (@Mughur)
- Product quality now depends on material quality (@Mughur)
- Product price can be set separately per-city (@Mughur)
- Exports can be set relative to inventory or production (@Mughur)
- ns.corporation.getProduct is city-specific (@Mughur)
- Bulk purchasing is available from the start (@Mughur)
- Can buy multiple upgrades at a time, similar to hacknet node upgrades (@Mughur)
- Various UI changes (@Mughur)
- Removed happiness from employees (@Mughur)
- Coffee renamed to tea (@Mughur)
- Training position renamed to intern (@Mughur)
- More options for SmartSupply (@Mughur)
- Advertising nerf (@Mughur)
- Nerfed investors and reduced effectiveness of "fraud" (@Mughur)
- Fixed React errors, renamed most corp object properties (@Snarling)
- Various other changes (@Mughur, @Snarling)

SF4:

- Faction invites trigger immediately when running ns.singularity.getFactionInvitations (@Snarling)
- Added ns.singularity.getCompanyPositionInfo (@jeek)

SF6:

- Failing a contract or operation now consumes the action (@Zelow79)

SF9:

- The SF9.3 bonus is also given to the player when inside of BN9. (@Zelow79)
- Adjusted the SF1 bonus for hacknet costs (slight nerf), and raised the SF9 bonus to compensate. (@d0sboots)
- Added option to purchase company favor using hashes. (@jeek)

SF10:

- Sleeve shock recovery now scales with intelligence. (@Tyasuh)
- Sleeve kills during crimes count towards numPeopleKilled (@Zelow79)
- Fix a misspelled moneySourceTracker call for sleeves (@zerbosh)
- ns.sleeve.getTask return value now includes cyclesNeeded where applicable (@Snarling)
- Internal type refactoring on Sleeve Work. (@Snarling)

SF12:

- Fix inconsistency in how BN12 multipliers were calculated

SF13:

- Improve performance of Stanek's gift update cycle, and rework (buff) bonus time handling. (@Snarling)

## v2.2.2 - 21 Feb 2023

PLANNED 2.3 BREAKING CHANGES:

- 2.3 will include a large planned rework to corporation. This may cause api breaks for any corporation scripts, and there will be large changes in how the corporation mechanic functions.

NETSCRIPT API:

- Added ns.formatNumber, ns.formatRam, and ns.formatPercent, which allow formatting these types of numbers the same way the game does (@Snarling, See UI section).
- Deprecated ns.nFormat. Likely to be removed in 2.3. Now just directly wraps numeral.format (@Snarling)
- EXPERIMENTAL CHANGE (may be reverted next patch): BasicHGWOptions now allows specifying a number of additionalMsec. This should allow easier and more reliable coordination
  of completion times for hack, grow, and weaken. Since this is an experimental change, be prepared for a possible API break next patch if you use this functionality. (@d0sboots)

- Corporation API:

  - Fix bugs with ns.corporation.setAutoJobAssignment. (@zerbosh and @croy)

- Formulas API:

  - Added ns.formulas.hacking.growThreads function (@d0sboots)

- Sleeve API:

  - ns.sleeve.getTask now also includes cyclesWorked for the task types where this applies. (@Zelow79)
  - Added ns.sleeve.setToIdle function (@Zelow79)

- Unsupported API:

  - Added ns.printRaw - allows printing custom React content to script logs. Use at your own risk, misuse is very likely to cause a crash. (@d0sboots)

ELECTRON (STEAM) VERSION:

- Fix security issue where player scripts were allowed to access any part of the player's filesystem. Now access is limited to the game's 'dist' folder. (@Snarling)

SCRIPTS:

- Fix an issue where multiple copies of the same script could be launched with same args/same server (@Mughur)
- Followup changes to API wrapping from 2.2.1 changes. (@d0sboots)

UI:

- Add new number formatting code to replace internal use of unmaintained package numeral.js. Added several Numeric Display options. (@Snarling)
- Removed ingame donation section. (@hydroflame)
- Improve some bladeburner number formatting (@Zelow79)
- Added IronMan theme (@MattiYT)
- Factions that have not been joined yet will show how many unowned augments they have available. (@Zelow79)
- Added more features to dev menu (@Zelow79 and @Snarling)

CORPORATION:

- Reverted previous change to employee needs. Now they will trend up on their own again. (@d0sboots)
- Improvements to how Market TA II works (@d0sboots)
- ns.corporation.getOffice return value now includes a totalExperience property. (@Snarling)

HACKNET:

- Hacknet servers are now named hacknet-server-# instead of hacknet-node-#. (@Tyasuh)
- Fix bug related to renaming hacknet servers (@Mughur)

GRAFTING:

- Bladeburner augs can be grafted if player is in Bladeburner faction (@Tyasuh)

DOCUMENTATION

- Many documentation updates (@Mughur, @d0sboots, @Snarling, @teauxfu).
- Official non-markdown docs are at https://github.com/bitburner-official/bitburner-src/tree/dev/src/Documentation/doc
- Official dev version markdown docs are at https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.ns.md
- Official stable version markdown docs are at https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.ns.md
- Dev version documentation is now kept up to date as changes are made. (@Snarling)

CODEBASE:

- Updated many dependencies (@d0sboots)
- Updated lots of the build processes and GitHub workflows. (@Snarling)
- Internal refactoring of how BitNode multipliers are stored (@d0sboots)
- Added some extra helper function (useRerender hook, positiveInteger ns argument validator). (@Snarling)

MISC:

- Nerf noodle bar

## v2.2.1 Hotfixes

Hotfix / bugfix:

- (@d0sboots) Implemented a new API wrapping solution that prevents the need for binding functions to ns when placing them in a new variable, but maintains and perhaps improves upon the performance gains from the previous v2.2.0 changes.
- Fixed some issues with savegames failing to load, or causing the main engine loop to stall after load.
- Fixed an issue where .script files were not receiving the correct args when ran
- Fixed an issue with sleeve HP calculation
- Possible fix for MathJax "Typesetting Failed" errors
- There was an issue with Corporations decaying their employees to 0 stats, even though the minimum was supposed to be 5. Moved the variable storing the min decay value to corporation constants, and raised it to 10.
- Regenerated documentation at https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.ns.md due to corporation changes related to min decay stats.
- Faction XP was unintentionally providing 20x the experience gain as it did prior to v2.0. This caused faction work to exceed gym/university as the optimal way to gain experience. Values have been reduced to only about 2x what they were prior to v2.0, and they are no longer better than gym/university.
- Fixed an issue where the overview skill bars could be displayed inaccurately based on player multipliers.

## v2.2.0 - Jan 2 2023 Development Reboot

Dev notes

- The previous main developer, hydroflame, is stepping back from this project for the foreseeable future. To facilitate this, we've moved the repo to a new location at https://github.com/bitburner-official/bitburner-src.
- Sorry for the large number of API breaks in this version. To ease the pain here, attempting to use any of the removed functions will provide an error guiding you to the new replacement function to use instead.

BREAKING API CHANGES:

- No longer applicable as of v2.2.1! (ns2 only) ns functions use the 'this' value from ns: if you move the function to its own variable off of ns, it needs to be bound to ns. The internal changes that make this necessary led to very large performance gains for running many scripts at once. e.g.:

  const tprint1 = ns.tprint; // This doesn't work and will error out when calling tprint1();

  const tprint = ns.tprint.bind(ns); // This works because the 'this' value is preserved.

- ns.getPlayer no longer provides properties tor, inBladeburner, or hasCorporation. This information can be looked up using standlone functions: ns.hasTorRouter(), ns.bladeburner.inBladeburner(), ns.corporation.hasCorporation().
- Removed many functions, with replacement ways to get the same info.

  - getServerRam: use getServerMaxRam and getServerUsedRam instead.
  - corporation.assignJob: use setAutoJobAssignment instead.
  - corporation.getEmployee: No longer available (employees are not individual objects).
  - corporation.getExpandCityCost: use ns.corporation.getConstants().officeInitialCost
  - corporation.getExpandIndustryCost: use getIndustryData instead.
  - corporation.getIndustryTypes: use ns.corporation.getConstants().industryNames
  - corporation.getMaterialNames: use ns.corporation.getConstants().materialNames
  - corporation.getPurchaseWarehouseCost: use ns.corporation.getConstants().warehouseInitialCost
  - corporation.getResearchNames: use ns.corporation.getConstants().researchNames
  - corporation.getUnlockables: use ns.corporation.getConstants().unlockNames
  - corporation.getUpgradeNames: use ns.corporation.getConstants().upgradeNames
  - formulas.work.classGains: split into universityGains and gymGains
  - singularity.getAugmentationCost: use getAugmentationPrice and getAugmentationRepReq instead
  - sleeve.getSleeveStats: use getSleeve instead
  - sleeve.getInformation: use getSleeve instead

- An error dialog will inform the player of the above API changes if the player tries to use one of the removed functions above.
- enums.toast was renamed ToastVariant to provide consistency with internal code.

- codingcontract.attempt always returns a string (empty string for a failed attempt). This may break player code if a direct boolean comparison (e.g. 'attemptResult === true') was being made. The string can be used directly as the conditional, because empty string evaluates to false as a boolean.

- corporation.getCorporation().divisions now returns an array of division names, instead of division objects. Use corporation.getDivision(name) to get the division info object.

DEVELOPMENT

- Development repo moved to https://github.com/bitburner-official/bitburner-src
- Dev version available on web at https://bitburner-official.github.io/bitburner-src/
- Development is active again for non-bugfix.
- A bunch of fixes, setup, and assistance related to moving to a new repo (@hydroflame)

TUTORIAL

- Removed NS1/NS2 selection. Tutorial now only references .js files (NS1 is essentially deprecated) (@Mughur)
- Fix Ram Text (by @jaculler)

NETSCRIPT

- Base NS API:
  - More enums and more types are exposed to the player instead of "magic strings", as type documentation and on ns.enums.
  - Added ns.pid property to access a script's PID without a function call. (@jeek)
  - Much faster API wrapping on script launch. (@d0sboots) To support this, ns functions need to keep their "this" value from their parent object.
  - tFormat: Fix display for negative time
  - ns.getPlayer: removed tor, inBladeburner, and hasCorporation properties
  - Added ns.hasTorRouter() function.
- Coding Contract API
  - ns.codingcontract.attempt always returns a string. (@Snarling)
- Corporation API
  - Removed ns.corporation.getEmployee and ns.corporation.assignJob, due to employees no longer being objects.
  - Added ns.corporation.hasCorporation()
  - Reworked how ram costs are applied for corporation.
- Formulas API
  - ns.formulas.work.classGains removed, replaced with ns.formulas.work.universityGains and ns.formulas.work.gymGains (@Snarling)
  - Add ns.formulas.work.companyGains function (@AlexeyKozhemiakin)
- Ports
  - added portHandle.nextWrite() (@LJNeon)
  - Make ns.writePort synchronous (@Snarling)
- Sleeve API
  - ns.sleeve.getSleeve added. getPlayer and getSleeve can both be used for formulas. (@Snarling)
  - getSleeve also includes storedCycles (i.e. bonusTime) (@zerbosh)
- Stock API
  - ns.stock.getOrganization added for getting org from stock symbol (@SamuraiNinjaGuy)

SCRIPTS

- Fixed bug where zombie scripts could be created after a soft reset (@Snarling)
- Scripts now have a maximum ram cost of 1024GB per thread.

SCRIPT LOGS

- Add ctrl-a support for selecting all text in tail window (@Snarling)

CORPORATION

- Remove corp employees as objects (by @Kelenius)
- API access is provided automatically if the player is in BN3. (@zerbosh)
- Happiness/Energy/Morale trend down even for productive corps (by @Snarling)
- Typo fixes in modals to sell materials and products (by @quacksouls)
- Reworked MP formula validation to prevent possible save corruption on invalid entry (by @Snarling)
- Internal reorganization of Industry data (by @Snarling)
- Added check to material buy amount (by @G4mingJon4s)
- Check there is room to make a new product before opening popup. (by @G4mingJon4s)
- Fix typos in research descriptions (by @quacksouls)

SLEEVE

- Fixed inconsistencies in how sleeve work rewards are handled. (by @Snarling)
- Fix bug that prevented selecting some crimes from UI. (by @Snarling)
- Internally shock starts at 100 and lowers to 0. Previously this was backwards.

STOCKMARKET

- Fix broken initializer when manually buying WSE access (by @Snarling)

TERMINAL

- Added changelog command to re-display the changelog dialog.
- Connect command will connect to player owned servers from anywhere. (by @Snarling)

UI

- Improve UI performance of sidebar and character overview using memoization (@d0sboots)
- Other UI additions / improvements (@Mughur, @d0sboots, probably others)
- Fixed spacing of text in Trade for reputation button after Infiltration (by @PyroGenesis)
- Fix spacing on ANSI background escape codes (by @Snarling)
- Fix several instances where newlines were not being displayed properly (by @quacksouls)
- SoftResetButton.tsx Tooltip changed to make more sense (by @rai68)
- GANG: Fix Gang UI to correctly report the bonus time multiplier as 25x (by @TheMas3212)
- Change formatting for skill levels to use localeStr (@G4mingJon4s)

DOC

- Fix incorrect examples for grow (by @quacksouls)
- Updated limitMaterialProduction() and limitProductProduction() documentation to mention removing limits. (by @PyroGenesis)
- Add ns documentation for possible sleeve tasks (by @Snarling)
- Update documentation for workForFaction and workForCompany (by @quacksouls)
- Improve CCT documentation for HammingCodes (by @quacksouls)
- cleanup in doc of Netscript functions (by @quacksouls)
- Various other doc fixes (by @quacksouls)
- Update documentation for ns.args (by @Snarling)
- De-uglify ns.print examples (by @LJNeon)

STATS

- Fix logic for increasing HP based on defense skill levels (by @mattgarretson)
- Fix a bug where HP could be something other than max after a bitnode reset.

INFILTRATION

- Fix SlashGame scaling. (by @Snarling)

GANG

- When starting a gang, any in progress work with that faction will end. (@G4mingJon4s)

MISC

- Lots of typesafety improvements with internal code
- Remove google analytics (@hydroflame)
- Some error handling streamlining (by @Snarling)
- fix: check both ts and js source now (by @Tanimodori)
- chore: sync version in package-lock.json (by @Tanimodori)
- Better safety when loading game for multiple save corruption issues (by @Snarling)
- Nerf Noodle bar

## v2.1.0 - 2022-09-23 Remote File API

Dev note

- The most important change about this update is the introduction of the Remote File API (RFA).
  With this we also deprecate the HTTP file API and the Visual Studio extension. Those things
  were made during the rush of Steam and aren't well thought out. This new process works with
  both the web and Steam version of the game and every text editor. Moving forward we also
  won't be doing much, if any, upgrades to the in-game editor. We think it's good enough for
  now and if you need more we recommend you hook up your favorite external editor.

--- NEW FEATURES ---

- New Remote File API for transmitting files to the game (by @Hoekstraa)
- Added a new Augmentation, Z.O.Ë., which allows Sleeves to benefit from Stanek.

--- FIXES ---

API

- Remove incorrectly placed 's' in ns.tFormat() (by @LJNeon)
- More ports (previously max 20, now practically unlimited) (by @Hoekstraa)
- Corp functions now return copy of constant arrays instead of the original (by @Mughur)
- All the player sub-objects need to be copied for `getPlayer`. (by @MageKing17)
- add corp get<constant> functions, UI (by @Mughur)
- destroyW0r1dD43m0n now properly gives achievements
- favor now properly syncs across pages and the Donate achievement is now given correctly (by @Aerophia)
- getCrimeStats use bitnode multipliers in the output of crime stats (by @phyzical)
- add singularity function for exporting game save back (by @phyzical)

CODING CONTRACTS

- inconsistent probability for generation between online and offline (by @quacksouls)
- Don't stringify answer if already a string (by @alainbryden)
- change input handling for contract attempts (by @Snarling)

CORPORATION

- Bunch of corporation fixes (by @Mughur)
- Gave investors some economics classes (by @Mughur)
- Limit shareholder priority on newly issued shares (by @Undeemiss)
- dont take research points for something already researched via api (by @phyzical)

CORPORATION API

- Fix up param order for limitProductProduction to match docs (by @phyzical)
- Expose exports from Material (by @Rasmoh)

DOCUMENTATION

- update docs a bit more, amending some BN and SF texts (by @Mughur)
- Fixed Argument order for scp() (by @njalooo)
- Some typo fixes in Netscript functions (by @quacksouls)
- Why use Coding Contract API (by @quacksouls)
- typo fix in description of Caesar cipher (by @quacksouls)
- typo fix in terminal.rst (by @BugiDev)
- Update bitburner.sleeve.settobladeburneraction.md (by @borisflagell)
- Correct documentation for `run()` with 0 threads. (by @MageKing17)
- Some doc updates (by @Mughur)
- fix documentation for remote api (by @hydroflame)

NETSCRIPT

- Added functions to resize, move, and close tail windows
- ns.exit now exits immediately (by @Snarling)
- Fix dynamic ram check (by @Snarling)
- ns1 wraps deeper layers correctly. (by @Snarling)
- Prevent bladeburner.setActionLevel from setting invalid action levels (by @MPJ-K)
- Typo fixes in CodingContract, Hacknet, Singularity APIs (by @quacksouls)
- Fix a typo in doc of Singularity.travelToCity() (by @quacksouls)
- Update netscript definition file for scp, write, read, and flags (by @Snarling)
- Correct missing ! for boolean coercion in Corporation.createCorporation(). (by @Risenafis)
- Normalized Stock API logging (by @Snarling)
- allow null duration in toast ns function (by @RollerKnobster)
- Correct missing `!` for boolean coercion in `singularity.workForCompany()`. (by @MageKing17)
- ns.scp and ns.write are now synchronous + fix exec race condition (by @Snarling)
- atExit now allows synchronous ns functions (by @Snarling)
- Improve real life CPU and memory performance of scripts. (by @Snarling)
- Prompt Add user friendly message to avoid throwing recovery screen for invalid choices (by @phyzical)
- Rerunning a script from tail window recalculates ram usage (by @Snarling)
- The correct script will be closed even if the player modifies args (v2.0) (by @Snarling)
- Corrected ns formula for infiltration rewards (by @ezylot)
- Add singularity check for finishing company work (by @Snarling)

SLEEVES

- Allow using the regeneration chamber with sleeves to heal them. (by @coderanger)
- fix crash when player tries to assign more than 3 sleeves to Bladeburner contracts (by @Snarling)
- Sleeves no longer crash when player quits company sleeve was working (by @Snarling)
- Sleeve crime gain bitnode multiplier fix (by @Mughur)

REMOTE FILE API

- NetscriptDefinitions retains export strings (by @Hoekstraa)
- Fix type of RFAMessages with non-String results (by @Hoekstraa)

UI

- add a setting to display middle time unit in Time Elapsed String (by @hydroflame)
- fix incorrect experience display in Crime UI. (by @SilverNexus)
- Bitnode stats now show if BB/Corporation are disabled (by @Kelenius)
- Removed three empty lines from BB status screen (by @Kelenius)
- Add missing space to BN7 description (by @hex7cd)
- Improvements to crime work UI (by @Kelenius)
- Script Editor more responsive on resize, and fix dirty file indicator (by @Snarling)

MISC

- Added weight to GangMemberTask construction call (by @ezylot)
- Fix ANSI display bugs (by @Snarling)
- Debounce updateRAM calls in script editor. (by @Snarling)
- Allow characters & and ' in filenames (by @Snarling)
- Corrected tutorial text (by @mihilt)
- Fix infil definitions.d.ts (by @phyzical)
- Modify PR template (by @Hoekstraa)
- crime gains, sleeve gang augs and faq (by @Mughur)
- Preventing server starting security level from going above 100 (by @Shiiyu)
- Adds Shadows of Anarchy (by @Lagicrus)
- Added intormation about hacking managers to hacking algorithms page (by @Kelenius)
- Fix Jest CI Error (by @geggleto)
- multiple hasAugmentation checks didn't check if the augment was installed (by @Mughur)
- & (by @G4mingJon4s)
- Adds info regarding augments and focus (by @Lagicrus)
- Removed console.log line (by @dhosborne)
- Update some doc (by @hydroflame)
- trying to fix int problems (by @hydroflame)
- Fix broken ns filesnames (by @hydroflame)
- new formula functions (by @hydroflame)
- test fixes/md updates (by @phyzical)
- Remove "based" from positive adjectives in infiltrations (by @faangbait)
- minor fix in instance calculation (by @hydroflame)
- fix dynamic ram miscalc not triggering (by @hydroflame)
- Refactor game options into separate components (by @hydroflame)
- fix settings unfocusing on every key stroke (by @hydroflame)
- fix some stuff with the timestamp settings (by @hydroflame)
- Fix unique key problem with ascii elements (by @hydroflame)
- Improve wrong arg user message and add ui.windowSize (by @hydroflame)
- fix stack trace missing in some errors (by @hydroflame)
- Fix scp and write in ns1 (by @hydroflame)
- Did some changes of the remote api and added documentation (by @hydroflame)
- Add dummy function to generate a mock server or player for formulas stuff (by @hydroflame)
- fix compile error (by @hydroflame)
- regen doc (by @hydroflame)
- rm console log (by @hydroflame)
- regen doc (by @hydroflame)
- Added more info about blood program, change some aug descriptions (by @hydroflame)
- use triple equal (by @hydroflame)
- Minor improvements to Netscript Port loading and unloading (by @hydroflame)
- Fix hostname generation being weird about dash 0 added (by @hydroflame)
- upgrade version number. (by @hydroflame)
- Nerf noodle bar.

## v2.0.0 - 2022-07-19 Work rework

API break rewards

- Everyone is awarded 10 NFG.
- All work in progress program is auto completed.
- All work in progress crafting is auto completed without adding entropy.

  Work (Create program / Work for faction / Studying / etc ...)

- Working has been rebuilt from the grounds up. The motivation for that change is that all
  different types of work all required different cached variables on the main Player object.
  This caused a lot of bugs and crashes. It's been reworked in such a way as to prevent bugs
  and make it nearly trivial to add new kinds of work. However, since this caused a few API break
  I've decided to mark this version following semver protocols and call it 2.0.0
- Crime can be unfocused and auto loops, no more spam clicking.
- All work type give their reward immediately. No need to stop work to bank rewards like reputation.
- Faction and Company work no longer have a time limit.
- Company work no longer reduces rep gain by half for quitting early.
- Company faction require 400k rep to join (from 200k)
- Backdooring company server reduces faction requirement to 300k.
- All work generally no longer keep track of cumulative gains like exp and reputation since it's applied instantly.
- getPlayer returns way less fields but does return the new 'currentWork' field, some fields are moved around.

API breaks

- workForCompany argument 'companyName' is now not-optional
- commitCrime now has 'focus' optional parameter
- using getScriptIncome to get total income has been separated to getTotalScriptIncome.
- using getScriptExpGain to get total income has been separated to getTotalScriptExpGain.
- scp has it's 2 last argument reversed, the signature is now (files, destination, optional_source)
- ns.connect and other singularity function are no longer available at the top level.
  They were already hidden from documentation but now they're gone.
- stock.buy and stock.sell were renamed to stock.buyStock and stock.sellStock because 'buy' and 'sell'
  are very common tokens.
- corporation.bribe no longer allows to give shares as bribe.

  Netscript

- Add singularity.getCurrentWork
- Add singularity.getAugmentationBasePrice
- Add sleeve.getSleeveAugmentationPrice
- Add sleeve.getSleeveAugmentationRepReq
- Fix infiltration.getInfiltrationLocations
- Singularity.goToLocation support for non-city-specific locations (@Ansopedian)
- All corporation functions are synchronous. Job assignment only works on the following cycle. (@stalefishies)
- Add batch functionality to NS spendHashes API (@undeemiss)
- Fix #3661 Add missing memory property to Sleeve API (@borisflagell)
- FIX#3732 Cannot assign two sleeve on "Take on contracts" regardless of contract type. (@borisflagell)

  Corporation

- Dividend fixes and exposing dividends info via scripts (@stalefishies)
- Add big number format support in some Corporation's modal (@borisflagell)
- Fix #3261 Industry overview number formatting (@violet)

  Multipliers

- The main player object was also plagues with a million fields all called '\*\_mult'. Representing the different multipliers
- These have been refactored in a field called 'mults'.

  Misc.

- #3596 Enhanced terminal command parsing (@RevanProdigalKnight)
- Fix #3366 Sleeve UI would sometimes displays the wrong stat while working out. (@borisflagell)
- Two new encryption themed contracts - caesar and vigenere (@Markus-D-M)
- Fixes #3132 several Sleeve can no longer works concurrently in the same company (@borisflagell)
- FIX #3514 Clear recently killed tab on BN end event (@Daniel-Barbera)
- HammingCodes description and implementation fixes (@s2ks)
- FIX #3794 Sleeve were getting less shocked when hospitalized (was positive, should have detrimental) (@borisflagell)
- Fix #3803 Servers can no longer have duplicate IPs (@crimsonhawk47)
- Fix #3854 ctrl+c does not clear terminal input (@evil-tim)
- Nerf noodle bar, obviously.
