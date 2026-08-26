import { BladeburnerMultName, BladeburnerSkillName } from "@enums";
import { Skill } from "../Skill";

export const Skills: Record<BladeburnerSkillName, Skill> = {
  [BladeburnerSkillName.BladesIntuition]: new Skill({
    name: BladeburnerSkillName.BladesIntuition,
    desc: "此技能每级使所有合约、行动与黑色行动的成功率提高 3%",
    baseCost: 3,
    costInc: 2.1,
    mults: { [BladeburnerMultName.SuccessChanceAll]: 3 },
  }),
  [BladeburnerSkillName.Cloak]: new Skill({
    name: BladeburnerSkillName.Cloak,
    desc:
      "此技能每级使涉及潜行的" +
      "合约、行动与黑色行动的成功率提高 5.5%",
    baseCost: 2,
    costInc: 1.1,
    mults: { [BladeburnerMultName.SuccessChanceStealth]: 5.5 },
  }),
  [BladeburnerSkillName.ShortCircuit]: new Skill({
    name: BladeburnerSkillName.ShortCircuit,
    desc:
      "此技能每级使涉及清除的" +
      "合约、行动与黑色行动的成功率提高 5.5%",
    baseCost: 2,
    costInc: 2.1,
    mults: { [BladeburnerMultName.SuccessChanceKill]: 5.5 },
  }),
  [BladeburnerSkillName.DigitalObserver]: new Skill({
    name: BladeburnerSkillName.DigitalObserver,
    desc: "此技能每级使所有行动与黑色行动的成功率提高 4%",
    baseCost: 2,
    costInc: 2.1,
    mults: { [BladeburnerMultName.SuccessChanceOperation]: 4 },
  }),
  [BladeburnerSkillName.Tracer]: new Skill({
    name: BladeburnerSkillName.Tracer,
    desc: "此技能每级使所有合约的成功率提高 4%",
    baseCost: 2,
    costInc: 2.1,
    mults: { [BladeburnerMultName.SuccessChanceContract]: 4 },
  }),
  [BladeburnerSkillName.Overclock]: new Skill({
    name: BladeburnerSkillName.Overclock,
    desc:
      "此技能每级使尝试合约、行动与黑色行动所需的时间缩短 1%（最高等级：90）",
    baseCost: 3,
    costInc: 1.4,
    maxLvl: 90,
    mults: { [BladeburnerMultName.ActionTime]: -1 },
  }),
  [BladeburnerSkillName.Reaper]: new Skill({
    name: BladeburnerSkillName.Reaper,
    desc: "此技能每级使你在Bladeburner行动中的有效战斗属性提高 2%",
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
    desc: "此技能每级使你在Bladeburner行动中的有效灵巧和敏捷提高 4%",
    baseCost: 2,
    costInc: 2.1,
    mults: { [BladeburnerMultName.EffDex]: 4, [BladeburnerMultName.EffAgi]: 4 },
  }),
  [BladeburnerSkillName.Datamancer]: new Skill({
    name: BladeburnerSkillName.Datamancer,
    desc:
      "此技能每级使你进行合成人数量分析与调查的效果提高 5%。这会影响所有可能提高合成人数量/社区估计精度的行动。",
    baseCost: 3,
    costInc: 1,
    mults: { [BladeburnerMultName.SuccessChanceEstimate]: 5 },
  }),
  [BladeburnerSkillName.CybersEdge]: new Skill({
    name: BladeburnerSkillName.CybersEdge,
    desc: "此技能每级使你的最大体力提高 2%",
    baseCost: 1,
    costInc: 3,
    mults: { [BladeburnerMultName.Stamina]: 2 },
  }),
  [BladeburnerSkillName.HandsOfMidas]: new Skill({
    name: BladeburnerSkillName.HandsOfMidas,
    desc: "此技能每级使你从合约获得的资金增加 10%",
    baseCost: 2,
    costInc: 2.5,
    mults: { [BladeburnerMultName.Money]: 10 },
  }),
  [BladeburnerSkillName.Hyperdrive]: new Skill({
    name: BladeburnerSkillName.Hyperdrive,
    desc: "此技能每级使从合约、行动与黑色行动中获得的经验提高 10%",
    baseCost: 1,
    costInc: 2.5,
    mults: { [BladeburnerMultName.ExpGain]: 10 },
  }),
};
