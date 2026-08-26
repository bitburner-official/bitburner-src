import type { FragmentType } from "@nsdefs";

// Numeric enum
export const FragmentTypeEnum = {
  HackingSpeed: 3,
  HackingMoney: 4,
  HackingGrow: 5,
  Hacking: 6,
  Strength: 7,
  Defense: 8,
  Dexterity: 9,
  Agility: 10,
  Charisma: 11,
  HacknetMoney: 12,
  HacknetCost: 13,
  Rep: 14,
  WorkMoney: 15,
  Crime: 16,
  Bladeburner: 17,
  // Utility fragments.
  Booster: 18,
} as const;

export function Effect(type: FragmentType): string {
  switch (type) {
    case FragmentTypeEnum.HackingSpeed: {
      return "+x% hack()、grow() 和 weaken() 速度提升";
    }
    case FragmentTypeEnum.HackingMoney: {
      return "+x% hack() 效果";
    }
    case FragmentTypeEnum.HackingGrow: {
      return "+x% grow() 效果";
    }
    case FragmentTypeEnum.Hacking: {
      return "+x% 黑客经验与技能等级";
    }
    case FragmentTypeEnum.Strength: {
      return "+x% 力量经验与技能等级";
    }
    case FragmentTypeEnum.Defense: {
      return "+x% 防御经验与技能等级";
    }
    case FragmentTypeEnum.Dexterity: {
      return "+x% 灵巧经验与技能等级";
    }
    case FragmentTypeEnum.Agility: {
      return "+x% 敏捷经验与技能等级";
    }
    case FragmentTypeEnum.Charisma: {
      return "+x% 魅力经验与技能等级";
    }
    case FragmentTypeEnum.HacknetMoney: {
      return "+x% Hacknet 产出";
    }
    case FragmentTypeEnum.HacknetCost: {
      return "-x% Hacknet 花费";
    }
    case FragmentTypeEnum.Rep: {
      return "+x% 来自派系和公司的声望";
    }
    case FragmentTypeEnum.WorkMoney: {
      return "+x% 工作收入";
    }
    case FragmentTypeEnum.Crime: {
      return "+x% 犯罪资金与成功率";
    }
    case FragmentTypeEnum.Bladeburner: {
      return "+x% Bladeburner 属性（最大体力、体力获取、现场分析效果、行动成功率）";
    }
    case FragmentTypeEnum.Booster: {
      return "为相邻碎片提供 1.1x 威力加成";
    }
  }
}
