# Hacking

In the year 2077, currency has become digital and decentralized.
People and corporations store their money on [servers](servers.md).
By hacking these [servers](servers.md), you can steal their money and gain experience.

## Gaining Root Access

The first step to hacking a [server](servers.md) is to gain root access to that [server](servers.md).
This can be done using the `NUKE.exe` virus.
You start the game with a copy of the `NUKE.exe` virus on your home computer.
The `NUKE.exe` virus attacks the target [server](servers.md)'s open ports using buffer overflow exploits.
When successful, you are granted root administrative access to the machine.

In order for the `NUKE.exe` virus to succeed, the target [server](servers.md) needs to have enough open ports.
Some [servers](servers.md) have no security and will not need any ports opened.
Some will have very high security and will need many ports opened.
In order to open ports on another [server](servers.md), you will need to run programs that attack the [server](servers.md) to open specific ports.
These programs can be coded once your hacking skill gets high enough, or they can be purchased if you can find a seller.

**There are two ways to execute port-opening programs and the NUKE virus:**

- Connect to the target [server](servers.md) through the [Terminal](terminal.md) and use the `run` command: `$ run [programName]`
- Use a function:
  - `nuke`
  - `brutessh`
  - `ftpcrack`
  - `relaysmtp`
  - `httpworm`
  - `sqlinject`

**There are two ways to determine how many ports need to be opened
on a [server](servers.md) in order to successfully NUKE it:**

- Connect to that [server](servers.md) through the [Terminal](terminal.md) and use the `analyze` command.
- Use the `getServerNumPortsRequired` function.

Once you have enough ports opened on a [server](servers.md) and have ran the NUKE virus to gain root access, you will be able to hack it.

### For specific details of how Hacking work "offline"

See [Offline And Bonus Time](../advanced/offlineandbonustime.md).

## General Hacking Mechanics

When you execute the `hack` command, either manually through the [Terminal](terminal.md) or automatically through a script, you attempt to hack the [server](servers.md).
This action takes time.
The more advanced a [server](servers.md)'s security is, the more time it will take.
Your hacking skill level also affects the hacking time, with a higher hacking skill leading to shorter hacking times.
Also, running the hack command manually through [Terminal](terminal.md)
is faster than hacking from a script.

Your attempt to hack a [server](servers.md) will not always succeed.
The chance you have to successfully hack a [server](servers.md) is also determined by the [server](servers.md)'s security and your hacking skill level.
Even if your hacking attempt is unsuccessful, you will still gain experience points.

When you successfully hack a [server](servers.md).
You steal a certain percentage of that [server](servers.md)'s total money.
This percentage is, once again, determined by the [server](servers.md)'s security and your hacking skill level.
The amount of money on a [server](servers.md) is not limitless.
So, if you constantly hack a [server](servers.md) and deplete its money, then you will encounter diminishing returns in your hacking (since you are only hacking a certain percentage).
You can increase the amount of money on a [server](servers.md) using a script and the `grow` function.

## Server Security

Each [server](servers.md) has a security level, typically between `1` and `100`.
A higher number means the [server](servers.md) has stronger security.

As mentioned above, a [server](servers.md)'s security level is an important factor to consider when hacking.
You can check a [server](servers.md)'s security level using the `analyze` [Terminal](terminal.md) command.
You can also check a [server](servers.md)'s security in a script, using the `getServerSecurityLevel` function.

Whenever a [server](servers.md) is hacked manually or through a script, its security level increases by a small amount.
Calling the `grow` function in a script will also increase security level of the target [server](servers.md).
These actions will make it harder for you to hack the [server](servers.md), and decrease the amount of money you can steal.
You can lower a [server](servers.md)'s security level in a script using the `weaken` function.

Each server has a minimum security level. The [server](servers.md)'s security level will not fall below this value if you try to `weaken` it. You can get this value with the `getServerMinSecurityLevel` function.

## Backdoors

[Servers](servers.md) that can be hacked can also have backdoors installed.
These backdoors will provide you with a benefit - the services may be cheaper, penalties may be reduced or there may be other results.
Honeypots exist and will let factions know when you have succeeded at backdooring their system.
Once you have a backdoor installed, you can connect to that [server](servers.md) directly.

When you visit a location in the city and see that the name is partially scrambled, this indicates that you have backdoored the [server](servers.md) related to the location.
