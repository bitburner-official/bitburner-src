import type { GangTaskName } from "@nsdefs";
import { GangTaskNameEnum } from "../Enums";
import { ITaskParams } from "../ITaskParams";

/**
 * Defines the parameters that can be used to initialize and describe a GangMemberTask
 * (defined in Gang.js)
 */
interface IGangMemberTaskMetadata {
  /** Description of the task */
  desc: string;

  /** Whether or not this task is meant for Combat-type gangs */
  isCombat: boolean;

  /** Whether or not this task is for Hacking-type gangs */
  isHacking: boolean;

  /** Name of the task */
  name: GangTaskName;

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
    desc: "该帮派成员当前处于闲置状态",
    isCombat: true,
    isHacking: true,
    name: GangTaskNameEnum.Unassigned,
    params: { hackWeight: 100 }, // This is just to get by the weight check in the GangMemberTask constructor
  },
  {
    desc: "指派该帮派成员创建并传播勒索软件<br><br>赚取资金 - 略微增加尊重 - 略微增加通缉等级",
    isCombat: false,
    isHacking: true,
    name: GangTaskNameEnum.Ransomware,
    params: {
      baseRespect: 0.00005,
      baseWanted: 0.0001,
      baseMoney: 3,
      hackWeight: 100,
      difficulty: 1,
    },
  },
  {
    desc: "指派该帮派成员实施网络钓鱼骗局与攻击<br><br>赚取资金 - 略微增加尊重 - 略微增加通缉等级",
    isCombat: false,
    isHacking: true,
    name: GangTaskNameEnum.Phishing,
    params: {
      baseRespect: 0.00008,
      baseWanted: 0.003,
      baseMoney: 7.5,
      hackWeight: 85,
      chaWeight: 15,
      difficulty: 3.5,
    },
  },
  {
    desc: "指派该帮派成员实施身份盗用<br><br>赚取资金 - 增加尊重 - 增加通缉等级",
    isCombat: false,
    isHacking: true,
    name: GangTaskNameEnum.IdentityTheft,
    params: {
      baseRespect: 0.0001,
      baseWanted: 0.075,
      baseMoney: 18,
      hackWeight: 80,
      chaWeight: 20,
      difficulty: 5,
    },
  },
  {
    desc: "指派该帮派成员发动 DDoS 攻击<br><br>增加尊重 - 增加通缉等级",
    isCombat: false,
    isHacking: true,
    name: GangTaskNameEnum.DDoSAttacks,
    params: {
      baseRespect: 0.0004,
      baseWanted: 0.2,
      hackWeight: 100,
      difficulty: 8,
    },
  },
  {
    desc: "指派该帮派成员制作并传播恶意病毒<br><br>增加尊重 - 增加通缉等级",
    isCombat: false,
    isHacking: true,
    name: GangTaskNameEnum.PlantVirus,
    params: {
      baseRespect: 0.0006,
      baseWanted: 0.4,
      hackWeight: 100,
      difficulty: 12,
    },
  },
  {
    desc: "指派该帮派成员实施金融诈骗与数字造假<br><br>赚取资金 - 略微增加尊重 - 略微增加通缉等级",
    isCombat: false,
    isHacking: true,
    name: GangTaskNameEnum.FraudAndCounterfeiting,
    params: {
      baseRespect: 0.0004,
      baseWanted: 0.3,
      baseMoney: 45,
      hackWeight: 80,
      chaWeight: 20,
      difficulty: 20,
    },
  },
  {
    desc: "指派该帮派成员洗钱<br><br>赚取资金 - 增加尊重 - 增加通缉等级",
    isCombat: false,
    isHacking: true,
    name: GangTaskNameEnum.MoneyLaundering,
    params: {
      baseRespect: 0.001,
      baseWanted: 1.25,
      baseMoney: 360,
      hackWeight: 75,
      chaWeight: 25,
      difficulty: 25,
    },
  },
  {
    desc: "指派该帮派成员实施网络恐怖主义行为<br><br>大幅增加尊重 - 大幅增加通缉等级",
    isCombat: false,
    isHacking: true,
    name: GangTaskNameEnum.Cyberterrorism,
    params: {
      baseRespect: 0.01,
      baseWanted: 6,
      hackWeight: 80,
      chaWeight: 20,
      difficulty: 36,
    },
  },
  {
    desc: "指派该帮派成员为企业做白帽黑客<br><br>赚取资金 - 降低通缉等级",
    isCombat: false,
    isHacking: true,
    name: GangTaskNameEnum.EthicalHacking,
    params: {
      baseWanted: -0.001,
      baseMoney: 3,
      hackWeight: 90,
      chaWeight: 10,
      difficulty: 1,
    },
  },
  {
    desc: "指派该帮派成员在街头抢劫路人<br><br>赚取资金 - 略微增加尊重 - 极轻微增加通缉等级",
    isCombat: true,
    isHacking: false,
    name: GangTaskNameEnum.MugPeople,
    params: {
      baseRespect: 0.00005,
      baseWanted: 0.00005,
      baseMoney: 3.6,
      strWeight: 25,
      defWeight: 25,
      dexWeight: 25,
      agiWeight: 10,
      chaWeight: 15,
      difficulty: 1,
    },
  },
  {
    desc: "指派该帮派成员贩卖毒品<br><br>赚取资金 - 略微增加尊重 - 略微增加通缉等级 - 随地盘略微提升",
    isCombat: true,
    isHacking: false,
    name: GangTaskNameEnum.DealDrugs,
    params: {
      baseRespect: 0.00006,
      baseWanted: 0.002,
      baseMoney: 15,
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
    desc: "指派该帮派成员向你的地盘内的平民收取保护费<br><br>赚取资金 - 略微增加尊重 - 增加通缉等级 - 随地盘大幅提升",
    isCombat: true,
    isHacking: false,
    name: GangTaskNameEnum.StrongarmCivilians,
    params: {
      baseRespect: 0.00004,
      baseWanted: 0.02,
      baseMoney: 7.5,
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
    desc: "指派该帮派成员实施诈骗<br><br>赚取资金 - 增加尊重 - 增加通缉等级",
    isCombat: true,
    isHacking: false,
    name: GangTaskNameEnum.RunACon,
    params: {
      baseRespect: 0.00012,
      baseWanted: 0.05,
      baseMoney: 45,
      strWeight: 5,
      defWeight: 5,
      agiWeight: 25,
      dexWeight: 25,
      chaWeight: 40,
      difficulty: 14,
    },
  },
  {
    desc: "指派该帮派成员抢劫商店、银行和运钞车<br><br>赚取资金 - 增加尊重 - 增加通缉等级",
    isCombat: true,
    isHacking: false,
    name: GangTaskNameEnum.ArmedRobbery,
    params: {
      baseRespect: 0.00014,
      baseWanted: 0.1,
      baseMoney: 114,
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
    desc: "指派该帮派成员走私军火<br><br>赚取资金 - 增加尊重 - 增加通缉等级 - 随地盘大幅提升",
    isCombat: true,
    isHacking: false,
    name: GangTaskNameEnum.TraffickIllegalArms,
    params: {
      baseRespect: 0.0002,
      baseWanted: 0.24,
      baseMoney: 174,
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
    desc: "指派该帮派成员威胁并勒索知名人士<br><br>赚取资金 - 略微增加尊重 - 略微增加通缉等级",
    isCombat: true,
    isHacking: false,
    name: GangTaskNameEnum.ThreatenAndBlackmail,
    params: {
      baseRespect: 0.0002,
      baseWanted: 0.125,
      baseMoney: 72,
      hackWeight: 25,
      strWeight: 25,
      dexWeight: 25,
      chaWeight: 25,
      difficulty: 28,
    },
  },
  {
    desc: "指派该帮派成员从事人口贩卖活动<br><br>赚取资金 - 增加尊重 - 增加通缉等级 - 随地盘大幅提升",
    isCombat: true,
    isHacking: false,
    name: GangTaskNameEnum.HumanTrafficking,
    params: {
      baseRespect: 0.004,
      baseWanted: 1.25,
      baseMoney: 360,
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
    desc: "指派该帮派成员实施恐怖主义行为<br><br>大幅增加尊重 - 大幅增加通缉等级 - 随地盘大幅提升",
    isCombat: true,
    isHacking: false,
    name: GangTaskNameEnum.Terrorism,
    params: {
      baseRespect: 0.01,
      baseWanted: 6,
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
    desc: "指派该帮派成员担任义警，保护城市免受罪犯侵扰<br><br>降低通缉等级",
    isCombat: true,
    isHacking: true,
    name: GangTaskNameEnum.VigilanteJustice,
    params: {
      baseWanted: -0.001,
      hackWeight: 20,
      strWeight: 20,
      defWeight: 20,
      dexWeight: 20,
      agiWeight: 20,
      difficulty: 1,
      territory: {
        money: 1,
        respect: 1,
        wanted: 0.9, // Gets harder with more territory
      },
    },
  },
  {
    desc: "指派该帮派成员训练其战斗属性（力量、防御、灵巧、敏捷）",
    isCombat: true,
    isHacking: true,
    name: GangTaskNameEnum.TrainCombat,
    params: {
      strWeight: 25,
      defWeight: 25,
      dexWeight: 25,
      agiWeight: 25,
      difficulty: 100,
    },
  },
  {
    desc: "指派该帮派成员训练其黑客技能",
    isCombat: true,
    isHacking: true,
    name: GangTaskNameEnum.TrainHacking,
    params: { hackWeight: 100, difficulty: 45 },
  },
  {
    desc: "指派该帮派成员训练其魅力",
    isCombat: true,
    isHacking: true,
    name: GangTaskNameEnum.TrainCharisma,
    params: { chaWeight: 100, difficulty: 8 },
  },
  {
    desc: "被指派此任务的成员会提升你帮派的势力。如果“地盘冲突”已启用，他们还会为争夺地盘而战斗。<br /><br />执行此任务的帮派成员可能会在冲突中死亡。",
    isCombat: true,
    isHacking: true,
    name: GangTaskNameEnum.TerritoryWarfare,
    params: {
      hackWeight: 15,
      strWeight: 20,
      defWeight: 20,
      dexWeight: 20,
      agiWeight: 20,
      chaWeight: 5,
      difficulty: 5,
    },
  },
];
