import {
  AugmentationName,
  BladeSkillName,
  CityName,
  CompletedProgramName,
  CorpUnlockName,
  FactionName,
  IndustryType,
} from "@enums";
import { Skills } from "../Bladeburner/data/Skills";
import { CONSTANTS } from "../Constants";
import { Exploit } from "../Exploits/Exploit";
import { Factions } from "../Faction/Factions";
import { AllGangs } from "../Gang/AllGangs";
import { GangConstants } from "../Gang/data/Constants";
import { HacknetNodeConstants, HacknetServerConstants } from "../Hacknet/data/Constants";
import { hasHacknetServers } from "../Hacknet/HacknetHelpers";
import { HacknetNode } from "../Hacknet/HacknetNode";
import { HacknetServer } from "../Hacknet/HacknetServer";
import { Player } from "@player";
import { GetAllServers, GetServer } from "../Server/AllServers";
import { Server } from "../Server/Server";
import { Router } from "../ui/GameRoot";
import { Page } from "../ui/Router";
import data from "./AchievementData.json";
import { isClassWork } from "../Work/ClassWork";
import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { workerScripts } from "../Netscript/WorkerScripts";

import { getRecordValues } from "../Types/Record";
import { ServerConstants } from "../Server/data/Constants";
import { isBitNodeFinished } from "../BitNode/BitNodeUtils";

// Unable to correctly cast the JSON data into AchievementDataJson type otherwise...
const achievementData = (<AchievementDataJson>(<unknown>data)).achievements;

export interface Achievement {
  ID: string;
  Icon?: string;
  Name?: string;
  Description?: string;
  Secret?: boolean;
  Condition: () => boolean;
  Visible?: () => boolean;
  AdditionalUnlock?: string[]; // IDs of achievements that should be awarded when awarding this one
}

export interface PlayerAchievement {
  ID: string;
  unlockedOn?: number;
}

export interface AchievementDataJson {
  achievements: Record<string, AchievementData>;
}

export interface AchievementData {
  ID: string;
  Name: string;
  Description: string;
}

function canAccessBitNodeFeature(bitNode: number): boolean {
  return Player.bitNodeN === bitNode || Player.sourceFileLvl(bitNode) > 0;
}

function knowsAboutBitverse(): boolean {
  return Player.sourceFiles.size > 0;
}

function sfAchievements(): Record<string, Achievement> {
  const achs: Record<string, Achievement> = {};
  for (let i = 1; i <= 12; i++) {
    const ID = `SF${i}.1`;
    achs[ID] = {
      ...achievementData[ID],
      Icon: ID,
      Visible: knowsAboutBitverse,
      Condition: () => Player.sourceFileLvl(i) >= 1,
    };
  }
  return achs;
}

export const achievements: Record<string, Achievement> = {
  [FactionName.CyberSec.toUpperCase()]: {
    ...achievementData[FactionName.CyberSec.toUpperCase()],
    Icon: "CSEC",
    Condition: () => Player.factions.includes(FactionName.CyberSec),
  },
  [FactionName.NiteSec.toUpperCase()]: {
    ...achievementData[FactionName.NiteSec.toUpperCase()],
    Icon: FactionName.NiteSec,
    Condition: () => Player.factions.includes(FactionName.NiteSec),
  },
  THE_BLACK_HAND: {
    ...achievementData.THE_BLACK_HAND,
    Icon: "TBH",
    Condition: () => Player.factions.includes(FactionName.TheBlackHand),
  },
  [FactionName.BitRunners.toUpperCase()]: {
    ...achievementData[FactionName.BitRunners.toUpperCase()],
    Icon: FactionName.BitRunners.toLowerCase(),
    Condition: () => Player.factions.includes(FactionName.BitRunners),
  },
  [FactionName.Daedalus.toUpperCase()]: {
    ...achievementData[FactionName.Daedalus.toUpperCase()],
    Icon: FactionName.Daedalus.toLowerCase(),
    Condition: () => Player.factions.includes(FactionName.Daedalus),
  },
  THE_COVENANT: {
    ...achievementData.THE_COVENANT,
    Icon: FactionName.TheCovenant.toLowerCase().replace(/ /g, ""),
    Condition: () => Player.factions.includes(FactionName.TheCovenant),
  },
  [FactionName.Illuminati.toUpperCase()]: {
    ...achievementData[FactionName.Illuminati.toUpperCase()],
    Icon: FactionName.Illuminati.toLowerCase(),
    Condition: () => Player.factions.includes(FactionName.Illuminati),
  },
  "BRUTESSH.EXE": {
    ...achievementData["BRUTESSH.EXE"],
    Icon: "p0",
    Condition: () => Player.getHomeComputer().programs.includes(CompletedProgramName.bruteSsh),
  },
  "FTPCRACK.EXE": {
    ...achievementData["FTPCRACK.EXE"],
    Icon: "p1",
    Condition: () => Player.getHomeComputer().programs.includes(CompletedProgramName.ftpCrack),
  },
  //-----------------------------------------------------
  "RELAYSMTP.EXE": {
    ...achievementData["RELAYSMTP.EXE"],
    Icon: "p2",
    Condition: () => Player.getHomeComputer().programs.includes(CompletedProgramName.relaySmtp),
  },
  "HTTPWORM.EXE": {
    ...achievementData["HTTPWORM.EXE"],
    Icon: "p3",
    Condition: () => Player.getHomeComputer().programs.includes(CompletedProgramName.httpWorm),
  },
  "SQLINJECT.EXE": {
    ...achievementData["SQLINJECT.EXE"],
    Icon: "p4",
    Condition: () => Player.getHomeComputer().programs.includes(CompletedProgramName.sqlInject),
  },
  "FORMULAS.EXE": {
    ...achievementData["FORMULAS.EXE"],
    Icon: "formulas",
    Condition: () => Player.getHomeComputer().programs.includes(CompletedProgramName.formulas),
  },
  ...sfAchievements(),
  MONEY_1Q: {
    ...achievementData.MONEY_1Q,
    Icon: "$1Q",
    Condition: () => Player.money >= 1e18,
  },
  MONEY_M1B: {
    ...achievementData.MONEY_M1B,
    Icon: "-1b",
    Secret: true,
    Condition: () => Player.money <= -1e9,
  },
  INSTALL_1: {
    ...achievementData.INSTALL_1,
    Icon: "install",
    Condition: () => Player.augmentations.length >= 1,
  },
  INSTALL_100: {
    ...achievementData.INSTALL_100,
    Icon: "install_100",
    Condition: () => Player.augmentations.length >= 100,
  },
  QUEUE_40: {
    ...achievementData.QUEUE_40,
    Icon: "queue40",
    Condition: () => Player.queuedAugmentations.length >= 40,
  },
  HACKING_100000: {
    ...achievementData.HACKING_100000,
    Icon: "hack100000",
    Condition: () => Player.skills.hacking >= 100000,
  },
  COMBAT_3000: {
    ...achievementData.COMBAT_3000,
    Icon: "combat3000",
    Condition: () =>
      Player.skills.strength >= 3000 &&
      Player.skills.defense >= 3000 &&
      Player.skills.dexterity >= 3000 &&
      Player.skills.agility >= 3000,
  },
  NEUROFLUX_255: {
    ...achievementData.NEUROFLUX_255,
    Icon: "nf255",
    Condition: () => Player.augmentations.some((a) => a.name === AugmentationName.NeuroFluxGovernor && a.level >= 255),
  },
  NS2: {
    ...achievementData.NS2,
    Icon: "ns2",
    Condition: () => [...Player.getHomeComputer().scripts.values()].some((s) => s.filename.endsWith(".js")),
  },
  FROZE: {
    ...achievementData.FROZE,
    Icon: "forze",
    Condition: () => location.href.includes("noScripts"),
  },
  RUNNING_SCRIPTS_1000: {
    ...achievementData.RUNNING_SCRIPTS_1000,
    Icon: "run1000",
    Condition: (): boolean => workerScripts.size >= 1000,
  },
  DRAIN_SERVER: {
    ...achievementData.DRAIN_SERVER,
    Icon: "drain",
    Condition: (): boolean => {
      for (const s of GetAllServers()) {
        if (s instanceof Server) {
          if (s.moneyMax > 0 && s.moneyAvailable === 0) return true;
        }
      }
      return false;
    },
  },
  MAX_RAM: {
    ...achievementData.MAX_RAM,
    Icon: "maxram",
    Condition: () => Player.getHomeComputer().maxRam === ServerConstants.HomeComputerMaxRam,
  },
  MAX_CORES: {
    ...achievementData.MAX_CORES,
    Icon: "maxcores",
    Condition: () => Player.getHomeComputer().cpuCores === 8,
  },
  SCRIPTS_30: {
    ...achievementData.SCRIPTS_30,
    Icon: "folders",
    Condition: () => Player.getHomeComputer().scripts.size >= 30,
  },
  KARMA_1000000: {
    ...achievementData.KARMA_1000000,
    Icon: "karma",
    Secret: true,
    Condition: () => Player.karma <= -1e6,
  },
  STOCK_1q: {
    ...achievementData.STOCK_1q,
    Icon: "$1Q",
    Condition: () => Player.moneySourceB.stock >= 1e15,
  },
  DISCOUNT: {
    ...achievementData.DISCOUNT,
    Icon: "discount",
    Condition: (): boolean => {
      const p = GetServer("powerhouse-fitness");
      if (!(p instanceof Server)) return false;
      return p.backdoorInstalled;
    },
  },
  SCRIPT_32GB: {
    ...achievementData.SCRIPT_32GB,
    Icon: "bigcost",
    Condition: () => [...Player.getHomeComputer().scripts.values()].some((s) => (s.ramUsage ?? 0) >= 32),
  },
  FIRST_HACKNET_NODE: {
    ...achievementData.FIRST_HACKNET_NODE,
    Icon: "node",
    Condition: () => !hasHacknetServers() && Player.hacknetNodes.length > 0,
  },
  "30_HACKNET_NODE": {
    ...achievementData["30_HACKNET_NODE"],
    Icon: "hacknet-all",
    Condition: () => !hasHacknetServers() && Player.hacknetNodes.length >= 30,
  },
  MAX_HACKNET_NODE: {
    ...achievementData.MAX_HACKNET_NODE,
    Icon: "hacknet-max",
    Condition: (): boolean => {
      if (hasHacknetServers()) return false;
      for (const h of Player.hacknetNodes) {
        if (!(h instanceof HacknetNode)) return false;
        if (
          h.ram === HacknetNodeConstants.MaxRam &&
          h.cores === HacknetNodeConstants.MaxCores &&
          h.level === HacknetNodeConstants.MaxLevel
        )
          return true;
      }
      return false;
    },
  },
  HACKNET_NODE_10M: {
    ...achievementData.HACKNET_NODE_10M,
    Icon: "hacknet-10m",
    Condition: () => !hasHacknetServers() && Player.moneySourceB.hacknet >= 10e6,
  },
  REPUTATION_10M: {
    ...achievementData.REPUTATION_10M,
    Icon: "reputation",
    Condition: () => Object.values(Factions).some((f) => f.playerReputation >= 10e6),
  },
  DONATION: {
    ...achievementData.DONATION,
    Icon: "donation",
    Condition: () =>
      Object.values(Factions).some(
        (f) => f.favor >= Math.floor(CONSTANTS.BaseFavorToDonate * currentNodeMults.RepToDonateToFaction),
      ),
  },
  TRAVEL: {
    ...achievementData.TRAVEL,
    Icon: "TRAVEL",
    Condition: () => Player.city !== CityName.Sector12,
  },
  WORKOUT: {
    ...achievementData.WORKOUT,
    Icon: "WORKOUT",
    Condition: () => isClassWork(Player.currentWork) && Player.currentWork.isGym(),
  },
  TOR: {
    ...achievementData.TOR,
    Icon: "TOR",
    Condition: () => Player.hasTorRouter(),
  },
  HOSPITALIZED: {
    ...achievementData.HOSPITALIZED,
    Icon: "OUCH",
    Condition: () => Player.moneySourceB.hospitalization !== 0,
  },
  GANG: {
    ...achievementData.GANG,
    Icon: "GANG",
    Visible: () => canAccessBitNodeFeature(2),
    Condition: () => Player.gang !== null,
  },
  FULL_GANG: {
    ...achievementData.FULL_GANG,
    Icon: "GANGMAX",
    Visible: () => canAccessBitNodeFeature(2),
    Condition: () => Player.gang !== null && Player.gang.members.length === GangConstants.MaximumGangMembers,
  },
  GANG_TERRITORY: {
    ...achievementData.GANG_TERRITORY,
    Icon: "GANG100%",
    Visible: () => canAccessBitNodeFeature(2),
    Condition: () => Player.gang !== null && AllGangs[Player.gang.facName].territory >= 0.999,
  },
  GANG_MEMBER_POWER: {
    ...achievementData.GANG_MEMBER_POWER,
    Icon: "GANG10000",
    Visible: () => canAccessBitNodeFeature(2),
    Condition: () =>
      Player.gang !== null &&
      Player.gang.members.some(
        (m) =>
          m.hack >= 10000 || m.str >= 10000 || m.def >= 10000 || m.dex >= 10000 || m.agi >= 10000 || m.cha >= 10000,
      ),
  },
  CORPORATION: {
    ...achievementData.CORPORATION,
    Icon: "CORP",
    Visible: () => canAccessBitNodeFeature(3),
    Condition: () => Player.corporation !== null,
  },
  CORPORATION_BRIBE: {
    ...achievementData.CORPORATION_BRIBE,
    Icon: "CORPLOBBY",
    Visible: () => canAccessBitNodeFeature(3),
    Condition: () => !!Player.corporation && Player.corporation.unlocks.has(CorpUnlockName.GovernmentPartnership),
  },
  CORPORATION_PROD_1000: {
    ...achievementData.CORPORATION_PROD_1000,
    Icon: "CORP1000",
    Visible: () => canAccessBitNodeFeature(3),
    Condition: () => {
      if (!Player.corporation) return false;
      for (const division of Player.corporation.divisions.values()) {
        if (division.productionMult >= 1000) return true;
      }
      return false;
    },
  },
  CORPORATION_EMPLOYEE_3000: {
    ...achievementData.CORPORATION_EMPLOYEE_3000,
    Icon: "CORPCITY",
    Visible: () => canAccessBitNodeFeature(3),
    Condition: (): boolean => {
      if (!Player.corporation) return false;
      for (const division of Player.corporation.divisions.values()) {
        const totalEmployees = getRecordValues(division.offices).reduce((a, b) => a + b.numEmployees, 0);
        if (totalEmployees >= 3000) return true;
      }
      return false;
    },
  },
  CORPORATION_REAL_ESTATE: {
    ...achievementData.CORPORATION_REAL_ESTATE,
    Icon: "CORPRE",
    Name: "Own the land",
    Description: "Expand to the Real Estate division.",
    Visible: () => canAccessBitNodeFeature(3),
    Condition: () => {
      if (!Player.corporation) return false;
      for (const division of Player.corporation.divisions.values()) {
        if (division.type === IndustryType.RealEstate) return true;
      }
      return false;
    },
  },
  INTELLIGENCE_255: {
    ...achievementData.INTELLIGENCE_255,
    Icon: "INT255",
    Visible: () => canAccessBitNodeFeature(5),
    Condition: () => Player.skills.intelligence >= 255,
  },
  BLADEBURNER_DIVISION: {
    ...achievementData.BLADEBURNER_DIVISION,
    Icon: "BLADE",
    Visible: () => canAccessBitNodeFeature(6),
    Condition: () => Player.bladeburner !== null,
  },
  BLADEBURNER_OVERCLOCK: {
    ...achievementData.BLADEBURNER_OVERCLOCK,
    Icon: "BLADEOVERCLOCK",
    Visible: () => canAccessBitNodeFeature(6),
    Condition: () =>
      Player.bladeburner?.getSkillLevel(BladeSkillName.overclock) === Skills[BladeSkillName.overclock].maxLvl,
  },
  BLADEBURNER_UNSPENT_100000: {
    ...achievementData.BLADEBURNER_UNSPENT_100000,
    Icon: "BLADE100K",
    Visible: () => canAccessBitNodeFeature(6),
    Condition: () => Player.bladeburner !== null && Player.bladeburner.skillPoints >= 100000,
  },
  "4S": {
    ...achievementData["4S"],
    Icon: "4S",
    Condition: () => Player.has4SData,
  },
  FIRST_HACKNET_SERVER: {
    ...achievementData.FIRST_HACKNET_SERVER,
    Icon: "HASHNET",
    Visible: () => canAccessBitNodeFeature(9),
    Condition: () => hasHacknetServers() && Player.hacknetNodes.length > 0,
    AdditionalUnlock: [achievementData.FIRST_HACKNET_NODE.ID],
  },
  ALL_HACKNET_SERVER: {
    ...achievementData.ALL_HACKNET_SERVER,
    Icon: "HASHNETALL",
    Visible: () => canAccessBitNodeFeature(9),
    Condition: () => hasHacknetServers() && Player.hacknetNodes.length === HacknetServerConstants.MaxServers,
    AdditionalUnlock: [achievementData["30_HACKNET_NODE"].ID],
  },
  MAX_HACKNET_SERVER: {
    ...achievementData.MAX_HACKNET_SERVER,
    Icon: "HASHNETALL",
    Visible: () => canAccessBitNodeFeature(9),
    Condition: (): boolean => {
      if (!hasHacknetServers()) return false;
      for (const h of Player.hacknetNodes) {
        if (typeof h !== "string") return false;
        const hs = GetServer(h);
        if (!(hs instanceof HacknetServer)) return false;
        if (
          hs.maxRam === HacknetServerConstants.MaxRam &&
          hs.cores === HacknetServerConstants.MaxCores &&
          hs.level === HacknetServerConstants.MaxLevel &&
          hs.cache === HacknetServerConstants.MaxCache
        )
          return true;
      }
      return false;
    },
    AdditionalUnlock: [achievementData.MAX_HACKNET_NODE.ID],
  },
  HACKNET_SERVER_1B: {
    ...achievementData.HACKNET_SERVER_1B,
    Icon: "HASHNETMONEY",
    Visible: () => canAccessBitNodeFeature(9),
    Condition: () => hasHacknetServers() && Player.moneySourceB.hacknet >= 1e9,
    AdditionalUnlock: [achievementData.HACKNET_NODE_10M.ID],
  },
  MAX_CACHE: {
    ...achievementData.MAX_CACHE,
    Icon: "HASHNETCAP",
    Visible: () => canAccessBitNodeFeature(9),
    Condition: () =>
      hasHacknetServers() &&
      Player.hashManager.hashes === Player.hashManager.capacity &&
      Player.hashManager.capacity > 0,
  },
  SLEEVE_8: {
    ...achievementData.SLEEVE_8,
    Icon: "SLEEVE8",
    Visible: () => canAccessBitNodeFeature(10),
    Condition: () => Player.sleeves.length === 8 && Player.sourceFileLvl(10) === 3,
  },
  INDECISIVE: {
    ...achievementData.INDECISIVE,
    Icon: "1H",
    Visible: knowsAboutBitverse,
    Condition: (function () {
      let c = 0;
      setInterval(() => {
        if (Router.page() === Page.BitVerse) {
          c++;
        } else {
          c = 0;
        }
      }, 60 * 1000);
      return () => c > 60;
    })(),
  },
  FAST_BN: {
    ...achievementData.FAST_BN,
    Icon: "2DAYS",
    Visible: knowsAboutBitverse,
    Condition: () => isBitNodeFinished() && Player.playtimeSinceLastBitnode < 1000 * 60 * 60 * 24 * 2,
  },
  CHALLENGE_BN1: {
    ...achievementData.CHALLENGE_BN1,
    Icon: "BN1+",
    Visible: knowsAboutBitverse,
    Condition: () =>
      Player.bitNodeN === 1 &&
      isBitNodeFinished() &&
      Player.getHomeComputer().maxRam <= 128 &&
      Player.getHomeComputer().cpuCores === 1,
  },
  CHALLENGE_BN2: {
    ...achievementData.CHALLENGE_BN2,
    Icon: "BN2+",
    Visible: () => canAccessBitNodeFeature(2),
    Condition: () => Player.bitNodeN === 2 && isBitNodeFinished() && Player.gang === null,
  },
  CHALLENGE_BN3: {
    ...achievementData.CHALLENGE_BN3,
    Icon: "BN3+",
    Visible: () => canAccessBitNodeFeature(3),
    Condition: () => Player.bitNodeN === 3 && isBitNodeFinished() && Player.corporation === null,
  },
  CHALLENGE_BN6: {
    ...achievementData.CHALLENGE_BN6,
    Icon: "BN6+",
    Visible: () => canAccessBitNodeFeature(6),
    Condition: () => Player.bitNodeN === 6 && isBitNodeFinished() && Player.bladeburner === null,
  },
  CHALLENGE_BN7: {
    ...achievementData.CHALLENGE_BN7,
    Icon: "BN7+",
    Visible: () => canAccessBitNodeFeature(7),
    Condition: () => Player.bitNodeN === 7 && isBitNodeFinished() && Player.bladeburner === null,
  },
  CHALLENGE_BN8: {
    ...achievementData.CHALLENGE_BN8,
    Icon: "BN8+",
    Visible: () => canAccessBitNodeFeature(8),
    Condition: () => Player.bitNodeN === 8 && isBitNodeFinished() && !Player.has4SData && !Player.has4SDataTixApi,
  },
  CHALLENGE_BN9: {
    ...achievementData.CHALLENGE_BN9,
    Icon: "BN9+",
    Visible: () => canAccessBitNodeFeature(9),
    Condition: () =>
      Player.bitNodeN === 9 &&
      isBitNodeFinished() &&
      Player.moneySourceB.hacknet === 0 &&
      Player.moneySourceB.hacknet_expenses === 0,
  },
  CHALLENGE_BN10: {
    ...achievementData.CHALLENGE_BN10,
    Icon: "BN10+",
    Visible: () => canAccessBitNodeFeature(10),
    Condition: () =>
      Player.bitNodeN === 10 &&
      isBitNodeFinished() &&
      !Player.sleeves.some(
        (s) =>
          s.augmentations.length > 0 ||
          s.exp.hacking > 0 ||
          s.exp.strength > 0 ||
          s.exp.defense > 0 ||
          s.exp.agility > 0 ||
          s.exp.dexterity > 0 ||
          s.exp.charisma > 0,
      ),
  },
  CHALLENGE_BN12: {
    ...achievementData.CHALLENGE_BN12,
    Icon: "BN12+",
    Visible: () => canAccessBitNodeFeature(12),
    Condition: () => Player.sourceFileLvl(12) >= 50,
  },
  BYPASS: {
    ...achievementData.BYPASS,
    Icon: "SF-1",
    Secret: true,
    Condition: () => Player.exploits.includes(Exploit.Bypass),
  },
  PROTOTYPETAMPERING: {
    ...achievementData.PROTOTYPETAMPERING,
    Icon: "SF-1",
    Secret: true,
    Condition: () => Player.exploits.includes(Exploit.PrototypeTampering),
  },
  UNCLICKABLE: {
    ...achievementData.UNCLICKABLE,
    Icon: "SF-1",
    Secret: true,
    Condition: () => Player.exploits.includes(Exploit.Unclickable),
  },
  UNDOCUMENTEDFUNCTIONCALL: {
    ...achievementData.UNDOCUMENTEDFUNCTIONCALL,
    Icon: "SF-1",
    Secret: true,
    Condition: () => Player.exploits.includes(Exploit.UndocumentedFunctionCall),
  },
  TIMECOMPRESSION: {
    ...achievementData.TIMECOMPRESSION,
    Icon: "SF-1",
    Secret: true,
    Condition: () => Player.exploits.includes(Exploit.TimeCompression),
  },
  REALITYALTERATION: {
    ...achievementData.REALITYALTERATION,
    Icon: "SF-1",
    Secret: true,
    Condition: () => Player.exploits.includes(Exploit.RealityAlteration),
  },
  N00DLES: {
    ...achievementData.N00DLES,
    Icon: "SF-1",
    Secret: true,
    Condition: () => Player.exploits.includes(Exploit.N00dles),
  },
  EDITSAVEFILE: {
    ...achievementData.EDITSAVEFILE,
    Icon: "SF-1",
    Secret: true,
    Condition: () => Player.exploits.includes(Exploit.EditSaveFile),
  },
  UNACHIEVABLE: {
    ...achievementData.UNACHIEVABLE,
    Icon: "SF-1",
    Secret: true,
    // Hey Players! Yes, you're supposed to modify this to get the achievement!
    Condition: () => false,
  },
  CHALLENGE_BN13: {
    ...achievementData.CHALLENGE_BN13,
    Icon: "BN13+",
    Visible: () => canAccessBitNodeFeature(13),
    Condition: () =>
      Player.bitNodeN === 13 &&
      isBitNodeFinished() &&
      !Player.augmentations.some((a) => a.name === AugmentationName.StaneksGift1),
  },
  DEVMENU: {
    ...achievementData.DEVMENU,
    Icon: "SF-1",
    Secret: true,
    Condition: () => Player.exploits.includes(Exploit.YoureNotMeantToAccessThis),
  },
  RAINBOW: {
    ...achievementData.RAINBOW,
    Icon: "SF-1",
    Secret: true,
    Condition: () => Player.exploits.includes(Exploit.INeedARainbow),
  },
  TRUE_RECURSION: {
    ...achievementData.TRUE_RECURSION,
    Icon: "SF-1",
    Secret: true,
    Condition: () => Player.exploits.includes(Exploit.TrueRecursion),
  },
};

// Steam has a limit of 100 achievement. So these were planned but commented for now.
// { ID: FactionNames.ECorp.toUpperCase(), Condition: () => Player.factions.includes(FactionNames.ECorp) },
// { ID: FactionNames.MegaCorp.toUpperCase(), Condition: () => Player.factions.includes(FactionNames.MegaCorp) },
// { ID: "BACHMAN_&_ASSOCIATES", Condition: () => Player.factions.includes(FactionNames.BachmanAssociates) },
// { ID: "BLADE_INDUSTRIES", Condition: () => Player.factions.includes(FactionNames.BladeIndustries) },
// { ID: FactionNames.NWO.toUpperCase(), Condition: () => Player.factions.includes(FactionNames.NWO) },
// { ID: "CLARKE_INCORPORATED", Condition: () => Player.factions.includes(FactionNames.ClarkeIncorporated) },
// { ID: "OMNITEK_INCORPORATED", Condition: () => Player.factions.includes(FactionNames.OmniTekIncorporated) },
// { ID: "FOUR_SIGMA", Condition: () => Player.factions.includes(FactionNames.FourSigma) },
// { ID: "KUAIGONG_INTERNATIONAL", Condition: () => Player.factions.includes(FactionNames.KuaiGongInternational) },
// { ID: "FULCRUM_SECRET_TECHNOLOGIES", Condition: () => Player.factions.includes(FactionNames.FulcrumSecretTechnologies) },
// { ID: FactionNames.Aevum.toUpperCase(), Condition: () => Player.factions.includes(FactionNames.Aevum) },
// { ID: FactionNames.Chongqing.toUpperCase(), Condition: () => Player.factions.includes(FactionNames.Chongqing) },
// { ID: FactionNames.Ishima.toUpperCase(), Condition: () => Player.factions.includes(FactionNames.Ishima) },
// { ID: "NEW_TOKYO", Condition: () => Player.factions.includes(FactionNames.NewTokyo) },
// { ID: "SECTOR-12", Condition: () => Player.factions.includes(FactionNames.Sector12) },
// { ID: FactionNames.Volhaven.toUpperCase(), Condition: () => Player.factions.includes(FactionNames.Volhaven) },
// { ID: "SPEAKERS_FOR_THE_DEAD", Condition: () => Player.factions.includes(FactionNames.SpeakersForTheDead) },
// { ID: "THE_DARK_ARMY", Condition: () => Player.factions.includes(FactionNames.TheDarkArmy) },
// { ID: "THE_SYNDICATE", Condition: () => Player.factions.includes(FactionNames.TheSyndicate) },
// { ID: FactionNames.Silhouette.toUpperCase(), Condition: () => Player.factions.includes(FactionNames.Silhouette) },
// { ID: FactionNames.Tetrads.toUpperCase(), Condition: () => Player.factions.includes(FactionNames.Tetrads) },
// { ID: "SLUM_SNAKES", Condition: () => Player.factions.includes(FactionNames.SlumSnakes) },
// { ID: FactionNames.Netburners.toUpperCase(), Condition: () => Player.factions.includes(FactionNames.Netburners) },
// { ID: "TIAN_DI_HUI", Condition: () => Player.factions.includes(FactionNames.TianDiHui) },
// { ID: FactionNames.Bladeburners.toUpperCase(), Condition: () => Player.factions.includes(FactionNames.Bladeburners) },
// { ID: "DEEPSCANV1.EXE", Condition: () => Player.getHomeComputer().programs.includes(Programs.DeepscanV1.name) },
// { ID: "DEEPSCANV2.EXE", Condition: () => Player.getHomeComputer().programs.includes(Programs.DeepscanV2.name) },
// { ID: "INFILTRATORS", Condition: () => Player.factions.includes(FactionNames.Infiltrators) },
// {
//   ID: "SERVERPROFILER.EXE",
//   Condition: () => Player.getHomeComputer().programs.includes(Programs.ServerProfiler.name),
// },
// { ID: "AUTOLINK.EXE", Condition: () => Player.getHomeComputer().programs.includes(Programs.AutoLink.name) },
// { ID: "FLIGHT.EXE", Condition: () => Player.getHomeComputer().programs.includes(Programs.Flight.name) },

export function calculateAchievements(): void {
  const playerAchievements = Player.achievements.map((a) => a.ID);

  const missingAchievements = Object.values(achievements)
    .filter((a) => !playerAchievements.includes(a.ID) && a.Condition())
    // callback returns array of achievement id and id of any in the additional list, flatmap means we have only a 1D array
    .flatMap((a) => [a.ID, ...(a.AdditionalUnlock || [])]);

  for (const id of missingAchievements) {
    Player.giveAchievement(id);
  }

  // Write all player's achievements to document for Steam/Electron
  // This could be replaced by "availableAchievements"
  // if we don't want to grant the save game achievements to steam but only currently available
  document.achievements = [...Player.achievements.map((a) => a.ID)];
}
