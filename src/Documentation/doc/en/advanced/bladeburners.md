# Bladeburners

Bladeburner divisions were created internationally in the mid-21st century, tasked with monitoring and "managing" rogue Synthoids, which may have blended into society. By working for the Bladeburners and operating against increasingly strong Synthoid opposition, you'll get access to powerful enhancements and a unique method of destroying [BitNodes](bitnodes.md). Through the Bladeburners, you can destroy the World Daemon in any BitNode without needing the Red Pill.

## Bladeburner rank

You can gain rank among the Bladeburners by taking on Contracts, Operations and Black Ops. Gaining rank lets you:

- Purchase skills
- Join the Bladeburner faction
- Take on more dangerous Black Ops, and eventually destroy World Daemon

Your rank persists throughout a [BitNode](bitnodes.md), even after installing augmentations.

## Bladeburner faction

The Bladeburners offer unique [Augmentations](../basic/augmentations.md), and will invite you to join their faction when you reach 25 rank.

Bladeburner faction reputation can only be gained through Bladeburner actions. Faction reputation is reset when you install agumentations.

## Bladeburner skills

Designed to improve a human agent's capabilities beyond their natural limits, Bladeburner skills add bonuses that persist after installing augmentations.

Bladeburner skills are purchased with Bladeburner skill points, not money.

There is no limit on the skill level you can reach, except with Overclock, which can only reach level 90. Each individual skill will become more expensive as you level it up.

Each skill level is additive, however different skills' effects are multiplicative.

## Actions

### General actions

#### Training

- Costs 0.1425 stamina.
- Gives +0.04 max stamina, multiplied by your bonus from Cyber's Edge.
- Gives 30 exp (1 exp/second) in each combat stat, increasing with your combat exp multipliers. (The exp from other Bladeburner actions is increased by your multipliers too, we're just specifying this one because otherwise it sounds like a flat exp rate.)

#### Field Analysis

- Improves your estimate of the Synthoid population in the current city. The improvement of the estimate scales with your hacking and charisma skills.
- Gives hacking and charisma exp.

#### Recruitment

- Has a chance of recruiting 1 team member. The success chance scales with charisma.
- Action time is reduced at higher charisma levels.
- Gives charisma exp that scales with your charisma level. Studying at a university offers better charisma exp at lower levels. charisma exp is soft-capped at 60 exp/s.

#### Diplomacy

- Reduces chaos by at least %1, with charisma giving a small bonus. At a charisma level of 1000, the chaos reduction is 2.3%.

#### Hyperbolic Regeneration Chamber

- Regens 1% of your max stamina.
- Regens 2 health.

#### Incite Violence

- Gives the equivalent of 3 minutes of passive Contract and Operation generation.
- Raises the chaos of every city by 10 + log10(current_city_chaos).

### Contracts

Contracts give you rank, exp, and money. Contracts will level up as you succeed and make you lose HP if you fail them.

The higher the level, the more rank, experience and money you will gain, but the difficulty will also increase. [Sleeves](../advanced/sleeves.md) can also take on Contracts.

### Operations

Operations give you much more exp and rank than Contracts. They're also harder and more punishing. Failing an Operation reduces your HP a lot more, and also reduces your rank. Operations do not earn money.

### Black Ops

Black Ops are special, one-time covert operations. Each Black Op must be unlocked successively by completing the one before it. Failing a Black Op will incur heavy HP and rank losses.

**After you complete all the Black Ops, you're given the abiity to destroy the World Daemon.**

## Understanding stats

### Stamina

Your max stamina increases with:

- Your effective agility level, which is your agility level multiplied by the bonuses from the Reaper and Evasive System skills
- Levels in the Cyber's Edge skill
- Training, which gives +0.04 max stamina, multiplied by your bonus from Cyber's Edge
- The Bladeburner Max Stamina multiplier from your Stats page

Your stamina gain rate increases with:

- Your effective agility level, which is your agility level multiplied by the bonuses from the Reaper and Evasive System skills
- Your max stamina
- The Bladeburner Stamina Gain multiplier your Stats page

Stamina can also be restored with the Hyperbolic Regeneration Chamber action.

Once your stamina falls below 50% of its max value, it begins to negatively affect the success rate of your Contracts and Operations.

### Synthoid population estimates

Actions like Field Analysis improve your estimate of how many Synthoids are in a city. That improves the accuracy of the estimated success chance of an action. But it does not improve the success chance itself.

### Action time

Action time is reduced by:

- The Overlock skill
- Your effective agility and dexterity level, which is your level in those skills multiplied by the bonuses from the Reaper and Evasive System skills

## Team members

You can recruit team members via the Recruitment action in the General tab. The more team members you have, the more difficult it is to recruit them.

Team members increase your success chance in Operations and Black Ops, but some are likely to die on every operation, whether you fail or succeed in the task.

Sleeves can join your team by performing the Support Main Sleeve task.

## Sleeves

Sleeves can perform all the General actions. They don't have a stamina stat, so if they perform Training or Hyperbolic Regeneration Chamber, it's the player's stamina that's affected.

Sleeves can also do the following:

- Infiltrate Synthoids to generate more Contracts and Operations.
- Support the Main Sleeve. This means they can join you as a team member on Bladeburner Operations and Black Ops. If the sleeve is hurt and loses all its health, it will receive shock.
- Take on Contracts, as if it were you doing them.

Infiltrating Synthoids is less effective the more sleeves are doing it.

<table>
<tr>
<th>Sleeves infiltrating simultaneously</th><th>Contracts generated per action</th>
</tr>
<tr>
<td>1</td><td>0.50</td>
</tr>
<tr>
<td>2</td><td>0.71</td>
</tr>
<tr>
<td>3</td><td>0.87</td>
</tr>
<tr>
<td>4</td><td>1.00</td>
</tr>
<tr>
<td>5</td><td>1.12</td>
</tr>
<tr>
<td>6</td><td>1.22</td>
</tr>
<tr>
<td>7</td><td>1.32</td>
</tr>
<tr>
<td>8</td><td>1.41</td>
</tr>
</table>
