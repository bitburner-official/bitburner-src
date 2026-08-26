// Class definition for a single Augmentation object
import { Player } from "@player";
import { AugmentationName, CompletedProgramName, FactionName } from "@enums";
import { formatPercent } from "../ui/formatNumber";
import { Multipliers, defaultMultipliers } from "../PersonObjects/Multipliers";
import { getRecordKeys } from "../Types/Record";

export interface AugmentationCosts {
  moneyCost: number;
  repCost: number;
}

export interface AugmentationCtorParams {
  info: string;
  stats?: string;
  isSpecial?: boolean;
  moneyCost: number;
  name: AugmentationName;
  prereqs?: AugmentationName[];
  repCost: number;
  factions: FactionName[];

  hacking?: number;
  strength?: number;
  defense?: number;
  dexterity?: number;
  agility?: number;
  charisma?: number;
  hacking_exp?: number;
  strength_exp?: number;
  defense_exp?: number;
  dexterity_exp?: number;
  agility_exp?: number;
  charisma_exp?: number;
  hacking_chance?: number;
  hacking_speed?: number;
  hacking_money?: number;
  hacking_grow?: number;
  company_rep?: number;
  faction_rep?: number;
  crime_money?: number;
  crime_success?: number;
  dnet_money?: number;
  work_money?: number;
  hacknet_node_money?: number;
  hacknet_node_purchase_cost?: number;
  hacknet_node_ram_cost?: number;
  hacknet_node_core_cost?: number;
  hacknet_node_level_cost?: number;
  bladeburner_max_stamina?: number;
  bladeburner_stamina_gain?: number;
  bladeburner_analysis?: number;
  bladeburner_success_chance?: number;

  startingMoney?: number;
  programs?: CompletedProgramName[];
}

function generateStatsDescription(mults: Multipliers, programs?: string[], startingMoney?: number): string {
  // For a percentage that is <10, show x.xx%, otherwise show xx.x%
  const f = (x: number) => formatPercent(x, x - 1 < 0.1 ? 2 : 1);
  let desc = "效果：";

  // Skills
  if (
    mults.hacking !== 1 &&
    mults.hacking === mults.strength &&
    mults.hacking === mults.defense &&
    mults.hacking === mults.dexterity &&
    mults.hacking === mults.agility &&
    mults.hacking === mults.charisma
  ) {
    desc += `\n+${f(mults.hacking - 1)} 全部技能`;
  } else {
    // Not allskills
    if (mults.hacking !== 1) desc += `\n+${f(mults.hacking - 1)} 黑客技能`;
    if (
      mults.strength !== 1 &&
      mults.strength === mults.defense &&
      mults.strength === mults.dexterity &&
      mults.strength === mults.agility
    ) {
      desc += `\n+${f(mults.strength - 1)} 战斗技能`;
    } else {
      // Not all combat
      if (mults.strength !== 1) desc += `\n+${f(mults.strength - 1)} 力量技能`;
      if (mults.defense !== 1) desc += `\n+${f(mults.defense - 1)} 防御技能`;
      if (mults.dexterity !== 1) desc += `\n+${f(mults.dexterity - 1)} 灵巧技能`;
      if (mults.agility !== 1) desc += `\n+${f(mults.agility - 1)} 敏捷技能`;
    }
    if (mults.charisma !== 1) desc += `\n+${f(mults.charisma - 1)} 魅力技能`;
  }

  // Skill XP
  if (
    mults.hacking_exp !== 1 &&
    mults.hacking_exp === mults.strength_exp &&
    mults.hacking_exp === mults.defense_exp &&
    mults.hacking_exp === mults.dexterity_exp &&
    mults.hacking_exp === mults.agility_exp &&
    mults.hacking_exp === mults.charisma_exp
  ) {
    desc += `\n+${f(mults.hacking_exp - 1)} 全部技能经验`;
  } else {
    // Not allskillxp
    if (mults.hacking_exp !== 1) desc += `\n+${f(mults.hacking_exp - 1)} 黑客经验`;
    if (
      mults.strength_exp !== 1 &&
      mults.strength_exp === mults.defense_exp &&
      mults.strength_exp === mults.dexterity_exp &&
      mults.strength_exp === mults.agility_exp
    ) {
      desc += `\n+${f(mults.strength_exp - 1)} 战斗经验`;
    } else {
      // Not all combat
      if (mults.strength_exp !== 1) desc += `\n+${f(mults.strength_exp - 1)} 力量经验`;
      if (mults.defense_exp !== 1) desc += `\n+${f(mults.defense_exp - 1)} 防御经验`;
      if (mults.dexterity_exp !== 1) desc += `\n+${f(mults.dexterity_exp - 1)} 灵巧经验`;
      if (mults.agility_exp !== 1) desc += `\n+${f(mults.agility_exp - 1)} 敏捷经验`;
    }
    if (mults.charisma_exp !== 1) desc += `\n+${f(mults.charisma_exp - 1)} 魅力经验`;
  }

  if (mults.hacking_speed !== 1) desc += `\n+${f(mults.hacking_speed - 1)} hack()、grow() 和 weaken() 速度提升`;
  if (mults.hacking_chance !== 1) desc += `\n+${f(mults.hacking_chance - 1)} hack() 成功率`;
  if (mults.hacking_money !== 1) desc += `\n+${f(mults.hacking_money - 1)} hack() 威力`;
  if (mults.hacking_grow !== 1) desc += `\n+${f(mults.hacking_grow - 1)} grow() 威力`;

  // Reputation
  if (mults.faction_rep !== 1 && mults.faction_rep === mults.company_rep)
    desc += `\n+${f(mults.faction_rep - 1)} 来自派系和公司的声望`;
  else {
    // Not all reputation
    if (mults.faction_rep !== 1) desc += `\n+${f(mults.faction_rep - 1)} 来自派系的声望`;
    if (mults.company_rep !== 1) desc += `\n+${f(mults.company_rep - 1)} 来自公司的声望`;
  }

  if (mults.crime_money !== 1) desc += `\n+${f(mults.crime_money - 1)} 犯罪收入`;
  if (mults.crime_success !== 1) desc += `\n+${f(mults.crime_success - 1)} 犯罪成功率`;
  if (mults.work_money !== 1) desc += `\n+${f(mults.work_money - 1)} 工作收入`;

  // Hacknet: costs are negative
  if (mults.hacknet_node_money !== 1) desc += `\n+${f(mults.hacknet_node_money - 1)} Hacknet 产出`;
  if (mults.hacknet_node_purchase_cost !== 1) {
    desc += `\n-${f(-(mults.hacknet_node_purchase_cost - 1))} Hacknet 购买成本`;
  }
  if (mults.hacknet_node_level_cost !== 1) {
    desc += `\n-${f(-(mults.hacknet_node_level_cost - 1))} Hacknet 升级等级成本`;
  }
  if (mults.hacknet_node_ram_cost !== 1) {
    desc += `\n-${f(-(mults.hacknet_node_ram_cost - 1))} Hacknet RAM 升级成本`;
  }
  if (mults.hacknet_node_core_cost !== 1) {
    desc += `\n-${f(-(mults.hacknet_node_core_cost - 1))} Hacknet 核心升级成本`;
  }

  // Bladeburner
  if (mults.bladeburner_max_stamina !== 1) desc += `\n+${f(mults.bladeburner_max_stamina - 1)} Bladeburner 最大体力`;
  if (mults.bladeburner_stamina_gain !== 1) {
    desc += `\n+${f(mults.bladeburner_stamina_gain - 1)} Bladeburner 体力获取`;
  }
  if (mults.bladeburner_analysis !== 1) {
    desc += `\n+${f(mults.bladeburner_analysis - 1)} Bladeburner 现场分析效果`;
  }
  if (mults.bladeburner_success_chance !== 1) {
    desc += `\n+${f(mults.bladeburner_success_chance - 1)} Bladeburner 行动成功率`;
  }
  if (startingMoney) desc += `\n安装强化后以 ${startingMoney} 起步。`;
  if (programs) desc += `\n安装强化后获得 ${programs.join(" 和 ")}。`;
  return desc;
}

export class Augmentation {
  // How much money this costs to buy before multipliers
  baseCost = 0;

  // How much faction reputation is required to unlock this  before multipliers
  baseRepRequirement = 0;

  // Description of what this Aug is and what it does
  info: string;

  // Description of the stats, often autogenerated, sometimes manually written.
  stats: string;

  // Any Augmentation not immediately available in BitNode-1 is special (e.g. Bladeburner augs)
  isSpecial = false;

  // Name of Augmentation
  name: AugmentationName;

  // Array of names of all prerequisites
  prereqs: AugmentationName[] = [];

  // Multipliers given by this Augmentation.  Must match the property name in
  // The Player/Person classes
  mults: Multipliers = defaultMultipliers();

  // Amount of money given to the Player when prestiging with this augmentation.
  startingMoney: number;

  // Array of programs to be given to the player when prestiging with this augmentation.
  programs: CompletedProgramName[];

  // Factions that offer this aug.
  factions: FactionName[] = [];

  constructor(params: AugmentationCtorParams) {
    this.name = params.name;
    this.info = params.info;
    this.prereqs = params.prereqs ? params.prereqs : [];

    this.baseRepRequirement = params.repCost;
    Object.freeze(this.baseRepRequirement);
    this.baseCost = params.moneyCost;
    Object.freeze(this.baseCost);
    this.factions = params.factions;

    if (params.isSpecial) {
      this.isSpecial = true;
    }

    // Set multipliers
    for (const multName of getRecordKeys(this.mults)) {
      const mult = params[multName];
      if (mult) this.mults[multName] = mult;
    }

    this.startingMoney = params.startingMoney ?? 0;
    this.programs = params.programs ?? [];

    if (params.stats === undefined)
      this.stats = generateStatsDescription(this.mults, params.programs, params.startingMoney);
    else this.stats = params.stats;
  }

  /** Get the current level of an augmentation before buying. Currently only relevant for NFG. */
  getLevel(): number {
    // Only NFG currently has levels, all others will be level 0 before purchase
    if (this.name !== AugmentationName.NeuroFluxGovernor) return 0;
    // Owned NFG has the level baked in
    const ownedNFGLevel = Player.augmentations.find((aug) => aug.name === this.name)?.level ?? 0;
    // Queued NFG is queued multiple times for each level purchased
    const queuedNFGLevel = Player.queuedAugmentations.filter((aug) => aug.name === this.name).length;
    return ownedNFGLevel + queuedNFGLevel;
  }
  /** Get the next level of an augmentation to buy. Currently only relevant for NFG. */
  getNextLevel(): number {
    return this.getLevel() + 1;
  }
}
