// This is in a separate file from the normal augmentation helpers to limit import impact on Augmentations.ts

import { Multipliers } from "@nsdefs";
import { FactionName } from "@enums";
import { AugmentationCtorParams } from "./Augmentation";
import { getRecordKeys } from "../Types/Record";
import { WHRNG } from "../Casino/RNG";

export function getUnstableCircadianModulatorParams(): Omit<AugmentationCtorParams, "name"> {
  //Time-Based Augment Test
  const randomBonuses = getRandomBonus();

  const UnstableCircadianModulatorParams: Omit<AugmentationCtorParams, "name"> = {
    moneyCost: 5e9,
    repCost: 3.625e5,
    info:
      "一种实验性的纳米机器人注射剂。其不稳定的特性会" +
      "根据你的昼夜节律产生不可预测的结果。",
    factions: [FactionName.SpeakersForTheDead],
  };
  getRecordKeys(randomBonuses.bonuses).forEach(
    (key) => (UnstableCircadianModulatorParams[key] = randomBonuses.bonuses[key]),
  );

  return UnstableCircadianModulatorParams;
}

interface CircadianBonus {
  bonuses: Partial<Multipliers>;
  description: string;
}

function getRandomBonus(): CircadianBonus {
  const bonuses = [
    {
      bonuses: {
        hacking_chance: 1.25,
        hacking_speed: 1.1,
        hacking_money: 1.25,
        hacking_grow: 1.1,
      },
      description:
        "将玩家的入侵成功率提高 25%。\n" +
        "将玩家的入侵速度提高 10%。\n" +
        "将玩家通过入侵获得的资金提高 25%。\n" +
        "使 grow() 的效果提高 10%。",
    },
    {
      bonuses: {
        hacking: 1.15,
        hacking_exp: 2,
      },
      description:
        "将玩家的黑客技能提高 15%。\n" +
        "将玩家的黑客经验获取速度提高 100%。",
    },
    {
      bonuses: {
        strength: 1.25,
        strength_exp: 2,
        defense: 1.25,
        defense_exp: 2,
        dexterity: 1.25,
        dexterity_exp: 2,
        agility: 1.25,
        agility_exp: 2,
      },
      description:
        "将玩家的所有战斗属性提高 25%。\n" +
        "将玩家的所有战斗属性经验获取速度提高 100%。",
    },
    {
      bonuses: {
        charisma: 1.5,
        charisma_exp: 2,
      },
      description:
        "该强化将玩家的魅力提高 50%。\n" +
        "将玩家的魅力经验获取速度提高 100%。",
    },
    {
      bonuses: {
        hacknet_node_money: 1.2,
        hacknet_node_purchase_cost: 0.85,
        hacknet_node_ram_cost: 0.85,
        hacknet_node_core_cost: 0.85,
        hacknet_node_level_cost: 0.85,
      },
      description: "将 Hacknet 产出提高 20%。\n" + "将与 Hacknet 相关的所有成本降低 15%。",
    },
    {
      bonuses: {
        company_rep: 1.25,
        faction_rep: 1.15,
        work_money: 1.7,
      },
      description:
        "将玩家通过工作获得的资金提高 70%。\n" +
        "将玩家为公司工作时获得的声望提高 25%。\n" +
        "将玩家为派系工作时获得的声望提高 15%。",
    },
    {
      bonuses: {
        crime_success: 2,
        crime_money: 2,
      },
      description:
        "将玩家的犯罪成功率提高 100%。\n" +
        "将玩家通过犯罪获得的资金提高 100%。",
    },
  ];

  const randomNumber = new WHRNG(Math.floor(Date.now() / 3600000));
  for (let i = 0; i < 5; i++) randomNumber.step();

  return bonuses[Math.floor(bonuses.length * randomNumber.random())];
}
