import { BladeburnerMultName, BladeburnerSkillName } from "@enums";
import { Skill } from "../Skill";

export const Skills: Record<BladeburnerSkillName, Skill> = {
  [BladeburnerSkillName.BladesIntuition]: new Skill({
    name: BladeburnerSkillName.BladesIntuition,
    desc: "Each level of this skill increases your success chance for all Contracts, Operations, and BlackOps by 3%",
    baseCost: 3,
    costInc: 2.1,
    mults: { [BladeburnerMultName.SuccessChanceAll]: 3 },
  }),
  [BladeburnerSkillName.Cloak]: new Skill({
    name: BladeburnerSkillName.Cloak,
    desc:
      "Each level of this skill increases your " +
      "success chance in stealth-related Contracts, Operations, and BlackOps by 5.5%",
    baseCost: 2,
    costInc: 1.1,
    mults: { [BladeburnerMultName.SuccessChanceStealth]: 5.5 },
  }),
  [BladeburnerSkillName.ShortCircuit]: new Skill({
    name: BladeburnerSkillName.ShortCircuit,
    desc:
      "Each level of this skill increases your success chance " +
      "in Contracts, Operations, and BlackOps that involve retirement by 5.5%",
    baseCost: 2,
    costInc: 2.1,
    mults: { [BladeburnerMultName.SuccessChanceKill]: 5.5 },
  }),
  [BladeburnerSkillName.DigitalObserver]: new Skill({
    name: BladeburnerSkillName.DigitalObserver,
    desc: "Each level of this skill increases your success chance in all Operations and BlackOps by 4%",
    baseCost: 2,
    costInc: 2.1,
    mults: { [BladeburnerMultName.SuccessChanceOperation]: 4 },
  }),
  [BladeburnerSkillName.Tracer]: new Skill({
    name: BladeburnerSkillName.Tracer,
    desc: "Each level of this skill increases your success chance in all Contracts by 4%",
    baseCost: 2,
    costInc: 2.1,
    mults: { [BladeburnerMultName.SuccessChanceContract]: 4 },
  }),
  [BladeburnerSkillName.Overclock]: new Skill({
    name: BladeburnerSkillName.Overclock,
    desc:
      "Each level of this skill decreases the time it takes " +
      "to attempt a Contract, Operation, and BlackOp by 1% (Max Level: 90)",
    baseCost: 3,
    costInc: 1.4,
    maxLvl: 90,
    mults: { [BladeburnerMultName.ActionTime]: -1 },
  }),
  [BladeburnerSkillName.Reaper]: new Skill({
    name: BladeburnerSkillName.Reaper,
    desc: "Each level of this skill increases your effective combat stats for Bladeburner actions by 2%",
    baseCost: 2,
    costInc: 2.1,
    mults: {
      [BladeburnerMultName.EffStr]: 2,
      [BladeburnerMultName.EffDef]: 2,
      [BladeburnerMultName.EffDex]: 2,
      [BladeburnerMultName.EffAgi]: 2,
    },
  }),
  [BladeburnerSkillName.EvasiveSystem]: new Skill({
    name: BladeburnerSkillName.EvasiveSystem,
    desc: "Each level of this skill increases your effective dexterity and agility for Bladeburner actions by 4%",
    baseCost: 2,
    costInc: 2.1,
    mults: { [BladeburnerMultName.EffDex]: 4, [BladeburnerMultName.EffAgi]: 4 },
  }),
  [BladeburnerSkillName.Datamancer]: new Skill({
    name: BladeburnerSkillName.Datamancer,
    desc:
      "Each level of this skill increases your effectiveness in " +
      "synthoid population analysis and investigation by 5%. " +
      "This affects all actions that can potentially increase " +
      "the accuracy of your synthoid population/community estimates.",
    baseCost: 3,
    costInc: 1,
    mults: { [BladeburnerMultName.SuccessChanceEstimate]: 5 },
  }),
  [BladeburnerSkillName.CybersEdge]: new Skill({
    name: BladeburnerSkillName.CybersEdge,
    desc: "Each level of this skill increases your max stamina by 2%",
    baseCost: 1,
    costInc: 3,
    mults: { [BladeburnerMultName.Stamina]: 2 },
  }),
  [BladeburnerSkillName.HandsOfMidas]: new Skill({
    name: BladeburnerSkillName.HandsOfMidas,
    desc: "Each level of this skill increases the amount of money you receive from Contracts by 10%",
    baseCost: 2,
    costInc: 2.5,
    mults: { [BladeburnerMultName.Money]: 10 },
  }),
  [BladeburnerSkillName.Hyperdrive]: new Skill({
    name: BladeburnerSkillName.Hyperdrive,
    desc: "Each level of this skill increases the experience earned from Contracts, Operations, and BlackOps by 10%",
    baseCost: 1,
    costInc: 2.5,
    mults: { [BladeburnerMultName.ExpGain]: 10 },
  }),
};
