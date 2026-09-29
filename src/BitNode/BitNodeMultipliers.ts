import { PartialRecord, getRecordEntries } from "../Types/Record";
import { clampNumber } from "../utils/helpers/clampNumber";
/**
 * Bitnode multipliers influence the difficulty of different aspects of the game.
 * Each Bitnode has a different theme/strategy to achieving the end goal, so these multipliers help drive the
 * player toward the intended strategy. Unless they really want to play the long, slow game of waiting...
 */
export class BitNodeMultipliers {
  /** Influences how quickly the player's agility level (not exp) scales. */
  AgilityLevelMultiplier = 1;

  /** Influences the base cost of purchasing an augmentation. */
  AugmentationMoneyCost = 1;

  /** Influences the base rep the player must have with a faction to purchase an augmentation. */
  AugmentationRepCost = 1;

  /** Influences how quickly the player gains Bladeburner rank. */
  BladeburnerRank = 1;

  /** Influences the cost of Bladeburner skills. */
  BladeburnerSkillCost = 1;

  /** Influences how quickly the player's charisma level (not exp) scales. */
  CharismaLevelMultiplier = 1;

  /** Influences the experience gained from taking a class. */
  ClassGymExpGain = 1;

  /** Influences the money gained from completing Coding Contracts. */
  CodingContractMoney = 1;

  /** Influences the experience gained from working for a company. */
  CompanyWorkExpGain = 1;

  /** Influences the money earned from working for a company. */
  CompanyWorkMoney = 1;

  /** Influences the rep gained from working for a company. */
  CompanyWorkRepGain = 1;

  /** Influences the amount of divisions a corporation can have at the same time. */
  CorporationDivisions = 1;

  /** Influences an exponential modifier applied to corporation dividends. */
  CorporationSoftcap = 1;

  /** Influences the valuation of corporations created by the player. */
  CorporationValuation = 1;

  /** Influences the experience gained from committing crimes. */
  CrimeExpGain = 1;

  /** Influences the money gained from committing crimes. */
  CrimeMoney = 1;

  /** Influences the success chance of committing crimes. */
  CrimeSuccessRate = 1;

  /** Influences how many augmentations you need in order to get invited to the Daedalus faction. */
  DaedalusAugsRequirement = 30;

  /** If true, TRP can be found in the fourth lab deep in the darknet. */
  DarknetLabyrinthRewardsTheRedPill = 1;

  /** Influences the money gained from phishing and reward caches on the darknet. */
  DarknetMoneyMultiplier = 1;

  /** Influences how quickly the player's defense level (not exp) scales. */
  DefenseLevelMultiplier = 1;

  /** Influences how quickly the player's dexterity level (not exp) scales. */
  DexterityLevelMultiplier = 1;

  /** Influences the rep the player gains with each faction simply by being a member. */
  FactionPassiveRepGain = 1;

  /** Influences the experience gained from working for a faction. */
  FactionWorkExpGain = 1;

  /** Influences the rep gained working for a faction or donating to it. */
  FactionWorkRepGain = 1;

  /** Influences the cost of unlocking stock market's 4S Market Data API. */
  FourSigmaMarketDataApiCost = 1;

  /** Influences the cost of unlocking the stock market's 4S Market Data (not the API). */
  FourSigmaMarketDataCost = 1;

  /** Influences an exponential modifier applied to money and respect gain. */
  GangSoftcap = 1;

  /** Percentage of unique augmentations that a gang has. */
  GangUniqueAugs = 1;

  /** Percentage multiplier on the effect of IPvGO rewards. */
  GoPower = 1;

  /** Influences the experience gained when hacking a server. */
  HackExpGain = 1;

  /** Influences how quickly the player's hacking level (not exp) scales. */
  HackingLevelMultiplier = 1;

  /** Influences how quickly the player's hack(), grow() and weaken() calls run. */
  HackingSpeedMultiplier = 1;

  /**
   * Influences how much money is produced by Hacknet Nodes.
   * Influences the hash rate of Hacknet Servers (unlocked in BitNode-9).
   */
  HacknetNodeMoney = 1;

  /** Influences the cost of upgrading your home computer's RAM. */
  HomeComputerRamCost = 1;

  /** Influences the money gained from infiltrating a company. */
  InfiltrationMoney = 1;

  /** Influences the faction rep the player can gain from selling stolen documents and secrets. */
  InfiltrationRep = 1;

  /**
   * Influences how much of the stolen money you actually gain when hacking a server using the Terminal.
   * When you hack a server using the Terminal, an amount of money is removed from it.
   * This multiplier determines how much of the removed money you actually gain.
   */
  ManualHackMoney = 1;

  /** Influences the base cost of cloud server purchases and upgrades. */
  CloudServerCost = 1;

  /** Influences an exponential modifier applied to cloud server purchase and upgrade costs beyond 32 GB. */
  CloudServerSoftcap = 1;

  /** Influences the maximum number of cloud servers you can have. */
  CloudServerLimit = 1;

  /** Influences the maximum allowed RAM for a cloud server. */
  CloudServerMaxRam = 1;

  /** Influences the minimum favor the player must have with a faction before they can donate to gain rep. */
  FavorToDonateToFaction = 1;

  /** Influences how much money is stolen from a server when you hack it. */
  ScriptHackMoney = 1;

  /**
   * Influences how much of the stolen money you actually gain when hacking a server using a script.
   * When you hack a server with a script, an amount of money is removed from it.
   * This multiplier determines how much of the removed money you actually gain.
   */
  ScriptHackMoneyGain = 1;

  /** Influences the growth percentage per cycle. */
  ServerGrowthRate = 1;

  /** Influences the maximum money that a server can grow to. */
  ServerMaxMoney = 1;

  /** Influences the initial money that a server starts with. */
  ServerStartingMoney = 1;

  /** Influences the initial security level (hackDifficulty) of a server. */
  ServerStartingSecurity = 1;

  /** Influences the weaken amount per cycle. */
  ServerWeakenRate = 1;

  /** Influences how quickly the player's strength level (not exp) scales. */
  StrengthLevelMultiplier = 1;

  /** Influences the power of the gift. */
  StaneksGiftPowerMultiplier = 1;

  /** Influences the size of the gift. */
  StaneksGiftExtraSize = 0;

  /** Influences the hacking skill required to backdoor the World Daemon. */
  WorldDaemonDifficulty = 1;

  constructor(a: PartialRecord<keyof BitNodeMultipliers, number> = {}) {
    for (const [key, value] of getRecordEntries(a)) this[key] = clampNumber(value);
  }
}

/** The multipliers currently in effect */
export let currentNodeMults = new BitNodeMultipliers();

export function replaceCurrentNodeMults(mults: BitNodeMultipliers) {
  currentNodeMults = mults;
}
