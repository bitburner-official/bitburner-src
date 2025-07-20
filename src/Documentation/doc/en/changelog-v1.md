# Changelog - Legacy v1

## v1.6.3 - 2022-04-01 Few stanek fixes

Stanek Gift

- Has a minimum size of 2x3
- Active Fragment property 'avgCharge' renamed to 'highestCharge'
- Formula for fragment effect updated to make 561% more sense.
  Now you can charge to your heart content.
- Logs for the 'chargeFragment' function updated.

  Misc.

- Nerf noodle bar.

## v1.6.0 - 2022-03-29 Grafting

** Vitalife secret lab **

- A new mechanic called Augmentation Grafting has been added. Resleeving has been removed.
- Credit to @violet for her incredible work.

** Stanek **

- BREAKING: Many functions in the stanek API were renamed in order to avoid name collision with things like Map.prototype.get

** UI **

- Major update to Sleeve, Gang UI, and Create Program (@violet)
- re-add pre tags to support slash n in prompt (@jacktose)
- Tabelize linked output of 'ls' (@Master-Guy)
- Add the ability to filter open scripts (@phyzical)
- Add minHeight to editor tabs (@violet)
- Properly expand gang equipment cards to fill entire screen (@violet)
- Add shortcut to Faction augmentations page from FactionsRoot (@violet)
- Fix extra space on editor tabs (@violet)
- Present offline message as list (@DSteve595)
- add box showing remaining augments per faction (@jjayeon)
- Add tab switching support to vim mode (@JParisFerrer)
- Show current task on gang management screen (@zeddrak)
- Fix for ui of gang members current task when set via api (@phyzical)
- Don't hide irrelevant materials if their stock is not empty and hide irrelevant divisions from Export (@SagePtr)
- Fix regex to enable alpha transparency hex codes (8 digits) (@surdaft)

** API **

- Added dark web functions to ns api
- BREAKING: purchaseTor() should returns true if player already has Tor. (@DavidGrinberg, @waffleattack)
- Implement getBonusTime in Corporation API (@t-wolfeadam)
- Added functions to purchase TIX and WSI (@incubusnb)
- purchaseSleeveAug checks shock value (@incubusnb)
- Fix bug with hacknet api
- Fix spendHashes bug
- Added 0 cost of asleep() (@Master-Guy)
- Fix some misleading corporation errors (@TheRealMaxion)
- expose the inBladeburner on the player object (@phyzical)
- added ram charge for stanek width and height (@phyzical)
- Fix sufficient player money check to buy back shares. (@ChrissiQ)
- Fix Static Ram Circumventing for some NS functions (@CrafterKolyan)
- added CorporationSoftCap to NetscriptDefinitions (@phyzical)
- Added definition of autocomplete() 'data' argument. (@tigercat2000)
- Adding support for text/select options in Prompt command (@PhilipArmstead)
- Added the ability to exportGame via api (@phyzical)

** Arcade **

- Added an arcade to New Tokyo where you can play a 4 year old version of bitburner.

** Misc. **

- Add a warning triggered while auto-saves are off. (@MartinFournier)
- Log info for field analysis now displays actual rank gained. (@ApamNapat)
- Removed BladeburnerSkillCost from skill point cost description. (@ApamNapat)
- Fix handling for UpArrow in bladeburner console. (@dowinter)
- Add GitHub action to check PRs for generated files. (@MartinFournier)
- Cap Staneks gift at 25x25 to prevent crashes. (@waffleattack)
- Remove old & unused files from repository. (@MartinFournier)
- Factions on the factions screens are sorted by story progress / type. (@phyzical)
- Fix log manager not picking up new runs of scripts. (@phyzical)
- Added prettier to cicd.
- UI improvements (@phyzical)
- Documentation / Typos (@nanogyth, @Master-Guy, @incubusnb, @ApamNapat, @phyzical, @SagePtr)
- Give player code a copy of Division.upgrades instead of the live object (@Ornedan)
- Fix bug with small town achievement.
- Fix bug with purchaseSleeveAug (@phyzical)
- Check before unlocking corp upgrade (@gianfun)
- General codebase improvements. (@phyzical, @Master-Guy, @ApamNapat)
- Waiting on promises in NS1 no longer freezes the script. (@Master-Guy)
- Fix bug with missing ramcost for tFormat (@TheMas3212)
- Fix crash with new prompt
- Quick fix to prevent division by 0 in terminal (@Master-Guy)
- removed ip references (@phyzical, @Master-Guy)
- Terminal now supports 'ls -l'
- Fix negative number formatting (@Master-Guy)
- Fix unique ip generation (@InDieTasten)
- remove terminal command theme from docs (@phyzical)
- Fix 'Augmentations Left' with gang factions (@violet)
- Attempt to fix 'bladeburner.process()' early routing issue (@MartinFournier)
- work in progress augment fix (@phyzical)
- Fixes missing space in Smart Supply (@TheRealMaxion)
- Change license to Apache 2 with Commons Clause
- updated regex sanitization (@mbrannen)
- Sleeve fix for when faction isnt found (@phyzical)
- Fix editor "close" naming (@phyzical)
- Fix bug with sleeves where some factions would be listed as workable. (@phyzical)
- Fix research tree of product industries post-prestige (@pd)
- Added a check for exisiting industry type before expanding (@phyzical)
- fix hackAnalyzeThreads returning infinity (@chrisrabe)
- Make growthAnalyze more accurate (@dwRchyngqxs)
- Add 'Zoom -> Reset Zoom' command to Steam (@smolgumball)
- Add hasOwnProperty check to GetServer (@SagePtr)
- Speed up employee productivity calculation (@pd)
- Field Work and Security Work benefit from 'share' (@SagePtr)
- Nerf noodle bar.

## v1.5.0 - Steam Cloud integration

** Steam Cloud Saving **

- Added support for steam cloud saving (@MartinFournier)

** UI **

- background now matches game primary color (@violet)
- page title contains version (@MartinFourier)
- Major text editor improvements (@violet)
- Display bonus time on sleeve page (@MartinFourier)
- Several UI improvements (@violet, @smolgumball, @DrCuriosity, @phyzical)
- Fix aug display in alpha (@Dominik Winter)
- Fix display of corporation product equation (@SagePtr)
- Make Bitverse more accessible (@ChrissiQ)
- Make corporation warehouse more accessible (@ChrissiQ)
- Make tab style more consistent (@violet)

** Netscript **

- Fix bug with async.
- Add 'printf' ns function (@Ninetailed)
- Remove blob caching.
- Fix formulas access check (@Ornedan)
- Fix bug in exp calculation (@qcorradi)
- Fix NaN comparison (@qcorradi)
- Fix travelToCity with bad argument (@SlyCedix)
- Fix bug where augs could not be purchased via sing (@reacocard)
- Fix rounding error in donateToFaction (@Risenafis)
- Fix bug with weakenAnalyze (@rhobes)
- Prevent exploit with atExit (@Ornedan)
- Double 'share' power

** Corporations **

- Fix bugs with corp API (@pigalot)
- Add smart supply func to corp API (@pd)

** Misc. **

- The file API now allows GET and DELETE (@lordducky)
- Force achievement calculation on BN completion (@SagePtr)
- Cleanup in repository (@MartinFourier)
- Several improvements to the electron version (@MartinFourier)
- Fix bug with casino roulette (@jamie-mac)
- Terminal history persists in savefile (@MartinFourier)
- Fix tests (@jamie-mac)
- Fix crash with electron windows tracker (@smolgumball)
- Fix BN6/7 passive reputation gain (@BrianLDev)
- Fix Sleeve not resetting on install (@waffleattack)
- Sort joined factions (@jjayeon)
- Update documentation / typo (@lethern, @Meowdoleon, @JohnnyUrosevic, @JosephDavidTalbot,
  @pd, @lethern, @lordducky, @zeddrak, @fearnlj01, @reasonablytall, @MatthewTh0,
  @SagePtr, @manniL, @Jedimaster4559, @loganville, @Arrow2thekn33, @wdpk, @fwolfst,
  @fschoenfeldt, @Waladil, @AdamTReineke, @citrusmunch, @factubsio, @ashtongreen,
  @ChrissiQ, @DJ-Laser, @waffleattack, @ApamNapat, @CrafterKolyan, @DSteve595)
- Nerf noodle bar.

## v1.4.0 - 2022-01-18 Sharing is caring

** Computer sharing **

- A new mechanic has been added, it's is invoked by calling the new function 'share'.
  This mechanic helps you farm reputation faster.

** gang **

- Installing augs means losing a little bit of ascension multipliers.

** Misc. **

- Prevent gang API from performing actions for the type of gang they are not. (@TheMas3212)
- Fix donation to gang faction. (@TheMas3212)
- Fix gang check crashing the game. (@TheMas3212)
- Make time compression more robust.
- Fix bug with scp.
- Add zoom to steam version. (@MartinFourier)
- Fix donateToFaction accepts donation of NaN. (@woody-lam-cwl)
- Show correct hash capacity gain on cache level upgrade tooltip. (@woody-lam-cwl)
- Fix tests (@woody-lam-cwl)
- Fix cache tooltip (@woody-lam-cwl)
- Added script to prettify save file for debugging (@MartinFourier)
- Update documentation / typos (@theit8514, @thadguidry, @tigercat2000, @SlyCedix, @Spacejoker, @KenJohansson,
  @Ornedan, @JustAnOkapi, @violet, @philarmstead, @TheMas3212, @dcragusa, @XxKingsxX-Pinu,
  @paiv, @smolgumball, @zeddrak, @stinky-lizard, @violet, @Feodoric, @daanflore,
  @markusariliu, @mstruebing, @erplsf, @waffleattack, @Dexalt142, @AIT-OLPE, @deathly809, @BuckAMayzing,
  @MartinFourier, @pigalot, @lethern)
- Fix BN3+ achievement (@SagePtr)
- Fix reputation carry over bug (@TheMas3212)
- Add button to exit infiltrations (@TheMas3212)
- Add dev menu achievement check (@TheMas3212)
- Add 'host' config for electron server (@MartinFourier)
- Suppress save toast only works for autosave (@MartinFourier)
- Fix some achievements not triggering with 'backdoor' (@SagePtr)
- Update Neuroflux Governor description.
- Fix bug with electron server.
- Fix bug with corporation employee assignment function (@Ornedan)
- Add detailed information to terminal 'mem' command (@MartinFourier)
- Add savestamp to savefile (@MartinFourier)
- Dev menu can apply export bonus (@MartinFourier)
- Icarus message no longer applies on top of itself (@Feodoric)
- purchase augment via API can no longer buy Neuroflux when it shouldn't (@Feodoric)
- Syntax highlighter should be smarter (@neuralsim)
- Fix some miscalculation when calculating money stolen (@zeddrak)
- Fix max cache achievement working with 0 cache (@MartinFourier)
- Add achievements in the game, not just steam (@MartinFourier)
- Overflow hash converts to money automatically (@MartinFourier)
- Make mathjax load locally (@MartinFourier)
- Make favor calculation more efficient (@kittycat2002)
- Fix some scripts crashing the game on startup (@MartinFourier)
- Toasts will appear above tail window (@MartinFourier)
- Fix issue that can cause terminal actions to start on one server and end on another (@MartinFourier)
- Fix 'fileExists' not correctly matching file names (@TheMas3212)
- Refactor some code to be more efficient (@TheMas3212)
- Fix exp gain for terminal grow and weaken (@violet)
- Refactor script death code to reject waiting promises instead of resolving (@Ornedan)
- HP recalculates on defense exp gain (@TheMas3212)
- Fix log for ascendMember (@TheMas3212)
- Netscript ports clear on reset (@TheMas3212)
- Fix bug related to company (@TheMas3212)
- Fix bug where corporation handbook would not be correctly added (@TheMas3212)
- Servers in hash upgrades are sorted alpha (@MartinFourier)
- Fix very old save not properly migrating augmentation renamed in 0.56 (@MartinFourier)
- Add font height and line height in theme settings (@MartinFourier)
- Fix crash when quitting job (@MartinFourier)
- Added save file validation system (@TheMas3212)
- React and ReactDOM are now global objects (@pigalot)
- 'nano' supports globs (@smolgumball)
- Character overview can be dragged (@MartinFourier)
- Job page updates in real time (@violet)
- Company favor gain uses the same calculation as faction, this is just performance
  the value didn't change (@violet)
- ns2 files work with more import options (@theit8514)
- Allow autocomplete for partial executables (@violet)
- Add support for contract completion (@violet)
- 'ls' link are clickable (@smolgumball)
- Prevent steam from opening external LOCAL files (@MartinFourier)
- Fix a bug with autocomplete (@Feodoric)
- Optimise achievement checks (@Feodoric)
- Hacknet server achievements grant associated hacknet node achievement (@Feodoric)
- Fix display bug with hacknet (@Feodoric)
- 'analyze' now says if the server is backdoored (@deathly809)
- Add option to exclude running script from save (@MartinFourier)
- Game now catches more errors and redirects to recovery page (@MartinFourier)
- Fix bug with autocomplete (@violet)
- Add tooltip to unfocus work (@violet)
- Add detailst overview (@MartinFourier)
- Fix focus bug (@deathly809)
- Fix some NaN handling (@deathly809)
- Added 'mv' ns function (@deathly809)
- Add focus argument to some singularity functions (@violet)
- Fix some functions not disabling log correctly (@deathly809)
- General UI improvements (@violet)
- Handle steamworks errors gravefully (@MartinFourier)
- Fix some react component not unmounting correctly (@MartinFourier)
- 'help' autocompletes (@violet)
- No longer push all achievements to steam (@Ornedan)
- Recovery page has more information (@MartinFourier)
- Added 'getGameInfo' ns function (@MartinFourier)
- SF3.3 unlocks all corp API (@pigalot)
- Major improvements to corp API (@pigalot)
- Prevent seed money outside BN3 (@pigalot)
- Fix bug where using keyboard shortcuts would crash if the feature is not available (@MartinFourier)\
- Sidebar remains opened/closed on save (@MartinFourier)
- Added tooltip to sidebar when closed (@MartinFourier)
- Fix bug where Formulas.exe is not available when starting BN5 (@TheMas3212)
- Fix CI (@tvanderpol)
- Change shortcuts to match sidebar (@MartinFourier)
- Format gang respect (@attrib)
- Add modal to text editor with ram details (@violet)
- Fix several bugs with singularity focus (@violet)
- Nerf noodle bar.

## v1.3.0 - 2022-01-04 Cleaning up

** External IDE integration **

- The Steam version has a webserver that allows integration with external IDEs.
  A VSCode extension is available on the market place. (The documentation for the ext. isn't
  written yet)

** Source-Files **

- SF4 has been reworked.
- New SF -1.

** UI **

- Fix some edge case with skill bat tooltips (@MartinFournier)
- Made some background match theme color (@Kejikus)
- Fix problem with script editor height not adjusting correctly (@billyvg)
- Fix some formatting issues with Bladeburner (@MartinFournier, @violet)
- Fix some functions like 'alert' format messages better (@MageKing17)
- Many community themes added.
- New script editor theme (@Hedrauta, @Dexalt142)
- Improvements to tail windows (@theit8514)
- Training is more consise (@mikomyazaki)
- Fix Investopedia not displaying properly (@JotaroS)
- Remove alpha from theme editor (@MartinFournier)
- Fix corporation tooltip not displaying properly (@MartinFournier)
- Add tooltip on backdoored location names (@MartinFournier)
- Allow toasts to be dismissed by clicking them (@violet)
- Darkweb item listing now shows what you own. (@hexnaught)

** Bug fix **

- Fix unit tests (@MartinFournier)
- Fixed issue with 'cat' and 'read' not finding foldered files (@Nick-Colclasure)
- Buying on the dark web will remove incomplete exe (@hexnaught)
- Fix bug that would cause the game to crash trying to go to a job without a job (@hexnaught)
- purchaseServer validation (@violet)
- Script Editor focuses code when changing tab (@MartinFournier)
- Fix script editor for .txt files (@65-7a)
- Fix 'buy' command not displaying correctly. (@hexnaught)
- Fix hackAnalyzeThread returning NaN (@mikomyazaki)
- Electron handles exceptions better (@MageKing17)
- Electron will handle 'unresponsive' event and present the opportunity to reload the game with no scripts (@MartinFournier)
- Fix 'cp' between folders (@theit8514)
- Fix throwing null/undefined errors (@violet)
- Allow shortcuts to work when unfocused (@MageKing17)
- Fix some dependency issue (@locriacyber)
- Fix corporation state returning an object instead of a string (@antonvmironov)
- Fix 'mv' overwriting files (@theit8514)
- Fix joesguns not being influenced by hack/grow (@dou867, @MartinFournier)
- Added warning when opening external links. (@MartinFournier)
- Prevent applying for positions that aren't offered (@TheMas3212)
- Import has validation (@MartinFournier)

** Misc. **

- Added vim mode to script editor (@billyvg)
- Clean up script editor code (@Rez855)
- 'cat' works on scripts (@65-7a)
- Add wordWrap for Monaco (@MartinFournier)
- Include map bundles in electron for easier debugging (@MartinFournier)
- Fix importing very large files (@MartinFournier)
- Cache program blob, reducing ram usage of the game (@theit8514)
- Dev menu can set server to \$0 (@mikomyazaki)
- 'backdoor' allows direct connect (@mikomyazaki)
- Github workflow work (@MartinFournier)
- workForFaction / workForCompany have a new parameter (@theit8514)
- Alias accept single quotes (@sporkwitch, @FaintSpeaker)
- Add grep options to 'ps' (@maxtimum)
- Added buy all option to 'buy' (@anthonydroberts)
- Added more shortcuts to terminal input (@Frank-py)
- Refactor some port code (@ErzengelLichtes)
- Settings to control GiB vs GB (@ErzengelLichtes)
- Add electron option to export save game (@MartinFournier)
- Electron improvements (@MartinFournier)
- Expose some notifications functions to electron (@MartinFournier)
- Documentation (@MartinFournier, @cyn, @millennIumAMbiguity, @2PacIsAlive,
  @TheCoderJT, @hexnaught, @sschmidTU, @FOLLGAD, @Hedrauta, @Xynrati,
  @mikomyazaki, @Icehawk78, @aaronransley, @TheMas3212, @Hedrauta, @alkemann,
  @ReeseJones, @amclark42, @thadguidry, @jasonhaxstuff, @pan-kuleczka, @jhollowe,
  @ApatheticsAnonymous, @erplsf, @daanflore, @violet, @Kebap, @smolgumball,
  @woody-lam-cwl)

## v1.1.0 - 2021-12-18 You guys are awesome (community because they're god damn awesome)

** Script Editor **

- The text editor can open several files at once. (@Rez855 / @Shadow72)
  It's not perfect so keep the feedback coming.

** Steam **

- Windows has a new launch option that lets player start with killing all their scripts
  This is a safety net in case all the other safety nets fail.
- Linux has several launch options that use different flags for different OS.
- Debug and Fullscreen are available in the window utility bar.
- Tried (and maybe failed) to make the game completely kill itself after closing.
  This one I still don't know wtf is going.
- No longer has background throttling.
- Default color should be pitch black when loading
- Add BN13: Challenge achievement.

** Tutorial **

- I watched someone play bitburner on youtube and reworked part of
  the tutorial to try to make some parts of the game clearer.
  https://www.youtube.com/watch?v=-_JETXff4Zo
- Add option to restart tutorial.

** Netscript **

- getGangInformation returns more information.
- getAscensionResult added
- getMemberInformation returns more info
- Formulas API has new functions for gang.
- Added documentation for corp API.
- exec has clearer error message when you send invalid data.
- getServer returns all defined field for hacknet servers.
- Fix a bug with scp multiple files (@theit8514)
- Stack traces should be smarter at replacing blobs with filenames
- Fix a weird error message that would occur when throwing raw strings.
- Fix shortcuts not working.
- Re-added setFocus and isFocused (@theit8514)
- new function getHashUpgrades (@MartinFournier)
- enableLog accepts "ALL" like disableLog (@wynro)
- toast() doesn't crash on invalid data (@ivanjermakov)
- alert() doesn't crash on invalid data (@Siern)
- Fixed an issue where scripts don't run where they should.
- Sleeve getInformation now returns cha
- getServer does work with no argument now
- workForFaction returns false when it mistakenly returned null

** Character Overview **

- The character overview now shows the amount of exp needed to next level (@MartinFournier)

** Misc. **

- Add option to supress Game Saved! toasts (@MartinFournier)
- Fix bug where ctrl+alt+j was eaten by the wrong process. (@billyvg)
- Theme Editor lets you paste colors (@MartinFournier)
- ctrl + u/k/w should work on terminal (@billyvg)
- Game now shows commit number, this is mostly for me. (@MartinFourier)
- running a bad script will give a clearer error message (@TheCoderJT)
- Default terminal capacity is maximum (@SayntGarmo)
- Fix problems with cp and mv (@theit8514)
- Make monaco load fully offline for players behind firewalls.
- change beginer guide to use n00dles instead of foodnstuff
- BN13 is harder
- nerf int gain from manualHack
- Fix UI displaying wrong stats (@DJMatch3000)
- Fix button not disabling as it should.
- New location in Ishima.
- Add setting to suppress stock market popups.
- Typo fixes (@Hedrauta, @cvr-119, @Ationi, @millennIumAMbiguity
  @TealKoi, @TheCoderJT, @cblte, @2PacIsAlive, @MageKing17,
  @Xynrati, @Adraxas, @pobiega)
- Fix 100% territory achievement.
- Reword message on active scripts page.
- Fix terminal not clearing after BN
- Remove references to .fconf
- Augmentation pages shows BN difficulty with SF5
- Fix scripts saving on wrong server while 'connect'ing
- Fix gym discount not working.
- Fix scan-analyze not working with timestamps
- Hash upgrades remember last choice.
- Save files now sort by date
- The covenant no longer supports negative memory purchases
- Fix corp shares buyback triggering by pressing enter
- Staneks gift display avg / num charges
- Infiltration rewards no longer decay with better stats
- terminal 'true' is parsed as boolean not string
- tail and kill use autocomplete()
- Fix focus for coding contract
- massive boost to noodle bar.

** Special Thanks **

- Special thank you to everyone on Discord who can answer
  new player questions so I can focus on more important things.

## v1.1.0 - 2021-12-03 BN13: They're Lunatics (hydroflame & community)

** BN13: They're Lunatics **

- BN13 added.

** Steam **

- Tested on all 3 major OS.
- 94 achievements added
- Release is 2021-12-10.

** Corporation API **

- Added corporation API. (Unstable)

** Netscript **

- tprintf crashes when not giving a format as first arg.
- tprintf no longer prints filename (@BartKoppelmans)
- TIX buy/sell/sellShort all return askprice/bidprice (@Insight)
- getRunningScript now works.
- Fix disableLog for gang and TIX API
- getOwnedSourceFiles is not singularity anymore (makes it easier to share scripts.) (@theit8514)
- true/false is a valid value to send to other scripts.
- workForFaction no longer returns null when trying to work for gang.
- Scripts logging no longer generates the string if logging is disabled.
  This should give performance boost for some scripts.

** Gang **

- Gang with 0 territory can no longer fight
- Territory now caps at exactly 0 or 1.

** Misc. **

- Clicking "previous" on the browser will not pretend you had unsaved information
  allowing you to cancel if needs be.
- Fixed some tail box coloring issue.
- Fixed BladeBurner getCityCommunities ram cost
- The download terminal command no longer duplicate extensions (@Insight)
- Fix #000 on #000 text in blackjack. (@Insight)
- Remove reference to .fconf
- Tail boxes all die on soft reset.
- Fix codign contract focus bug.
- Megacorp factions simply re-invite you instead of auto added on reset. (@theit8514)
- Tail window is bound to html body.
- Infiltration reward is tied to your potential stats, not your actual stats
  So you won't lose reward for doing the same thing over and over.
- intelligence lowers program creation requirements.
- Terminal parses true as the boolean, not the string.
- Tail and kill autocomplete using the ns2 autocomplete feature.
- scan-analyze doesn't take up as many terminal entries.
- GangOtherInfo documentation now renders correctly.
- ActiveScripts search box also searches for script names.
- Infinite money no longer allows for infinite hacknet server.
- Blackjack doesn't make you lose money twice.
- Recent Scripts is now from most to least recent.
- Fix mathjax ascii art bug in NiteSec.
- Remove warning that the theme editor is slow, it's only slow in dev mode.
- In BN8 is it possible to reduce the money on a server without gaining any.
- In the options, the timestamp feature has a placeholder explaining the expected format.
- Bunch of doc typo fix. (hydroflame & @BartKoppelmans & @cvr-119)
- nerf noodle bar

## v1.0.2 - 2021-11-17 It's the little things (hydroflame)

** Breaking (very small I promise!) **

- buy / sell now return getAskPrice / getBidPrice instead of just price.
  This should help solve some inconsistencies.

** Misc. **

- scripts logs are colorized. Start your log with SUCCESS, ERROR, FAIL, WARN, INFO.
- documentation for scp not say string | string[]
- Donation link updated.
- nerf noodle bar

## v1.0.1 - 2021-11-17 New documentation (hydroflame)

** Documentation **

- The new documentation for the netscript API is available at
  https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.ns.md
  This documentation is used in-game to validate the code, in-editor to autocomplete, and
  for users to reference. This is a huge quality of life improvements for me.

** Reputation **

- Fixed favor not affecting faction work reputation gain (Yeah, I know right?)

** Hacknet **

- Servers are now considerd "purchasedByPlayers"

** Script Editor **

- solarized themes now work.

** Corporation **

- Dividends are now much more taxed.
- The 2 upgrades that reduced taxes are now much stronger.

** Misc. **

- Starting / Stopping scripts on hashnet servers immediately updates their hash rate (instead of on the next tick)
- Hacknet has tooltip showing what the result of the upgrade would be.
- Augmentations page displayes current price multiplier as well as explains the mechanic.
- Terminal now is 25x stronger.
- Tail boxes use pre-wrap for it's lines.
- Tail boxes allow you to rerun dead scripts.
- Tail boxes can no longer open the same one twice.
- Terminal now autocompletes through aliases.
- Make alter reality harder.
- Fix bladeburner cancelling actions when manually starting anything with Simulacrum.
- Buying hash upgrade to increase uni class or gym training will apply to current class.
- Internally the game no longer uses the decimal library.
- Fix an issue where 'download \*' would generate weird windows files.
- Timestamps can be set to any format in the options.
- Fix typo in documentation share popup.
- Remove bunch of debug log.
- Fix typo in corporation handbook literature.
- Fix typo in documentation
- Fix duplicate SF -1 exploit. (Yeah, an exploit of exploits, now were meta)
- Fix offline hacking earning being attributed to hacknet.
- nerf noodle bar

## v1.0.0 - 2021-11-10 Breaking the API :( (blame hydroflame)

** Announcement **

- Several API breaks have been implemented.
- See the v1.0.0 migration guide under Documentation
- Everyone gets 10 free neuroflux level.

** Netscript **

- Fix a bug that would cause RAM to not get recalculated.
- New function: hackAnalyzeSecurity
- New function: growthAnalyzeSecurity
- New function: weakenAnalyze

** Script Editor **

- Sometimes warn you about unawaited infinite loops.
- ns1 functions are now correctly colors in Monokai.

** Programs **

- Formulas.exe is a new program that lets you use the formulas API.

** Corporations **

- Real Estate takes up a tiny bit of room.
- Dividends are now taxes exponentially in certain bitnodes.
- UI displays how many level of each corporation upgrade.
- Fix exploit with going public.
- Employee salary no longer increase.

** Documentation **

- The documentation is now autogenerated into .md files.
  It is usable but not yet linked to readthedocs. It's on github.

** Misc. **

- Favor is not internall floating point. Meaning I don't have to save an extra variable.
- Manually starting a Bladeburner action cancels unfocused action.
- Updated description of gang territory to be clearer.
- Hacknet expenses and profit are in different categories.
- Fixed favor equation.
- Toast messages aren't hidden behind work in progress screen.
- Fix bug that made infiltration checkmark look off by one.
- Fix some inconsistency with running files that start or don't start with /
- Can't tail the same window twice.
- Added recovery mode. Hopefully no one will ever have to use it.
- Fix readthedocs
- Programs now give int exp based on time not program.
- Many sing. functions now give int exp.
- Active Scripts page now displays some arguments next to script name.
- Fixed some invisible black text.
- Button colors can be edited.
- Added 2 new colors in the theme editor: background primary and background secondary.
- infiltration uses key instead of keycode so it should work better on non-american keyboards.
- buff noodle bar.
