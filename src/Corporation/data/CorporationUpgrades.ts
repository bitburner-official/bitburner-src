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
      "Advanced AI automatically optimizes the operation and productivity " +
      "of factories. Each level of this upgrade increases your global production by 3% (additive).",
  },

  //Smart warehouses, increases storage size
  [CorpUpgradeName.SmartStorage]: {
    name: CorpUpgradeName.SmartStorage,
    basePrice: 2e9,
    priceMult: 1.06,
    benefit: 0.1,
    desc:
      "Advanced AI automatically optimizes your warehouse storage methods. " +
      "Each level of this upgrade increases your global warehouse storage size by 10% (additive).",
  },

  //Makes advertising more effective
  [CorpUpgradeName.WilsonAnalytics]: {
    name: CorpUpgradeName.WilsonAnalytics,
    basePrice: 4e9,
    priceMult: 2,
    benefit: 0.005,
    desc:
      "Purchase data and analysis from Wilson, a marketing research " +
      "firm. Each level of this upgrade increases the effectiveness of your " +
      "advertising by 0.5% (additive).",
  },

  //Augmentation for employees, increases cre
  [CorpUpgradeName.NuoptimalNootropicInjectorImplants]: {
    name: CorpUpgradeName.NuoptimalNootropicInjectorImplants,
    basePrice: 1e9,
    priceMult: 1.06,
    benefit: 0.1,
    desc:
      "Purchase the Nuoptimal Nootropic " +
      "Injector augmentation for your employees. Each level of this upgrade " +
      "globally increases the creativity of your employees by 10% (additive).",
  },

  //Augmentation for employees, increases cha
  [CorpUpgradeName.SpeechProcessorImplants]: {
    name: CorpUpgradeName.SpeechProcessorImplants,
    basePrice: 1e9,
    priceMult: 1.06,
    benefit: 0.1,
    desc:
      "Purchase the Speech Processor augmentation for your employees. " +
      "Each level of this upgrade globally increases the charisma of your employees by 10% (additive).",
  },

  //Augmentation for employees, increases int
  [CorpUpgradeName.NeuralAccelerators]: {
    name: CorpUpgradeName.NeuralAccelerators,
    basePrice: 1e9,
    priceMult: 1.06,
    benefit: 0.1,
    desc:
      "Purchase the Neural Accelerator augmentation for your employees. " +
      "Each level of this upgrade globally increases the intelligence of your employees " +
      "by 10% (additive).",
  },

  //Augmentation for employees, increases eff
  [CorpUpgradeName.FocusWires]: {
    name: CorpUpgradeName.FocusWires,
    basePrice: 1e9,
    priceMult: 1.06,
    benefit: 0.1,
    desc:
      "Purchase the FocusWire augmentation for your employees. Each level " +
      "of this upgrade globally increases the efficiency of your employees by 10% (additive).",
  },

  //Improves sales of materials/products
  [CorpUpgradeName.ABCSalesBots]: {
    name: CorpUpgradeName.ABCSalesBots,
    basePrice: 1e9,
    priceMult: 1.07,
    benefit: 0.01,
    desc:
      "Always Be Closing. Purchase these robotic salesmen to increase the amount of " +
      "materials and products you sell. Each level of this upgrade globally increases your sales " +
      "by 1% (additive).",
  },

  //Improves scientific research rate
  [CorpUpgradeName.ProjectInsight]: {
    name: CorpUpgradeName.ProjectInsight,
    basePrice: 5e9,
    priceMult: 1.07,
    benefit: 0.05,
    desc:
      "Purchase 'Project Insight', a R&D service provided by the secretive " +
      "Fulcrum Technologies. Each level of this upgrade globally increases the amount of " +
      "Scientific Research you produce by 5% (additive).",
  },
};
