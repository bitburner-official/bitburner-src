import { FactionNames } from "./Faction/data/FactionNames";
import { CityName } from "./Enums";
import { StaticAugmentations } from "./Augmentation/StaticAugmentations";
import { augmentationExists, initAugmentations } from "./Augmentation/AugmentationHelpers";
import { AugmentationNames } from "./Augmentation/data/AugmentationNames";
import { initBitNodeMultipliers } from "./BitNode/BitNode";
import { Companies, initCompanies } from "./Company/Companies";
import { resetIndustryResearchTrees } from "./Corporation/IndustryData";
import { Programs } from "./Programs/Programs";
import { Factions, initFactions } from "./Faction/Factions";
import { joinFaction } from "./Faction/FactionHelpers";
import { updateHashManagerCapacity } from "./Hacknet/HacknetHelpers";
import { prestigeWorkerScripts } from "./NetscriptWorker";
import { Player } from "@player";
import { recentScripts } from "./Netscript/RecentScripts";
import { resetPidCounter } from "./Netscript/Pid";
import { LiteratureName } from "./Literature/data/LiteratureNames";
import { Literatures } from "./Literature/Literatures";

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

const BitNode8StartingMoney = 250e6;

// Prestige by purchasing augmentation
export function prestigeAugmentation(): void {
  initBitNodeMultipliers();

  const maintainMembership = Player.factions.concat(Player.factionInvitations).filter(function (faction) {
    return Factions[faction].getInfo().keep;
  });
  Player.prestigeAugmentation();

  // Delete all Worker Scripts objects
  prestigeWorkerScripts();

  const homeComp = Player.getHomeComputer();
  // Delete all servers except home computer
  prestigeAllServers();

  // Reset home computer (only the programs) and add to AllServers
  AddToAllServers(homeComp);
  prestigeHomeComputer(homeComp);

  if (augmentationExists(AugmentationNames.Neurolink) && Player.hasAugmentation(AugmentationNames.Neurolink, true)) {
    homeComp.programs.push(Programs.FTPCrackProgram.name);
    homeComp.programs.push(Programs.RelaySMTPProgram.name);
  }
  if (augmentationExists(AugmentationNames.CashRoot) && Player.hasAugmentation(AugmentationNames.CashRoot, true)) {
    Player.setMoney(1e6);
    homeComp.programs.push(Programs.BruteSSHProgram.name);
  }
  if (augmentationExists(AugmentationNames.PCMatrix) && Player.hasAugmentation(AugmentationNames.PCMatrix, true)) {
    homeComp.programs.push(Programs.DeepscanV1.name);
    homeComp.programs.push(Programs.AutoLink.name);
  }

  if (Player.sourceFileLvl(5) > 0 || Player.bitNodeN === 5) {
    homeComp.programs.push(Programs.Formulas.name);
  }

  // Re-create foreign servers
  initForeignServers(Player.getHomeComputer());

  // Gain favor for Companies
  for (const member of Object.keys(Companies)) {
    if (Companies.hasOwnProperty(member)) {
      Companies[member].gainFavor();
    }
  }

  // Gain favor for factions
  for (const member of Object.keys(Factions)) {
    if (Factions.hasOwnProperty(member)) {
      Factions[member].gainFavor();
    }
  }

  // Stop a Terminal action if there is one.
  if (Terminal.action !== null) {
    Terminal.finishAction(true);
  }
  Terminal.clear();
  LogBoxClearEvents.emit();

  // Re-initialize things - This will update any changes
  initFactions(); // Factions must be initialized before augmentations

  Player.factionInvitations = Player.factionInvitations.concat(maintainMembership);
  initAugmentations(); // Calls reapplyAllAugmentations() and resets Player multipliers
  Player.reapplyAllSourceFiles();
  Player.hp.current = Player.hp.max;
  initCompanies();

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
    homeComp.messages.push(Literatures[LiteratureName.CorporationManagementHandbook].fn);
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
  if (augmentationExists(AugmentationNames.TheRedPill) && Player.hasAugmentation(AugmentationNames.TheRedPill, true)) {
    const WorldDaemon = GetServer(SpecialServers.WorldDaemon);
    const DaedalusServer = GetServer(SpecialServers.DaedalusServer);
    if (WorldDaemon && DaedalusServer) {
      WorldDaemon.serversOnNetwork.push(DaedalusServer.hostname);
      DaedalusServer.serversOnNetwork.push(WorldDaemon.hostname);
    }
  }

  if (
    augmentationExists(AugmentationNames.StaneksGift1) &&
    Player.hasAugmentation(AugmentationNames.StaneksGift1, true)
  ) {
    joinFaction(Factions[FactionNames.ChurchOfTheMachineGod]);
  }

  staneksGift.prestigeAugmentation();

  resetPidCounter();
  ProgramsSeen.splice(0, ProgramsSeen.length);
  InvitationsSeen.splice(0, InvitationsSeen.length);
}

// Prestige by destroying Bit Node and gaining a Source File
export function prestigeSourceFile(flume: boolean): void {
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

  // Reset favor for Companies
  for (const member of Object.keys(Companies)) {
    if (Companies.hasOwnProperty(member)) {
      Companies[member].favor = 0;
    }
  }

  // Reset favor for factions
  for (const member of Object.keys(Factions)) {
    if (Factions.hasOwnProperty(member)) {
      Factions[member].favor = 0;
    }
  }

  // Stop a Terminal action if there is one
  if (Terminal.action !== null) {
    Terminal.finishAction(true);
  }

  // Delete all Augmentations
  for (const name of Object.keys(StaticAugmentations)) {
    if (StaticAugmentations.hasOwnProperty(name)) {
      delete StaticAugmentations[name];
    }
  }

  // Give levels of NeuroFluxGovernor for Source-File 12. Must be done here before Augmentations are recalculated
  if (Player.sourceFileLvl(12) > 0) {
    Player.augmentations.push({
      name: AugmentationNames.NeuroFluxGovernor,
      level: Player.sourceFileLvl(12),
    });
  }

  // Re-initialize things - This will update any changes
  initFactions(); // Factions must be initialized before augmentations
  initAugmentations(); // Calls reapplyAllAugmentations() and resets Player multipliers
  Player.reapplyAllSourceFiles();
  initCompanies();

  if (Player.sourceFileLvl(5) > 0 || Player.bitNodeN === 5) {
    homeComp.programs.push(Programs.Formulas.name);
  }

  console.log(Player.bitNodeN);
  // BitNode 3: Corporatocracy
  if (Player.bitNodeN === 3) {
    // Easiest way to comply with type constraint, instead of revalidating the enum member's file path
    homeComp.messages.push(Literatures[LiteratureName.CorporationManagementHandbook].fn);
    dialogBoxCreate(
      "You received a copy of the Corporation Management Handbook on your home computer. " +
        "Read it if you need help getting started with Corporations!",
    );
  }

  // BitNode 6: Bladeburners and BitNode 7: Bladeburners 2079
  if (Player.bitNodeN === 6 || Player.bitNodeN === 7) {
    dialogBoxCreate("NSA would like to have a word with you once you're ready.");
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
    dialogBoxCreate(
      "Seek out The Covenant if you'd like to purchase a new sleeve or two! And see what VitaLife in New Tokyo has to offer for you",
    );
  }

  // BitNode 12: Digital Carbon
  if (Player.bitNodeN === 12 && Player.sourceFileLvl(10) > 100) {
    dialogBoxCreate("Saynt_Garmo is watching you");
  }

  if (Player.bitNodeN === 13) {
    dialogBoxCreate(`Trouble is brewing in ${CityName.Chongqing}`);
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
  if (Player.sourceFileLvl(5) !== 0 && !flume) Player.gainIntelligenceExp(300);

  // Clear recent scripts
  recentScripts.splice(0, recentScripts.length);
  resetPidCounter();
}
