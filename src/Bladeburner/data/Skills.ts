import { BladeSkillName } from "../Enums";
import { Skill } from "../Skill";

export const Skills: Record<BladeSkillName, Skill> = {
  [BladeSkillName.bladesIntuition]: new Skill({
    name: BladeSkillName.bladesIntuition,
    desc: "Each level of this skill increases your success chance for all Contracts, Operations, and BlackOps by 3%",
    baseCost: 3,
    costInc: 2.1,
    successChanceAll: 3,
  }),
  [BladeSkillName.cloak]: new Skill({
    name: BladeSkillName.cloak,
    desc:
      "Each level of this skill increases your " +
      "success chance in stealth-related Contracts, Operations, and BlackOps by 5.5%",
    baseCost: 2,
    costInc: 1.1,
    successChanceStealth: 5.5,
  }),
  [BladeSkillName.shortCircuit]: new Skill({
    name: BladeSkillName.shortCircuit,
    desc:
      "Each level of this skill increases your success chance " +
      "in Contracts, Operations, and BlackOps that involve retirement by 5.5%",
    baseCost: 2,
    costInc: 2.1,
    successChanceKill: 5.5,
  }),
  [BladeSkillName.digitalObserver]: new Skill({
    name: BladeSkillName.digitalObserver,
    desc: "Each level of this skill increases your success chance in all Operations and BlackOps by 4%",
    baseCost: 2,
    costInc: 2.1,
    successChanceOperation: 4,
  }),
  [BladeSkillName.tracer]: new Skill({
    name: BladeSkillName.tracer,
    desc: "Each level of this skill increases your success chance in all Contracts by 4%",
    baseCost: 2,
    costInc: 2.1,
    successChanceContract: 4,
  }),
  [BladeSkillName.overclock]: new Skill({
    name: BladeSkillName.overclock,
    desc:
      "Each level of this skill decreases the time it takes " +
      "to attempt a Contract, Operation, and BlackOp by 1% (Max Level: 90)",
    baseCost: 3,
    costInc: 1.4,
    maxLvl: 90,
    actionTime: 1,
  }),
  [BladeSkillName.reaper]: new Skill({
    name: BladeSkillName.reaper,
    desc: "Each level of this skill increases your effective combat stats for Bladeburner actions by 2%",
    baseCost: 2,
    costInc: 2.1,
    effStr: 2,
    effDef: 2,
    effDex: 2,
    effAgi: 2,
  }),
  [BladeSkillName.evasiveSystem]: new Skill({
    name: BladeSkillName.evasiveSystem,
    desc: "Each level of this skill increases your effective dexterity and agility for Bladeburner actions by 4%",
    baseCost: 2,
    costInc: 2.1,
    effDex: 4,
    effAgi: 4,
  }),
  [BladeSkillName.datamancer]: new Skill({
    name: BladeSkillName.datamancer,
    desc:
      "Each level of this skill increases your effectiveness in " +
      "synthoid population analysis and investigation by 5%. " +
      "This affects all actions that can potentially increase " +
      "the accuracy of your synthoid population/community estimates.",
    baseCost: 3,
    costInc: 1,
    successChanceEstimate: 5,
  }),
  [BladeSkillName.cybersEdge]: new Skill({
    name: BladeSkillName.cybersEdge,
    desc: "Each level of this skill increases your max stamina by 2%",
    baseCost: 1,
    costInc: 3,
    stamina: 2,
  }),
  [BladeSkillName.handsOfMidas]: new Skill({
    name: BladeSkillName.handsOfMidas,
    desc: "Each level of this skill increases the amount of money you receive from Contracts by 10%",
    baseCost: 2,
    costInc: 2.5,
    money: 10,
  }),
  [BladeSkillName.hyperdrive]: new Skill({
    name: BladeSkillName.hyperdrive,
    desc: "Each level of this skill increases the experience earned from Contracts, Operations, and BlackOps by 10%",
    baseCost: 1,
    costInc: 2.5,
    expGain: 10,
  }),
};
