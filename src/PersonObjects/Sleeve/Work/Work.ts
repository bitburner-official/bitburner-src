import { Player } from "@player";
import { IReviverValue } from "../../../utils/JSONReviver";
import { Sleeve } from "../Sleeve";
import { applyWorkStatsExp, WorkStats } from "../../../Work/WorkStats";
import { SleeveTask } from "@nsdefs";
import { SleeveCompanyWork } from "./SleeveCompanyWork";
import { SleeveFactionWork } from "./SleeveFactionWork";
import { SleeveCrimeWork } from "./SleeveCrimeWork";
import { SleeveClassWork } from "./SleeveClassWork";
import { SleeveRecoveryWork } from "./SleeveRecoveryWork";
import { SleeveSynchroWork } from "./SleeveSynchroWork";
import { SleeveBladeburnerWork } from "./SleeveBladeburnerWork";
import { SleeveInfiltrateWork } from "./SleeveInfiltrateWork";
import { SleeveSupportWork } from "./SleeveSupportWork";

export const applySleeveGains = (sleeve: Sleeve, shockedStats: WorkStats, mult = 1): void => {
  applyWorkStatsExp(sleeve, shockedStats, mult);
  Player.gainMoney(shockedStats.money * mult, "sleeves");
  const sync = sleeve.syncBonus();
  // The receiving sleeves and the player do not apply their xp multipliers from augs (avoid double dipping xp mults)
  applyWorkStatsExp(Player, shockedStats, mult * sync);
  // Sleeves apply their own shock bonus to the XP they receive, even though it is also shocked by the working sleeve
  Player.sleeves.forEach((s) => s !== sleeve && applyWorkStatsExp(s, shockedStats, mult * sync * s.shockBonus()));
};

export abstract class Work {
  abstract type: WorkType;
  abstract process(sleeve: Sleeve, cycles: number): void;
  abstract APICopy(sleeve: Sleeve): SleeveTask;
  abstract toJSON(): IReviverValue;
  finish(): void {
    /* left for children to implement */
  }
}

export enum WorkType {
  COMPANY = "COMPANY",
  FACTION = "FACTION",
  CRIME = "CRIME",
  CLASS = "CLASS",
  RECOVERY = "RECOVERY",
  SYNCHRO = "SYNCHRO",
  BLADEBURNER = "BLADEBURNER",
  INFILTRATE = "INFILTRATE",
  SUPPORT = "SUPPORT",
}

export type SleeveWork =
  | SleeveCompanyWork
  | SleeveFactionWork
  | SleeveCrimeWork
  | SleeveClassWork
  | SleeveRecoveryWork
  | SleeveSynchroWork
  | SleeveBladeburnerWork
  | SleeveInfiltrateWork
  | SleeveSupportWork;
