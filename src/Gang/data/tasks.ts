import { ITaskParams } from "../ITaskParams";

/**
 * Defines the parameters that can be used to initialize and describe a GangMemberTask
 * (defined in Gang.js)
 */
interface IGangMemberTaskMetadata {
  /** Description of the task */
  desc: string;

  /** Whether or not this task can be done by enforcers */
  allowEnforcers: boolean;

  /** Whether or not this task can be done by hackers */
  allowHackers: boolean;

  /** Name of the task */
  name: string;

  /**
   * An object containing weighting parameters for the task. These parameters are used for
   * various calculations (respect gain, wanted gain, etc.)
   */
  params: ITaskParams;
}

/**
 * Array of metadata for all Gang Member tasks. Used to construct the global GangMemberTask
 * objects in Gang.js
 */
export const gangMemberTasksMetadata: IGangMemberTaskMetadata[] = [
  {
    desc: "This gang member is currently idle",
    allowEnforcers: true,
    allowHackers: true,
    name: "Unassigned",
    params: { hackWeight: 100 }, // This is just to get by the weight check in the GangMemberTask constructor
  },
  {
    desc: "Create and distribute ransomware<br><br>Earns money - Slightly increases respect - Slightly increases wanted level",
    allowEnforcers: false,
    allowHackers: true,
    name: "Ransomware",
    params: {
      baseRespect: 0.00055,
      baseWanted: 0.0007,
      baseMoney: 15,
      hackWeight: 100,
      difficulty: 1,
    },
  },
  {
    desc: "Attempt phishing scams and attacks<br><br>Earns money - Slightly increases respect - Slightly increases wanted level",
    allowEnforcers: false,
    allowHackers: true,
    name: "Phishing",
    params: {
      baseRespect: 0.00088,
      baseWanted: 0.021,
      baseMoney: 37.5,
      hackWeight: 85,
      chaWeight: 15,
      difficulty: 3.5,
    },
  },
  {
    desc: "Attempt identity theft<br><br>Earns money - Increases respect - Increases wanted level",
    allowEnforcers: false,
    allowHackers: true,
    name: "Identity Theft",
    params: {
      baseRespect: 0.0011,
      baseWanted: 0.525,
      baseMoney: 90,
      hackWeight: 80,
      chaWeight: 20,
      difficulty: 5,
    },
  },
  {
    desc: "Carry out DDoS attacks<br><br>Increases respect - Increases wanted level",
    allowEnforcers: false,
    allowHackers: true,
    name: "DDoS Attacks",
    params: {
      baseRespect: 0.0044,
      baseWanted: 1.4,
      hackWeight: 100,
      difficulty: 8,
    },
  },
  {
    desc: "Create and distribute malicious viruses<br><br>Increases respect - Increases wanted level",
    allowEnforcers: false,
    allowHackers: true,
    name: "Plant Virus",
    params: {
      baseRespect: 0.0066,
      baseWanted: 2.8,
      hackWeight: 100,
      difficulty: 12,
    },
  },
  {
    desc: "Commit financial fraud and digital counterfeiting<br><br>Earns money - Slightly increases respect - Slightly increases wanted level",
    allowEnforcers: false,
    allowHackers: true,
    name: "Fraud & Counterfeiting",
    params: {
      baseRespect: 0.0044,
      baseWanted: 2.1,
      baseMoney: 225,
      hackWeight: 80,
      chaWeight: 20,
      difficulty: 20,
    },
  },
  {
    desc: "Launder money<br><br>Earns money - Increases respect - Increases wanted level",
    allowEnforcers: false,
    allowHackers: true,
    name: "Money Laundering",
    params: {
      baseRespect: 0.011,
      baseWanted: 8.75,
      baseMoney: 1800,
      hackWeight: 75,
      chaWeight: 25,
      difficulty: 25,
    },
  },
  {
    desc: "Commit acts of cyberterrorism<br><br>Greatly increases respect - Greatly increases wanted level",
    allowEnforcers: false,
    allowHackers: true,
    name: "Cyberterrorism",
    params: {
      baseRespect: 0.11,
      baseWanted: 42,
      hackWeight: 80,
      chaWeight: 20,
      difficulty: 36,
    },
  },
  {
    desc: "Work as an ethical hacker for corporations<br><br>Earns money - Lowers wanted level",
    allowEnforcers: false,
    allowHackers: true,
    name: "Ethical Hacking",
    params: {
      baseWanted: -0.0004,
      baseMoney: 15,
      hackWeight: 90,
      chaWeight: 10,
      difficulty: 1,
    },
  },
  {
    desc: "Mug random people on the streets<br><br>Earns money - Slightly increases respect - Very slightly increases wanted level",
    allowEnforcers: true,
    allowHackers: false,
    name: "Mug People",
    params: {
      baseRespect: 0.00055,
      baseWanted: 0.00035,
      baseMoney: 18,
      strWeight: 25,
      defWeight: 25,
      dexWeight: 25,
      agiWeight: 10,
      chaWeight: 15,
      difficulty: 1,
    },
  },
  {
    desc: "Sell drugs<br><br>Earns money - Slightly increases respect - Slightly increases wanted level - Scales slightly with territory",
    allowEnforcers: true,
    allowHackers: false,
    name: "Deal Drugs",
    params: {
      baseRespect: 0.00066,
      baseWanted: 0.014,
      baseMoney: 75,
      agiWeight: 20,
      dexWeight: 20,
      chaWeight: 60,
      difficulty: 3.5,
      territory: {
        money: 1.2,
        respect: 1,
        wanted: 1.15,
      },
    },
  },
  {
    desc: "Assign this gang member to extort civilians in your territory<br><br>Earns money - Slightly increases respect - Increases wanted - Scales heavily with territory",
    allowEnforcers: true,
    allowHackers: false,
    name: "Strongarm Civilians",
    params: {
      baseRespect: 0.00044,
      baseWanted: 0.14,
      baseMoney: 37.5,
      hackWeight: 10,
      strWeight: 25,
      defWeight: 25,
      dexWeight: 20,
      agiWeight: 10,
      chaWeight: 10,
      difficulty: 5,
      territory: {
        money: 1.6,
        respect: 1.1,
        wanted: 1.5,
      },
    },
  },
  {
    desc: "Assign this gang member to run cons<br><br>Earns money - Increases respect - Increases wanted level",
    allowEnforcers: true,
    allowHackers: false,
    name: "Run a Con",
    params: {
      baseRespect: 0.00132,
      baseWanted: 0.35,
      baseMoney: 225,
      strWeight: 5,
      defWeight: 5,
      agiWeight: 25,
      dexWeight: 25,
      chaWeight: 40,
      difficulty: 14,
    },
  },
  {
    desc: "Assign this gang member to commit armed robbery on stores, banks and armored cars<br><br>Earns money - Increases respect - Increases wanted level",
    allowEnforcers: true,
    allowHackers: false,
    name: "Armed Robbery",
    params: {
      baseRespect: 0.00154,
      baseWanted: 0.7,
      baseMoney: 570,
      hackWeight: 20,
      strWeight: 15,
      defWeight: 15,
      agiWeight: 10,
      dexWeight: 20,
      chaWeight: 20,
      difficulty: 20,
    },
  },
  {
    desc: "Assign this gang member to traffick illegal arms<br><br>Earns money - Increases respect - Increases wanted level - Scales heavily with territory",
    allowEnforcers: true,
    allowHackers: false,
    name: "Traffick Illegal Arms",
    params: {
      baseRespect: 0.0022,
      baseWanted: 1.68,
      baseMoney: 870,
      hackWeight: 15,
      strWeight: 20,
      defWeight: 20,
      dexWeight: 20,
      chaWeight: 25,
      difficulty: 32,
      territory: {
        money: 1.4,
        respect: 1.3,
        wanted: 1.25,
      },
    },
  },
  {
    desc: "Assign this gang member to threaten and blackmail high-profile targets<br><br>Earns money - Slightly increases respect - Slightly increases wanted level",
    allowEnforcers: true,
    allowHackers: false,
    name: "Threaten & Blackmail",
    params: {
      baseRespect: 0.0022,
      baseWanted: 0.875,
      baseMoney: 360,
      hackWeight: 25,
      strWeight: 25,
      dexWeight: 25,
      chaWeight: 25,
      difficulty: 28,
    },
  },
  {
    desc: "Assign this gang member to engage in human trafficking operations<br><br>Earns money - Increases respect - Increases wanted level - Scales heavily with territory",
    allowEnforcers: true,
    allowHackers: false,
    name: "Human Trafficking",
    params: {
      baseRespect: 0.044,
      baseWanted: 8.75,
      baseMoney: 1800,
      hackWeight: 30,
      strWeight: 5,
      defWeight: 5,
      dexWeight: 30,
      chaWeight: 30,
      difficulty: 36,
      territory: {
        money: 1.5,
        respect: 1.5,
        wanted: 1.6,
      },
    },
  },
  {
    desc: "Assign this gang member to commit acts of terrorism<br><br>Greatly increases respect - Greatly increases wanted level - Scales heavily with territory",
    allowEnforcers: true,
    allowHackers: false,
    name: "Terrorism",
    params: {
      baseRespect: 0.11,
      baseWanted: 42,
      hackWeight: 20,
      strWeight: 20,
      defWeight: 20,
      dexWeight: 20,
      chaWeight: 20,
      difficulty: 36,
      territory: {
        money: 1,
        respect: 2,
        wanted: 2,
      },
    },
  },
  {
    desc: "Assign this gang member to be a vigilante and protect the city from criminals<br><br>Decreases wanted level",
    allowEnforcers: true,
    allowHackers: false,
    name: "Vigilante Justice",
    params: {
      baseWanted: -0.0004,
      hackWeight: 20,
      strWeight: 20,
      defWeight: 20,
      dexWeight: 20,
      agiWeight: 20,
      difficulty: 1,
      territory: {
        money: 1,
        respect: 1,
        wanted: 0.9,
      },
    },
  },
  {
    desc: "Assign this gang member to increase their combat stats (str, def, dex, agi)",
    allowEnforcers: true,
    allowHackers: true,
    name: "Train Combat",
    params: {
      strWeight: 25,
      defWeight: 25,
      dexWeight: 25,
      agiWeight: 25,
      difficulty: 100,
    },
  },
  {
    desc: "Assign this gang member to train their hacking skills",
    allowEnforcers: true,
    allowHackers: true,
    name: "Train Hacking",
    params: { hackWeight: 100, difficulty: 45 },
  },
  {
    desc: "Assign this gang member to train their charisma",
    allowEnforcers: true,
    allowHackers: true,
    name: "Train Charisma",
    params: { chaWeight: 100, difficulty: 8 },
  },
  {
    desc: "Members assigned to this task increase your gang's power.<br /><br />Gang members performing this task can be killed during clashes.",
    allowEnforcers: true,
    allowHackers: true,
    name: "Territory Warfare",
    params: {
      hackWeight: 5,
      strWeight: 20,
      defWeight: 20,
      dexWeight: 20,
      agiWeight: 20,
      chaWeight: 15,
      difficulty: 5,
      territoryPower: 1,
      deathRisk: true,
    },
  },
  {
    desc: "Members assigned to this task increase your gang's power.<br /><br />No risk of death, but slow.",
    allowEnforcers: true,
    allowHackers: true,
    name: "Delegate Territory Warfare",
    params: {
      hackWeight: 5,
      strWeight: 20,
      defWeight: 20,
      dexWeight: 20,
      agiWeight: 20,
      chaWeight: 15,
      difficulty: 3,
      territoryPower: 0.5,
    },
  },
];
