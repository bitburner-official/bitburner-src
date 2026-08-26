import { BladeburnerGeneralActionName } from "@enums";
import { GeneralAction } from "../Actions/GeneralAction";
import { BladeburnerConstants } from "./Constants";

export const GeneralActions: Record<BladeburnerGeneralActionName, GeneralAction> = {
  [BladeburnerGeneralActionName.Training]: new GeneralAction({
    name: BladeburnerGeneralActionName.Training,
    getActionTime: () => 30,
    desc:
      "在Bladeburner部队的专业训练中心提升你的能力。此举会为所有战斗属性提供经验，并提高你的最大体力。",
  }),
  [BladeburnerGeneralActionName.FieldAnalysis]: new GeneralAction({
    name: BladeburnerGeneralActionName.FieldAnalysis,
    getActionTime: () => 30,
    desc:
      "挖掘并分析合成人相关数据，提升Bladeburner部队对合成人位置与活动的情报掌握。完成该行动将提高你对当前城市合成人数量估计的准确度。\n" +
      "不消耗体力。",
  }),
  [BladeburnerGeneralActionName.Recruitment]: new GeneralAction({
    name: BladeburnerGeneralActionName.Recruitment,
    getActionTime: function (bladeburner, person) {
      const effCharisma = bladeburner.getEffectiveSkillLevel(person, "charisma");
      const charismaFactor = Math.pow(effCharisma, 0.81) + effCharisma / 90;
      return Math.max(10, Math.round(BladeburnerConstants.BaseRecruitmentTimeNeeded - charismaFactor));
    },
    getSuccessChance: function (bladeburner, person) {
      return Math.pow(person.skills.charisma, 0.45) / (bladeburner.teamSize - bladeburner.sleeveSize + 1);
    },
    desc:
      "尝试为你的Bladeburner小队招募成员。这些成员可以协助你执行行动。\n" +
      "不消耗体力。",
    successScaling: "成功率受魅力影响。",
  }),
  [BladeburnerGeneralActionName.Diplomacy]: new GeneralAction({
    name: BladeburnerGeneralActionName.Diplomacy,
    getActionTime: () => 60,
    desc:
      "改善与合成人族群的外交关系。完成该行动将降低当前城市的混乱度。\n" +
      "不消耗体力。",
  }),
  [BladeburnerGeneralActionName.HyperbolicRegen]: new GeneralAction({
    name: BladeburnerGeneralActionName.HyperbolicRegen,
    getActionTime: () => 60,
    desc:
      "使用Bladeburner部门的高科技双曲再生舱进入低温休眠。这将缓慢治愈你的伤口，并小幅恢复体力。",
  }),
  [BladeburnerGeneralActionName.InciteViolence]: new GeneralAction({
    name: BladeburnerGeneralActionName.InciteViolence,
    getActionTime: () => 60,
    desc:
      "蓄意在合成人社区中制造事端，以获取政治优势。这会生成更多合约与行动，但代价是所有城市的混乱度都会上升。\n" +
      "不消耗体力。",
    warning: "该行动会按百分比增加所有城市的混乱度。",
  }),
};
