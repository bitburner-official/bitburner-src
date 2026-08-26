// Metadata used to construct all Hash Upgrades
import React from "react";
import { HashUpgradeParams } from "../HashUpgrade";
import { formatInt } from "../../ui/formatNumber";
import { Money } from "../../ui/React/Money";
import { HashUpgradeEnum } from "../Enums";

export const HashUpgradesMetadata: HashUpgradeParams[] = [
  {
    cost: 4,
    costPerLevel: 4,
    desc: (
      <>
        将哈希出售，换取 <Money money={1e6} />
      </>
    ),
    name: HashUpgradeEnum.SellForMoney,
    effectText: (level: number): JSX.Element | null => (
      <>
        已售出，获得 <Money money={1e6 * level} />
      </>
    ),
    value: 1e6,
  },
  {
    costPerLevel: 100,
    desc: (
      <>
        将哈希出售为企业资金，获得 <Money money={1e9} />
      </>
    ),
    name: HashUpgradeEnum.SellForCorporationFunds,
    effectText: (level: number): JSX.Element | null => (
      <>
        已售出，获得企业资金 <Money money={1e9 * level} />。
      </>
    ),
    value: 1e9,
  },
  {
    costPerLevel: 50,
    desc:
      "使用哈希将单台服务器的最低安全等级降低 2%。" +
      "注意服务器的最低安全等级不会低于 1。此效果会持续到你安装强化为止" +
      "（因为届时服务器会被重置）。",
    hasTargetServer: true,
    name: HashUpgradeEnum.ReduceMinimumSecurity,
    value: 0.98,
  },
  {
    costPerLevel: 50,
    desc: (
      <>
        使用哈希将单台服务器的最大资金量提高
        2%。此效果会持续到你安装强化为止（因为届时服务器会被重置）。注意当服务器资金超过 <Money money={10e12} />{" "}
        后会受到软上限的限制
      </>
    ),
    hasTargetServer: true,
    name: HashUpgradeEnum.IncreaseMaximumMoney,
    value: 1.02,
  },
  {
    costPerLevel: 50,
    desc: "使用哈希使在大学学习时获得的经验提高 20%。" + "此效果会持续到你安装强化为止。",
    name: HashUpgradeEnum.ImproveStudying,
    effectText: (level: number): JSX.Element | null => <>学习收益提高 {level * 20}%</>,
    value: 20, // Improves studying by value%
  },
  {
    costPerLevel: 50,
    desc: "使用哈希使在健身房训练时获得的经验提高 20%。此效果" + "会持续到你安装强化为止。",
    name: HashUpgradeEnum.ImproveGymTraining,
    effectText: (level: number): JSX.Element | null => <>训练收益提高 {level * 20}%</>,
    value: 20, // Improves training by value%
  },
  {
    costPerLevel: 200,
    desc: "将哈希兑换为科研点数，为你企业的所有部门各获得 1000 点",
    name: HashUpgradeEnum.ExchangeForCorporationResearch,
    effectText: (level: number): JSX.Element | null => <>你的各部门已累计获得 {formatInt(level * 1000)} 点科研点数。</>,
    value: 1000,
  },
  {
    costPerLevel: 250,
    desc: "将哈希兑换为 100 点 Bladeburner 军衔",
    name: HashUpgradeEnum.ExchangeForBladeburnerRank,
    effectText: (level: number): JSX.Element | null => <>已累计获得 {formatInt(100 * level)} 点 Bladeburner 军衔</>,
    value: 100,
  },
  {
    costPerLevel: 250,
    desc: "将哈希兑换为 10 点 Bladeburner 技能点",
    name: HashUpgradeEnum.ExchangeForBladeburnerSP,
    effectText: (level: number): JSX.Element | null => <>已累计获得 {formatInt(10 * level)} 点 Bladeburner 技能点</>,
    value: 10,
  },
  {
    costPerLevel: 25,
    desc: "在网络上的某处生成一份随机编程合约",
    name: HashUpgradeEnum.GenerateCodingContract,
    effectText: (level: number): JSX.Element | null => <>已生成 {level} 份合约。</>,
    value: 1,
  },
  {
    costPerLevel: 200,
    desc: "使用哈希使你与某家公司的人脉提高 5。此效果会持续到你进入新的 BitNode 为止。",
    hasTargetCompany: true,
    name: HashUpgradeEnum.CompanyFavor,
    value: 5,
  },
];
