# Bladeburners

Bladeburner divisions were formed in the mid-21st century, tasked with monitoring and "managing" rogue Synthoids that have blended into society.

By working for the Bladeburners against increasingly strong Synthoid opposition, you'll get access to their augmentations, and to a unique method of destroying [BitNodes](bitnodes.md). Through the Bladeburners' Black Ops, you can destroy the World Daemon in any BitNode without needing the Red Pill.

## Gaining rank

You gain rank by taking on Contracts, Operations and Black Ops. Gaining rank lets you:

- Purchase Bladeburner skills
- Join the Bladeburner faction
- Take on more dangerous Black Ops, and eventually destroy World Daemon

Your rank persists throughout a [BitNode](bitnodes.md), even after installing augmentations.

## Bladeburner faction

The Bladeburners offer unique [Augmentations](../basic/augmentations.md), and will invite you to join their faction when you reach 25 rank.

Bladeburner faction reputation can only be gained through Bladeburner actions. Faction reputation is reset when you install agumentations.

## Bladeburner skills

Designed to improve a human agent's capabilities beyond their natural limits, Bladeburner skills add bonuses that persist after installing augmentations.

There is no limit on the skill level you can reach, with the exception of Overclock which can only reach level 90.

## Actions

There are 4 types of action:

- General actions are safe, supporting activities. They do things like increase your max stamina, or lower chaos.
- Contracts earn money, exp and rank.
- Operations earn exp and rank at a higher rate.
- Black Ops earn rank. Completing all 21 Black Ops gives you the ability to destroy the World Daemon.

### General actions

#### Training

- Costs 0.1425 stamina.
- Increases your max stamina by 0.04, multiplied by your bonus from the Cyber's Edge skill.
- Gives 30 exp (1 exp/second) in each combat stat, increasing with your combat exp multipliers. (The exp from other Bladeburner actions is increased by your multipliers too, we're just calling this one out because otherwise it sounds like a flat exp rate.)

#### Field Analysis

- Improves your estimate of the Synthoid population in the current city. This increases the precision of your success chance estimates. The improvement of the estimate scales with your hacking and charisma skills.
- Gives hacking and charisma exp.

#### Recruitment

- Gives a chance of recruiting 1 team member. The success chance increases with your charisma level, and decreases the more team members you already have.
- Action time is reduced by higher charisma levels.
- Gives charisma exp that scales with your charisma level. Studying at a university offers better charisma exp at lower levels. Charisma exp is soft-capped at 60 exp/s.

#### Diplomacy

- Reduces chaos by %1, with a bonus reduction from charisma. At a charisma level of 1000, the chaos reduction is 2.3% per action.

#### Hyperbolic Regeneration Chamber

- Regenerates 1% of your max stamina.
- Regenerates 2 health.

#### Incite Violence

- Gives the equivalent of 3 minutes of passive Contract and Operation generation.
- Raises the chaos of every city by 10 + log10(current_city_chaos).

### Contracts, Operations and Black Ops

#### Action time

Action time is reduced by:

- The Overlock skill
- Your effective agility and dexterity level, which is your level in those skills multiplied by the bonuses from the Reaper and Evasive System skills

#### Action success chance

Your success chance in Contracts, Operations and Black Ops is based on:

- Team size, in Operations and Black Ops. The multiplier is `Math.pow(team_count + 1, 0.05)`, so the benefit of having more team members tails of quickly.
- Chaos level in your current city above 50. If your chaos is 50 or less, your success chance is not affected. After 50 chaos, your success chance is divided by `1 + city chaos - 50`. So a chaos level of 60 reduces your success chance by 90%.
- The Synthoid population in your current city being less than 1,000,000,000 (again, Black Ops ignore population). The multiplier is `Math.pow(population / 1,000,000,000, 0.7)`, so it scales in your favour. At 100,000,000 population, you have x0.2 success multiplier.
- The inherent difficulty of the action.
- The your skill levels (strength, defence, intelligence, and so on).
- Succcess multiplers from augs, source files, and Bladeburner skills.
- Whether your stamina is below 50%.

Black ops ignore chaos and city population.

Actions like Field Analysis improve your estimate of how many Synthoids are in a city. That improves the precision of your estimated success chance. But it does not improve the success chance itself.

## Stamina

Training, and all Contracts, Operations and Black Ops cost stamina.

Your max stamina increases with:

- Your effective agility level, which is your agility level multiplied by the bonuses from the Reaper and Evasive System skills
- Levels in the Cyber's Edge skill
- Training, which gives +0.04 max stamina, multiplied by your bonus from Cyber's Edge
- The Bladeburner Max Stamina multiplier from your Stats page

Your stamina gain rate increases with:

- Your effective agility level, which is your agility level multiplied by the bonuses from the Reaper and Evasive System skills
- Your max stamina
- The Bladeburner Stamina Gain multiplier your Stats page

Stamina can also be restored by the Hyperbolic Regeneration Chamber action.

Once your stamina falls below 50% of its max value, it begins to reduce the success rate of your Contracts and Operations.

## Sleeves

Sleeves can perform all the General actions. They don't have a stamina stat, so if they perform Training or Hyperbolic Regeneration Chamber, it's the player's stamina that's affected.

Sleeves can also do the following:

- Infiltrate Synthoids to generate more Contracts and Operations.
- Support the Main Sleeve. This means they will be available to join you as a team member on Bladeburner Operations and Black Ops. If the sleeve is hurt and loses all its health, it will receive shock.
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
