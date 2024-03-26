import { BlackOperation } from "../Actions/BlackOperation";
import { BladeBlackOpName, CityName, FactionName } from "@enums";

export const BlackOperations: Record<BladeBlackOpName, BlackOperation> = {
  [BladeBlackOpName.OperationTyphoon]: new BlackOperation({
    name: BladeBlackOpName.OperationTyphoon,
    n: 0,
    baseDifficulty: 2000,
    reqdRank: 2.5e3,
    rankGain: 50,
    rankLoss: 10,
    hpLoss: 100,
    weights: {
      hacking: 0.1,
      strength: 0.2,
      defense: 0.2,
      dexterity: 0.2,
      agility: 0.2,
      charisma: 0,
      intelligence: 0.1,
    },
    decays: {
      hacking: 0.6,
      strength: 0.8,
      defense: 0.8,
      dexterity: 0.8,
      agility: 0.8,
      charisma: 0,
      intelligence: 0.75,
    },
    isKill: true,
    desc:
      "Obadiah Zenyatta is the leader of a RedWater PMC. It has long been known among the intelligence community " +
      "that Zenyatta, along with the rest of the PMC, is a Synthoid.\n\n" +
      `The goal of ${BladeBlackOpName.OperationTyphoon} is to find and eliminate Zenyatta and RedWater by any means ` +
      "necessary. After the task is completed, the actions must be covered up from the general public.",
  }),
  [BladeBlackOpName.OperationZero]: new BlackOperation({
    name: BladeBlackOpName.OperationZero,
    n: 1,
    baseDifficulty: 2500,
    reqdRank: 5e3,
    rankGain: 60,
    rankLoss: 15,
    hpLoss: 50,
    weights: {
      hacking: 0.2,
      strength: 0.15,
      defense: 0.15,
      dexterity: 0.2,
      agility: 0.2,
      charisma: 0,
      intelligence: 0.1,
    },
    decays: {
      hacking: 0.6,
      strength: 0.8,
      defense: 0.8,
      dexterity: 0.8,
      agility: 0.8,
      charisma: 0,
      intelligence: 0.75,
    },
    isStealth: true,
    desc:
      "AeroCorp is one of the world's largest defense contractors. Its leader, Steve Watataki, is thought to be " +
      "a supporter of Synthoid rights. He must be removed.\n\n" +
      `The goal of ${BladeBlackOpName.OperationZero} is to covertly infiltrate AeroCorp and uncover any incriminating ` +
      "evidence or information against Watataki that will cause him to be removed from his position at AeroCorp. " +
      "Incriminating evidence can be fabricated as a last resort. Be warned that AeroCorp has some of the most advanced " +
      "security measures in the world.",
  }),
  [BladeBlackOpName.OperationX]: new BlackOperation({
    name: BladeBlackOpName.OperationX,
    n: 2,
    baseDifficulty: 3000,
    reqdRank: 7.5e3,
    rankGain: 75,
    rankLoss: 15,
    hpLoss: 100,
    weights: {
      hacking: 0.1,
      strength: 0.2,
      defense: 0.2,
      dexterity: 0.2,
      agility: 0.2,
      charisma: 0,
      intelligence: 0.1,
    },
    decays: {
      hacking: 0.6,
      strength: 0.8,
      defense: 0.8,
      dexterity: 0.8,
      agility: 0.8,
      charisma: 0,
      intelligence: 0.75,
    },
    isKill: true,
    desc:
      "We have recently discovered an underground publication group called Samizdat. Even though most of their " +
      "publications are nonsensical conspiracy theories, the average human is gullible enough to believe them. Many of " +
      "their works discuss Synthoids and pose a threat to society. The publications are spreading rapidly in China and " +
      "other Eastern countries.\n\n" +
      "Samizdat has done a good job of keeping hidden and anonymous. However, we've just received intelligence that " +
      `their base of operations is in ${CityName.Ishima}'s underground sewer systems. Your task is to investigate the ` +
      "sewer systems, and eliminate Samizdat. They must never publish anything again.",
  }),
  [BladeBlackOpName.OperationTitan]: new BlackOperation({
    name: BladeBlackOpName.OperationTitan,
    n: 3,
    baseDifficulty: 4000,
    reqdRank: 10e3,
    rankGain: 100,
    rankLoss: 20,
    hpLoss: 100,
    weights: {
      hacking: 0.1,
      strength: 0.2,
      defense: 0.2,
      dexterity: 0.2,
      agility: 0.2,
      charisma: 0,
      intelligence: 0.1,
    },
    decays: {
      hacking: 0.6,
      strength: 0.8,
      defense: 0.8,
      dexterity: 0.8,
      agility: 0.8,
      charisma: 0,
      intelligence: 0.75,
    },
    isKill: true,
    desc:
      "Several months ago Titan Laboratories' Bioengineering department was infiltrated by Synthoids. As far as we " +
      "know, Titan Laboratories' management has no knowledge about this. We don't know what the Synthoids are up to, " +
      "but the research that they could be conducting using Titan Laboratories' vast resources is potentially very " +
      "dangerous.\n\n" +
      `Your goal is to enter and destroy the Bioengineering department's facility in ${CityName.Aevum}. The task is not ` +
      "just to retire the Synthoids there, but also to destroy any information or research at the facility that is " +
      "relevant to the Synthoids and their goals.",
  }),
  [BladeBlackOpName.OperationAres]: new BlackOperation({
    name: BladeBlackOpName.OperationAres,
    n: 4,
    baseDifficulty: 5000,
    reqdRank: 12.5e3,
    rankGain: 125,
    rankLoss: 20,
    hpLoss: 200,
    weights: {
      hacking: 0,
      strength: 0.25,
      defense: 0.25,
      dexterity: 0.25,
      agility: 0.25,
      charisma: 0,
      intelligence: 0,
    },
    decays: {
      hacking: 0,
      strength: 0.8,
      defense: 0.8,
      dexterity: 0.8,
      agility: 0.8,
      charisma: 0,
      intelligence: 0.75,
    },
    isKill: true,
    desc:
      "One of our undercover agents, Agent Carter, has informed us of a massive weapons deal going down in Dubai " +
      "between rogue Russian militants and a radical Synthoid community. These weapons are next-gen plasma and energy " +
      "weapons. It is critical for the safety of humanity that this deal does not happen.\n\n" +
      "Your task is to intercept the deal. Leave no survivors.",
  }),
  [BladeBlackOpName.OperationArchangel]: new BlackOperation({
    name: BladeBlackOpName.OperationArchangel,
    n: 5,
    baseDifficulty: 7500,
    reqdRank: 15e3,
    rankGain: 200,
    rankLoss: 20,
    hpLoss: 25,
    weights: {
      hacking: 0,
      strength: 0.2,
      defense: 0.2,
      dexterity: 0.3,
      agility: 0.3,
      charisma: 0,
      intelligence: 0,
    },
    decays: {
      hacking: 0,
      strength: 0.8,
      defense: 0.8,
      dexterity: 0.8,
      agility: 0.8,
      charisma: 0,
      intelligence: 0.75,
    },
    isKill: true,
    desc:
      "Our analysts have discovered that the popular Red Rabbit brothel in Amsterdam is run and 'staffed' by MK-VI " +
      "Synthoids. Intelligence suggests that the profit from this brothel is used to fund a large black market arms " +
      "trafficking operation.\n\n" +
      "The goal of this operation is to take out the leaders that are running the Red Rabbit brothel. Try to limit the " +
      "number of other casualties, but do what you must to complete the mission.",
  }),
  [BladeBlackOpName.OperationJuggernaut]: new BlackOperation({
    name: BladeBlackOpName.OperationJuggernaut,
    n: 6,
    baseDifficulty: 10e3,
    reqdRank: 20e3,
    rankGain: 300,
    rankLoss: 40,
    hpLoss: 300,
    weights: {
      hacking: 0,
      strength: 0.25,
      defense: 0.25,
      dexterity: 0.25,
      agility: 0.25,
      charisma: 0,
      intelligence: 0,
    },
    decays: {
      hacking: 0,
      strength: 0.8,
      defense: 0.8,
      dexterity: 0.8,
      agility: 0.8,
      charisma: 0,
      intelligence: 0.75,
    },
    isKill: true,
    desc:
      "The CIA has just encountered a new security threat. A new criminal group, lead by a shadowy operative who calls " +
      "himself Juggernaut, has been smuggling drugs and weapons (including suspected bioweapons) into " +
      `${CityName.Sector12}. We also have reason to believe they tried to break into one of Universal Energy's ` +
      "facilities in order to cause a city-wide blackout. The CIA suspects that Juggernaut is a heavily-augmented " +
      "Synthoid, and have thus enlisted our help.\n\n" +
      "Your mission is to eradicate Juggernaut and his followers.",
  }),
  [BladeBlackOpName.OperationRedDragon]: new BlackOperation({
    name: BladeBlackOpName.OperationRedDragon,
    n: 7,
    baseDifficulty: 12.5e3,
    reqdRank: 25e3,
    rankGain: 500,
    rankLoss: 50,
    hpLoss: 500,
    weights: {
      hacking: 0.05,
      strength: 0.2,
      defense: 0.2,
      dexterity: 0.25,
      agility: 0.25,
      charisma: 0,
      intelligence: 0.05,
    },
    decays: {
      hacking: 0.6,
      strength: 0.8,
      defense: 0.8,
      dexterity: 0.8,
      agility: 0.8,
      charisma: 0,
      intelligence: 0.75,
    },
    isKill: true,
    desc:
      `The ${FactionName.Tetrads} criminal organization is suspected of reverse-engineering the MK-VI Synthoid design. ` +
      "We believe they altered and possibly improved the design and began manufacturing their own Synthoid models in" +
      "order to bolster their criminal activities.\n\n" +
      `Your task is to infiltrate and destroy the ${FactionName.Tetrads}' base of operations in Los Angeles. ` +
      "Intelligence tells us that their base houses one of their Synthoid manufacturing units.",
  }),
  [BladeBlackOpName.OperationK]: new BlackOperation({
    name: BladeBlackOpName.OperationK,
    n: 8,
    baseDifficulty: 15e3,
    reqdRank: 30e3,
    rankGain: 750,
    rankLoss: 60,
    hpLoss: 1000,
    weights: {
      hacking: 0.05,
      strength: 0.2,
      defense: 0.2,
      dexterity: 0.25,
      agility: 0.25,
      charisma: 0,
      intelligence: 0.05,
    },
    decays: {
      hacking: 0.6,
      strength: 0.8,
      defense: 0.8,
      dexterity: 0.8,
      agility: 0.8,
      charisma: 0,
      intelligence: 0.75,
    },
    isKill: true,
    desc:
      "CODE RED SITUATION. Our intelligence tells us that VitaLife has discovered a new android cloning technology. " +
      "This technology is supposedly capable of cloning Synthoids, not only physically but also their advanced AI " +
      "modules. We do not believe that VitaLife is trying to use this technology illegally or maliciously, but if any " +
      "Synthoids were able to infiltrate the corporation and take advantage of this technology then the results would " +
      "be catastrophic.\n\n" +
      "We do not have the power or jurisdiction to shut this down through legal or political means, so we must resort " +
      "to a covert operation. Your goal is to destroy this technology and eliminate anyone who was involved in its " +
      "creation.",
  }),
  [BladeBlackOpName.OperationDeckard]: new BlackOperation({
    name: BladeBlackOpName.OperationDeckard,
    n: 9,
    baseDifficulty: 20e3,
    reqdRank: 40e3,
    rankGain: 1e3,
    rankLoss: 75,
    hpLoss: 200,
    weights: {
      hacking: 0,
      strength: 0.24,
      defense: 0.24,
      dexterity: 0.24,
      agility: 0.24,
      charisma: 0,
      intelligence: 0.04,
    },
    decays: {
      hacking: 0,
      strength: 0.8,
      defense: 0.8,
      dexterity: 0.8,
      agility: 0.8,
      charisma: 0,
      intelligence: 0.75,
    },
    isKill: true,
    desc:
      "Despite your success in eliminating VitaLife's new android-replicating technology in " +
      `${BladeBlackOpName.OperationK}, we've discovered that a small group of MK-VI Synthoids were able to make off with ` +
      "the schematics and design of the technology before the Operation. It is almost a certainty that these Synthoids " +
      "are some of the rogue MK-VI ones from the Synthoid Uprising.\n\n" +
      `The goal of ${BladeBlackOpName.OperationDeckard} is to hunt down these Synthoids and retire them. I don't need to ` +
      "tell you how critical this mission is.",
  }),
  [BladeBlackOpName.OperationTyrell]: new BlackOperation({
    name: BladeBlackOpName.OperationTyrell,
    n: 10,
    baseDifficulty: 25e3,
    reqdRank: 50e3,
    rankGain: 1.5e3,
    rankLoss: 100,
    hpLoss: 500,
    weights: {
      hacking: 0.1,
      strength: 0.2,
      defense: 0.2,
      dexterity: 0.2,
      agility: 0.2,
      charisma: 0,
      intelligence: 0.1,
    },
    decays: {
      hacking: 0.6,
      strength: 0.8,
      defense: 0.8,
      dexterity: 0.8,
      agility: 0.8,
      charisma: 0,
      intelligence: 0.75,
    },
    isKill: true,
    desc:
      `A week ago ${FactionName.BladeIndustries} reported a small break-in at one of their ${CityName.Aevum} ` +
      `Augmentation storage facilities. We figured out that ${FactionName.TheDarkArmy} was behind the heist, and didn't think ` +
      "any more of it. However, we've just discovered that several known MK-VI Synthoids were part of that break-in group.\n\n" +
      "We cannot have Synthoids upgrading their already-enhanced abilities with Augmentations. Your task is to hunt " +
      `down associated ${FactionName.TheDarkArmy} members and eliminate them.`,
  }),
  [BladeBlackOpName.OperationWallace]: new BlackOperation({
    name: BladeBlackOpName.OperationWallace,
    n: 11,
    baseDifficulty: 30e3,
    reqdRank: 75e3,
    rankGain: 2e3,
    rankLoss: 150,
    hpLoss: 1500,
    weights: {
      hacking: 0,
      strength: 0.24,
      defense: 0.24,
      dexterity: 0.24,
      agility: 0.24,
      charisma: 0,
      intelligence: 0.04,
    },
    decays: {
      hacking: 0.6,
      strength: 0.8,
      defense: 0.8,
      dexterity: 0.8,
      agility: 0.8,
      charisma: 0,
      intelligence: 0.75,
    },
    isKill: true,
    desc:
      `Based on information gathered from ${BladeBlackOpName.OperationTyrell}, we've discovered that ` +
      `${FactionName.TheDarkArmy} was well aware that there were Synthoids amongst their ranks. Even worse, we believe ` +
      `that ${FactionName.TheDarkArmy} is working together with other criminal organizations such as ` +
      `${FactionName.TheSyndicate} and that they are planning some sort of large-scale takeover of multiple major ` +
      `cities, most notably ${CityName.Aevum}. We suspect that Synthoids have infiltrated the ranks of these criminal ` +
      "factions and are trying to stage another Synthoid uprising.\n\n" +
      "The best way to deal with this is to prevent it before it even happens. The goal of " +
      `${BladeBlackOpName.OperationWallace} is to destroy ${FactionName.TheDarkArmy} and Syndicate factions in ` +
      `${CityName.Aevum} immediately. Leave no survivors.`,
  }),
  [BladeBlackOpName.OperationShoulderOfOrion]: new BlackOperation({
    name: BladeBlackOpName.OperationShoulderOfOrion,
    n: 12,
    baseDifficulty: 35e3,
    reqdRank: 100e3,
    rankGain: 2.5e3,
    rankLoss: 500,
    hpLoss: 1500,
    weights: {
      hacking: 0.1,
      strength: 0.2,
      defense: 0.2,
      dexterity: 0.2,
      agility: 0.2,
      charisma: 0,
      intelligence: 0.1,
    },
    decays: {
      hacking: 0.6,
      strength: 0.8,
      defense: 0.8,
      dexterity: 0.8,
      agility: 0.8,
      charisma: 0,
      intelligence: 0.75,
    },
    isStealth: true,
    desc:
      "China's Solaris Space Systems is secretly launching the first manned spacecraft in over a decade using " +
      "Synthoids. We believe China is trying to establish the first off-world colonies.\n\n" +
      "The mission is to prevent this launch without instigating an international conflict. When you accept this " +
      "mission you will be officially disavowed by the NSA and the national government until after you successfully " +
      "return. In the event of failure, all of the operation's team members must not let themselves be captured alive.",
  }),
  [BladeBlackOpName.OperationHyron]: new BlackOperation({
    name: BladeBlackOpName.OperationHyron,
    n: 13,
    baseDifficulty: 40e3,
    reqdRank: 125e3,
    rankGain: 3e3,
    rankLoss: 1e3,
    hpLoss: 500,
    weights: {
      hacking: 0.1,
      strength: 0.2,
      defense: 0.2,
      dexterity: 0.2,
      agility: 0.2,
      charisma: 0,
      intelligence: 0.1,
    },
    decays: {
      hacking: 0.6,
      strength: 0.8,
      defense: 0.8,
      dexterity: 0.8,
      agility: 0.8,
      charisma: 0,
      intelligence: 0.75,
    },
    isKill: true,
    desc:
      `Our intelligence tells us that ${FactionName.FulcrumSecretTechnologies} is developing a quantum supercomputer ` +
      "using human brains as core processors. This supercomputer is rumored to be able to store vast amounts of data " +
      "and perform computations unmatched by any other supercomputer on the planet. But more importantly, the use of " +
      "organic human brains means that the supercomputer may be able to reason abstractly and become self-aware.\n\n" +
      "I do not need to remind you why sentient-level AIs pose a serious threat to all of mankind.\n\n" +
      `The research for this project is being conducted at one of ${FactionName.FulcrumSecretTechnologies} secret ` +
      `facilities in ${CityName.Aevum}, codenamed 'Alpha Ranch'. Infiltrate the compound, delete and destroy the work, ` +
      "and then find and kill the project lead.",
  }),
  [BladeBlackOpName.OperationMorpheus]: new BlackOperation({
    name: BladeBlackOpName.OperationMorpheus,
    n: 14,
    baseDifficulty: 45e3,
    reqdRank: 150e3,
    rankGain: 4e3,
    rankLoss: 1e3,
    hpLoss: 100,
    weights: {
      hacking: 0.05,
      strength: 0.15,
      defense: 0.15,
      dexterity: 0.3,
      agility: 0.3,
      charisma: 0,
      intelligence: 0.05,
    },
    decays: {
      hacking: 0.6,
      strength: 0.8,
      defense: 0.8,
      dexterity: 0.8,
      agility: 0.8,
      charisma: 0,
      intelligence: 0.75,
    },
    isStealth: true,
    desc:
      "DreamSense Technologies is an advertising company that uses special technology to transmit their ads into the " +
      "people's dreams and subconscious. They do this using broadcast transmitter towers. Based on information from our " +
      `agents and informants in ${CityName.Chongqing}, we have reason to believe that one of the broadcast towers there ` +
      "has been compromised by Synthoids and is being used to spread pro-Synthoid propaganda.\n\n" +
      "The mission is to destroy this broadcast tower. Speed and stealth are of the utmost importance for this.",
  }),
  [BladeBlackOpName.OperationIonStorm]: new BlackOperation({
    name: BladeBlackOpName.OperationIonStorm,
    n: 15,
    baseDifficulty: 50e3,
    reqdRank: 175e3,
    rankGain: 5e3,
    rankLoss: 1e3,
    hpLoss: 5000,
    weights: {
      hacking: 0,
      strength: 0.24,
      defense: 0.24,
      dexterity: 0.24,
      agility: 0.24,
      charisma: 0,
      intelligence: 0.04,
    },
    decays: {
      hacking: 0.6,
      strength: 0.8,
      defense: 0.8,
      dexterity: 0.8,
      agility: 0.8,
      charisma: 0,
      intelligence: 0.75,
    },
    isKill: true,
    desc:
      "Our analysts have uncovered a gathering of MK-VI Synthoids that have taken up residence in the " +
      `${CityName.Sector12} Slums. We don't know if they are rogue Synthoids from the Uprising, but we do know that they ` +
      "have been stockpiling weapons, money, and other resources. This makes them dangerous.\n\n" +
      `This is a full-scale assault operation to find and retire all of these Synthoids in the ${CityName.Sector12} ` +
      "Slums.",
  }),
  [BladeBlackOpName.OperationAnnihilus]: new BlackOperation({
    name: BladeBlackOpName.OperationAnnihilus,
    n: 16,
    baseDifficulty: 55e3,
    reqdRank: 200e3,
    rankGain: 7.5e3,
    rankLoss: 1e3,
    hpLoss: 10e3,
    weights: {
      hacking: 0,
      strength: 0.24,
      defense: 0.24,
      dexterity: 0.24,
      agility: 0.24,
      charisma: 0,
      intelligence: 0.04,
    },
    decays: {
      hacking: 0.6,
      strength: 0.8,
      defense: 0.8,
      dexterity: 0.8,
      agility: 0.8,
      charisma: 0,
      intelligence: 0.75,
    },
    isKill: true,
    desc:
      "Our superiors have ordered us to eradicate everything and everyone in an underground facility located in " +
      `${CityName.Aevum}. They tell us that the facility houses many dangerous Synthoids and belongs to a terrorist ` +
      `organization called '${FactionName.TheCovenant}'. We have no prior intelligence about this organization, so you ` +
      "are going in blind.",
  }),
  [BladeBlackOpName.OperationUltron]: new BlackOperation({
    name: BladeBlackOpName.OperationUltron,
    n: 17,
    baseDifficulty: 60e3,
    reqdRank: 250e3,
    rankGain: 10e3,
    rankLoss: 2e3,
    hpLoss: 10e3,
    weights: {
      hacking: 0.1,
      strength: 0.2,
      defense: 0.2,
      dexterity: 0.2,
      agility: 0.2,
      charisma: 0,
      intelligence: 0.1,
    },
    decays: {
      hacking: 0.6,
      strength: 0.8,
      defense: 0.8,
      dexterity: 0.8,
      agility: 0.8,
      charisma: 0,
      intelligence: 0.75,
    },
    isKill: true,
    desc:
      `${FactionName.OmniTekIncorporated}, the original designer and manufacturer of Synthoids, has notified us of a ` +
      "malfunction in their AI design. This malfunction, when triggered, causes MK-VI Synthoids to become radicalized " +
      "and seek out the destruction of humanity. They say that this bug affects all MK-VI Synthoids, not just the rogue " +
      "ones from the Uprising.\n\n" +
      `${FactionName.OmniTekIncorporated} has also told us they believe someone has triggered this malfunction in a ` +
      "large group of MK-VI Synthoids, and that these newly-radicalized Synthoids are now amassing in " +
      `${CityName.Volhaven} to form a terrorist group called Ultron.\n\n` +
      "Intelligence suggests Ultron is heavily armed and that their members are augmented. We believe Ultron is making " +
      "moves to take control of and weaponize DeltaOne's Tactical High-Energy Satellite Laser Array (THESLA).\n\n" +
      "Your task is to find and destroy Ultron.",
  }),
  [BladeBlackOpName.OperationCenturion]: new BlackOperation({
    name: BladeBlackOpName.OperationCenturion,
    n: 18,
    baseDifficulty: 70e3,
    reqdRank: 300e3,
    rankGain: 15e3,
    rankLoss: 5e3,
    hpLoss: 10e3,
    weights: {
      hacking: 0.1,
      strength: 0.2,
      defense: 0.2,
      dexterity: 0.2,
      agility: 0.2,
      charisma: 0,
      intelligence: 0.1,
    },
    decays: {
      hacking: 0.6,
      strength: 0.8,
      defense: 0.8,
      dexterity: 0.8,
      agility: 0.8,
      charisma: 0,
      intelligence: 0.75,
    },
    desc:
      "D)@#)($M)C0293c40($*)@#D0JUMP3Rm0C<*@#)*$)#02c94830c(#$*D)\n\n" +
      "Throughout all of humanity's history, we have relied on technology to survive, conquer, and progress. Its " +
      "advancement became our primary goal. And at the peak of human civilization technology turned into power. Global, " +
      "absolute power.\n\n" +
      "It seems that the universe is not without a sense of irony.\n\n" +
      "D)@#)($M)C0293c40($*)@#D0JUMP3Rm0C<*@#)*$)#02c94830c(#$*D)",
  }),
  [BladeBlackOpName.OperationVindictus]: new BlackOperation({
    name: BladeBlackOpName.OperationVindictus,
    n: 19,
    baseDifficulty: 75e3,
    reqdRank: 350e3,
    rankGain: 20e3,
    rankLoss: 20e3,
    hpLoss: 20e3,
    weights: {
      hacking: 0.1,
      strength: 0.2,
      defense: 0.2,
      dexterity: 0.2,
      agility: 0.2,
      charisma: 0,
      intelligence: 0.1,
    },
    decays: {
      hacking: 0.6,
      strength: 0.8,
      defense: 0.8,
      dexterity: 0.8,
      agility: 0.8,
      charisma: 0,
      intelligence: 0.75,
    },
    desc:
      "D)@#)($M)C0293c40($*)@#D0JUMP3Rm0C<*@#)*$)#02c94830c(#$*D)\n\n" +
      "The bits are all around us. The daemons that hold the Node together can manifest themselves in many different " +
      "ways.\n\n" +
      "D)@#)($M)C0293c40($*)@#D0JUMP3Rm0C<*@#)*$)#02c94830c(#$*D)",
  }),
  [BladeBlackOpName.OperationDaedalus]: new BlackOperation({
    name: BladeBlackOpName.OperationDaedalus,
    n: 20,
    baseDifficulty: 80e3,
    reqdRank: 400e3,
    rankGain: 40e3,
    rankLoss: 10e3,
    hpLoss: 100e3,
    weights: {
      hacking: 0.1,
      strength: 0.2,
      defense: 0.2,
      dexterity: 0.2,
      agility: 0.2,
      charisma: 0,
      intelligence: 0.1,
    },
    decays: {
      hacking: 0.6,
      strength: 0.8,
      defense: 0.8,
      dexterity: 0.8,
      agility: 0.8,
      charisma: 0,
      intelligence: 0.75,
    },
    desc: "Yesterday we obeyed kings and bent our neck to emperors. Today we kneel only to truth.",
  }),
};

/** Array for quick lookup by blackop number */
export const blackOpsArray = Object.values(BlackOperations).sort((a, b) => (a.n < b.n ? -1 : 1));
// Verify that all "n" properties match the index in the array
if (!blackOpsArray.every((blackOp, i) => blackOp.n === i)) {
  throw new Error("blackOpsArray did not initialize with correct indices");
}
