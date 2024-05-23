import {
  AugmentationName,
  CityName,
  CompanyName,
  CompletedProgramName,
  FactionName,
  FactionDiscovery,
  JobName,
  LocationName,
  ToastVariant,
} from "@enums";

import type { PlayerObject } from "./PlayerObject";
import type { ProgramFilePath } from "../../Paths/ProgramFilePath";

import { applyAugmentation } from "../../Augmentation/AugmentationHelpers";
import { PlayerOwnedAugmentation } from "../../Augmentation/PlayerOwnedAugmentation";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { CodingContractRewardType, ICodingContractReward } from "../../CodingContracts";
import { Company } from "../../Company/Company";
import { Companies } from "../../Company/Companies";
import { getNextCompanyPositionHelper } from "../../Company/GetNextCompanyPosition";
import { getJobRequirements, getJobRequirementText } from "../../Company/GetJobRequirements";
import { CompanyPosition } from "../../Company/CompanyPosition";
import { CONSTANTS } from "../../Constants";
import { Exploit } from "../../Exploits/Exploit";
import { Faction } from "../../Faction/Faction";
import { Factions } from "../../Faction/Factions";
import { FactionInvitationEvents } from "../../Faction/ui/FactionInvitationManager";
import { resetGangs } from "../../Gang/AllGangs";
import { Cities } from "../../Locations/Cities";
import { Locations } from "../../Locations/Locations";
import { Sleeve } from "../Sleeve/Sleeve";
import { SleeveWorkType } from "../Sleeve/Work/Work";
import { calculateSkillProgress as calculateSkillProgressF, ISkillProgress } from "../formulas/skill";
import { AddToAllServers, createUniqueRandomIp } from "../../Server/AllServers";
import { safelyCreateUniqueServer } from "../../Server/ServerHelpers";

import { SpecialServers } from "../../Server/data/SpecialServers";
import { applySourceFile } from "../../SourceFile/applySourceFile";
import { applyExploit } from "../../Exploits/applyExploits";
import { SourceFiles } from "../../SourceFile/SourceFiles";
import { getHospitalizationCost } from "../../Hospital/Hospital";

import { formatMoney } from "../../ui/formatNumber";
import { MoneySource, MoneySourceTracker } from "../../utils/MoneySourceTracker";
import { dialogBoxCreate } from "../../ui/React/DialogBox";

import { SnackbarEvents } from "../../ui/React/Snackbar";
import { achievements } from "../../Achievements/Achievements";

import { isCompanyWork } from "../../Work/CompanyWork";
import { isMember } from "../../utils/EnumHelper";

export function init(this: PlayerObject): void {
  /* Initialize Player's home computer */
  const t_homeComp = safelyCreateUniqueServer({
    adminRights: true,
    hostname: "home",
    ip: createUniqueRandomIp(),
    isConnectedTo: true,
    maxRam: 8,
    organizationName: "Home PC",
    purchasedByPlayer: true,
  });
  this.currentServer = SpecialServers.Home;
  AddToAllServers(t_homeComp);

  this.getHomeComputer().programs.push(CompletedProgramName.nuke);
}

export function prestigeAugmentation(this: PlayerObject): void {
  this.currentServer = SpecialServers.Home;

  this.numPeopleKilled = 0;

  //Reset stats
  this.skills.hacking = 1;

  this.skills.strength = 1;
  this.skills.defense = 1;
  this.skills.dexterity = 1;
  this.skills.agility = 1;

  this.skills.charisma = 1;

  this.exp.hacking = 0;
  this.exp.strength = 0;
  this.exp.defense = 0;
  this.exp.dexterity = 0;
  this.exp.agility = 0;
  this.exp.charisma = 0;

  this.money = 1000 + CONSTANTS.Donations;

  this.city = CityName.Sector12;
  this.location = LocationName.TravelAgency;

  this.jobs = {};

  this.purchasedServers = [];

  this.factions = [];
  this.factionInvitations = [];
  this.factionRumors.clear();
  // Clear any pending invitation modals
  FactionInvitationEvents.emit({ type: "ClearAll" });

  this.queuedAugmentations = [];

  Sleeve.recalculateNumOwned();

  this.sleeves.forEach((sleeve) => (sleeve.shock <= 0 ? sleeve.synchronize() : sleeve.shockRecovery()));

  this.lastUpdate = new Date().getTime();

  // Statistics Trackers
  this.playtimeSinceLastAug = 0;
  this.lastAugReset = this.lastUpdate;
  this.scriptProdSinceLastAug = 0;
  this.moneySourceA.reset();

  this.hacknetNodes.length = 0;
  this.hashManager.prestige();

  // Reapply augs, re-calculate skills and reset HP
  this.reapplyAllAugmentations(true);
  this.hp.current = this.hp.max;

  this.finishWork(true, true);
}

export function prestigeSourceFile(this: PlayerObject): void {
  this.entropy = 0;
  this.prestigeAugmentation();
  this.karma = 0;
  // Duplicate sleeves are reset to level 1 every Bit Node (but the number of sleeves you have persists)
  this.sleeves.forEach((sleeve) => sleeve.prestige());

  if (this.bitNodeN === 10) {
    for (let i = 0; i < this.sleeves.length; i++) {
      this.sleeves[i].shock = Math.min(25, this.sleeves[i].shock);
      this.sleeves[i].sync = Math.max(25, this.sleeves[i].sync);
    }
  }

  this.gang = null;
  resetGangs();
  this.corporation = null;
  this.bladeburner = null;

  // Reset Stock market
  this.hasWseAccount = false;
  this.hasTixApiAccess = false;
  this.has4SData = false;
  this.has4SDataTixApi = false;

  // BitNode 3: Corporatocracy
  this.corporation = null;

  this.moneySourceB.reset();
  this.playtimeSinceLastBitnode = 0;
  this.lastNodeReset = this.lastUpdate;
  this.augmentations = [];
}

export function receiveInvite(this: PlayerObject, factionName: FactionName): void {
  const faction = Factions[factionName];
  if (this.factionInvitations.includes(factionName) || faction.alreadyInvited || faction.isMember || faction.isBanned)
    return;
  this.factionInvitations.push(factionName);
  this.factionRumors.delete(factionName);
  faction.discovery = FactionDiscovery.known;
}

export function receiveRumor(this: PlayerObject, factionName: FactionName): void {
  const faction = Factions[factionName];
  if (faction.discovery === FactionDiscovery.unknown) faction.discovery = FactionDiscovery.rumored;
  if (this.factionRumors.has(factionName) || faction.isMember || faction.isBanned || faction.alreadyInvited) return;
  this.factionRumors.add(factionName);
}

//Calculates skill level progress based on experience. The same formula will be used for every skill
export function calculateSkillProgress(this: PlayerObject, exp: number, mult = 1): ISkillProgress {
  return calculateSkillProgressF(exp, mult);
}

export function hasProgram(this: PlayerObject, programName: CompletedProgramName | ProgramFilePath): boolean {
  const home = this.getHomeComputer();
  return home.programs.includes(programName);
}

export function setMoney(this: PlayerObject, money: number): void {
  if (isNaN(money)) {
    console.error("NaN passed into Player.setMoney()");
    return;
  }
  this.money = money;
}

export function gainMoney(this: PlayerObject, money: number, source: MoneySource): void {
  if (isNaN(money)) {
    console.error("NaN passed into Player.gainMoney()");
    return;
  }

  this.money = this.money + money;
  this.recordMoneySource(money, source);
}

export function loseMoney(this: PlayerObject, money: number, source: MoneySource): void {
  if (isNaN(money)) {
    console.error("NaN passed into Player.loseMoney()");
    return;
  }
  if (this.money === Infinity && money === Infinity) return;
  this.money = this.money - money;
  this.recordMoneySource(-1 * money, source);
}

export function canAfford(this: PlayerObject, cost: number): boolean {
  if (isNaN(cost)) {
    console.error(`NaN passed into Player.canAfford()`);
    return false;
  }
  return this.money >= cost;
}

export function recordMoneySource(this: PlayerObject, amt: number, source: MoneySource): void {
  if (!(this.moneySourceA instanceof MoneySourceTracker)) {
    console.warn(`Player.moneySourceA was not properly initialized. Resetting`);
    this.moneySourceA = new MoneySourceTracker();
  }
  if (!(this.moneySourceB instanceof MoneySourceTracker)) {
    console.warn(`Player.moneySourceB was not properly initialized. Resetting`);
    this.moneySourceB = new MoneySourceTracker();
  }
  this.moneySourceA.record(amt, source);
  this.moneySourceB.record(amt, source);
}

export function startFocusing(this: PlayerObject): void {
  this.focus = true;
}

export function stopFocusing(this: PlayerObject): void {
  this.focus = false;
}

// Returns true if hospitalized, false otherwise
export function takeDamage(this: PlayerObject, amt: number): boolean {
  if (typeof amt !== "number") {
    console.warn(`Player.takeDamage() called without a numeric argument: ${amt}`);
    return false;
  }

  this.hp.current -= amt;
  if (this.hp.current <= 0) {
    this.hospitalize();
    return true;
  } else {
    return false;
  }
}

export function hospitalize(this: PlayerObject): number {
  const cost = getHospitalizationCost();
  SnackbarEvents.emit(`You've been Hospitalized for ${formatMoney(cost)}`, ToastVariant.SUCCESS, 2000);

  this.loseMoney(cost, "hospitalization");
  this.hp.current = this.hp.max;
  return cost;
}

/**
 * Company job application. Determines the job that the Player should get (if any) at the given company.
 * @param this The player instance
 * @param company The company being applied to
 * @param position A specific position
 * @param sing Whether this is being called from the applyToCompany() Netscript Singularity function
 * @returns The name of the Job received (if any). May be higher or lower than the job applied to.
 */
export function applyForJob(
  this: PlayerObject,
  company: Company,
  position: CompanyPosition,
  sing = false,
): JobName | null {
  if (!company) return null;

  // Start searching the job track from the provided point (which may not be the entry position)
  let pos = position;
  if (!this.isQualified(company, pos)) {
    if (!sing) {
      dialogBoxCreate(`Unfortunately, you do not qualify for this position.\n${getJobRequirementText(company, pos)}`);
    }
    return null;
  }

  if (!company.hasPosition(pos)) {
    console.error(`Company ${company.name} does not have position ${pos}. Player.applyToCompany() failed.`);
    return null;
  }

  let nextPos = getNextCompanyPositionHelper(pos);
  while (nextPos && company.hasPosition(nextPos) && this.isQualified(company, nextPos)) {
    pos = nextPos;
    nextPos = getNextCompanyPositionHelper(pos);
  }

  //Check if player already has the assigned job
  if (this.jobs[company.name] === pos.name) {
    if (!sing) {
      const nextPos = getNextCompanyPositionHelper(pos);
      if (nextPos == null) {
        dialogBoxCreate(`You are already ${pos.name}! No promotion available`);
      } else if (!company.hasPosition(nextPos)) {
        dialogBoxCreate(
          `You already have the highest ${pos.field} position available at ${company.name}! No promotion available`,
        );
      } else {
        dialogBoxCreate(
          `Unfortunately, you do not qualify for a promotion.\n${getJobRequirementText(company, nextPos)}`,
        );
      }
    }
    return null;
  }

  this.jobs[company.name] = pos.name;

  if (!sing) {
    dialogBoxCreate(`${pos.hiredText} at ${company.name}!`);
  }
  return pos.name;
}

/**
 * Get a job position that the player can apply for.
 * @param this The player instance
 * @param company The Company being applied to
 * @param entryPosType Job field (Software, Business, etc)
 * @returns The highest job the player can apply for at this company, if any
 */
export function getNextCompanyPosition(
  this: PlayerObject,
  company: Company,
  entryPosType: CompanyPosition,
): CompanyPosition | null {
  let pos: CompanyPosition | null = entryPosType;
  let nextPos = getNextCompanyPositionHelper(pos);
  // Find the highest-level job in this category that the player is currently able to apply for.
  while (nextPos && company.hasPosition(nextPos) && this.isQualified(company, nextPos)) {
    pos = nextPos;
    nextPos = getNextCompanyPositionHelper(pos);
  }
  // If the player already has this position, return the one after that (if any).
  if (this.jobs[company.name] == pos.name) {
    pos = nextPos;
  }
  return pos;
}

export function quitJob(this: PlayerObject, company: CompanyName): void {
  if (isCompanyWork(this.currentWork) && this.currentWork.companyName === company) {
    this.finishWork(true);
  }
  for (const sleeve of this.sleeves) {
    if (sleeve.currentWork?.type === SleeveWorkType.COMPANY && sleeve.currentWork.companyName === company) {
      sleeve.stopWork();
      dialogBoxCreate(`You quit ${company} while one of your sleeves was working there. The sleeve is now idle.`);
    }
  }
  delete this.jobs[company];
}

/**
 * Method to see if the player has at least one job assigned to them
 * @param this The player instance
 * @returns Whether the user has at least one job
 */
export function hasJob(this: PlayerObject): boolean {
  return Boolean(Object.keys(this.jobs).length);
}

//Checks if the Player is qualified for a certain position
export function isQualified(this: PlayerObject, company: Company, position: CompanyPosition): boolean {
  const reqs = getJobRequirements(company, position);
  return reqs.every((req) => req.isSatisfied(this));
}

/********** Reapplying Augmentations and Source File ***********/
export function reapplyAllAugmentations(this: PlayerObject, resetMultipliers = true): void {
  if (resetMultipliers) {
    this.resetMultipliers();
  }

  for (const playerAug of this.augmentations) {
    const augName = playerAug.name;

    if (augName == AugmentationName.NeuroFluxGovernor) {
      for (let i = 0; i < playerAug.level; ++i) {
        applyAugmentation(playerAug, true);
      }
      continue;
    }
    applyAugmentation(playerAug, true);
  }

  this.updateSkillLevels();
}

export function reapplyAllSourceFiles(this: PlayerObject): void {
  //Will always be called after reapplyAllAugmentations() so multipliers do not have to be reset
  //this.resetMultipliers();

  for (const [bn, lvl] of this.sourceFiles) {
    const srcFileKey = "SourceFile" + bn;
    const sourceFileObject = SourceFiles[srcFileKey];
    if (!sourceFileObject) {
      console.error(`Invalid source file number: ${bn}`);
      continue;
    }
    applySourceFile(bn, lvl);
  }
  applyExploit();
  this.updateSkillLevels();
}

/**
 * Checks whether a player meets the requirements for joining each faction, and returns an array of all invitations the player should receive.
 * Also handles receiving rumors for factions if the rumor requirements are met.
 */
export function checkForFactionInvitations(this: PlayerObject): Faction[] {
  const invitedFactions = [];
  for (const faction of Object.values(Factions)) {
    if (faction.isBanned) continue;
    if (faction.isMember) continue;
    if (faction.alreadyInvited) continue;
    // Handle invites
    const { inviteReqs, rumorReqs } = faction.getInfo();
    if (inviteReqs.isSatisfied(this)) invitedFactions.push(faction);
    // Handle rumors
    if (this.factionRumors.has(faction.name)) continue;
    if (rumorReqs.isSatisfied(this)) this.receiveRumor(faction.name);
  }
  return invitedFactions;
}

/************* BitNodes **************/
export function setBitNodeNumber(this: PlayerObject, n: number): void {
  this.bitNodeN = n;
}

export function queueAugmentation(this: PlayerObject, name: AugmentationName): void {
  for (const aug of this.queuedAugmentations) {
    if (aug.name == name) {
      console.warn(`tried to queue ${name} twice, this may be a bug`);
      return;
    }
  }

  for (const aug of this.augmentations) {
    if (aug.name == name) {
      console.warn(`tried to queue ${name} twice, this may be a bug`);
      return;
    }
  }

  this.queuedAugmentations.push(new PlayerOwnedAugmentation(name));
}

/************* Coding Contracts **************/
export function gainCodingContractReward(
  this: PlayerObject,
  reward: ICodingContractReward | null,
  difficulty = 1,
): string {
  if (!reward) return `No reward for this contract`;

  switch (reward.type) {
    case CodingContractRewardType.FactionReputation: {
      if (!Factions[reward.name]) {
        return this.gainCodingContractReward({ type: CodingContractRewardType.FactionReputationAll });
      }
      const repGain = CONSTANTS.CodingContractBaseFactionRepGain * difficulty;
      Factions[reward.name].playerReputation += repGain;
      return `Gained ${repGain} faction reputation for ${reward.name}`;
    }
    case CodingContractRewardType.FactionReputationAll: {
      const totalGain = CONSTANTS.CodingContractBaseFactionRepGain * difficulty;

      // Ignore Bladeburners and other special factions for this calculation
      const specialFactions = [
        FactionName.Bladeburners,
        FactionName.ShadowsOfAnarchy,
        FactionName.ChurchOfTheMachineGod,
      ];
      const factions = this.factions.slice().filter((f) => {
        return !specialFactions.includes(f);
      });

      // If the player was only part of the special factions, we'll just give money
      if (factions.length == 0) {
        return this.gainCodingContractReward({ type: CodingContractRewardType.Money }, difficulty);
      }

      const gainPerFaction = Math.floor(totalGain / factions.length);
      for (const facName of factions) {
        if (!Factions[facName]) continue;
        Factions[facName].playerReputation += gainPerFaction;
      }
      return `Gained ${gainPerFaction} reputation for each of the following factions: ${factions.join(", ")}`;
    }
    case CodingContractRewardType.CompanyReputation: {
      if (!isMember("CompanyName", reward.name)) {
        return this.gainCodingContractReward({ type: CodingContractRewardType.FactionReputationAll });
      }
      const repGain = CONSTANTS.CodingContractBaseCompanyRepGain * difficulty;
      Companies[reward.name].playerReputation += repGain;
      return `Gained ${repGain} company reputation for ${reward.name}`;
    }
    case CodingContractRewardType.Money:
    default: {
      const moneyGain = CONSTANTS.CodingContractBaseMoneyGain * difficulty * currentNodeMults.CodingContractMoney;
      this.gainMoney(moneyGain, "codingcontract");
      return `Gained ${formatMoney(moneyGain)}`;
    }
  }
}

export function travel(this: PlayerObject, to: CityName): boolean {
  if (Cities[to] == null) {
    console.warn(`Player.travel() called with invalid city: ${to}`);
    return false;
  }
  this.city = to;

  return true;
}

export function gotoLocation(this: PlayerObject, to: LocationName): boolean {
  if (Locations[to] == null) {
    console.warn(`Player.gotoLocation() called with invalid location: ${to}`);
    return false;
  }
  this.location = to;

  return true;
}

export function canAccessGrafting(this: PlayerObject): boolean {
  return this.bitNodeN === 10 || this.sourceFileLvl(10) > 0;
}

export function giveExploit(this: PlayerObject, exploit: Exploit): void {
  if (!this.exploits.includes(exploit)) {
    this.exploits.push(exploit);
    SnackbarEvents.emit("SF -1 acquired!", ToastVariant.SUCCESS, 2000);
  }
}

export function giveAchievement(this: PlayerObject, achievementId: string): void {
  const achievement = achievements[achievementId];
  if (!achievement) return;
  if (!this.achievements.map((a) => a.ID).includes(achievementId)) {
    this.achievements.push({ ID: achievementId, unlockedOn: new Date().getTime() });
    SnackbarEvents.emit(`Unlocked Achievement: "${achievement.Name}"`, ToastVariant.SUCCESS, 2000);
  }
}

export function getCasinoWinnings(this: PlayerObject): number {
  return this.moneySourceA.casino;
}

export function canAccessCotMG(this: PlayerObject): boolean {
  return this.bitNodeN === 13 || this.sourceFileLvl(13) > 0;
}

export function sourceFileLvl(this: PlayerObject, n: number): number {
  return this.sourceFiles.get(n) ?? 0;
}

export function focusPenalty(this: PlayerObject): number {
  let focus = 1;
  if (!this.hasAugmentation(AugmentationName.NeuroreceptorManager, true)) {
    focus = this.focus ? 1 : CONSTANTS.BaseFocusBonus;
  }
  return focus;
}
