# Bladeburners

Bladeburner divisions were created internationally in the mid-21st century, tasked with monitoring and "managing" rogue Synthoids, which may have blended into society.

By working for the Bladeburners against increasingly strong Synthoid opposition, you'll gain access to their augmentations, and to a unique method of destroying [BitNodes](bitnodes.md). Completing all of the Bladeburners' Black Ops gives you the ability to destroy the World Daemon without needing the Red Pill. This is possible in any BitNode, not just BitNodes 6 and 7.

## Joining the Bladeburners

To join the Bladeburners, visit the NSA in Sector-12.

## Gaining rank

You gain rank by taking on Contracts, Operations and Black Ops. Gaining rank lets you:

- Purchase Bladeburner skills
- Join the Bladeburner faction
- Take on more dangerous Black Ops

Your rank persists throughout a [BitNode](bitnodes.md), even after installing augmentations.

## Bladeburner faction

The Bladeburners offer unique [Augmentations](../basic/augmentations.md), and will invite you to join their faction when you reach 25 rank.

Bladeburner faction reputation can only be gained through Bladeburner actions. Faction reputation is reset when you install augmentations.

## Bladeburner skills

Designed to improve a human agent's capabilities beyond their natural limits, Bladeburner skills add bonuses that persist after installing augmentations.

There is no limit on the skill level you can reach, with the exception of Overclock which can only reach level 90.

## Actions

There are 4 types of action you can take:

- General actions are supporting activities. They might increase your max stamina, or reduce a city's city chaos.
- Contracts earn money, exp and rank.
- Operations earn exp and rank, at a higher rate.
- Black Ops earn rank. Completing all 21 Black Ops gives you the ability to destroy the World Daemon.

### General actions

Any exp you gain from General actions is boosted by a person's exp multipliers (either yours, or a sleeve's, depending on who's doing the action). But it is not boosted by the exp bonus from the Hyperdrive skill.

#### Training

- Costs 0.1425 stamina.
- Increases your max stamina by 0.04, multiplied by your bonus from the Cyber's Edge skill.
- Gives 1 exp/second in each combat stat.

#### Field Analysis

- Improves your estimate of the Synthoid population in the current city. This increases the precision of your success chance estimates. The degree of the improvement scales with your hacking and charisma skills.
- Gives hacking and charisma exp.
- Increases your rank.

#### Recruitment

- Gives a chance of recruiting 1 team member. The success chance increases with your charisma level, and decreases the more team members you already have.
- Gives charisma exp.
- Action time is reduced by higher charisma levels.

#### Diplomacy

- Reduces chaos by a %, calculated as `Math.pow(person_charisma, 0.045) + person_charisma / 1000`. If sleeves are performing the action, it's their charisma that's used.

#### Hyperbolic Regeneration Chamber

- Regenerates 1% of your max stamina.
- Regenerates 2 health for the person performing the action, either you or a sleeve.

#### Incite Violence

- Gives the equivalent of 3 minutes' passive Contract and Operation generation.
- Raises the chaos of every city by 10, and then by a further `city_chaos / Math.log10(city_chaos)`.

### Contracts, Operations and Black Ops

Contracts, Operations and Black Ops all cost stamina.

Failing them causes you to lose health, and in the case of Operations and Black Ops, rank. Black Ops are particularly punishing to fail.

#### Action time

Action time is reduced by:

- The Overclock skill
- Your effective agility and dexterity level, which is your level in those skills multiplied by the bonuses from the Reaper and Evasive System skills. The calculation for this reduction is `action_time / (Math.pow(effAgility, 0.04) + Math.pow(effDexterity, 0.035) + effAgility / 10000 + effDexterity / 10000)`.

#### Action success chance

Your success chance in Contracts, Operations and Black Ops is based on:

- Team size (applies to Operations and Black Ops only). The multiplier is `Math.pow(team_count + 1, 0.05)`.
- How far the chaos level in your current city is above 50 (does not apply to Black Ops). If your chaos is 50 or less, your success chance is not affected. After 50 chaos, your success chance is divided by `1 + city chaos - 50`.
- How much the Synthoid population in your current city is less than 1,000,000,000 (does not apply to Black Ops). The multiplier is `Math.pow(population / 1,000,000,000, 0.7)`.
- How far your stamina is below 50%. The penalty scales linearly: `success_chance * Math.max(1, current_stamina / (0.5 * max_stamina))`.
- The inherent difficulty of the action.
- Your skill levels (strength, defense, intelligence, and so on).
- Success multipliers from augs, source files and Bladeburner skills.

Actions like Field Analysis improve your estimate of how many Synthoids are in a city. That improves the precision of your estimated success chance. But it does not improve the success chance itself.

## Stamina

Training, and all Contracts, Operations and Black Ops cost stamina.

Your max stamina increases with:

- Your effective agility level, which is your agility level multiplied by the bonuses from the Reaper and Evasive System skills
- Levels in the Cyber's Edge skill
- Training, which gives +0.04 max stamina, multiplied by your bonus from Cyber's Edge
- The Bladeburner Max Stamina multiplier

Your stamina gain rate increases with:

- Your effective agility level, which is your agility level multiplied by the bonuses from the Reaper and Evasive System skills
- Your max stamina
- The Bladeburner Stamina Gain multiplier

Stamina can also be restored by the Hyperbolic Regeneration Chamber action.

Once your stamina falls below 50% of its max value, it begins to reduce the success rate of your Contracts and Operations.

## Sleeves

Sleeves can perform all the General actions. They don't have a stamina stat, so if they perform Training or Hyperbolic Regeneration Chamber, it's your stamina that's affected.

Sleeves can also do the following:

- Take on Contracts, as if it were you doing them.
- Infiltrate Synthoids to generate more Contracts and Operations. Infiltrating Synthoids is less effective the more sleeves are doing it. The calculation is `Math.pow(infilSleeves, -0.5) / 2`
- Support the Main Sleeve. This means they will be available to join you as a team member on Bladeburner Operations and Black Ops. If the sleeve is hurt and loses all its health, it will receive shock.
