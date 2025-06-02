## TODO:

---

- start with crash course?

```
const homeComp = Player.getHomeComputer();
const handbook = LiteratureName.CorporationManagementHandbook;
if (!homeComp.messages.includes(handbook)) homeComp.messages.push(handbook);
showLiterature(handbook);
```

"password-protected servers" mentions in documentation (exec and scp)
scp: add session details to docs
exec: add session details to docs

move phishing calcs to effects.js

unsubscribe from all subscriptions on unmount

```
  useEffect(() => {
    const clear = () => setKey((key) => key + 1);
    const debounced = _.debounce(() => clear(), 25, { maxWait: 50 });
    const unsubscribe = TerminalClearEvents.subscribe(debounced);
    return () => {
      debounced.cancel();
      unsubscribe();
    };
  }, []);
```

increase priority of locked ram indicator
keep some icons statically placed on mini-indicators (script count?)
more color on icons

improve session vs adjacency phrasing

- BN 15 stuff?
- hint note for TRP in lab (in starter guide?)
- BN description
- BN Mults for BN15
- new BN mults for darknet

- improve phishing documentation
- improve phishing somehow else?

labels for icons in detail view on password modal?

- lab cha requirement (in UI too)
- lab api

- webstorm visual indicator

- Go over guide looking for misleading info or other out-of-date or missing things
- starter script?
- preventDuplicates on the run options is very powerful here

ns.dnet.enums.XXX for status codes etc
Usually "data" in the form of enums or constants we typically store in a data folder so it's easier to find.

- more hint notes

- add a location to discover darknet navigator?

## Post MVP:

more Bitnode multipliers?

Improve error UI and handle multiple thrown errors
https://discord.com/channels/415207508303544321/415207508303544323/1372228866621571163

- stanek fragments for darkweb

- achievements

- ui methods for setting server description, colors, icons etc?

- Make network wider at deeper parts?

- Attempt to make connection?
  - chance to put current server offline?
  - chance to move the target server
  - only nearby servers are valid

webstorm screen glitch / text? https://codepen.io/Juxtopposed/pen/MWPmaww ?

- ub3r_l4byr1nth server

  - treasure chests in maze?
  - traps or monsters in maze?

- server that returns yes/no in its failure response

  - yes, the password has X as one of its factors

- server that returns a string in response to the attempt?

  - result: (encoded attempt) expectation: (encoded password)

  - backdoored servers more likely to restart and/or loose auth, removing backdoor, balancing risk level
  - low number (1 backdoor per X depth explored, or less than low const): no effect
  - lv 1 instability: small debuff to auth() time
  - lv 2: sometimes auth fails with timeout
  - lv 3: more server restarts on the darknet
  - lv 4: It's hard to sustain this many backdoors without a lot of upkeep due to them going offline or resetting. More connection severing on the darknet. player starts taking damage sometimes. creepypasta appears on player terminal, signed by the darknet.
  - lv 5: ports and file writes and other ns methods sometimes fail silently, or return garbage data. hard mode that is effectively opt-in

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
