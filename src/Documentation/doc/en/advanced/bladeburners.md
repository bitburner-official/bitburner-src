# Bladeburners

Bladeburner divisions were created internationally in the mid-21st century, tasked with monitoring and "managing" rogue Synthoids, which may have blended into society and are sometimes considered a threat.

By working for the Bladeburners against increasingly strong Synthoid opposition, you'll gain access to their augmentations, and to a unique method of destroying [BitNodes](bitnodes.md) that does not require the Red Pill.

Your goal is to complete all of the Bladeburner's Black Ops.

## Joining the Bladeburners

To join the Bladeburners, visit the NSA in Sector-12.

For them to approve your application, you will need level 100 in each combat skill (strength, defense, dexterity and agility).

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

Bladeburner skills are purchased with Bladeburner skill points, not money.

There is no limit on the skill level you can reach, with the exception of Overclock which can only reach level 90.

The benefit of each skill level is additive, but different skills together have a multiplicative effect.

## Actions

There are 4 types of action you can take:

- General actions are supporting activities. They might increase your max stamina, or reduce a city's city chaos.
- Contracts earn money, exp and rank.
- Operations earn exp and rank, at a higher rate.
- Black Ops earn rank.

### General actions

Note: Any exp that a person (whether you or a sleeve) gains from doing a General action is boosted by their exp multipliers, but not by the exp bonus from the Hyperdrive skill.

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

- The Overclock skill.
- Your effective agility and dexterity level, which is your level in those skills multiplied by the bonuses from the Reaper and Evasive System skills.

```javascript
0.5 * (Math.pow(effAgility, 0.04) + Math.pow(effDexterity, 0.035) + effAgility / 10000 + effDexterity / 10000);
```

#### Action success chance

Your success chance in Contracts, Operations and Black Ops is based on:

- Team size (applies to Operations and Black Ops only). The multiplier is `Math.pow(team_count + 1, 0.05)`.
- How far the chaos level in your current city is above 50 (does not apply to Black Ops). If your chaos is above 50, your success chance is divided by `1 + city chaos - 50`.
- How much the Synthoid population in your current city is less than 1bn (does not apply to Black Ops). The multiplier is `Math.pow(population / 1,000,000,000, 0.7)`.
- How far your stamina is below 50%. The penalty scales linearly: `success_chance * Math.max(1, current_stamina / (0.5 * max_stamina))`.
- The inherent difficulty of the action.
- Your skill levels (strength, defense, intelligence, and so on).
- Success multipliers from augs, source files and Bladeburner skills.

Actions like Field Analysis improve your estimate of how many Synthoids are in a city. That improves the precision of your estimated success chance. But it does not improve the success chance itself.

## Synthoid population and communities

- On average, Synthoid populations grow slowly. Every few minutes, one city will undergo a population change event. Its population might increase, decrease, or a part of it might migrate to another city.
- Having more Synthoid communities does not increase the growth rate of a city's Synthoid population.

## Stamina

Training, and all Contracts, Operations and Black Ops cost stamina.

Your max stamina increases with:

- Your effective agility level, which is your agility level multiplied by the bonuses from the Reaper and Evasive System skills
- Levels in the Cyber's Edge skill
- Training, which gives +0.04 max stamina, multiplied by your bonus from Cyber's Edge
- The Bladeburner Max Stamina multiplier

The base max stamina calculation before Training is: `Math.pow(effective_agility, 0.8) * cybers_edge_multiplier * player_max_stamina_multiplier`

Your stamina gain rate increases with:

- Your effective agility level, which is your agility level multiplied by the bonuses from the Reaper and Evasive System skills
- Your max stamina
- The Bladeburner Stamina Gain multiplier

The calculation is:

```javascript
Math.pow(effective_agility, 0.17) *
  (max_stamina / 70000 + 0.0085) *
  cybers_edge_multiplier *
  player_max_stamina_multiplier;
```

Stamina can also be restored by the Hyperbolic Regeneration Chamber action.

Once your stamina falls below 50% of its max value, it begins to reduce the success rate of your Contracts and Operations.

## Sleeves

Sleeves can perform all the General actions. They don't have a stamina stat, so if they perform Training or Hyperbolic Regeneration Chamber, it's your stamina that's affected.

Sleeves can also do the following:

- Take on Contracts, as if it were you doing them.
- Infiltrate Synthoids to generate more Contracts and Operations. Infiltrating Synthoids is less effective the more sleeves are doing it. The calculation is `Math.pow(infilSleeves, -0.5) / 2`.
- Support the Main Sleeve. This means they will be available to join you as a team member on Bladeburner Operations and Black Ops. If the sleeve loses all its health during an Operation, it will receive shock.
