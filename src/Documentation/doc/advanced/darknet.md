# The Darkweb Network

(work-in-progress documentation)

The internet is the largest datastream in the world, and thus the most heavily surveiled. Not everyone wants their actions followed, though.

Leaving the internet behind and turning to the dark web, however, comes with its risks... and potential rewards. A person with the right know-how (and enough charm to survive on their wits alone) can find their way into less-than-secure computers connected to that unregulated network. A person like you, perhaps.

### Network structure

Unlike the traditional BitBurner network, the darknet is constantly changing. Servers may sometimes restart, change its connections to other servers, or even go offline indefinitely. The network is also not a simple tree. It contains loops of connections, lost servers, and disconnected islands to explore.

In addition, servers on the darknet are not freely accessible from anywhere. Generally, they can only be interacted with or modified if you (or your script) is running on a directly connected nearby server. This means you will need to find a way to make deployers that can roam the network, or duplicate themselves.

In some cases, the only way to get to some places is to hitch a ride on a server when it moves to another part of the network.

### Gaining server access

The servers cannot be broken into with a few scripts you can buy off-of-the-shelf. You must find a way to crack the password of each one to run scripts on it and pass through it. Fortunately, each server provides some hints and feedback as you attempt to guess the password, and you will find that similar models of computer have similar vulnerabilities. You will need those passwords later, so make sure to store them somewhere you won't lose if a server goes offline! If you aren't sure how to guess a server's auth codes, look around for notes on darkweb servers you have already unlocked; they may have hints for how to solve some of the puzzles (and sometimes other helpful data, too.)

Darknet servers require a password to interact with. You can use `await ns.dnet.authenticate(hostname, password)` to see if a password is correct. (Remember to await it, network requests take time!) The higher your charisma, the faster you can smooth-talk your way through these vulnerable servers' passwords. Using more threads also speeds up this process. However, it may be faster to divide up the work across multiple scripts, if you can coordinate them.

### Taking advantage of stolen credentials

Once you figure out the password for a server, you can use that in the darknet API to write to that server. For example, you might want to copy and run a script to that server like this:

```js
ns.dnet.scp("crawler.js", hostName, password);
ns.dnet.exec("crawler.js", hostName, password);
```

Remember that you must be in a directly connected server to write to a target! Use `ns.dnet.scan()` to see the darknet servers connected to your current server.

### Treasure!

Sometimes you will find valuable data in .cache files on servers you unlock. They can contain money or experience, darkweb programs, or even stock market access keys. They can be opened via `run` from the terminal, or `ns.dnet.openCache(fileName)` from a script on that server.

### Alternate approaches

If you get stuck on a puzzle, you can try to brute-force it. Most servers will tell you their password length and format, allowing you to try each of the possibilities. It's not likely to be fast, but it's an option.

If you don't want to wait on that, you can social-engineer your way around it. Not everyone uses secure internet connections, and a lot of interesting things can be pulled from their network traffic... including passwords. `await ns.dnet.packetCapture(hostName)` will let you spend some time scraping data from outgoing packets from that server. Most of what you overhear will be useless, but the password will eventually be inside some of that garbage, sooner or later. (It may take a long time to stumble upon the password on higher-difficulty servers, though!)

### Other helpful API methods

`ns.dnet.getServer(hostName)` can give you relevant details about a darknet server, notably its modelId (which is key to identifying its vulnerabilities)

`ns.dnet.killall(hostname, password)` will let you cleanly kill all scripts on a nearby connected server. If called without arguments, it kills all other scripts on the current server instead.

==========================

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

## patches:

- Fully removed errors from authenticate() (outside of passing a bool instead of a string type validations). It now returns status codes with text descriptions. The detail below is also included in the docs for authenticate.
  Response status types:
  "200 Success" - Authentication was successful.
  "401 Unauthorized" - Authentication failed. The password is incorrect.
  "404 Not Found" - The server was not found. The server may be offline or the hostname is invalid.
  "408 Request Timeout" - The request failed (though the password may or may not have been correct). Caused by network instability.
  "301 Moved Permanently" - The server has moved to a different location and is no longer connected to the current server.
  "418 I'm a teapot" - ~~The server is a teapot and cannot brew coffee.~~ The target server is not a darknet server.

- A successful authenticate() gives the script a "session" (aka whitelists its PID.) This allows it to run exec() on the target server. (exec does not require a password anymore, but does require a session)

- Added connectToSession(). It is similar to authenticate (whitelists the script's PID given the correct password) except it is nearly instant and very cheap, and also works on stasis linked and backdoored servers (not just direct connection). However, it requires root access to the server in addition to the password (meaning you need to have already successfully authenticate()'d on that server from somewhere. It always fails [even if you have the right password] if the server does not have root access gained). It is intended to be used by child scripts or remote scripts, or an error-less way to check a server's status/existence via response codes in the returned object.

- Added probe(). Shows all immediate neighbors (all connected servers, including darknet ones) to the server the script is running on. Cannot be used to probe a remote server, only the script's current server.

- darknet UI only shows connections to servers connected to servers with root access (the same visibility as probe()). Other nearby servers are visible, too, but you can't see any of their connections or their hostname. They're just to encourage exploration.

- Terminal `scan` shows all connected servers, even darknet. ns.scan() does not show darknet servers (but still shows `darkweb` as normal). `scan-analyze` does not show darknet servers (but still shows `darkweb` as normal). (this can be reworked if it is confusing)

- added isDarknetServer(): free test to see if the given hostname is a darknet server. Returns false if the server is not a darknet server or does not exist (does not throw errors)

- added dnet.stasisLink(): adds or removes a stasis link from the current server. Makes the server connectable remotely (via connectToSession() with the correct password). Also prevents the server form moving or going offline. Does not prevent nearby servers from moving or going offline, though, so connections can still be lost

- removed dnet.exec in favor of ns.exec. Exec itself does not need a password, but the target server requires a session with the current script (via authenticate or connectToSession with the right password), root access, and a direct connection or stasis link or backdoor.

- removed dnet.scp in favor of ns.scp. The SOURCE server requires a session. This means that pulling files FROM the darkweb requires a session, but writing to anywhere is restricted.

- Backdoored servers are more likely to be targeted for restarts (which remove backdoors) or going offline, which makes them less reliable and naturally reduces their number over time
- Backdooring too many servers starts to accrue a debuff to authenticate() time taken
- Backdooring too many servers starts causing authenticate() to fail with a timeout error, requiring a retry
- added dnet.getCurrentDarknetInstability() to view the current debuff and timeout chances

- added current server depth to getServer()

- Reduced ram cost of authenticate
- bugfixes

---

- added more lore and partial password hint files to servers. Most servers should not be empty now.

- auth gives response codes based on what happened instead of throwing

  - "200 Success" | "401 Unauthorized" | "404 Not Found" | "408 Request Timeout" | "301 Moved Permanently"

- some hints to the password, or extra info from the last password attempted, can sometimes appear in packet capture

- clicking on a server name in the UI modal copies the hostname to clipboard

- small bugfixes

## TODO:

lab: join together multiple mazes?

scp: add session details to docs
exec: add session details to docs

IP stuff for probe

Catlover writeup: https://discord.com/channels/415207508303544321/1358930422607642845/1360131828756775033
My suggestion: Create many layers and cliques. We are still consistent in the behavior of APIs, but each layer (or clique) has a unique purpose. A very rough guideline:
Low tier:
Accessible from BN1.
Low rewards.
Easy to set up "foothold" (backdoor/stasis link).
Suitable for testing scripts.
Have many volatile servers.
Clique:
001: Darkweb and some servers with easy minigames.
002: Some servers with easy minigames.
Mid tier:
Require SF.
Better rewards.
Harder to set up foothold.
Have many cliques. Each clique may require a different strategy.
Have fewer volatile servers, but some special cliques have volatile servers leading to high tier.
High tier: AKA "The Wild West"
Very good rewards.
Require resilient scripts. Running scripts can be terminated randomly.
Don't rely on foothold. Even foothold can be wiped!
Git gud.

We need to give the player a way to set up a foothold, at least in low/mid layers. Stasis link looks like a good idea. Backdoor should be "nerfed" heavily. For example, more backdoor = more risk (e.g., server may go offline immediately, may trigger a "scan" on all servers in the same clique, each scanned+backdoored server may go offline, negatively affect volatile servers). Each clique may have a different strategy (e.g., different threshold of backdoor, chance of going offline, performing scan).

- a macguffin you have to get to be able to access the darkweb ('darkscape navigator'?)

darkweb has multiple connections to home?

Small book-keeping request. Usually "data" in the form of enums or constants we typically store in a data folder so it's easier to find.

- backdooring increases darknet instability
  - backdoored servers more likely to restart and/or loose auth, removing backdoor, balancing risk level
  - low number (1 backdoor per X depth explored, or less than low const): no effect
  - lv 1 instability: small debuff to auth() time
  - lv 2: sometimes auth fails with timeout
  - lv 3: more server restarts on the darknet
  - lv 4: It's hard to sustain this many backdoors without a lot of upkeep due to them going offline or resetting. More connection severing on the darknet. player starts taking damage sometimes. creepypasta appears on player terminal, signed by the darknet.
  - lv 5: ports and file writes and other ns methods sometimes fail silently, or return garbage data. hard mode that is effectively opt-in

backdoored and stasis link'd servers need visual indicators

packet capture shows extra password hints, sometimes mastermind one? sometimes a digit/char contained? sometimes something else?

Make network wider at deeper parts?

preventDuplicates on the run options is very powerful here, and almost necessary to stop sepuku on the player's machine. Should be emphasised in the docs

a button to kill all darknet scripts

The differences between nuked, authenticated and connected get difficult to keep track of on the swarm.

have a clear immediate reward from tier 1 that isn't just cha XP

formulas: auth response time or estimates given CHA level

sake of suspense: perhaps hide the network past current+3 levels

- access only to connected or backdoored server for dnet exec

- add Stasis Link mechanic

  - Limited resource
  - Cap can be raised somehow
  - Prevents server from mutating
  - Backdoors server
  - Can be removed to free up resource for somewhere else

- mini version of darknet on pre- bn15?

- very occasional un-backdooring?

- occasional changing hostnames

- start with crash course?

- more hint notes

- unlocked server viewer: polish?

- ub3r_l4byr1nth server

  - special cache: gives augments
  - can give TRP
  - treasure chests in maze?
  - traps or monsters in maze?
  - grue?

- make darkwebserver extend baseServer

- colorful servers?

- servers renamed occasionally?
- scripts go down sometimes?

- File/status viewer for darkweb servers?

- server that returns yes/no in its failure response

  - yes, the password has X as one of its factors

- server that returns a string in response to the attempt?

  - result: (encoded attempt) expectation: (encoded password)

- WEBSTORM

  - Runs on a timer, or when logging in after being online for a while?
  - upgrade to harden scripts against restarts?
  - some actions delay or impend the webstorm?
  - webstorm needs indicator when starting and when recovering
  - the oncoming of a storm is broadcast on every active packet capture, allowing player to capture on any server to monitor this

- Attempt to make connection?

  - chance to put current server offline?
  - chance to move the target server
  - only nearby servers are valid

- New augments?

  - Some given by lab
  - Some in various factions
  - Give cha? what else?

- session token?

## TODO later:

- reward that scales password attempt speed?
- reward that speeds up packet sniffing speed?

- bonus time?

- slow down net mutations

- Darkweb server cha difficulty balance?

- Bitnode multipliers

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

stock market boosts? grow and hack?

- final boss with special cache

  - unique augs?
  - interactive proof problem?
  - blind maze solving?
  - T14m4t the m0th3r

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

- phishing attack?

  - what will this look like?
  - Failing severs the connection?
  - success chance scales off of cha?

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

- enemy scripts?

  - Sometimes player script is overwritten by nothing but an empty script that occasionally logs something ominous
  - Sometimes servers are full because of bloated, idle, non-player scripts

- Hubs or superconnections?
- treasure chest server?

- standard network viewer?

- hide servers not yet explored near? (later upgrade?)
  - show all servers button / upgrade
