# Infiltration

Infiltration is a gameplay mechanic that allows you to infiltrate a [Company](companies.md)'s facility to try and steal the [Company](companies.md)'s classified secrets.
These secrets can be sold for money or for [Reputation](reputation.md) with a [Faction](factions.md).

## Overview

Many companies have facilities that you can attempt to infiltrate.
By infiltrating, you can steal classified [Company](companies.md) secrets and then sell these for money or for [Faction](factions.md) [Reputation](reputation.md).
To try and infiltrate a [Company](companies.md), visit a [Company](companies.md) through the [World](world.md) menu.
There will be an option that says 'Infiltrate [Company](companies.md)'.

When infiltrating a [Company](companies.md), you will be presented with short active challenges.

- None of the challenges uses the mouse.
- Most challenges use spacebar as the `action`.
- Some challenges use WASD or arrows interchangeably.
- A few others use the rest of the keyboard.

Each location that can be infiltrated has 3 important values:

- Difficulty: It affects how difficult the challenges are. This value depends on your "common" stats (combat stats and charisma). It's reduced when you improve your stats. It is not recommended to attempt infiltrations when the difficulty is above normal. You will not be able to infiltrate a location if the difficulty of that location is "Impossible" (100 in UI; 3.5 in NS API).
- Max clearance level: It is the number of challenges you need to pass to receive the infiltration reward.
- Starting security level: It affects the difficulty and rewards.

Every time you successfully complete an infiltration challenge and go to the higher clearance level, the "effective" difficulty is increased. The difficulty value in the introduction screen is the initial value for the first clearance level. When you go to higher levels, this value will be increased, so the challenges will become harder.

Every time you fail an infiltration challenge, you will take damage based on the starting security level of the location.
If your HP is reduced to 0, you will be hospitalized, and the infiltration will immediately end.

Infiltration rewards depend on:

- Max clearance level. Higher max clearance level = Higher rewards.
- Starting security level. Higher starting security level = Higher rewards.
- "SoA - phyzical WKS harmonizer" augmentation.
- Market demand. This is a multiplier.
- An endgame stat. You will know what it is when you reach the endgame.
- An endgame multiplier. You will know what it is when you reach the endgame.

Every time you complete an infiltration, the market demand reduces, so you receive fewer rewards. The market demand naturally recovers over time. The effective value of this multiplier is always in the range of [0, 1]. The UI may show a negative value to indicate how low it currently is.

The most common misconception of infiltration rewards is that they depend on your skill levels. This is wrong. The rewards do **NOT** depend on your skill levels.

Tips for increasing the infiltration rewards:

- Improve stats. Having higher stats does not increase the rewards, but it allows you to infiltrate harder locations. Training at gyms, committing crimes, and working for companies/factions are good and easy ways to improve stats. After getting higher stats, you can infiltrate harder locations (higher max clearance level, higher starting security level) to get higher rewards.
- Increase the endgame stat mentioned above.
- Buy SoA augmentations (especially "SoA - phyzical WKS harmonizer").

## Challenge list

### Attack the distracted sentinel

Press space bar to attack when the sentinel drops his guard and is distracted. Do not alert him!

There are 3 phases:

1. Guarding - The sentinel is guarding. Attacking will result in a failure.
2. Distracted - The sentinel is distracted. Attacking will result in a victory.
3. Alerted - The sentinel is alerted. Attacking will result in a failure.

### Close the brackets

Enter all the matching brackets in reverse order.

### Type it backward

Type the words that are written backward.

### Say something nice about the guard.

Use the arrows to find a compliment for the guard.

### Enter the Code!

Match the arrows as they appear.

### Match the symbols!

Move the cursor to the matching symbol and press space to confirm.

### Remember all the mines!

At first, the cursor cannot be moved - remember the positions of the mines.  
Next, move the cursor and press space to mark the mines on the board.

### Cut the wires

Follow the instructions and press the numbers `1` through `9` to cut the appropriate
wires.
