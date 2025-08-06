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
      "Develop infrastructure to export your materials to your other facilities. " +
      "This allows you to move materials around between different divisions and cities.",
  },

  //Lets you buy exactly however many required materials you need for production
  [CorpUnlockName.SmartSupply]: {
    name: CorpUnlockName.SmartSupply,
    price: 25e9,
    desc:
      "Use advanced AI to anticipate your supply needs. " +
      "This allows you to purchase exactly however many materials you need for production.",
  },

  //Displays each material/product's demand
  [CorpUnlockName.MarketResearchDemand]: {
    name: CorpUnlockName.MarketResearchDemand,
    price: 5e9,
    desc:
      "Mine and analyze market data to determine the demand of all resources. " +
      "The demand attribute, which affects sales, will be displayed for every material and product.",
  },

  //Display's each material/product's competition
  [CorpUnlockName.MarketDataCompetition]: {
    name: CorpUnlockName.MarketDataCompetition,
    price: 5e9,
    desc:
      "Mine and analyze market data to determine how much competition there is on the market " +
      "for all resources. The competition attribute, which affects sales, will be displayed for " +
      "every material and product.",
  },

  [CorpUnlockName.ShadyAccounting]: {
    name: CorpUnlockName.ShadyAccounting,
    price: 500e12,
    desc:
      "Utilize unscrupulous accounting practices and pay off government officials to save money " +
      "on tribute. This reduces the tribute modifier by 0.05.",
  },

  [CorpUnlockName.GovernmentPartnership]: {
    name: CorpUnlockName.GovernmentPartnership,
    price: 2e15,
    desc:
      "Help national governments further their agendas in exchange for lowered tribute. " +
      "This reduces the tribute modifier by 0.1",
  },

  [CorpUnlockName.WarehouseAPI]: {
    name: CorpUnlockName.WarehouseAPI,
    price: 50e9,
    desc: "Enables the warehouse API.",
  },

  [CorpUnlockName.OfficeAPI]: {
    name: CorpUnlockName.OfficeAPI,
    price: 50e9,
    desc: "Enables the office API.",
  },
};
