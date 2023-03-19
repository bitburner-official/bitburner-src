import { applyAugmentation } from "../../Augmentation/AugmentationHelpers";
import { PlayerOwnedAugmentation } from "../../Augmentation/PlayerOwnedAugmentation";
import { AugmentationNames } from "../../Augmentation/data/AugmentationNames";
import { BitNodeMultipliers } from "../../BitNode/BitNodeMultipliers";
import { CodingContractRewardType, CodingContractReward } from "../../CodingContracts";
import { Company } from "../../Company/Company";
import { Companies } from "../../Company/Companies";
import { getNextCompanyPositionHelper } from "../../Company/GetNextCompanyPosition";
import { getJobRequirementText } from "../../Company/GetJobRequirementText";
import { CompanyPositions } from "../../Company/CompanyPositions";
import { CompanyPosition } from "../../Company/CompanyPosition";
import * as posNames from "../../Company/data/JobTracks";
import { CONSTANTS } from "../../Constants";
import { CompletedProgramName } from "../../Programs/Programs";
import { Exploit } from "../../Exploits/Exploit";
import { Faction } from "../../Faction/Faction";
import { Factions } from "../../Faction/Factions";
import { resetGangs } from "../../Gang/AllGangs";
import { Cities } from "../../Locations/Cities";
import { Locations } from "../../Locations/Locations";
import { CityName, LocationName, ToastVariant } from "../../data/Enums";
import { Sleeve } from "../Sleeve/Sleeve";
import { isSleeveCompanyWork } from "../Sleeve/Work/SleeveCompanyWork";
import { calculateSkillProgress as calculateSkillProgressF, ISkillProgress } from "../formulas/skill";
import { GetServer, AddToAllServers, createUniqueRandomIp } from "../../Server/AllServers";
import { Server } from "../../Server/Server";
import { safelyCreateUniqueServer } from "../../Server/ServerHelpers";

import { SpecialServers } from "../../Server/data/SpecialServers";
import { applySourceFile } from "../../SourceFile/applySourceFile";
import { applyExploit } from "../../Exploits/applyExploits";
import { SourceFiles } from "../../SourceFile/SourceFiles";
import { getHospitalizationCost } from "../../Hospital/Hospital";
import { HacknetServer } from "../../Hacknet/HacknetServer";

import { formatMoney } from "../../ui/formatNumber";
import { MoneySourceTracker } from "../../utils/MoneySourceTracker";
import { dialogBoxCreate } from "../../ui/React/DialogBox";

import { SnackbarEvents } from "../../ui/React/Snackbar";
import { achievements } from "../../Achievements/Achievements";
import { FactionName } from "../../Faction/data/Enums";

import { isCompanyWork } from "../../Work/CompanyWork";
import { serverMetadata } from "../../Server/data/servers";

import type { PlayerObject } from "./PlayerObject";
import { ProgramFilePath } from "src/Paths/ProgramFilePath";

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

  this.queuedAugmentations = [];

  const numSleeves = Math.min(3, this.sourceFileLvl(10) + (this.bitNodeN === 10 ? 1 : 0)) + this.sleevesFromCovenant;
  if (this.sleeves.length > numSleeves) this.sleeves.length = numSleeves;
  for (let i = this.sleeves.length; i < numSleeves; i++) {
    this.sleeves.push(new Sleeve());
  }

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

  this.finishWork(true);
}

export function prestigeSourceFile(this: PlayerObject): void {
  this.entropy = 0;
  this.prestigeAugmentation();
  this.karma = 0;
  // Duplicate sleeves are reset to level 1 every Bit Node (but the number of sleeves you have persists)
  this.sleeves.forEach((sleeve) => sleeve.prestige());

  if (this.bitNodeN === 10) {
    for (let i = 0; i < this.sleeves.length; i++) {
      this.sleeves[i].shock = Math.max(25, this.sleeves[i].shock);
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
  if (this.factionInvitations.includes(factionName) || this.factions.includes(factionName)) {
    return;
  }
  this.factionInvitations.push(factionName);
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

export function gainMoney(this: PlayerObject, money: number, source: string): void {
  if (isNaN(money)) {
    console.error("NaN passed into Player.gainMoney()");
    return;
  }

  this.money = this.money + money;
  this.recordMoneySource(money, source);
}

export function loseMoney(this: PlayerObject, money: number, source: string): void {
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

export function recordMoneySource(this: PlayerObject, amt: number, source: string): void {
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

/********* Company job application **********/
//Determines the job that the Player should get (if any) at the current company
//The 'sing' argument designates whether or not this is being called from
//the applyToCompany() Netscript Singularity function
export function applyForJob(this: PlayerObject, entryPosType: CompanyPosition, sing = false): boolean {
  const company = Companies[this.location]; //Company being applied to
  if (!company) {
    console.error(`Could not find company that matches the location: ${this.location}. Player.applyToCompany() failed`);
    return false;
  }

  let pos = entryPosType;

  if (!this.isQualified(company, pos)) {
    if (!sing) {
      dialogBoxCreate("Unfortunately, you do not qualify for this position\n" + getJobRequirementText(company, pos));
    }
    return false;
  }

  if (!company.hasPosition(pos)) {
    console.error(`Company ${company.name} does not have position ${pos}. Player.applyToCompany() failed`);
    return false;
  }

  while (true) {
    const nextPos = getNextCompanyPositionHelper(pos);
    if (nextPos == null) break;
    if (company.hasPosition(nextPos) && this.isQualified(company, nextPos)) {
      pos = nextPos;
    } else break;
  }

  //Check if player already has the assigned job
  if (this.jobs[company.name] === pos.name) {
    if (!sing) {
      const nextPos = getNextCompanyPositionHelper(pos);
      if (nextPos == null || !company.hasPosition(nextPos)) {
        dialogBoxCreate("You are already at the highest position for your field! No promotion available");
      } else {
        const reqText = getJobRequirementText(company, nextPos);
        dialogBoxCreate("Unfortunately, you do not qualify for a promotion\n" + reqText);
      }
    }
    return false;
  }

  this.jobs[company.name] = pos.name;

  if (!sing) {
    dialogBoxCreate(`Congratulations! You were offered a new job at ${company.name} for position ${pos.name}!`);
  }
  return true;
}

//Returns your next position at a company given the field (software, business, etc.)
export function getNextCompanyPosition(
  this: PlayerObject,
  company: Company,
  entryPosType: CompanyPosition,
): CompanyPosition | null {
  const currCompany = Companies[company.name];

  //Not employed at this company, so return the entry position
  if (currCompany == null || currCompany.name != company.name) {
    return entryPosType;
  }

  //If the entry pos type and the player's current position have the same type,
  //return the player's "nextCompanyPosition". Otherwise return the entryposType
  //Employed at this company, so just return the next position if it exists.
  const currentPositionName = this.jobs[company.name];
  if (!currentPositionName) return entryPosType;
  const currentPosition = CompanyPositions[currentPositionName];
  if (
    (currentPosition.isSoftwareJob() && entryPosType.isSoftwareJob()) ||
    (currentPosition.isITJob() && entryPosType.isITJob()) ||
    (currentPosition.isBusinessJob() && entryPosType.isBusinessJob()) ||
    (currentPosition.isSecurityEngineerJob() && entryPosType.isSecurityEngineerJob()) ||
    (currentPosition.isNetworkEngineerJob() && entryPosType.isNetworkEngineerJob()) ||
    (currentPosition.isSecurityJob() && entryPosType.isSecurityJob()) ||
    (currentPosition.isAgentJob() && entryPosType.isAgentJob()) ||
    (currentPosition.isSoftwareConsultantJob() && entryPosType.isSoftwareConsultantJob()) ||
    (currentPosition.isBusinessConsultantJob() && entryPosType.isBusinessConsultantJob()) ||
    (currentPosition.isPartTimeJob() && entryPosType.isPartTimeJob())
  ) {
    return getNextCompanyPositionHelper(currentPosition);
  }

  return entryPosType;
}

export function quitJob(this: PlayerObject, companyName: LocationName): void {
  if (isCompanyWork(this.currentWork) && this.currentWork.companyName === companyName) {
    this.finishWork(true);
  }
  for (const sleeve of this.sleeves) {
    if (isSleeveCompanyWork(sleeve.currentWork) && sleeve.currentWork.companyName === companyName) {
      sleeve.stopWork();
      dialogBoxCreate(`You quit ${companyName} while one of your sleeves was working there. The sleeve is now idle.`);
    }
  }
  delete this.jobs[companyName];
}

/**
 * Method to see if the player has at least one job assigned to them
 * @param this The player instance
 * @returns Whether the user has at least one job
 */
export function hasJob(this: PlayerObject): boolean {
  return Boolean(Object.keys(this.jobs).length);
}

export function applyForSoftwareJob(this: PlayerObject, sing = false): boolean {
  return this.applyForJob(CompanyPositions[posNames.SoftwareCompanyPositions[0]], sing);
}

export function applyForSoftwareConsultantJob(this: PlayerObject, sing = false): boolean {
  return this.applyForJob(CompanyPositions[posNames.SoftwareConsultantCompanyPositions[0]], sing);
}

export function applyForItJob(this: PlayerObject, sing = false): boolean {
  return this.applyForJob(CompanyPositions[posNames.ITCompanyPositions[0]], sing);
}

export function applyForSecurityEngineerJob(this: PlayerObject, sing = false): boolean {
  const company = Companies[this.location]; //Company being applied to
  if (!company) return false;
  if (this.isQualified(company, CompanyPositions[posNames.SecurityEngineerCompanyPositions[0]])) {
    return this.applyForJob(CompanyPositions[posNames.SecurityEngineerCompanyPositions[0]], sing);
  } else {
    if (!sing) {
      dialogBoxCreate("Unfortunately, you do not qualify for this position");
    }
    return false;
  }
}

export function applyForNetworkEngineerJob(this: PlayerObject, sing = false): boolean {
  const company = Companies[this.location]; //Company being applied to
  if (!company) return false;
  if (this.isQualified(company, CompanyPositions[posNames.NetworkEngineerCompanyPositions[0]])) {
    const pos = CompanyPositions[posNames.NetworkEngineerCompanyPositions[0]];
    return this.applyForJob(pos, sing);
  } else {
    if (!sing) {
      dialogBoxCreate("Unfortunately, you do not qualify for this position");
    }
    return false;
  }
}

export function applyForBusinessJob(this: PlayerObject, sing = false): boolean {
  return this.applyForJob(CompanyPositions[posNames.BusinessCompanyPositions[0]], sing);
}

export function applyForBusinessConsultantJob(this: PlayerObject, sing = false): boolean {
  return this.applyForJob(CompanyPositions[posNames.BusinessConsultantCompanyPositions[0]], sing);
}

export function applyForSecurityJob(this: PlayerObject, sing = false): boolean {
  // TODO Police Jobs
  // Indexing starts at 2 because 0 is for police officer
  return this.applyForJob(CompanyPositions[posNames.SecurityCompanyPositions[2]], sing);
}

export function applyForAgentJob(this: PlayerObject, sing = false): boolean {
  const company = Companies[this.location]; //Company being applied to
  if (!company) return false;
  if (this.isQualified(company, CompanyPositions[posNames.AgentCompanyPositions[0]])) {
    const pos = CompanyPositions[posNames.AgentCompanyPositions[0]];
    return this.applyForJob(pos, sing);
  } else {
    if (!sing) {
      dialogBoxCreate("Unfortunately, you do not qualify for this position");
    }
    return false;
  }
}

export function applyForEmployeeJob(this: PlayerObject, sing = false): boolean {
  const company = Companies[this.location]; //Company being applied to
  if (!company) return false;
  const position = posNames.MiscCompanyPositions[1];
  // Check if this company has the position
  if (!company.hasPosition(position)) {
    return false;
  }
  if (this.isQualified(company, CompanyPositions[position])) {
    this.jobs[company.name] = position;

    if (!sing) {
      dialogBoxCreate("Congratulations, you are now employed at " + this.location);
    }

    return true;
  } else {
    if (!sing) {
      dialogBoxCreate("Unfortunately, you do not qualify for this position");
    }

    return false;
  }
}

export function applyForPartTimeEmployeeJob(this: PlayerObject, sing = false): boolean {
  const company = Companies[this.location]; //Company being applied to
  if (!company) return false;
  const position = posNames.PartTimeCompanyPositions[1];
  // Check if this company has the position
  if (!company.hasPosition(position)) {
    return false;
  }
  if (this.isQualified(company, CompanyPositions[position])) {
    this.jobs[company.name] = position;
    if (!sing) {
      dialogBoxCreate("Congratulations, you are now employed part-time at " + this.location);
    }

    return true;
  } else {
    if (!sing) {
      dialogBoxCreate("Unfortunately, you do not qualify for this position");
    }

    return false;
  }
}

export function applyForWaiterJob(this: PlayerObject, sing = false): boolean {
  const company = Companies[this.location]; //Company being applied to
  if (!company) return false;
  const position = posNames.MiscCompanyPositions[0];
  // Check if this company has the position
  if (!company.hasPosition(position)) {
    return false;
  }
  if (this.isQualified(company, CompanyPositions[position])) {
    this.jobs[company.name] = position;
    if (!sing) {
      dialogBoxCreate("Congratulations, you are now employed as a waiter at " + this.location);
    }
    return true;
  } else {
    if (!sing) {
      dialogBoxCreate("Unfortunately, you do not qualify for this position");
    }
    return false;
  }
}

export function applyForPartTimeWaiterJob(this: PlayerObject, sing = false): boolean {
  const company = Companies[this.location]; //Company being applied to
  if (!company) return false;
  const position = posNames.PartTimeCompanyPositions[0];
  // Check if this company has the position
  if (!company.hasPosition(position)) {
    return false;
  }
  if (this.isQualified(company, CompanyPositions[position])) {
    this.jobs[company.name] = position;
    if (!sing) {
      dialogBoxCreate("Congratulations, you are now employed as a part-time waiter at " + this.location);
    }
    return true;
  } else {
    if (!sing) {
      dialogBoxCreate("Unfortunately, you do not qualify for this position");
    }
    return false;
  }
}

//Checks if the Player is qualified for a certain position
export function isQualified(this: PlayerObject, company: Company, position: CompanyPosition): boolean {
  const offset = company.jobStatReqOffset;
  const reqHacking = position.requiredHacking > 0 ? position.requiredHacking + offset : 0;
  const reqStrength = position.requiredStrength > 0 ? position.requiredStrength + offset : 0;
  const reqDefense = position.requiredDefense > 0 ? position.requiredDefense + offset : 0;
  const reqDexterity = position.requiredDexterity > 0 ? position.requiredDexterity + offset : 0;
  const reqAgility = position.requiredDexterity > 0 ? position.requiredDexterity + offset : 0;
  const reqCharisma = position.requiredCharisma > 0 ? position.requiredCharisma + offset : 0;

  return (
    this.skills.hacking >= reqHacking &&
    this.skills.strength >= reqStrength &&
    this.skills.defense >= reqDefense &&
    this.skills.dexterity >= reqDexterity &&
    this.skills.agility >= reqAgility &&
    this.skills.charisma >= reqCharisma &&
    company.playerReputation >= position.requiredReputation
  );
}

/********** Reapplying Augmentations and Source File ***********/
export function reapplyAllAugmentations(this: PlayerObject, resetMultipliers = true): void {
  if (resetMultipliers) {
    this.resetMultipliers();
  }

  for (let i = 0; i < this.augmentations.length; ++i) {
    //Compatibility with new version
    if (this.augmentations[i].name === "HacknetNode NIC Architecture Neural-Upload") {
      this.augmentations[i].name = "Hacknet Node NIC Architecture Neural-Upload";
    }

    const playerAug = this.augmentations[i];
    const augName = playerAug.name;

    if (augName == AugmentationNames.NeuroFluxGovernor) {
      for (let j = 0; j < playerAug.level; ++j) {
        applyAugmentation(this.augmentations[i], true);
      }
      continue;
    }
    applyAugmentation(this.augmentations[i], true);
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

/*************** Check for Faction Invitations *************/
//This function sets the requirements to join a Faction. It checks whether the Player meets
//those requirements and will return an array of all factions that the Player should
//receive an invitation to
export function checkForFactionInvitations(this: PlayerObject): Faction[] {
  const invitedFactions: Faction[] = []; //Array which will hold all Factions the player should be invited to

  const numAugmentations = this.augmentations.length;

  const { hacking, strength, defense, dexterity, agility } = this.skills;
  const [allCompanies, allPositions] = Object.entries(this.jobs);

  // Given a company name, safely returns the reputation (returns 0 if invalid company is specified)
  function getCompanyRep(companyName: LocationName): number {
    const company = Companies[companyName];
    if (!company) return 0;
    return company.playerReputation;
  }

  /** Checks if player meets rep and employment requirements for joining a megacorp faction */
  function checkMegacorpRequirements(companyName: LocationName): boolean {
    const serverMeta = serverMetadata.find((s) => s.specialName === companyName);
    const server = GetServer(serverMeta ? serverMeta.hostname : "");
    const bonus = (server as Server).backdoorInstalled ? -100e3 : 0;
    return (
      allCompanies.includes(companyName) && getCompanyRep(companyName) > CONSTANTS.CorpFactionRepRequirement + bonus
    );
  }

  const nodes = this.hacknetNodes;
  /** Checks netburner requirements. Due to structure this needed to be a separate function. */
  function checkNetburnerRequirements(): boolean {
    if (hacking < 80) return false;
    let ram = 0;
    let cores = 0;
    let levels = 0;
    for (const nodeOrName of nodes) {
      if (typeof nodeOrName === "string") {
        const hacknet = GetServer(nodeOrName);
        if (!hacknet || !(hacknet instanceof HacknetServer)) {
          throw new Error("player hacknet server was not HacknetServer");
        }
        ram += hacknet.maxRam;
        cores += hacknet.cores;
        levels += hacknet.level;
        continue;
      }
      levels += nodeOrName.level;
      ram += nodeOrName.ram;
      cores += nodeOrName.cores;
    }
    return ram >= 8 && cores >= 4 && levels >= 100;
  }

  // Check eligibility for hacking faction invites
  const hackFactions: { factionName: FactionName; serverName: string }[] = [
    { factionName: FactionName.CyberSec, serverName: SpecialServers.CyberSecServer },
    { factionName: FactionName.NiteSec, serverName: SpecialServers.NiteSecServer },
    { factionName: FactionName.TheBlackHand, serverName: SpecialServers.TheBlackHandServer },
    { factionName: FactionName.BitRunners, serverName: SpecialServers.BitRunnersServer },
  ];
  hackFactions.forEach(({ factionName, serverName }) => {
    const faction = Factions[factionName];
    const server = GetServer(serverName);
    if (server === null) {
      return console.error(`Could not find server ${serverName} for faction ${factionName}`);
    }
    if (server.backdoorInstalled && !faction.isBanned && !faction.isMember && !faction.alreadyInvited) {
      invitedFactions.push(faction);
    }
  });

  // Check eligibility for city factions
  const cityFactions: { factionName: FactionName; cityName: CityName; moneyReq: number }[] = [
    { factionName: FactionName.Chongqing, cityName: CityName.Chongqing, moneyReq: 20e6 },
    { factionName: FactionName.Sector12, cityName: CityName.Sector12, moneyReq: 15e6 },
    { factionName: FactionName.NewTokyo, cityName: CityName.NewTokyo, moneyReq: 20e6 },
    { factionName: FactionName.Aevum, cityName: CityName.Aevum, moneyReq: 40e6 },
    { factionName: FactionName.Ishima, cityName: CityName.Ishima, moneyReq: 30e6 },
    { factionName: FactionName.Volhaven, cityName: CityName.Volhaven, moneyReq: 50e6 },
  ];
  cityFactions.forEach(({ factionName, cityName, moneyReq }) => {
    const faction = Factions[factionName];
    if (
      !faction.isBanned &&
      !faction.isMember &&
      !faction.alreadyInvited &&
      this.city === cityName &&
      this.money > moneyReq
    ) {
      invitedFactions.push(faction);
    }
  });

  // Check eligibility for megacorp factions that follow standard requirements
  const plainMegacorps: { factionName: FactionName; locationName: LocationName }[] = [
    { factionName: FactionName.ECorp, locationName: LocationName.AevumECorp },
    { factionName: FactionName.MegaCorp, locationName: LocationName.Sector12MegaCorp },
    { factionName: FactionName.BachmanAssociates, locationName: LocationName.AevumBachmanAndAssociates },
    { factionName: FactionName.BladeIndustries, locationName: LocationName.Sector12BladeIndustries },
    { factionName: FactionName.NWO, locationName: LocationName.VolhavenNWO },
    { factionName: FactionName.ClarkeIncorporated, locationName: LocationName.AevumClarkeIncorporated },
    { factionName: FactionName.OmniTekIncorporated, locationName: LocationName.VolhavenOmniTekIncorporated },
    { factionName: FactionName.FourSigma, locationName: LocationName.Sector12FourSigma },
    { factionName: FactionName.KuaiGongInternational, locationName: LocationName.ChongqingKuaiGongInternational },
  ];
  plainMegacorps.forEach((megacorp) => {
    const faction = Factions[megacorp.factionName];
    if (
      !faction.isBanned &&
      !faction.isMember &&
      !faction.alreadyInvited &&
      checkMegacorpRequirements(megacorp.locationName)
    ) {
      invitedFactions.push(faction);
    }
  });

  // Factions with unique requirements
  const otherFactions: { factionName: FactionName; qualifies?: boolean }[] = [
    {
      factionName: FactionName.Illuminati,
      qualifies:
        numAugmentations >= 30 &&
        this.money >= 150e9 &&
        hacking >= 1500 &&
        strength >= 1200 &&
        defense >= 1200 &&
        dexterity >= 1200 &&
        agility >= 1200,
    },
    {
      factionName: FactionName.Daedalus,
      qualifies:
        numAugmentations >= BitNodeMultipliers.DaedalusAugsRequirement &&
        this.money >= 100e9 &&
        (hacking >= 2500 || (strength >= 1500 && defense >= 1500 && dexterity >= 1500 && agility >= 1500)),
    },
    {
      factionName: FactionName.TheCovenant,
      qualifies:
        numAugmentations >= 20 &&
        this.money >= 75e9 &&
        hacking >= 850 &&
        strength >= 850 &&
        defense >= 850 &&
        dexterity >= 850 &&
        agility >= 850,
    },
    {
      factionName: FactionName.FulcrumSecretTechnologies,
      qualifies:
        GetServer(SpecialServers.FulcrumSecretTechnologies)?.backdoorInstalled &&
        checkMegacorpRequirements(LocationName.AevumFulcrumTechnologies),
    },
    {
      factionName: FactionName.SpeakersForTheDead,
      qualifies:
        hacking >= 100 &&
        strength >= 300 &&
        defense >= 300 &&
        dexterity >= 300 &&
        agility >= 300 &&
        this.numPeopleKilled >= 30 &&
        this.karma <= -45 &&
        !(LocationName.Sector12CIA in this.jobs) &&
        !(LocationName.Sector12NSA in this.jobs),
    },
    {
      factionName: FactionName.TheDarkArmy,
      qualifies:
        hacking >= 300 &&
        strength >= 300 &&
        defense >= 300 &&
        dexterity >= 300 &&
        agility >= 300 &&
        this.city === CityName.Chongqing &&
        this.numPeopleKilled >= 5 &&
        this.karma <= -45 &&
        !(LocationName.Sector12CIA in this.jobs) &&
        !(LocationName.Sector12NSA in this.jobs),
    },
    {
      factionName: FactionName.TheSyndicate,
      qualifies:
        hacking >= 200 &&
        strength >= 200 &&
        defense >= 200 &&
        dexterity >= 200 &&
        agility >= 200 &&
        (this.city === CityName.Aevum || this.city === CityName.Sector12) &&
        this.money >= 10000000 &&
        this.karma <= -90 &&
        !(LocationName.Sector12CIA in this.jobs) &&
        !(LocationName.Sector12NSA in this.jobs),
    },
    {
      factionName: FactionName.Silhouette,
      qualifies:
        (allPositions.includes("Chief Technology Officer") ||
          allPositions.includes("Chief Financial Officer") ||
          allPositions.includes("Chief Executive Officer")) &&
        this.money >= 15000000 &&
        this.karma <= -22,
    },
    {
      factionName: FactionName.Tetrads,
      qualifies:
        (this.city == CityName.Chongqing || this.city == CityName.NewTokyo || this.city == CityName.Ishima) &&
        strength >= 75 &&
        defense >= 75 &&
        dexterity >= 75 &&
        agility >= 75 &&
        this.karma <= -18,
    },
    {
      factionName: FactionName.SlumSnakes,
      qualifies:
        strength >= 30 &&
        defense >= 30 &&
        dexterity >= 30 &&
        agility >= 30 &&
        this.karma <= -9 &&
        this.money >= 1000000,
    },
    {
      factionName: FactionName.Netburners,
      qualifies: checkNetburnerRequirements(),
    },
    {
      factionName: FactionName.TianDiHui,
      qualifies:
        this.money >= 1e6 &&
        hacking >= 50 &&
        (this.city == CityName.Chongqing || this.city == CityName.NewTokyo || this.city == CityName.Ishima),
    },
  ];
  otherFactions.forEach(({ factionName, qualifies }) => {
    if (!qualifies) return;
    const faction = Factions[factionName];
    if (!faction.isBanned && !faction.isMember && !faction.alreadyInvited) invitedFactions.push(faction);
  });

  return invitedFactions;
}

/************* BitNodes **************/
export function setBitNodeNumber(this: PlayerObject, n: number): void {
  this.bitNodeN = n;
}

export function queueAugmentation(this: PlayerObject, name: string): void {
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
  reward: CodingContractReward | null,
  difficulty = 1,
): string {
  if (reward == null || reward.type == null) {
    return `No reward for this contract`;
  }

  /* eslint-disable no-case-declarations */
  switch (reward.type) {
    case CodingContractRewardType.FactionReputation:
      const faction = Factions[reward.name];
      if (!faction) {
        // If no/invalid faction was designated, just give rewards to all factions
        return this.gainCodingContractReward(
          { name: "", type: CodingContractRewardType.FactionReputationAll },
          difficulty,
        );
      }
      const repGain = CONSTANTS.CodingContractBaseFactionRepGain * difficulty;
      faction.playerReputation += repGain;
      return `Gained ${repGain} faction reputation for ${reward.name}`;
    case CodingContractRewardType.FactionReputationAll:
      const totalGain = CONSTANTS.CodingContractBaseFactionRepGain * difficulty;

      // Ignore Bladeburners and other special factions for this calculation
      const specialFactions = [FactionName.Bladeburners, FactionName.ShadowsOfAnarchy];
      const factions = this.factions.filter((f) => !specialFactions.includes(f));

      // If the player was only part of the special factions, we'll just give money
      if (factions.length == 0) {
        reward.type = CodingContractRewardType.Money;
        return this.gainCodingContractReward(reward, difficulty);
      }

      const gainPerFaction = Math.floor(totalGain / factions.length);
      for (const facName of factions) {
        const faction = Factions[facName];
        if (!faction) continue;
        faction.playerReputation += gainPerFaction;
      }
      return `Gained ${gainPerFaction} reputation for each of the following factions: ${factions.join(", ")}`;
    case CodingContractRewardType.CompanyReputation: {
      if (!(reward.name in Companies)) {
        //If no/invalid company was designated, just give rewards to all factions
        return this.gainCodingContractReward({ name: "", type: CodingContractRewardType.FactionReputationAll });
      }
      const repGain = CONSTANTS.CodingContractBaseCompanyRepGain * difficulty;
      (Companies[reward.name] as Company).playerReputation += repGain;
      return `Gained ${repGain} company reputation for ${reward.name}`;
    }
    case CodingContractRewardType.Money:
    default: {
      const moneyGain = CONSTANTS.CodingContractBaseMoneyGain * difficulty * BitNodeMultipliers.CodingContractMoney;
      this.gainMoney(moneyGain, "codingcontract");
      return `Gained ${formatMoney(moneyGain)}`;
    }
  }
  /* eslint-enable no-case-declarations */
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
  if (!this.hasAugmentation(AugmentationNames.NeuroreceptorManager, true)) {
    focus = this.focus ? 1 : CONSTANTS.BaseFocusBonus;
  }
  return focus;
}
