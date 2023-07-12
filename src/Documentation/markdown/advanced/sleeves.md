# Sleeves

When VitaLife unveiled their Persona Core technology that allowed people to digitize
and transfer their consciousness into other vessels, human bodies became nothing more
than 'sleeves' for the human consciousness. This technology thus became known as
"Sleeve technology".

Sleeve technology unlocks two different gameplay features:

- Duplicate Sleeves
- [Grafting](grafting.md)

Sleeve technology is unlocked in [BitNode-10](bitnodes.md).

## Duplicate Sleeves

Duplicate Sleeves are MK-V Synthoids (synthetic androids) into which your consciousness
has been copied. In other words, these Synthoids contain a perfect duplicate of your mind.

Duplicate Sleeves are essentially clones which you can use to perform work-type actions,
such as working for a [Company](../basic/companies.md) / [Faction](../basic/factions.md) or committing a [Crime](../basic/crimes.md). When sleeves perform these tasks,
they will earn money, experience, and [Reputation](../basic/reputation.md).

Sleeves are their own individuals, which means they each have their own experience and stats.

When a sleeve earns experience, it earns experience for itself, the player's
original consciousness, as well as all of the player's other sleeves.

Duplicate Sleeves are **not** reset when installing [Augmentations](../basic/augmentations.md), but they are reset
when switching [BitNodes](bitnodes.md).

## Obtaining Duplicate Sleeves

There are two methods of obtaining Duplicate Sleeves:

1. Destroy [BitNode-10](bitnodes.md). Each completion gives you one additional Duplicate Sleeve.
2. Purchase Duplicate Sleeves from The Covenant.
   This is only available in [BitNode-10](bitnodes.md). Sleeves purchased this way are **permanent** (they persist
   through [BitNodes](bitnodes.md)). You can purchase up to 5 Duplicate Sleeves from The Covenant.

## Synchronization

Synchronization is a measure of how aligned your consciousness is with that of your
Duplicate Sleeves. It is a numerical value between `1` and `100`, and it affects how much experience
is earned when the sleeve is performing a task.

Synchronization can be increased by assigning sleeves to the `Synchronize` task.

## Sleeve Shock

Sleeve shock is a measure of how much trauma the sleeve has due to being placed in a new
body. It is a numerical value between `0` and `100`, where `100` indicates full shock and `0` indicates
no shock. Shock affects the amount of experience earned by the sleeve.

Sleeve shock slowly decreases over time. You can further increase the rate at which
it decreases by assigning sleeves to the `Shock Recovery` task.

Let `X` be the sleeve's shock and `Y` be the sleeve's synchronization. When the sleeve earns experience by performing
a task, the sleeve gains `X%` of the amount of experience normally earned by the task. player’s original host consciousness and all of the player's other sleeves
earn `Y%` of the experience that the sleeve gained, or `X\*Y %` of the normal experience amount.

## Augmentations

You can purchase [Augmentations](../basic/augmentations.md) for your Duplicate
Sleeves. In order to do this, the sleeve's shock must be at `0`. Any [Augmentation](../basic/augmentations.md)
that is currently available to you through a faction is also available for your
Duplicate Sleeves. There are a few [Augmentations](../basic/augmentations.md), such as NeuroFlux Governor and
[Bladeburner](bladeburners.md)-specific ones, that cannot be purchased for a Duplicate Sleeve.

When you purchase an [Augmentation](../basic/augmentations.md) for a Duplicate Sleeve, it is instantly installed.
When this happens, the sleeve's stats are instantly reset back to 0, similar to
when you normally install [Augmentations](../basic/augmentations.md).

The cost of purchasing an [Augmentation](../basic/augmentations.md) for a Duplicate Sleeve is **not** affected
by how many [Augmentations](../basic/augmentations.md) you have purchased for yourself, and vice versa.

## Memory

Sleeve memory dictates what a sleeve's synchronization will be when it is reset by
switching [BitNodes](bitnodes.md). For example, if a sleeve has a memory of `10`, then when you
switch [BitNodes](bitnodes.md) its synchronization will initially be set to `10`, rather than 1.

Memory can only be increased by purchasing upgrades from The Covenant. Just like
the ability to purchase additional sleeves, this is only available in [BitNode-10](bitnodes.md).

Memory is a persistent stat, meaning it never gets reset back to `1`.
The maximum possible value for a sleeve's memory is `100`.

Buying memory has no instant affect on synchronization,
memory affects only the starting synchronization upon entering a [BitNode](bitnodes.md).
