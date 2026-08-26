import { CorpUpgradeName } from "@enums";

export interface CorpUpgrade {
  name: CorpUpgradeName;
  basePrice: number;
  priceMult: number;
  benefit: number;
  desc: string;
}

/** Levelable upgrades that affect the entire corporation */
export const CorpUpgrades: Record<CorpUpgradeName, CorpUpgrade> = {
  //Smart factories, increases production
  [CorpUpgradeName.SmartFactories]: {
    name: CorpUpgradeName.SmartFactories,
    basePrice: 2e9,
    priceMult: 1.06,
    benefit: 0.03,
    desc:
      "先进的人工智能会自动优化工厂的运营和生产力。" +
      "该升级每提升一级，你的全局产量就会提高3%（加法叠加）。",
  },

  //Smart warehouses, increases storage size
  [CorpUpgradeName.SmartStorage]: {
    name: CorpUpgradeName.SmartStorage,
    basePrice: 2e9,
    priceMult: 1.06,
    benefit: 0.1,
    desc:
      "先进的人工智能会自动优化你的仓储方式。" +
      "该升级每提升一级，你的全局仓库容量就会扩大10%（加法叠加）。",
  },

  //Makes advertising more effective
  [CorpUpgradeName.WilsonAnalytics]: {
    name: CorpUpgradeName.WilsonAnalytics,
    basePrice: 4e9,
    priceMult: 2,
    benefit: 0.005,
    desc:
      "向营销研究公司Wilson购买数据和分析服务。" +
      "该升级每提升一级，你的广告效果就会提高0.5%（加法叠加）。",
  },

  //Augmentation for employees, increases cre
  [CorpUpgradeName.NuoptimalNootropicInjectorImplants]: {
    name: CorpUpgradeName.NuoptimalNootropicInjectorImplants,
    basePrice: 1e9,
    priceMult: 1.06,
    benefit: 0.1,
    desc:
      "为你的员工购买Nuoptimal Nootropic Injector强化。" +
      "该升级每提升一级，你员工的全局创造力就会提高10%（加法叠加）。",
  },

  //Augmentation for employees, increases cha
  [CorpUpgradeName.SpeechProcessorImplants]: {
    name: CorpUpgradeName.SpeechProcessorImplants,
    basePrice: 1e9,
    priceMult: 1.06,
    benefit: 0.1,
    desc:
      "为你的员工购买语音处理器（Speech Processor）强化。" +
      "该升级每提升一级，你员工的全局魅力就会提高10%（加法叠加）。",
  },

  //Augmentation for employees, increases int
  [CorpUpgradeName.NeuralAccelerators]: {
    name: CorpUpgradeName.NeuralAccelerators,
    basePrice: 1e9,
    priceMult: 1.06,
    benefit: 0.1,
    desc:
      "为你的员工购买神经加速器（Neural Accelerator）强化。" +
      "该升级每提升一级，你员工的全局智力就会提高10%（加法叠加）。",
  },

  //Augmentation for employees, increases eff
  [CorpUpgradeName.FocusWires]: {
    name: CorpUpgradeName.FocusWires,
    basePrice: 1e9,
    priceMult: 1.06,
    benefit: 0.1,
    desc:
      "为你的员工购买FocusWire强化。该升级每提升一级，" +
      "你员工的全局效率就会提高10%（加法叠加）。",
  },

  //Improves sales of materials/products
  [CorpUpgradeName.ABCSalesBots]: {
    name: CorpUpgradeName.ABCSalesBots,
    basePrice: 1e9,
    priceMult: 1.07,
    benefit: 0.01,
    desc:
      "Always Be Closing（不断成交）。购买这些机器人推销员，" +
      "以增加你售出的材料和产品数量。该升级每提升一级，" +
      "你的全局销售额就会提高1%（加法叠加）。",
  },

  //Improves scientific research rate
  [CorpUpgradeName.ProjectInsight]: {
    name: CorpUpgradeName.ProjectInsight,
    basePrice: 5e9,
    priceMult: 1.07,
    benefit: 0.05,
    desc:
      "购买“Project Insight”，这是由神秘的Fulcrum Technologies提供的一项研发服务。" +
      "该升级每提升一级，你产出的科研点数就会增加5%（加法叠加）。",
  },
};
