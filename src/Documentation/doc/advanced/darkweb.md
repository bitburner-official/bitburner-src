This is currently a design document, but eventually will be the in-game player documentation for the DarkWeb mechanics.


## Goals:

* Add (slightly simplified) real-life problems that programmers face for the player to solve
* Add a number of much smaller and simpler coding puzzles than CCTs, but with a similar minigame/leetcode feel
* Flesh out the dark web, which doesn't do hardly anything currently
* Add benefits to the under-utilized charisma stat, both in the DarkWeb mechanics and outside of them

## Gameplay:

* Player will solve simple pasword/auth security problems to gain access to servers (which can be automated)
    * Missing password or password that is openly visible
    * simple rainbow table attacks like "it's the default password" or "my dog's name"
    * mastermind/wordle style password guessing
    * "timing" attacks (the listed response time increases based on how many correct chars you submit)
    * simple parsers: the password is the value of this short math expression in a string
    * The player will need to find, store, and re-use those passwords

* DarkWeb servers are not reliable
    * They will periodically move around the network, severing old connections and adding new ones
    * Some servers change names or IPs occasionally, requiring the player to mark them somehow
    * The network can be circular (it is not a tree) and it also may not be fully connected sometimes
    * They will sometimes go offline, and new servers will sometimes come online
    * Players will need to build redundancy or fallback systems

* Players will sometimes discover things on servers they gain access to
    * Hints to different types of security vulnerabilities
    * Passwords for other servers in a note
    * Hints to parts of servers' passwords (or simple cipher / encoded password)
    * CCTs
    * caches with small money or xp rewards

* Scripting
    * Some API methods will only work if you are adjacent to (or running on) the target server
        * mapping the network and deploying scripts is important
        * dealing with moving servers or changing connections is important
    * Some API methods will scale off of charisma (and give cha xp)
        * Lower time awaited to submit a password guess with higher charisma?
        * harder servers have a min cha requirement?
        * phishing success chance based off of cha?




## Rewards:

* Start with tor router permanently?
* Cha stat gains from doing darkweb stuff
* Cha contributes slightly to rep gains from faction work?
* Cha contributes to regular jobs' pay
* Cha contributes to megacorp job rep (needed to later join megacorp factions)
* Small amounts of negative karma gain?



## Community feedback:
https://discord.com/channels/415207508303544321/459097632896188436/1350613323737071727
https://discord.com/channels/415207508303544321/459097632896188436/1345773862263984208


Idea scratch space

* man in the middle attack?
    * listen / intercept messages?
    * Will they just fill up a percent bar to gain a char in the password?

* phishing attack?
    * what will this look like?
    * Failing severs the connection?
    * success chance scales off of cha?


* simple ciphers or basic password encoding?
    * sha1 with no key & no salt?
    * base64 encoding?
    * found in notes on servers sometimes
    * found in password hints sometimes

* servers with code injection if you blindly eval() their expression instead of building a parser
    * what will they do? just spam a toast? infinite loop? kill your script? delete your script?


* api unreliability? small chance to sever connection on each failed password check?
    * increases with server difficulty? Decreases with cha?


common dog's names
rex fido spot rover lassie spike max

common default passwords / rainbow table ideas:
https://github.com/danielmiessler/SecLists/blob/master/Passwords/Default-Credentials/default-passwords.txt