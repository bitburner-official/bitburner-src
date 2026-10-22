# Intelligence

Intelligence is a skill available to you either:

- Permanently, after having obtained [Source-File 5.1](sourcefiles.md) from completing [BitNode-5](bitnodes.md) the first time.
- Temporarily, during [BitNode-5](bitnodes.md) before completing it and getting the first Source-File level.

Intelligence is unique in that once fully unlocked, it will persist across BitNodes and never be reset back to 1. The only exception to this would be during BitNode-5, _before_ getting Source-File 5.1. If you leave at any point to enter another BitNode that is not BitNode-5 without first getting Source-File 5.1, then any Intelligence gained will be reset to 0. Conversely, any Intelligence gained during time spent in BitNode-5 that is followed up with completing the BitNode will be retained, as from that point onward, Intelligence is fully unlocked and is now a permanent skill.

Another unique trait of Intelligence is, due to its persistent nature and variety of bonuses provided, how much slower you gain experience for it compared to other skills.

## What Intelligence Improves

- Bladeburner
  - Action success chance
  - Field Analysis effectiveness
- Crime success chance
- Darknet
  - `authenticate()` speed
  - `heartBleed()` speed
  - `labradar()` speed
  - `labreport()` speed
- Faction and company work reputation bonus
- Grafting speed
- Hacking
  - `hack()`, `grow()`, and `weaken()` speed
  - `hack()` success chance
- Infiltration
  - Infiltration difficulty reduction
  - Infiltration rewards
- Program creation
  - Creation speed
  - Hacking skill level required
- `share()` effective thread count multiplier
- Sleeves
  - Shock Recovery speed (per sleeve)
  - Synchronization speed (per sleeve)

## Sources of Intelligence Experience

- Bladeburner
  - Contracts
  - Operations
  - Black Ops
- Crime
  - Rob Store
  - Larceny
  - Bond Forgery
  - Grand Theft Auto
  - Kidnap
  - Assassination
  - Heist
- Destroying a BitNode
- Grafting
- Program creation
- Singularity API
  - `goToLocation()`
  - `installAugmentations()`
  - `joinFaction()`
  - `manualHack()`
  - `purchaseTor()`
  - `purchaseAugmentation()`
  - `purchaseProgram()`
  - `travelToCity()`
  - `upgradeHomeCores()`
  - `upgradeHomeRam()`
- Studying
- Terminal `hack` command

## Source-File 5 Overrides

When entering a BitNode, the player has options to override the level of Source-File 5 if already owned. If Source-File 5 is ever set to level 0, this will _not_ reset any progress made on Intelligence experience gained nor will it remove the ability to gain experience for it.

## Intelligence Overrides

When entering a BitNode, the player has options to override the level of their Intelligence skill. When assigning a value with this feature, your Intelligence and your Sleeves' Intelligence will be temporarily set to this value if it is lower than their current values. For example:

- If your Intelligence is 1000 and you set this value to 500, your Intelligence will be temporarily set to 500.
- If a Sleeve's Intelligence is 200 and you set this value to 500, that Sleeve's Intelligence is still 200.

Note that you still gain Intelligence experience as normal.

For example, suppose you have 1e6 Intelligence exp (Intelligence skill = 242) and set the Intelligence override to 100. At the start of the BitNode, your Intelligence skill will be set to 100 (equivalent to ~11255.318 Intelligence exp).

If you gain 500e3 Intelligence exp during the BitNode, your Intelligence skill will increase to 220 (total Intelligence exp = 11255 + 500e3 = 511255). After performing bitflume, the exp gained during the BitNode is added to your original exp. Your Intelligence skill will then become 255 (total Intelligence exp = 1e6 + 500e3 = 1.5e6).

The overridden Intelligence will be shown in the character overview. You can hover your mouse over it to see the original value.
