import { AugmentationName, CityName, CompletedProgramName, FactionName, LiteratureName, CompanyName } from "@enums";
import { initBitNodeMultipliers } from "./BitNode/BitNode";
import { Companies } from "./Company/Companies";
import { resetIndustryResearchTrees } from "./Corporation/data/IndustryData";
import { Factions } from "./Faction/Factions";
import { joinFaction } from "./Faction/FactionHelpers";
import { updateHashManagerCapacity } from "./Hacknet/HacknetHelpers";
import { prestigeWorkerScripts } from "./NetscriptWorker";
import { Player } from "@player";
import { recentScripts } from "./Netscript/RecentScripts";
import { resetPidCounter } from "./Netscript/Pid";

import { GetServer, AddToAllServers, initForeignServers, prestigeAllServers } from "./Server/AllServers";
import { prestigeHomeComputer } from "./Server/ServerHelpers";
import { SpecialServers } from "./Server/data/SpecialServers";
import { deleteStockMarket, initStockMarket } from "./StockMarket/StockMarket";
import { Terminal } from "./Terminal";

import { dialogBoxCreate } from "./ui/React/DialogBox";

import { staneksGift } from "./CotMG/Helper";
import { ProgramsSeen } from "./Programs/ui/ProgramsRoot";
import { InvitationsSeen } from "./Faction/ui/FactionsRoot";
import { CONSTANTS } from "./Constants";
import { LogBoxClearEvents } from "./ui/React/LogBoxManager";
import { initCircadianModulator } from "./Augmentation/Augmentations";

const BitNode8StartingMoney = 250e6;
function delayedDialog(message: string) {
  setTimeout(() => dialogBoxCreate(message), 200);
}

// Prestige by purchasing augmentation
export function prestigeAugmentation(): void {
  initBitNodeMultipliers();

  // Maintain invites to factions with the 'keepOnInstall' flag, and rumors about others
  const maintainInvites = new Set<FactionName>();
  const maintainRumors = new Set<FactionName>();
  for (const facName of [...Player.factions, ...Player.factionInvitations]) {
    if (Factions[facName].getInfo().keep) {
      maintainInvites.add(facName);
    } else {
      maintainRumors.add(facName);
    }
  }

  Player.prestigeAugmentation();

  // Delete all Worker Scripts objects
  prestigeWorkerScripts();

  const homeComp = Player.getHomeComputer();
  // Delete all servers except home computer
  prestigeAllServers();

  // Reset home computer (only the programs) and add to AllServers
  AddToAllServers(homeComp);
  prestigeHomeComputer(homeComp);

  if (Player.hasAugmentation(AugmentationName.Neurolink, true)) {
    homeComp.programs.push(CompletedProgramName.ftpCrack);
    homeComp.programs.push(CompletedProgramName.relaySmtp);
  }
  if (Player.hasAugmentation(AugmentationName.CashRoot, true)) {
    Player.setMoney(1e6);
    homeComp.programs.push(CompletedProgramName.bruteSsh);
  }
  if (Player.hasAugmentation(AugmentationName.PCMatrix, true)) {
    homeComp.programs.push(CompletedProgramName.deepScan1);
    homeComp.programs.push(CompletedProgramName.autoLink);
  }

  if (Player.sourceFileLvl(5) > 0 || Player.bitNodeN === 5) {
    homeComp.programs.push(CompletedProgramName.formulas);
  }

  // Re-create foreign servers
  initForeignServers(Player.getHomeComputer());

  // Gain favor for Companies and Factions
  for (const company of Object.values(Companies)) company.prestigeAugmentation();
  for (const faction of Object.values(Factions)) faction.prestigeAugmentation();

  // Stop a Terminal action if there is one.
  if (Terminal.action !== null) {
    Terminal.finishAction(true);
  }
  Terminal.clear();
  LogBoxClearEvents.emit();

  // Recalculate the bonus for circadian modulator aug
  initCircadianModulator();

  Player.factionInvitations = Player.factionInvitations.concat([...maintainInvites]);
  for (const factionName of maintainInvites) {
    Factions[factionName].alreadyInvited = true;
  }
  Player.reapplyAllAugmentations();
  Player.reapplyAllSourceFiles();
  Player.hp.current = Player.hp.max;

  staneksGift.prestigeAugmentation();

  // Apply entropy from grafting
  Player.applyEntropy(Player.entropy);

  // Gang
  const gang = Player.gang;
  if (gang) {
    const faction = Factions[gang.facName];
    if (faction) joinFaction(faction);
    const penalty = 0.95;
    for (const m of gang.members) {
      m.hack_asc_points *= penalty;
      m.str_asc_points *= penalty;
      m.def_asc_points *= penalty;
      m.dex_asc_points *= penalty;
      m.agi_asc_points *= penalty;
      m.cha_asc_points *= penalty;
    }
  }

  // BitNode 3: Corporatocracy
  if (Player.bitNodeN === 3) {
    // Easiest way to comply with type constraint, instead of revalidating the enum member's file path
    homeComp.messages.push(LiteratureName.CorporationManagementHandbook);
  }

  // Cancel Bladeburner action
  if (Player.bladeburner) {
    Player.bladeburner.prestige();
  }

  // BitNode 8: Ghost of Wall Street
  if (Player.bitNodeN === 8) {
    Player.money = BitNode8StartingMoney;
  }
  if (Player.bitNodeN === 8 || Player.sourceFileLvl(8) > 0) {
    Player.hasWseAccount = true;
    Player.hasTixApiAccess = true;
  }

  // Reset Stock market
  if (Player.hasWseAccount) {
    initStockMarket();
  }

  // Red Pill
  if (Player.hasAugmentation(AugmentationName.TheRedPill, true)) {
    const WorldDaemon = GetServer(SpecialServers.WorldDaemon);
    const DaedalusServer = GetServer(SpecialServers.DaedalusServer);
    if (WorldDaemon && DaedalusServer) {
      WorldDaemon.serversOnNetwork.push(DaedalusServer.hostname);
      DaedalusServer.serversOnNetwork.push(WorldDaemon.hostname);
    }
  }

  // Bitnode 13: Church of the Machine God
  if (Player.hasAugmentation(AugmentationName.StaneksGift1, true)) {
    joinFaction(Factions[FactionName.ChurchOfTheMachineGod]);
  } else if (Player.bitNodeN != 13) {
    if (Player.augmentations.some((a) => a.name !== AugmentationName.NeuroFluxGovernor)) {
      Factions[FactionName.ChurchOfTheMachineGod].isBanned = true;
    }
  }

  // Hear rumors after all invites/bans
  for (const factionName of maintainRumors) Player.receiveRumor(factionName);

  resetPidCounter();
  ProgramsSeen.clear();
  InvitationsSeen.clear();
}

// Prestige by destroying Bit Node and gaining a Source File
export function prestigeSourceFile(isFlume: boolean): void {
  initBitNodeMultipliers();

  Player.prestigeSourceFile();
  prestigeWorkerScripts(); // Delete all Worker Scripts objects

  const homeComp = Player.getHomeComputer();

  // Stop a Terminal action if there is one.
  if (Terminal.action !== null) {
    Terminal.finishAction(true);
  }
  Terminal.clear();
  LogBoxClearEvents.emit();

  // Delete all servers except home computer
  prestigeAllServers(); // Must be done before initForeignServers()

  // Reset home computer (only the programs) and add to AllServers
  AddToAllServers(homeComp);
  prestigeHomeComputer(homeComp);
  // Ram usage needs to be cleared for bitnode-level resets, due to possible change in singularity cost.
  for (const script of homeComp.scripts.values()) script.ramUsage = null;

  // Re-create foreign servers
  initForeignServers(Player.getHomeComputer());

  if (Player.sourceFileLvl(9) >= 2) {
    homeComp.setMaxRam(128);
  } else if (Player.sourceFileLvl(1) > 0) {
    homeComp.setMaxRam(32);
  } else {
    homeComp.setMaxRam(8);
  }
  homeComp.cpuCores = 1;

  // Reset favor for Companies and Factions
  for (const company of Object.values(Companies)) company.prestigeSourceFile();
  for (const faction of Object.values(Factions)) faction.prestigeSourceFile();

  // Stop a Terminal action if there is one
  if (Terminal.action !== null) {
    Terminal.finishAction(true);
  }

  // Give levels of NeuroFluxGovernor for Source-File 12. Must be done here before Augmentations are recalculated
  if (Player.sourceFileLvl(12) > 0) {
    Player.augmentations.push({
      name: AugmentationName.NeuroFluxGovernor,
      level: Player.sourceFileLvl(12),
    });
  }

  initCircadianModulator();

  Player.reapplyAllAugmentations();
  Player.reapplyAllSourceFiles();

  if (Player.sourceFileLvl(5) > 0 || Player.bitNodeN === 5) {
    homeComp.programs.push(CompletedProgramName.formulas);
  }

  // BitNode 3: Corporatocracy
  if (Player.bitNodeN === 3) {
    // Easiest way to comply with type constraint, instead of revalidating the enum member's file path
    homeComp.messages.push(LiteratureName.CorporationManagementHandbook);
    delayedDialog(
      "You received a copy of the Corporation Management Handbook on your home computer. " +
        "Read it if you need help getting started with Corporations!",
    );
  }

  // BitNode 6: Bladeburners and BitNode 7: Bladeburners 2079
  if (Player.bitNodeN === 6 || Player.bitNodeN === 7) {
    delayedDialog(`The ${CompanyName.NSA} would like to have a word with you once you're ready.`);
  }

  // BitNode 8: Ghost of Wall Street
  if (Player.bitNodeN === 8) {
    Player.money = BitNode8StartingMoney;
  }
  if (Player.bitNodeN === 8 || Player.sourceFileLvl(8) > 0) {
    Player.hasWseAccount = true;
    Player.hasTixApiAccess = true;
  }

  // BitNode 10: Digital Carbon
  if (Player.bitNodeN === 10) {
    delayedDialog(
      `Seek out ${FactionName.TheCovenant} if you'd like to purchase a new sleeve or two! And see what ${CompanyName.VitaLife} in ${CityName.NewTokyo} has to offer for you`,
    );
  }

  // BitNode 12: The Recursion
  if (Player.bitNodeN === 12 && Player.sourceFileLvl(12) > 100) {
    delayedDialog("Saynt_Garmo is watching you");
  }

  if (Player.bitNodeN === 13) {
    delayedDialog(`Trouble is brewing in ${CityName.Chongqing}`);
  }

  // Reset Stock market, gang, and corporation
  if (Player.hasWseAccount) {
    initStockMarket();
  } else {
    deleteStockMarket();
  }

  resetIndustryResearchTrees();

  // Source-File 9 (level 3) effect
  // also now applies when entering bn9 until install
  if (Player.sourceFileLvl(9) >= 3 || Player.bitNodeN === 9) {
    const hserver = Player.createHacknetServer();

    hserver.level = 100;
    hserver.cores = 10;
    hserver.cpuCores = 10;
    hserver.cache = 5;
    hserver.updateHashRate(Player.mults.hacknet_node_money);
    hserver.updateHashCapacity();
    updateHashManagerCapacity();
  }

  if (Player.bitNodeN === 13) {
    Player.money = CONSTANTS.TravelCost;
  }
  staneksGift.prestigeSourceFile();

  // Gain int exp
  if (Player.sourceFileLvl(5) !== 0 && !isFlume) Player.gainIntelligenceExp(300);

  // Clear recent scripts
  recentScripts.splice(0, recentScripts.length);
  resetPidCounter();
}
