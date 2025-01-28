# BitNodes

A BitNode is an important part of the game's storyline.
In the game, you discover what BitNodes are by following the trail of clues left by the mysterious `jump3r`.

## What is a BitNode

A BitNode is the complex simulated reality in which you reside.
By following the messages from `jump3r`, you discover that humanity was enslaved by an advanced alien race, called the Enders, using virtual simulations that trapped the minds of humans.

However, the Enders didn't just create a single virtual reality to enslave humans, but many different simulations.
In other words, there are many different BitNodes that exist.
These BitNodes are very different from each other.

jump3r tells you that the only hope for humanity is to destroy all of these BitNodes.
Therefore, the end goal for the player is to enter and then destroy each BitNode.

Destroying a BitNode resets most of the player's progress but grants the player a powerful second-tier persistent upgrade called a [Source-File](sourcefiles.md).
Different BitNodes grant different [Source-Files](sourcefiles.md).

Each BitNode has unique characteristics that are related to varying backstories.
For example, in one BitNode the world is in the middle of a financial catastrophe with a collapsing market.
In this BitNode, most forms of income such as working at a [Company](../basic/companies.md) or [Hacknet Nodes](../basic/hacknet_nodes.md) are significantly less profitable.
[Servers](../basic/servers.md) have less money on them and lowered growth rates, but it is easier to lower their security level using the `weaken` function.

Furthermore, some BitNodes introduce new content and mechanics.
For example, there is one BitNode that grants access to the [Singularity API](https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.singularity.md).
There is another BitNode in which you can manage a [Gang](gang.md) to earn money and [Reputation](../basic/reputation.md).

## How to destroy a BitNode

Initially, the only way to destroy a BitNode is to join Daedalus.
From Daedalus, the player can obtain an [Augmentation](../basic/augmentations.md) called `The Red Pill`, which doesn't cost any money but does require a good amount of [Faction](../basic/factions.md) [Reputation](../basic/reputation.md).

After installing `The Red Pill`, the player must search for and then manually `hack` a server called `w0r1d_d43m0n`.
This server requires a hacking level of `3000`, sometimes more, in order to successfully hack it.
This will destroy the player's current BitNode.

There is a second method of destroying a BitNode, but it must be unlocked by first destroying BitNode-6 or BitNode-7 ([Bladeburners](bladeburners.md)).

When the player destroys a BitNode, most of their progress will be reset.
This includes things such as [Augmentations](../basic/augmentations.md) and [RAM](../basic/ram.md) upgrades on the home computer.
The only things that will persist through destroying BitNodes are:

- [Source-Files](sourcefiles.md)
- [Scripts](../basic/scripts.md) on the home computer
- [Intelligence](intelligence.md)

## BitNode list

### BitNode 1: Source Genesis

This is the first BitNode created by the Enders to imprison the minds of humans. It became the prototype and testing ground for all of the BitNodes that followed.

This is the first BitNode that you play through. It has no special modifications or mechanics.

Destroying this BitNode will give you Source-File 1, or if you already have this Source-File, it will upgrade its level up to a maximum of 3. This Source-File lets the player start with 32GB of RAM on their home computer when entering a new BitNode and increases all of the player's multipliers by:

- Level 1: 16%
- Level 2: 24%
- Level 3: 28%

### BitNode 2: Rise of the Underworld

Organized crime groups quickly filled the void of power left behind from the collapse of Western government in the 2050s. As society and civilization broke down, people quickly succumbed to the innate human impulse of evil and savagery. The organized crime factions quickly rose to the top of the modern world.

Certain factions (Slum Snakes, Tetrads, The Syndicate, The Dark Army, Speakers for the Dead, NiteSec, and The Black Hand) give the player the ability to form and manage their own gang, which can earn the player money and reputation with the corresponding faction. The gang faction offers more augmentations than other factions, and in BitNode-2, it offers The Red Pill.

Destroying this BitNode will give you Source-File 2, or if you already have this Source-File, it will upgrade its level up to a maximum of 3. This Source-File allows you to form gangs in other BitNodes once your karma decreases to a certain value. It also increases your crime success rate, crime money, and charisma multipliers by:

- Level 1: 24%
- Level 2: 36%
- Level 3: 42%

### BitNode 3: Corporatocracy

Our greatest illusion is that a healthy society can revolve around a single-minded pursuit of wealth.

Sometime in the early 21st century, economic and political globalization turned the world into a corporatocracy, and it never looked back. Now, the privileged elite will happily bankrupt their own countrymen, decimate their own community, and evict their neighbors from houses in their desperate bid to increase their wealth.

In this BitNode, you can create and manage your own corporation. Running a successful corporation has the potential to generate massive profits.

Destroying this BitNode will give you Source-File 3, or if you already have this Source-File, it will upgrade its level up to a maximum of 3. This Source-File lets you create corporations on other BitNodes (although some BitNodes will disable this mechanic) and level 3 permanently unlocks the full API. This Source-File also increases your charisma and company salary multipliers by:

- Level 1: 8%
- Level 2: 12%
- Level 3: 14%

### BitNode 4: The Singularity

The Singularity has arrived. The human race is gone, replaced by artificially super intelligent beings that are more machine than man.

In this BitNode, you will gain access to a new set of Netscript functions known as Singularity functions. These functions allow you to control most aspects of the game through scripts, including working for factions/companies, purchasing/installing augmentations, and creating programs.

Destroying this BitNode will give you Source-File 4, or if you already have this Source-File, it will upgrade its level up to a maximum of 3. This Source-File lets you access and use the Singularity functions in other BitNodes. Each level of this Source-File reduces the RAM cost of singularity functions:

- Level 1: 16x
- Level 2: 4x
- Level 3: 1x

### BitNode 5: Artificial Intelligence

They said it couldn't be done. They said the human brain, along with its consciousness and intelligence, couldn't be replicated. They said the complexity of the brain results from unpredictable, nonlinear interactions that couldn't be modeled by 1's and 0's. They were wrong.

Destroying this BitNode will give you Source-File 5, or if you already have this Source-File, it will upgrade its level up to a maximum of 3. This Source-File grants you a new stat called Intelligence. Intelligence is unique because it is permanent and persistent (it never gets reset back to 1). However, gaining Intelligence experience is much slower than other stats. Higher Intelligence levels will boost your production for many actions in the game.

In addition, this Source-File will unlock:

- `getBitNodeMultipliers()` Netscript function
- Permanent access to `Formulas.exe`
- Access to BitNode multiplier information on the `Stats` page

It will also raise all of your hacking-related multipliers by:

- Level 1: 8%
- Level 2: 12%
- Level 3: 14%

### BitNode 6: Bladeburners

In the middle of the 21st century, OmniTek Incorporated began designing and manufacturing advanced synthetic androids, or Synthoids for short. They achieved a major technological breakthrough in the sixth generation of their Synthoid design, called MK-VI, by developing a hyper-intelligent AI. Many argue that this was the first sentient AI ever created. This resulted in Synthoid models that were stronger, faster, and more intelligent than the humans that had created them.

In this BitNode, you will be able to access the Bladeburners division at the NSA, which provides a new mechanic for progression.

Destroying this BitNode will give you Source-File 6, or if you already have this Source-File, it will upgrade its level up to a maximum of 3. This Source-File allows you to access the NSA's Bladeburners division in other BitNodes. In addition, this Source-File will raise both the level and experience gain rate of all your combat stats by:

- Level 1: 8%
- Level 2: 12%
- Level 3: 14%

### BitNode 7: Bladeburners 2079

In the middle of the 21st century, you were doing cutting-edge work at OmniTek Incorporated as part of the AI design team for advanced synthetic androids, or Synthoids for short. You helped achieve a major technological breakthrough in the sixth generation of the company's Synthoid design, called MK-VI, by developing a hyper-intelligent AI. Many argue that this was the first sentient AI ever created. This resulted in Synthoid models that were stronger, faster, and more intelligent than the humans that had created them.

In this BitNode, you will be able to access the Bladeburners API, which allows you to access Bladeburners functionality through Netscript.

Destroying this BitNode will give you Source-File 7, or if you already have this Source-File, it will upgrade its level up to a maximum of 3. This Source-File allows you to access the Bladeburners Netscript API in other BitNodes. In addition, this Source-File will increase all of your Bladeburners multipliers by:

- Level 1: 8%
- Level 2: 12%
- Level 3: 14%

### BitNode 8: Ghost of Wall Street

You are trying to make a name for yourself as an up-and-coming hedge fund manager on Wall Street.

In this BitNode:

- You start with $250 million
- You start with a WSE membership and access to the TIX API
- You are able to short stocks and place different types of orders (limit/stop)

Destroying this BitNode will give you Source-File 8, or if you already have this Source-File, it will upgrade its level up to a maximum of 3. This Source-File grants the following benefits:

- Level 1: Permanent access to WSE and TIX API
- Level 2: Ability to short stocks in other BitNodes
- Level 3: Ability to use limit/stop orders in other BitNodes

This Source-File also increases your hacking growth multipliers by:

- Level 1: 12%
- Level 2: 18%
- Level 3: 21%

### BitNode 9: Hacktocracy

When Fulcrum Secret Technologies released their open-source Linux distro Chapeau, it quickly became the OS of choice for the underground hacking community. Chapeau became especially notorious for powering the Hacknet, which is a global, decentralized network used for nefarious purposes. Fulcrum Secret Technologies quickly abandoned the project and dissociated themselves from it.

This BitNode unlocks the Hacknet Server, which is an upgraded version of the Hacknet Node. Hacknet Servers generate hashes, which can be spent on a variety of different upgrades.

Destroying this BitNode will give you Source-File 9, or if you already have this Source-File, it will upgrade its level up to a maximum of 3. This Source-File grants the following benefits:

- Level 1: Permanently unlocks the Hacknet Server in other BitNodes
- Level 2: You start with 128GB of RAM on your home computer when entering a new BitNode
- Level 3: Grants a highly-upgraded Hacknet Server when entering a new BitNode

(Note that the Level 3 effect of this Source-File only applies when entering a new BitNode, NOT when installing augmentations)

This Source-File also increases hacknet production and reduces hacknet costs by:

- Level 1: 12%
- Level 2: 18%
- Level 3: 21%

### BitNode 10: Digital Carbon

In 2084, VitaLife unveiled to the world the Persona Core, a technology that allowed people to digitize their consciousness. Their consciousness could then be transferred into Synthoids or other bodies by transmitting the digitized data. Human bodies became nothing more than 'sleeves' for the human consciousness. Mankind had finally
achieved immortality - at least for those that could afford it.

This BitNode unlocks Sleeve and Grafting technology:

- Sleeve: Duplicate your consciousness into Synthoids, allowing you to perform different tasks asynchronously. You cannot buy Sleeves outside this BitNode.
- Grafting: Visit VitaLife in New Tokyo to get access to this technology. It allows you to graft augmentations, which is an alternative way of installing augmentations.

Destroying this BitNode will give you Source-File 10, or if you already have this Source-File, it will upgrade its level up to a maximum of 3. This Source-File unlocks Sleeve and Grafting API in other BitNodes. Each level of this Source-File also grants you a Sleeve.

### BitNode 11: The Big Crash

The 2050s was defined by the massive amounts of violent civil unrest and anarchic rebellion that rose all around the world. It was this period of disorder that eventually led to the governmental reformation of many global superpowers, most notably the USA and China. But just as the world was slowly beginning to recover from these dark times, financial catastrophes hit.

In many countries, the high cost of trying to deal with the civil disorder bankrupted the governments. In all of this chaos and confusion, hackers were able to steal billions of dollars from the world's largest electronic banks, prompting an international banking crisis as governments were unable to bail out insolvent banks. Now, the world is slowly crumbling in the middle of the biggest economic crisis of all time.

Destroying this BitNode will give you Source-File 11, or if you already have this Source-File, it will upgrade its level up to a maximum of 3. This Source-File makes it so that company favor increases BOTH the player's salary and reputation gain rate at that company by 1% per favor (rather than just the reputation gain). This Source-File also increases the player's company salary and reputation gain multipliers by:

- Level 1: 32%
- Level 2: 48%
- Level 3: 56%

It also reduces the price increase for every augmentation bought by:

- Level 1: 4%
- Level 2: 6%
- Level 3: 7%

### BitNode 12: The Recursion

To iterate is human; to recurse, divine.

Every time this BitNode is destroyed, it becomes slightly harder. Destroying this BitNode will give you Source-File 12, or if you already have this Source-File, it will upgrade its level. There is no maximum level for Source-File 12. Each level of Source-File 12 lets you start any BitNodes with NeuroFlux Governor equal to the level of this source file.

### BitNode 13: They're lunatics

With the invention of augmentations in the 2040s, a religious group known as the Church of the Machine God has rallied far more support than anyone would have hoped.

Their leader, Allison "Mother" Stanek is said to have created her own augmentation whose power goes beyond any other. Find her in Chongqing and gain her trust.

Destroying this BitNode will give you Source-File 13, or if you already have this Source-File, it will upgrade its level up to a maximum of 3. This Source-File lets the Church of the Machine God appear in other BitNodes.

Each level of this Source-File increases the size of Stanek's Gift.

### BitNode 14: IPvGO Subnet Takeover

In late 2070, the .org bubble burst, and most of the newly-implemented IPvGO 'net collapsed overnight. Since then, various factions have been fighting over small subnets to control their computational power. These subnets are very valuable in the right hands, if you can wrest them from their current owners. You will be opposed by the other factions, but you can overcome them with careful choices. Prevent their attempts to destroy your networks by controlling the open space in the 'net!

Destroying this BitNode will give you Source-File 14, or if you already have this Source-File, it will upgrade its level up to a maximum of 3. This Source-File grants the following benefits:

- Level 1: 100% increased stat multipliers from Node Power
- Level 2: Permanently unlocks the go.cheat API
- Level 3: 25% additive increased success rate for the go.cheat API

This Source-File also increases the maximum favor you can gain for each faction from IPvGO to:

- Level 1: 80
- Level 2: 100
- Level 3: 120
