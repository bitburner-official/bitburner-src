import type { Player as IPlayer } from "@nsdefs";
import type { PlayerAchievement } from "../../Achievements/Achievements";
import type { Bladeburner } from "../../Bladeburner/Bladeburner";
import type { Corporation } from "../../Corporation/Corporation";
import type { Exploit } from "../../Exploits/Exploit";
import type { Gang } from "../../Gang/Gang";
import type { HacknetNode } from "../../Hacknet/HacknetNode";
import type { Sleeve } from "../Sleeve/Sleeve";
import type { Work } from "../../Work/Work";

import * as augmentationMethods from "./PlayerObjectAugmentationMethods";
import * as bladeburnerMethods from "./PlayerObjectBladeburnerMethods";
import * as corporationMethods from "./PlayerObjectCorporationMethods";
import * as gangMethods from "./PlayerObjectGangMethods";
import * as generalMethods from "./PlayerObjectGeneralMethods";
import * as serverMethods from "./PlayerObjectServerMethods";
import * as workMethods from "./PlayerObjectWorkMethods";

import { setPlayer } from "@player";
import { CompanyName, FactionName, JobName, LocationName } from "@enums";
import { HashManager } from "../../Hacknet/HashManager";
import { MoneySourceTracker } from "../../utils/MoneySourceTracker";
import { constructorsForReviver, Generic_toJSON, Generic_fromJSON, IReviverValue } from "../../utils/JSONReviver";
import { JSONMap, JSONSet } from "../../Types/Jsonable";
import { cyrb53 } from "../../utils/StringHelperFunctions";
import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { CONSTANTS } from "../../Constants";
import { Person } from "../Person";
import { isMember } from "../../utils/EnumHelper";
import { PartialRecord } from "../../Types/Record";

export class PlayerObject extends Person implements IPlayer {
  // Player-specific properties
  bitNodeN = 1; //current bitnode
  corporation: Corporation | null = null;
  gang: Gang | null = null;
  bladeburner: Bladeburner | null = null;
  currentServer = "";
  factions: FactionName[] = [];
  factionInvitations: FactionName[] = [];
  factionRumors = new JSONSet<FactionName>();
  hacknetNodes: (HacknetNode | string)[] = []; // HacknetNode object or hostname of Hacknet Server
  has4SData = false;
  has4SDataTixApi = false;
  hashManager = new HashManager();
  hasTixApiAccess = false;
  hasWseAccount = false;
  jobs: PartialRecord<CompanyName, JobName> = {};
  karma = 0;
  numPeopleKilled = 0;
  location = LocationName.TravelAgency;
  money = 1000 + CONSTANTS.Donations;
  moneySourceA = new MoneySourceTracker();
  moneySourceB = new MoneySourceTracker();
  playtimeSinceLastAug = 0;
  playtimeSinceLastBitnode = 0;
  lastAugReset = -1;
  lastNodeReset = -1;
  purchasedServers: string[] = [];
  scriptProdSinceLastAug = 0;
  sleeves: Sleeve[] = [];
  sleevesFromCovenant = 0;
  sourceFiles = new JSONMap<number, number>();
  exploits: Exploit[] = [];
  achievements: PlayerAchievement[] = [];
  terminalCommandHistory: string[] = [];
  identifier: string;
  lastUpdate = 0;
  lastSave = 0;
  totalPlaytime = 0;

  currentWork: Work | null = null;
  focus = false;

  entropy = 0;

  // Player-specific methods
  init = generalMethods.init;
  startWork = workMethods.startWork;
  processWork = workMethods.processWork;
  finishWork = workMethods.finishWork;
  applyForJob = generalMethods.applyForJob;
  canAccessBladeburner = bladeburnerMethods.canAccessBladeburner;
  canAccessCorporation = corporationMethods.canAccessCorporation;
  canAccessGang = gangMethods.canAccessGang;
  canAccessGrafting = generalMethods.canAccessGrafting;
  canAfford = generalMethods.canAfford;
  gainMoney = generalMethods.gainMoney;
  getCurrentServer = serverMethods.getCurrentServer;
  getGangFaction = gangMethods.getGangFaction;
  getGangName = gangMethods.getGangName;
  getHomeComputer = serverMethods.getHomeComputer;
  getNextCompanyPosition = generalMethods.getNextCompanyPosition;
  getUpgradeHomeRamCost = serverMethods.getUpgradeHomeRamCost;
  getUpgradeHomeCoresCost = serverMethods.getUpgradeHomeCoresCost;
  gotoLocation = generalMethods.gotoLocation;
  hasGangWith = gangMethods.hasGangWith;
  hasTorRouter = serverMethods.hasTorRouter;
  hasProgram = generalMethods.hasProgram;
  inGang = gangMethods.inGang;
  isAwareOfGang = gangMethods.isAwareOfGang;
  isQualified = generalMethods.isQualified;
  loseMoney = generalMethods.loseMoney;
  reapplyAllAugmentations = generalMethods.reapplyAllAugmentations;
  reapplyAllSourceFiles = generalMethods.reapplyAllSourceFiles;
  recordMoneySource = generalMethods.recordMoneySource;
  setMoney = generalMethods.setMoney;
  startBladeburner = bladeburnerMethods.startBladeburner;
  startCorporation = corporationMethods.startCorporation;
  startFocusing = generalMethods.startFocusing;
  startGang = gangMethods.startGang;
  takeDamage = generalMethods.takeDamage;
  travel = generalMethods.travel;
  giveExploit = generalMethods.giveExploit;
  giveAchievement = generalMethods.giveAchievement;
  getCasinoWinnings = generalMethods.getCasinoWinnings;
  quitJob = generalMethods.quitJob;
  hasJob = generalMethods.hasJob;
  createHacknetServer = serverMethods.createHacknetServer;
  queueAugmentation = generalMethods.queueAugmentation;
  receiveInvite = generalMethods.receiveInvite;
  receiveRumor = generalMethods.receiveRumor;
  gainCodingContractReward = generalMethods.gainCodingContractReward;
  stopFocusing = generalMethods.stopFocusing;
  prestigeAugmentation = generalMethods.prestigeAugmentation;
  prestigeSourceFile = generalMethods.prestigeSourceFile;
  calculateSkillProgress = generalMethods.calculateSkillProgress;
  hospitalize = generalMethods.hospitalize;
  checkForFactionInvitations = generalMethods.checkForFactionInvitations;
  setBitNodeNumber = generalMethods.setBitNodeNumber;
  canAccessCotMG = generalMethods.canAccessCotMG;
  sourceFileLvl = generalMethods.sourceFileLvl;
  applyEntropy = augmentationMethods.applyEntropy;
  focusPenalty = generalMethods.focusPenalty;

  constructor() {
    super();
    // Let's get a hash of some semi-random stuff so we have something unique.
    this.identifier = cyrb53(
      "I-" +
        new Date().getTime() +
        navigator.userAgent +
        window.innerWidth +
        window.innerHeight +
        getRandomIntInclusive(100, 999),
    );
    this.lastAugReset = this.lastNodeReset = Date.now();
  }

  whoAmI(): string {
    return "Player";
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("PlayerObject", this);
  }

  /** Initializes a PlayerObject object from a JSON save state. */
  static fromJSON(value: IReviverValue): PlayerObject {
    const player = Generic_fromJSON(PlayerObject, value.data);
    // Any statistics that could be infinite would be serialized as null (JSON.stringify(Infinity) is "null")
    player.hp = { current: player.hp?.current ?? 10, max: player.hp?.max ?? 10 };
    player.money ??= 0;
    // Just remove from the save file any augs that have invalid name
    player.augmentations = player.augmentations.filter((ownedAug) => isMember("AugmentationName", ownedAug.name));
    player.queuedAugmentations = player.queuedAugmentations.filter((ownedAug) =>
      isMember("AugmentationName", ownedAug.name),
    );
    player.updateSkillLevels();
    // Conversion code for Player.sourceFiles is here instead of normal save conversion area because it needs
    // to happen earlier for use in the savegame comparison tool.
    if (Array.isArray(player.sourceFiles)) {
      // Expect pre-2.3 sourcefile format here.
      type OldSourceFiles = { n: number; lvl: number }[];
      player.sourceFiles = new JSONMap((player.sourceFiles as OldSourceFiles).map(({ n, lvl }) => [n, lvl]));
    }
    // Remove any invalid jobs
    for (const [loadedCompanyName, loadedJobName] of Object.entries(player.jobs)) {
      if (!isMember("CompanyName", loadedCompanyName) || !isMember("JobName", loadedJobName)) {
        delete player.jobs[loadedCompanyName as CompanyName];
      }
    }
    return player;
  }
}

setPlayer(new PlayerObject());

constructorsForReviver.PlayerObject = PlayerObject;
