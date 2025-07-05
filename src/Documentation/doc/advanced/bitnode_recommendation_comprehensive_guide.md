# Introduction

After a player destroys their first [BitNode](./bitnodes.md), they are usually overwhelmed and do not know which BitNode they should do next. Some BitNodes even have peculiarities that tend to catch newbies off guard and ruin their run.

At first, we need to make this clear: There is no "perfect" BitNode order. Everybody has their own preferred play style, so a good order for this player may be a bad order for other players. This is why this guide does not show a single specific order.

Doing BitNodes in chronological order (BN1->BN2->BN3->BN4->BN5->etc.) is a classic mistake. Don't do that.

# BitNode characteristic

With each BitNode, you need to consider:

- Does it unlock a new mechanic?
- Is the new mechanic a new "gameplay" or a "utility" one (a mechanic that helps other mechanics)?
- How does this new mechanic interact with other mechanics?
- Are there peculiarities that I should know beforehand?
- How harsh are the BitNode's multipliers?

Some BitNodes unlock new mechanics, while others improve or change original mechanics in BitNode 1. This is a very rough introduction:

- New gameplay:
  - Gang (BitNode 2): Simple and useful.
  - Corporation (BitNode 3): Extremely complicated, extremely powerful, and extremely fast.
  - Bladeburner (BitNode 6, BitNode7): Relatively simple, slow, and not be nerfed too much in most BitNodes.
- Utility mechanics:
  - Singularity (BitNode 4): Automation APIs.
  - Intelligence (BitNode 5): Permanent stat that buffs many things and permanent access to `Formulas.exe`.
  - HackNet server (BitNode 9): Replace HackNet Node with HackNet Server. Buff many mechanics.
  - Sleeves + Grafting (BitNode 10): Help other mechanics.
  - Stanek's Gift (BitNode 13): Buff many mechanics.
- Other:
  - BitNode 8: Enhance the stock market.
  - BitNode 11: It gives some rewards, but they are not very interesting.
  - BitNode 12: Grant free NeuroFlux Governor (NFG) based on the Source-File level.
  - BitNode 14: Enhance IPvGO.

Some mechanics synergize well with other mechanics. For example, in order to create a gang outside of BitNode 2, you need to "farm karma" (more about this later), and Sleeves can help you do it faster.

Some mechanics have peculiarities that you should know beforehand. For example, enabling territory clashes too soon will make the player lose all territory and ruin their gang.

All BitNodes have a unique set of multipliers that affect the difficulty of that BitNode. You can see these multipliers when choosing a BitNode in the BitVerse. [Source-File](./sourcefiles.md) 5 gives you access to these multipliers when you are already in a BitNode. Some BitNodes are much harder than others. It's recommended to unlock other Source-Files before trying to beat these hard BitNodes. Note that the "Difficulty" value of a BitNode in the BitVerse may be a bit misleading in some cases. Understanding the difficulty of a BitNode is much harder than just choosing between "easy", "normal" and "hard".

# BitNode analysis

## BitNode 1

This is the easiest BitNode, and its Source-File gives a very strong buff to most multipliers. You should repeat this BitNode to get its powerful buff.

## BitNode 2

This BitNode unlocks [Gang](./gang.md). Gang is a simple and useful mechanic.

- Its benefits do not reset when you install augmentations or soft reset.
- Good income.
- Give you access to most augmentations. If you are in BitNode 2, your Gang will offer The Red Pill. This is arguably the biggest benefit of Gang. Farming reputation with factions to get access to their augmentations is the most time-consuming thing of a run. With Gang, you have access to most augmentations, so you only need to join 1 more faction to get NFG.

In order to create a gang, you need to "farm karma". Committing crimes reduces your karma, and Gang is unlocked when your karma is less than or equal to 54000 (this is a constant in all BitNodes). Farming karma is very slow, and Sleeves (BitNode 10) speed it up tremendously. Sleeves are copies of yourself, and you can let them do many tasks. When you set them to "Commit Crime", their action also reduces your karma as if you do it yourself.

When you enter this BitNode, there are two things that you need to keep in mind:

- There is no karma requirement in BitNode 2, but creating a gang too soon is a mistake. Having an adequate income boosts the early stage of Gang significantly. Outside BitNode 2, this is not a problem. When you finish farming karma, you usually have a decent income.
- Territory is important. Enabling territory clashes when your gang is still too weak is a serious mistake. You may lose all territory. On the other hand, enabling territory clashes too late is also bad. You need to find a balance here. In short, do it soon, but not too soon.

## BitNode 3

This BitNode unlocks [Corporation](./corporations.md). Corporation is one of the most controversial mechanics in Bitburner. As I said before, it's extremely complicated, extremely powerful, and extremely fast. If you have a good corporation script, you can ignore all other mechanics and speedrun most BitNodes. However, "having a good corporation script" is a serious challenge. Writing that "good script" may take days or weeks, assuming that you read the documentation carefully and have good advice from other experienced players (please join our [Discord](https://discord.gg/TFc3hKD) server and discuss there). If you try to do it blindly, Corporation is the worst mechanic.

If you want to try this mechanic, you must remember this advice: When in doubt, check the in-game documentation. Corporation has the most intensive documentation in Bitburner. Note that you do not have to read all of them in one go. I recommend that you read the first 4 sections. They are the most important sections for newbies. After that, you can read the following sections at your leisure.

## BitNode 4

This BitNode unlocks Singularity APIs in the `singularity` namespace (`ns.singularity`). Do you hate doing things manually (e.g., buying TOR, buying programs, connecting servers, installing backdoor)? These APIs let you do all of them programmatically.

If you use these APIs outside BitNode 4 and do not have Source-File 4.2 or Source-File 4.3, the RAM cost is multiplied by 4 or 16, respectively. This means that if you want to use this Source-File in other BitNodes, you have to complete this BitNode three times in one go. Otherwise, you will have to pay the massive RAM cost.

This BitNode's multipliers are a bit harsh, especially if you only have Source-File 1. Keep this in mind if you choose it as the second BitNode after completing BitNode 1.

## BitNode 5

This BitNode unlocks:

- [Intelligence](./intelligence.md): It's a permanent stat that buffs many things.
- BitNode's multiplier data in UI and NS APIs.
- Permanent access to `Formulas.exe`. Formulas APIs are useful for many mechanics, not just hacking. Having free access to them is a very good benefit.

Source-File 5 also buffs hacking-related multipliers. Hacking is a core mechanic, so it's always good to have higher hacking-related multipliers.

## BitNode 6 and BitNode 7

These BitNodes unlock [Bladeburner](./bladeburners.md). Bladeburner gives you an alternative way to destroy WD. In Bladeburner, you can do many actions (General, Contracts, Operations, Black Operations) to get money, experience, Bladeburner's rank, etc. You can destroy WD after completing the last Black Operation.

Bladeburner is a slow mechanic, but it's rarely nerfed in other BitNodes. Even when it's nerfed, the nerf is not too severe. This is why Bladeburner is a good choice in extremely hard BitNodes (e.g., BitNode 9, BitNode 13).

Both BitNodes grant Bladeburner access outside these BitNodes. The differences are:

- BitNode 6 does not have Bladeburner's penalty modifiers. Its Source-File buffs combat stats' multipliers.
- BitNode 7 has Bladeburner's penalty modifiers. Its Source-File buffs Bladeburner's multipliers. Source-File 7.3 gives you free access to "The Blade's Simulacrum" augmentation. You will immediately receive this augmentation after joining the Bladeburner division.

When you are performing Bladeburner action, you cannot do other actions (working, committing crimes, etc.). It's a downside of Bladeburner. "The Blade's Simulacrum" augmentation removes this restriction by allowing you to perform Bladeburner actions and other actions at the same time.

This mechanic is time-gated by the slow generation speed of contracts/operations. Sleeves speed it up a lot.

You must be careful with chaos and Synthoid population. The UI shows you many hints about the effect of dangerous actions on chaos and Synthoid population. You should keep an eye on those hints. Generally, you must keep the chaos level low and not kill too much Synthoid population.

## BitNode 8

This BitNode unlocks 2 new features for the stock market: short stock and limit/stop order.

This is a very challenging BitNode. It disables most normal ways to earn money so that you have to use the stock market as your source of income. Before having access to 4S Market Data, finding good stocks to invest in is pretty hard. You need to have a good pre-4S stock market script; otherwise, it's a slow run. You should take a look at stock manipulation. Hacking does not give you money, but hacking and growing a server that has a corresponding stock still influence that stock's price.

Grafting is very useful in this BitNode. Losing capital after each reset sets you back a lot. Grafting allows you to continuously install augmentations without resetting.

## BitNode 9

This BitNode replaces HackNet Node with [HackNet Server](./hacknetservers.md).

HackNet Servers generate `hash`. You can sell `hash` for money or a variety of upgrades that boost other mechanics. You can also run scripts on these servers, but doing it reduces the amount of `hash` produced.

Among the benefits of its Source-File, 2 most important ones are:

- Source-File 9.2: Start with 128GB of RAM on your home computer when entering a new BitNode.
- Source-File 9.3: Grant a highly upgraded Hacknet Server when entering a new BitNode. This effect only applies when entering a new BitNode, not when installing augmentations.

This BitNode's multipliers are extremely harsh. You should prepare carefully before entering it.

This BitNode disables private servers and significantly raises the RAM cost of your home computer. It also heavily nerfs hacking-related multipliers. You must find a way to properly utilize HackNet servers and their variety of upgrades. Inside this BitNode, you get the effect of Source-File 9.3 even before getting that Source-File. The free highly upgraded Hacknet Server is an extremely important asset at the start of the run.

## BitNode 10

This BitNode unlocks [Sleeves](./sleeves.md) and [Grafting](./grafting.md).

Sleeves are your "copies", so they can do most things that you can do (studying, working, committing crimes, etc.). This mechanic synergizes well with mechanics involving slow tasks that can be boosted by doing things simultaneously (e.g., farming karma for Gang, generating contracts/operations for Bladeburner). You can buy up to 5 Sleeves from "The Covenant" faction. Each Source-File level grants you a Sleeve.

Grafting is a special way of installing augmentations.

- Grafting bypasses the need of resetting the main body and farming faction reputation.
  - The augmentation is installed immediately after the grafting process finishes.
  - The requirement of faction reputation is ignored when grafting.
- Grafting gives you a debuff that decreases many multipliers. This debuff can be removed by installing a special augmentation.

You should keep these things in mind:

- You cannot buy Sleeves and their memory upgrades outside this BitNode.
- Sleeves are expensive. The last Sleeve costs 100e15 (100q). You will need a [batcher](../programming/hackingalgorithms.md) or a corporation.
- Due to the debuff, grafting is sometimes underestimated and underutilized. When grafting, you need to choose the augmentations carefully. If you choose appropriate ones, grafting is a very strong mechanic.

This BitNode's multipliers are fairly harsh. You will need a source of high income for the last Sleeve anyway, so harsh multipliers should not be a big problem. Utilizing the grafting mechanic properly lessens the harsh multipliers.

## BitNode 11

This BitNode does not unlock or enhance any mechanics.

Its Source-File's rewards:

- Company favor increases the player's salary and reputation gain.
- Increase the player's company salary and reputation gain multipliers.
- Reduce the price increase for every augmentation bought.

This BitNode's multipliers are harsh, but its rewards are mediocre, especially when comparing them to rewards in other BitNodes.

## BitNode 12

This is a special BitNode. In other BitNodes, the BitNode's multipliers are always the same, regardless of how many times you enter it, and the rewards only scale up to Source-File level 3. In BitNode 12, the BitNode's multipliers and the rewards scale to the Source File level, and the Source File level does not have a theoretical upper limit. For example, if you complete BitNode 12 one hundred times, you will have Source-File 12.100, and both the BitNode's multipliers and the rewards scale up to that level.

Source-File 12 grants free NFG levels based on the Source-File's level.

In this BitNode, you need to constantly change your strategy, depending on the current BitNode's multipliers. These multipliers become increasingly harsher when you go higher. It's recommended to unlock all mechanics before trying high levels.

Note that, although there is no limit in theory, there is still a practical limit to how high you can go. You won't need to worry about that limit for a long time, though.

## BitNode 13

This BitNode unlocks [Stanek's Gift](./stanek.md). Stanek's Gift is a grid that you can freely put fragments on. There are many types of fragments, and each type boosts a different mechanic.

This mechanic is versatile. It can boost many different mechanics. You can freely decide how to boost them by choosing appropriate fragments and arranging those fragments on the grid as you like.

Stanek's Gift decreases many multipliers by 10%. "Church of the Machine God" faction offers 2 augmentations to gradually remove this penalty.

You must accept Stanek's Gift before purchasing any augmentations. NFG is the only exception. Due to the effect of Source-File 7.3, you must accept Stanek's Gift before joining the Bladeburner division if you have that Source-File.

This BitNode's multipliers are extremely harsh. You should prepare carefully before entering it. Utilizing the Gift's bonuses is crucial to lessen the harsh multipliers.

## BitNode 14

This BitNode's Source-File buffs IPvGO's benefits and unlocks the ability to use cheat APIs. Cheat APIs may help you tremendously if you use them strategically, especially when playing against hard opponents. The Source-File's rewards:

- Higher stat multipliers from Node Power.
- Unlock `ns.go.cheat` APIs.
- Higher maximum favor that you can gain for each faction from IPvGO.

The last reward is pretty interesting. If you can consistently win several games in a row and get a higher favor bonus, you will cut down the time to reach 150 favor points with IPvGO factions and have access to their augmentations much sooner.

This BitNode's multipliers are fairly harsh, but IPvGO's multipliers are buffed significantly. If you use IPvGO, even a slightly improved version of the tutorial script will help you complete this BitNode without much trouble.

# Order advice

## The first choice

Repeating BitNode 1 is the best choice.

- There is no penalty modifier in BitNode 1. It's the best place for you to improve your scripts and prepare for harder BitNodes.
- The buff is huge. When you upgrade Source-File 1.1 to Source-File 1.2, you get a buff equivalent to 8 levels of NFG.

You should repeat it at least once to get Source-File 1.2. Most people complete this BitNode in one go and get Source-File 1.3.

## Early BitNodes

If you want to try different gameplay, BitNode 2 is a good choice. Gang is simple and useful in most BitNodes.

BitNode 5 is another good choice. Intelligence boosts many things, and it's permanent. Free access to Formulas APIs is very nice. A buff to hacking-related multipliers is useful in all BitNodes.

## Situational BitNodes and Hard BitNodes

If you hate doing things manually and want to automate everything, you will have to use Singularity APIs of BitNode 4. Note that this BitNode is not easy. Its multipliers are harsh, especially if you skip early BitNodes and only have Source-File 1. You also need to complete it entirely and get Source-File 4.3. Otherwise, you will have to pay the massive RAM cost. If you don't mind doing things manually, Source-File 4 is not really important.

Both BitNode 6 and BitNode 7 unlock Bladeburner. It's slow, but it's a good choice to beat extremely hard BitNodes (BitNode 9, BitNode 13). Ideally, you should complete both of them. However, if you decide to only use Bladeburner when needed and do not want to spend too much time doing both BitNodes, you can choose to complete only one of them. BitNode 6 is easier than BitNode 7, but Source-File 7 buffs Bladeburner's multipliers and gives you free access to "The Blade's Simulacrum" augmentation.

BitNode 10 unlocks 2 strong mechanics at the same time. Sleeves synergize well with many mechanics, especially Gang and Bladeburner. Grafting is useful in all BitNodes. Most people complete this BitNode in one go to get 8 Sleeves, but if you are in a rush, you can complete it once and get only Source-File 10.1. If you buy all 5 Sleeves from "The Covenant" faction, you will have 6 Sleeves and access to Grafting. That's not ideal, but still good enough.

BitNode 14 enhances IPvGO. IPvGO is _not_ locked behind this BitNode. It's available at the start of the game. You can play it by going to CIA (Sector-12) or using APIs in `ns.go`. If you have not touched that mechanic, you should do it now. IPvGO is tuned so that it still gives adequate benefits even if your script is only a slightly improved version of the tutorial script. Source-File 14 improves IPvGO's benefits and unlocks cheat APIs, which you can use to improve your win rate.

BitNode 9 and BitNode 13 unlock HackNet server and Stanek's Gift, respectively. They are powerful mechanics that buff other mechanics, but these BitNodes are extremely hard. You should prepare carefully before entering them.

## Challenging BitNodes

It's hard to recommend the priority of these BitNodes. They offer unique challenges. Some people can tackle them as early BitNodes without any problems. Some people complete them at the end, for the sake of completion. Some people despise and never touch them.

BitNode 3: This BitNode is not exactly hard. You can avoid the Corporation mechanic and complete it without any problems by using any mechanics that you have. Many people use Gang or just hacking scripts to beat it. However, that is not the point of BitNode 3. This BitNode unlocks Corporation, which is one of the most controversial mechanics in Bitburner. You either love it or hate it. Feel free to choose your path.

BitNode 8: You are forced to engage the stock market in this BitNode. The hardest part is to write a good (or at least usable) pre-4S stock market script. Even with good scripts, it still takes a long time to complete this BitNode. This is an interesting challenge.

## Special BitNodes

BitNode 12 is a unique BitNode. In the first dozen levels, it's an easy one, and you can beat it with any mechanics. When the difficulty ramps up due to increasingly harsher multipliers, you have to constantly change your strategy and use different mechanics. Thinking outside the box and exploiting oversights in the interaction of mechanics are the keys to success. You should try this BitNode after unlocking all mechanics.

## Bad BitNodes

BitNode 11 is hard, but its rewards are mediocre. You should only do it at the end, for the sake of completion.
