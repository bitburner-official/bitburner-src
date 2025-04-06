This is currently a design document, but eventually will be the in-game player documentation for the DarkWeb mechanics.

## Goals:

- Add (slightly simplified) real-life problems that programmers face for the player to solve
- Add a number of much smaller and simpler coding puzzles than CCTs, (puzzles, not research projects)
- Flesh out the dark web, which doesn't do hardly anything currently
- Add benefits to the under-utilized charisma stat, both in the DarkWeb mechanics and outside of them

## Gameplay:

- The darknet and the servers on it are not reliable

  - Servers will sometimes move around the dark web, severing old connections and adding new ones
  - The darkweb can be circular (it is not a tree) and it also will not be fully connected
  - Some areas can only be accessed by "hitching a ride" on a server that moved there
  - Servers will occasionally go offline, sometimes permanently, and new servers will periodically be added
  - Players will need to build redundancy or fallback systems to handle failing servers or connections
  - Some servers change their generated names or IPs occasionally, requiring the player to mark them somehow?

- Players will sometimes discover things on servers they gain access to

  - Hints to different types of security vulnerabilities
  - Passwords for other servers in a note
  - Hints to parts of servers' passwords (or simple cipher / encoded password)
  - CCTs
  - caches with (small) money or xp rewards, or small rep gains for active factions
  - Opportunities to buy passwords to servers they have not yet cracked

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
- Some API methods will scale off of charisma (and give cha xp)
  - Lower time awaited to submit a password guess with higher charisma?
  - harder servers have a min cha requirement?
  - phishing success chance based off of cha?

# Real-life problems to solve

- Environment unreliability
  - servers will sometimes restart or go offline, sometimes permanently
  - scripts will sometimes die
- Central data storage and retrieval (passwords)
- Building self-replicating web-crawlers
- Version control: how to handle when two different versions of a script meet, each trying to clear servers and replicate

## Rewards:

- Start with tor router permanently?
- Cha stat gains from doing darkweb stuff
- Small amounts of negative karma gain
- Caches with port openers, money, or xp

- Cha contributes [very slightly] to rep gains from faction work
- Cha contributes (more?) to regular jobs' pay
- Cha contributes (more?) to job rep (needed to later join megacorp factions)
- Cha boosts the stock manipulation effects of hack and grow

# requirements for MVP:

- Darkweb api
  - Documentation

- start with crash course?

- more hint notes

- labyrinth nav ui 

- unlocked server viewer

- unlocked server status icons (cache, notes, scripts)

## TODO:

- ub3r_l4byr1nth server
  - maze navigation via password attempts
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

- Attempt to make connection?
  - chance to put current server offline?
  - chance to move the target server
  - only nearby servers are valid

- New augments?
  - Some given by lab
  - Some in various factions
  - Give cha? what else?

## TODO later:

- more Clue notes on servers
  - hints to vulnerabilities,
  - partial passwords?

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

## Idea scratch space

retrieving passwords from other parts of the game?

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
- show all servers button
