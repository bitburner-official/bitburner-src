import { Multipliers, defaultMultipliers } from "../PersonObjects/Multipliers";
import { Worm } from "./Worm";
import { formatPercent } from "../ui/formatNumber";
import { StockMarketConstants } from "../StockMarket/data/Constants";
import { convertTimeMsToTimeElapsedString } from "../utils/StringHelperFunctions";

export interface BonusType {
  id: (typeof Bonus)[keyof typeof Bonus];
  name: string;
  description: string;
  infoText: string | null;

  // values describing effect increase
  a: number;
  g: number;
  k: number;
  m: number;
}

export interface BonusSpecialMults {
  gameTickSpeed: number;
  stockMarketMult: number;
  bladeburnerMult: number;
  intelligenceMult: number;
  crimeMult: number;
}

export const Bonus = {
  NONE: 0,

  CARDINAL_SIN: 1,
  FAVORABLE_APPEARANCE: 2,
  SYNTHETIC_BLACK_FRIDAY: 3,
  INCREASED_MAINFRAME_VOLTAGE: 4,
  RAPID_ASSIMILATION: 5,
  IS_LM_ACCELERATION: 6,
  RECORDLESS_CONTRACTING: 7,
} as const;

export const bonuses: BonusType[] = [
  {
    id: Bonus.NONE,
    name: "None",
    description: "no benefit",
    infoText: "Default bonus. Can be used to disable all Worm benefits.",
    a: 0,
    g: 0,
    k: 0,
    m: 0,
  },
  {
    id: Bonus.CARDINAL_SIN,
    name: "Cardinal sin",
    description: "Decreases the time it takes to commit a crime by -$DEC$",
    infoText: null,
    a: 1,
    g: 0.7,
    k: 0.026,
    m: 0.6,
  },
  {
    id: Bonus.FAVORABLE_APPEARANCE,
    name: "Favorable appearance",
    description: "+$INC$ reputation from factions and companies",
    infoText: null,
    a: 1,
    g: 1.5,
    k: 0.022,
    m: 0.6,
  },
  {
    id: Bonus.SYNTHETIC_BLACK_FRIDAY,
    name: "Synthetic black friday",
    description: "-$DEC$ hacknet costs, purchased server costs, home ram and home core costs",
    infoText: null,
    a: 1,
    g: 0.6,
    k: 0.003,
    m: 1,
  },
  {
    id: Bonus.INCREASED_MAINFRAME_VOLTAGE,
    name: "Increased mainframe voltage",
    description: "+$INC$ game cycles per process",
    infoText: "Increases the amount of cycles the game distributes to all mechanics.",
    a: 1,
    g: 1.05,
    k: 0.007,
    m: 0.8,
  },
  {
    id: Bonus.RAPID_ASSIMILATION,
    name: "Rapid assimilation",
    description: "Gain +$INC$ intelligence exp",
    infoText: "Increases the amount of intelligence exp gained from all sources.",
    a: 1,
    g: 1.1,
    k: 0.007,
    m: 0.8,
  },
  {
    id: Bonus.IS_LM_ACCELERATION,
    name: "IS-LM acceleration",
    description: "Reduces the time between stock market updates by -$DEC$",
    infoText: `Decreases the time between stock market updates. The minimum time between stock market updates is ${convertTimeMsToTimeElapsedString(
      StockMarketConstants.msPerStockUpdateMin,
    )}.`,
    a: 1,
    g: 0.8,
    k: 0.007,
    m: 0.8,
  },
  {
    id: Bonus.RECORDLESS_CONTRACTING,
    name: "Recordless contracting",
    description: "Reduces the time needed to complete a bladeburner action by -$DEC$",
    infoText: "Decreases the action time required for all bladeburner actions.",
    a: 1,
    g: 0.9,
    k: 0.007,
    m: 0.8,
  },
];

export const bonusMult = (effect: number): Record<(typeof Bonus)[keyof typeof Bonus], Partial<Multipliers> | null> => ({
  [Bonus.NONE]: {},
  [Bonus.CARDINAL_SIN]: null,
  [Bonus.FAVORABLE_APPEARANCE]: { faction_rep: effect, company_rep: effect },
  [Bonus.SYNTHETIC_BLACK_FRIDAY]: {
    hacknet_node_core_cost: effect,
    hacknet_node_level_cost: effect,
    hacknet_node_purchase_cost: effect,
    hacknet_node_ram_cost: effect,

    server_cost: effect,
    home_ram_cost: effect,
    home_core_cost: effect,
  },
  [Bonus.INCREASED_MAINFRAME_VOLTAGE]: null,
  [Bonus.RAPID_ASSIMILATION]: null,
  [Bonus.IS_LM_ACCELERATION]: null,
  [Bonus.RECORDLESS_CONTRACTING]: null,
});

export function applySpecialBonus(worm: Worm) {
  const mult = bonusMult(0)[worm.bonus.id];
  if (mult !== null) return;

  const effect = getBonusEffect(worm.bonus, worm.completions);

  switch (worm.bonus.id) {
    case Bonus.CARDINAL_SIN: {
      worm.specialMults.crimeMult = effect;
      break;
    }
    case Bonus.INCREASED_MAINFRAME_VOLTAGE: {
      worm.specialMults.gameTickSpeed = effect;
      break;
    }
    case Bonus.RAPID_ASSIMILATION: {
      worm.specialMults.intelligenceMult = effect;
      break;
    }
    case Bonus.IS_LM_ACCELERATION: {
      worm.specialMults.stockMarketMult = effect;
      break;
    }
    case Bonus.RECORDLESS_CONTRACTING: {
      worm.specialMults.bladeburnerMult = effect;
      break;
    }
    default:
      throw new Error(`Bonus #${worm.bonus.id} does not have a special implementation`);
  }
}

export function formatBonusDescription(effect: number, desc: string) {
  (desc = desc.replace("$INC$", formatPercent(effect - 1))),
    (desc = desc.replace("$DEC$", formatPercent(1 - effect))),
    (desc = desc.replace("$MUL$", formatPercent(effect)));
  return desc;
}

export function getBonusFormattingType(desc: string) {
  const match = desc.match(/(\+|-)?\$...\$/);
  if (match === null || match.length === 0) return "N/A";
  return match[0];
}

export const numberIsBonusValue = (n: number): n is (typeof Bonus)[keyof typeof Bonus] =>
  Object.values(Bonus).indexOf(n as (typeof Bonus)[keyof typeof Bonus]) !== -1;

export function getBonusEffect(data: BonusType, completions: number) {
  return effectFunction(completions, data.a, data.g, data.k, data.m);
}

export const effectFunction = (x: number, a: number, g: number, k: number, m: number) =>
  g + (a - g) * Math.exp(-1 * k * Math.pow(x, m));

export function getMultiplier(data: BonusType, completions: number): Multipliers | null {
  const mult = defaultMultipliers();
  const power = getBonusEffect(data, completions);
  const partial = bonusMult(power)[data.id];

  if (partial === null) return partial;

  return { ...mult, ...partial };
}
