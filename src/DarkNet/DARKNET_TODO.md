## Playtest thread link:

https://discord.com/channels/415207508303544321/1358930422607642845/1358930424281432127

## TODO:

- Tweak gang balance
- Tweak new city aug balance

- tweak induceServerMigration balance

- performance
- icon for stasis link

- more hint notes

- access .lit and .data files from UI

## Post MVP:

- Lab interactions: doors, chests, mimics, grue

- stanek fragments for darkweb

- ui methods for setting server description, colors, icons etc?

- Attempt to make connection?
  - chance to put current server offline?
  - chance to move the target server
  - only nearby servers are valid

webstorm screen glitch / text? https://codepen.io/Juxtopposed/pen/MWPmaww ?

- server that returns yes/no in its failure response

- server that returns a string in response to the attempt?

  - result: (encoded attempt) expectation: (encoded password)

most common item in array server
more leetcode array manipulation servers
more guess and check servers
verbal description of simple math problem (nth root of depth)
basic cypher server?

## Community feedback:

https://discord.com/channels/415207508303544321/459097632896188436/1350613323737071727
https://discord.com/channels/415207508303544321/459097632896188436/1345773862263984208
https://discord.com/channels/415207508303544321/415213435974975508/1352628138261086339
https://discord.com/channels/415207508303544321/415207839246581781/1358753789435314176
https://discord.com/channels/415207508303544321/415207923506216971/1174839532131188736

## Idea scratch space

Inspections run on a couple servers periodically, requiring scripts be shut down and files removed temporarily? What would the dangers be?

retrieving passwords from other parts of the game?

- Opportunities to buy passwords to servers not yet cracked?

- database server

  - basic "encryption" on its txt file
  - contains user data file with multiple user passwords?

- honeypot servers

  - black hole - kill any script that tries to scp stuff onto it
  - rickroll reward cache (`Apr1Events.emit();`)
  - "ad virus" - logs adds to the toast or to terminal. Can be removed from player's home server?

  - packet sniffing shows signature things for honeypots

    - empty string for black hole
    - lyrics for rickroll?
    - totally normal server .jpeg

  - glitchy UI?
  - grey plague?
  - stat debuff?
  - scripts crash?
  - rickroll?
  - "virus" file saved on home computer?

  - accept all passwords?
  - Edit scripts running on them?

- man in the middle attack?

  - listen / intercept messages?
  - Will they just fill up a percent bar to gain a char in the password?

- simple ciphers or basic password encoding?

  - sha1 with no key & no salt?
  - base64 encoding?
  - found in notes on servers sometimes
  - found in password hints sometimes

- api unreliability?

  - small chance for api to crash script, requiring fallbacks or health monitors
  - small chance to sever connection on each failed password check?
    - increases with server difficulty? Decreases with cha?
  - log server moved / connection broken vs server is gone
  - identify server remaining uptime?

- treasure chest server?

- standard network viewer?

# Darkweb network expansion project

Design document and workspace

## Goals:

- Add a variety of (simplified) real-life problems for the player to solve
- Add a number of much smaller and simpler coding problems than CCTs (puzzles, not research projects)
- Flesh out the dark web (which doesn't do hardly anything currently) with a new, shifting, non-tree network
- Add benefits to the under-utilized charisma stat

## Gameplay:

- The darknet and the servers on it are not reliable

  - Servers will sometimes move around the dark web, severing old connections and adding new ones
  - The darkweb can be circular (it is not a tree) and it also will not be fully connected
  - Some areas can only be accessed by "hitching a ride" on a server that moved there
  - Servers will occasionally go offline, sometimes permanently, and new servers will periodically be added
  - Players will need to build redundancy or fallback systems to handle failing servers or connections
  - Some servers change their generated names or IPs occasionally, requiring the player to mark them somehow?

- Players will sometimes discover things on servers they gain access to

  - Hints to different types of security vulnerabilities in .lit files
  - Hints for passwords for other servers in text files
  - CCTs
  - caches with (small) money or xp rewards, or sometimes programs or even TIX access

- Player will solve simple password/auth puzzles to gain access to servers (which can be automated)
  - puzzle: password that is openly visible, or not required at all
  - puzzle: mastermind/wordle style password guessing with feedback
  - vulnerability: simple dictionary attacks like "it's the default password" or "my dog's name"
  - vulnerability: "timing" attacks (the listed "response time" increases based on how many correct chars you submit)
  - puzzle: simple parsing. the password is the value of this short math expression in a string
  - The player will need to find, store, and re-use those passwords

## Scripting

- Some API methods will only work if you are adjacent to (or running on) the target server
  - mapping the network and deploying scripts is important
  - dealing with moving servers or changing connections is important
  - no "spooky action at a distance" remotely run from the safety of home!
- Some API methods will scale off of charisma (and give cha xp)
  - e.g. Lower time taken to submit a password guess with higher charisma

# Real-life problems to solve

- Environment unreliability hardening: servers will sometimes restart or go offline, sometimes permanently
- Central data storage and retrieval
- Building self-replicating web-crawlers
- Version control: how to handle when two different versions of a script meet, each trying to clear servers and replicate
- text parsing, looking for useful data
- Designing simple algorithms to reduce the number of password guesses required
- Cyclic graph traversal

## Rewards:

- Start with tor router permanently
- Cha stat gains from doing darkweb stuff
- Small amounts of negative karma gain
- Caches with port openers, money, xp, programs, or stock market access

- Cha contributes [very slightly] to rep gains from faction work
- Cha contributes (more?) to regular jobs' pay
- Cha contributes (more?) to job rep (needed to later join megacorp factions)
- Cha boosts the stock manipulation effects of hack and grow

---

## patches:

## PR feedback

- remove getServerSafely and use GetServer
- only give TRP based on bitnode mults
- do not give s4 data in bn8
- Make all dnet APIs gracefully handle `darkweb`

## Darknet server type overhaul

- Changed the signature of darknet servers to be more standardized
  - Now extends BaseServer
  - now has flat properties instead of inside a darknetData object
  - now implements IDarknetServer
  - now is json serializable
- dnet.getServer returns an IDarknetServer
- formulas.dnet methods now expect an IDarknetServer (and do not provide a default server)

- All stored cycles (from offline time or sleeping time etc) are treated the same
- Darknet mutation has a minimum cycle requirement to prevent rave mode
- Bonus time is detected by looking for a large pool of stored cycles
- bonus time now provides less auth speedup, but more auth xp and phishing reward money

Todo next: make `darknet` an actual IDarknetServer

## Tech debt patch

- Implemented bonus time, and saving/loading bonus time
- cleaned up api utility methods, refactored a number of files
- Start with darkscape navigator if you have SF-15 or are in BN-15
- Moving servers improved: it looks for available spaces, and expands search until it finds an open slot, to prevent failed moves in crowded rows
- Changed mutations to use game cycle loop instead of its own setTimeout on the side

## Error Reduction Patch

- keep track of offline servers (since last game restart)
- exec returns 0 if the target server is recently offline, with details in logging; does not throw error
- scp returns false if either the source or destination server is recently offline, with details in logging; does not throw error
- packetCapture now returns a `Result`, no longer errors if server is offline or not connected
- memoryReallocation gracefully returns a `Result` if target server is offline or not direct connected
- unified all result-returning API methods to have consistent logging and return messages
- getServerAuthDetails improved with `isConnectedToCurrentServer` and `hasSession` booleans to disambiguate the old `isConnected`
- induceServerMigration rework:

  - now targets a specific server
  - shows percent progress in its result & logging
  - guarantees the server moves deeper into the net once fully charged
  - Charge percent per call scales with cha & threads, and is now faster than before

- Fairly large refactor: make DarknetServer a new type that extends Server, and change up a bunch of things around detecting that

## Balance Patch 1

added `DarkscapeNavigator.exe` purchasable via tor router which (when later enabled) unlocks access to the dark net UI and API
added source-file 15 bonuses
added .lit hint for stasis linking servers
added .lit hint for lab (& that you should stasis link nearby)
added cha bonus to a number of existing augs (mainly ones that improve your influence/persuasion, skin, or eyes)
Increased lab augment cha bonuses
reduced higher lab's cha requirements, and rebalanced server difficulty scaling accordingly

## Fixes and polish patch

- added `getStasisLinkedServers` which returns a list of server hostnames (or IPs) that currently have stasis links. (replaced hasStasisLink)
- Prevent completely ram-blocked servers until deeper in net; added some tiny ram blocks in early servers
- adjusted getServer to include owner allocated ram, but fewer details from getServerAuthDetails
- added `isConnected` and `isOnline` to data returned by getServerAuthDetails. getServerAuthDetails no longer returns `null`
- improved max ram / used ram / blocked ram display & rounding

- heartbleed no longer can throw errors. instead returns a `Result & {logs: string[]}` and will let you know if a server moves
- prevented errors that can be thrown by probe and a couple other dnet methods

- Rebalanced cha requirements on servers & labs to scale into lab better
- Improved descriptions of lab augs to include stat bonuses

- modelID is now displayed on password status modal
- fixed binary encoded password puzzle

- Started on basic BN15 groundwork (shell functionality is in place, mostly placeholders currently. No SF's or BN mults yet)
- The Red Pill only can be gained from lab in BN15, it's not available through Daedalus

- Added debug button to show full darknet (slightly laggy at the moment, but it works mostly)

## Labyrinth and augment improvement patch

- Several factions now offer new augments that increase charisma and/or cha xx (including one with a shoutout to Denis in its flavor text for all his help testing.) This should help player progress in reaching charisma requirements. Many of these are not found in hacking factions.

- The Labyrinth now rewards a number of unique augments that increase charisma, auth speed, and maximum stasis links. One such augment is awarded each time a lab is completed. The maze gets larger and more complex as the player progresses.

- The darknet starts out much less deep (depth of ~8) and increases in depth each time the player completes the lab and gets a new augment.

- TRP is found in the fourth lab (out of seven), which requires a charisma of 3000

- Manual lab stops working after the third lab, requiring players to actually solve with a script instead of just using the UI

- Minor UX improvements and bugfixes

## The "player feedback" patch

- added `induceServerMigration` . Calling this method slowly builds up network instability around the current server, and each call raises the odds that one of the servers connected to the current server will move to another place in the network. This movement has a higher potential range than regular movement, so sometimes a server will go deep into a new area (or way back towards the start!)

- Sometimes a mysterious executable can be found on darknet servers. Run it at your own risk!
- Added `unleashStormSeed` accessor for... mysterious nefarious purposes

- refactored `authenticate` to return Result type. The dynamic feedback is placed in the server logs, not in the password request, to be retrieved separately.
- added `getServerAuthDetails` to get the static password hint, password format and length, and model ID

- Added new `heartbleed` method to extract the most recent server logs. Can peek at the most recent line item, or (destructively) pull up to 8 log entries from the server, starting from the most recent.

- Added additionalMsec support to both authenticate and heartbleed for fancy batch-style use

- Moved these analysis methods to a new `dnet` namespace under formulas
  getDarknetInstability
  getAuthenticateEstimatedTime
  getHeartbleedEstimatedTime
  getBlockedRam
  getExpectedRamBlockRemoved

- removed the `influence` namespace and moved its contents to base ns.dnet namespace. I didn't like how long the invocations were, and it felt like almost everything would fit there, and it made the api less discoverable.
- removed the remainder of the `analytics` namespace (moved isDarknetServer to base ns.dnet namespace)

- packetCapture can now rarely show other server's passwords

- model IDs now have evocative names instead of random numbers

### The "have stuff to do with darknet ram" patch!

Darknet servers belong to somebody already, and they are doing stuff on them. When you first find darkweb servers, often times some (or most!) of the ram will be "in use" by the owner's clearly wasteful use and needs to be... liberated.

- added `dnet.memoryReallocation`. It allows players to cleverly swindle away some of the ram in use by the owner. A reward cache can be found if all the occupied ram is reallocated to the player's use. Gains cha xp and grows the ram available to the player.
- added `dnet.analytics.getExpectedRamBlockRemoved` to see how much ram is expected to be freed up per thread

- added `dnet.promoteStock`. Spreading propaganda about a particular company or stock, while not enough to actually change the market, can increase the stock's volatility as some people buy the hype & others dump. Increases volatility by up to a factor of 3 with enough investment, but erodes over time.

- added `dnet.phishingAttack`. Gains cha xp, and occasionally gains money. Rarely can also generate a new cache reward (time limited, no more than once every 3 minutes). Allows players to gain cha xp using darknet server ram, with some upsides.

- added new method `dnet.analytics.getAuthenticateEstimatedTime` to predict the duration of an auth attempt

- Moved `getDarknetInstability` to live under new namespace `dnet.analytics`
- moved `isDarknetServer` to live under new namespace `dnet.analytics`

- added a new mutation: adding a connection to a darknet server that has none currently. This should help reduce isolated servers somewhat. Also increased darknet density slightly.

- attempting auth or packet capture on a server you do not have the charisma level for will incur a significant debuff to completion time.

- setStasisLink now returns a Result

Coming soon:

- rework authenticate() to return a Result promise

- Rework dynamic password feedback to be from a different method that can fetch a handful of results at once, to allow players to build more complex coordination for high efficiency password checking (or just run them in sequence in the same script if they don't want to do that)

---

- Fully removed errors from authenticate() (outside of passing a bool instead of a string type validations). It now returns status codes with text descriptions. The detail below is also included in the docs for authenticate.
  Response status types:
  "200 Success" - Authentication was successful.
  "401 Not Authorized" - Authentication failed. The password is incorrect.
  "401 Hostname Not Found" - The server was not found. The server may be offline or the hostname is invalid.
  "408 Request Timeout" - The request failed (though the password may or may not have been correct). Caused by network instability.
  "301 Server Has Moved" - The server has moved to a different location and is no longer connected to the current server.
  "400 Bad Request" - ~~The server is a teapot and cannot brew coffee.~~ The target server is not a darknet server.

- A successful authenticate() gives the script a "session" (aka whitelists its PID.) This allows it to run exec() on the target server. (exec does not require a password anymore, but does require a session)

- Added connectToSession(). It is similar to authenticate (whitelists the script's PID given the correct password) except it is nearly instant and very cheap, and also works on stasis linked and backdoored servers (not just direct connection). However, it requires root access to the server in addition to the password (meaning you need to have already successfully authenticate()'d on that server from somewhere. It always fails [even if you have the right password] if the server does not have root access gained). It is intended to be used by child scripts or remote scripts, or an error-less way to check a server's status/existence via response codes in the returned object.

- Added probe(). Shows all connected darknet neighbors to the server the script is running on. Cannot be used to probe a remote server, only the script's current server.

- darknet UI only shows connections to servers connected to servers with root access (the same visibility as probe()). Other nearby servers are visible, too, but you can't see any of their connections or their hostname. They're just to encourage exploration.

- Terminal `scan` shows all connected servers, even darknet. ns.scan() does not show darknet servers (but still shows `darkweb` as normal). `scan-analyze` does not show darknet servers (but still shows `darkweb` as normal). (this can be reworked if it is confusing)

- added isDarknetServer(): free test to see if the given hostname is a darknet server. Returns false if the server is not a darknet server or does not exist (does not throw errors)

- added dnet.stasisLink(): adds or removes a stasis link from the current server. Makes the server connectable remotely (via connectToSession() with the correct password). Also prevents the server form moving or going offline. Does not prevent nearby servers from moving or going offline, though, so connections can still be lost. Takes 30 seconds to apply or remove.

- removed dnet.exec in favor of ns.exec. Exec itself does not need a password, but the target server requires a session with the current script (via authenticate or connectToSession with the right password), root access, and a direct connection or stasis link or backdoor.

- removed dnet.scp in favor of ns.scp. The destination server requires a session (effectively requiring a backdoor or stasis link for remote scp INTO the darkweb, like exec)

- Backdoored servers are more likely to be targeted for restarts (which remove backdoors) or going offline, which makes them less reliable and naturally reduces their number over time
- Backdooring too many servers starts to accrue a debuff to authenticate() time taken
- Backdooring too many servers starts causing authenticate() to fail with a timeout error, requiring a retry
- added dnet.getDarknetInstability() to view the current debuff and timeout chances

- added current server depth to getServer()

- Reduced ram cost of authenticate
- bugfixes

---

- added more lore and partial password hint files to servers. Most servers should not be empty now.

- auth gives response codes based on what happened instead of throwing

  - "200 Success" | "401 Not Authorized" | "401 Hostname Not Found" | "408 Request Timeout" | "301 Server Has Moved"

- some hints to the password, or extra info from the last password attempted, can sometimes appear in packet capture

- clicking on a server name in the UI modal copies the hostname to clipboard

- small bugfixes
