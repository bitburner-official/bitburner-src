import { CorpUnlockName } from "@enums";

export interface CorpUnlock {
  name: CorpUnlockName;
  price: number;
  desc: string;
}

// Corporation Unlock Upgrades
// Upgrades for entire corporation, unlocks features, either you have it or you don't.
export const CorpUnlocks: Record<CorpUnlockName, CorpUnlock> = {
  //Lets you export goods
  [CorpUnlockName.Export]: {
    name: CorpUnlockName.Export,
    price: 20e9,
    desc:
      "开发基础设施，将你的材料出口到其他设施。" +
      "这允许你在不同的部门和城市之间调运材料。",
  },

  //Lets you buy exactly however many required materials you need for production
  [CorpUnlockName.SmartSupply]: {
    name: CorpUnlockName.SmartSupply,
    price: 25e9,
    desc:
      "利用先进的人工智能预测你的供应需求。" +
      "这让你能够精确购买生产所需的材料数量。",
  },

  //Displays each material/product's demand
  [CorpUnlockName.MarketResearchDemand]: {
    name: CorpUnlockName.MarketResearchDemand,
    price: 5e9,
    desc:
      "挖掘并分析市场数据，以确定所有资源的需求。" +
      "影响销售的“需求”属性将显示在每种材料和产品上。",
  },

  //Display's each material/product's competition
  [CorpUnlockName.MarketDataCompetition]: {
    name: CorpUnlockName.MarketDataCompetition,
    price: 5e9,
    desc:
      "挖掘并分析市场数据，以确定市场上所有资源面临的竞争程度。" +
      "影响销售的“竞争”属性将显示在每种材料和产品上。",
  },

  [CorpUnlockName.ShadyAccounting]: {
    name: CorpUnlockName.ShadyAccounting,
    price: 500e12,
    desc:
      "利用不正当的会计手段并收买政府官员，在贡金上省下一笔钱。" +
      "这会将贡金系数降低0.05。",
  },

  [CorpUnlockName.GovernmentPartnership]: {
    name: CorpUnlockName.GovernmentPartnership,
    price: 2e15,
    desc:
      "帮助各国政府推进其议程，以换取贡金的降低。" +
      "这会将贡金系数降低0.1。",
  },

  [CorpUnlockName.WarehouseAPI]: {
    name: CorpUnlockName.WarehouseAPI,
    price: 50e9,
    desc: "启用仓库 API。",
  },

  [CorpUnlockName.OfficeAPI]: {
    name: CorpUnlockName.OfficeAPI,
    price: 50e9,
    desc: "启用办公室 API。",
  },
};
