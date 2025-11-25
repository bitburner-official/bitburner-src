# FAQs for beginners

This page is dedicated for questions often asked by beginners in Bitburner Discord server.

The following are advice, not a bible, as this is a single-player game, so you are your own boss.

#### How do I create directories/folders?

These are a part of filenames, and therefore nonexistent, files with the same prepending "directory" string are bundled together.

#### Should I backdoor all servers?

Short answer:
Time-consuming for minimal benefits.

Long answer:
Backdooring a server takes a certain amount of time, and the duration is dependent on a given server's and your hacking level at the time of sending backdoor command.

Given the amount of servers in the network and how often you have to do so after installing augments, it is ill-advised to perform such potentially lengthy tasks unnecessarily.

#### How do I backdoor through scripts?

It is only possible in late game, or via exploits.

#### Should I target multiple servers or just one?

[EHTs (Early Hacking Templates)](../programming/hackingalgorithms.md) can somewhat benefit this at very late stages of the game where the player's hacking level is so high a few threads of `ns.hack()` can take all money of even strongest servers within the network.

However, targetting multiple servers is not viable for batchers in particular due to the fact such algorithms do not suffer from over-hacking (a loose term that describes a targeted server being drained of all reserved money).

#### What are the differences between threads and processes?

Threads are a part of a process, processes have their own thread count.

Picture this: Threads and processes are items in a container respectively.

As you run scripts, you effectively create a container, with threads being items of the aforementioned (defaulted to 1).

#### Do in-game threads/processes have anything to do with the real life, actual computer threads/processes?

No, in fact the game is run in JavaScript which is single-threaded.
