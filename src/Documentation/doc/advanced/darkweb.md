This is currently a design document, but eventually will be the in-game player documentation for the DarkWeb mechanics.

## Goals:

- Add (slightly simplified) real-life problems that programmers face for the player to solve
- Add a number of much smaller and simpler coding puzzles than CCTs, but with a similar minigame/leetcode feel
- Flesh out the dark web, which doesn't do hardly anything currently
- Add benefits to the under-utilized charisma stat, both in the DarkWeb mechanics and outside of them

## Gameplay:

- The dark web and the servers on it are not reliable
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

- Player will solve simple pasword/auth puzzles to gain access to servers (which can be automated)
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

## Rewards:

- Start with tor router permanently?
- Cha stat gains from doing darkweb stuff
- Cha contributes slightly to rep gains from faction work?
- Cha contributes (more?) to regular jobs' pay
- Cha contributes (more?) to job rep (needed to later join megacorp factions)
- Small amounts of negative karma gain for breaking into servers?
- Caches with port openers, money, or xp

## TODO:

- servers renamed occasionally?

- packet sniffing 
  - mostly garbage data, sometimes has password
  - sniffed data includes fake passwords, html, rickroll, random garbage, lorem ipsum, silly google searches


- Clue notes on servers
  - passwords for another server
  - hints to password tables, 
  - hints to vulnerabilities,
  - partial passwords?

- File/status viewer for darkweb servers?

- reward caches?
  - stock market unlocks?


- Harden existing commands against loops in network? or exclude darkweb from them?
- Limit ns commands from use on darkweb servers
  - ns.scan
  - exec (run? spawn?)
  - ns.scp & scp
  - hack against, run hack on +weak +grow

  
- add code injection to break eval()
- change arithmatic symbols to break eval() injection?


- Generate interesting server names

- bonus time?
- server scrambler when offline?

- slow down net mutations

- Limit darkweb stuff to when feature is enabled (bitnode? own tor router?)
- start more cleanly with root access to "darkweb" server


## TODO later:

- Darkweb server cha difficulty balance?

- Bitnode multipliers

## Community feedback:

https://discord.com/channels/415207508303544321/459097632896188436/1350613323737071727
https://discord.com/channels/415207508303544321/459097632896188436/1345773862263984208
https://discord.com/channels/415207508303544321/415213435974975508/1352628138261086339


## Idea scratch space

- database server 
  - basic "encryption" on its txt file
  - contains user data file with multiple user passwords?

- honeypot servers
  - black hole - kill any script that tries to scp stuff onto it
  - rickroll reward cache
  - "ad virus" - logs adds to the toast or to terminal. Can be removed from player's home server?

  - packet sniffing shows signature things for honeypots
    - empty string for black hole
    - lyrics for rickroll?
    - totally normal server .jpeg

  - glitchy UI?
  - scripts crash?
  - 
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

- servers with code injection if you blindly eval() their expression instead of building a parser

  - what will they do? just spam a toast? infinite loop? kill your script? delete your script?

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

