import { AugmentationName, CityName, CompletedProgramName, FactionName, LiteratureName, CompanyName } from "@enums";
import { Augmentations } from "./Augmentation/Augmentations";
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

import { GetServer, AddToAllServers, prestigeAllServers } from "./Server/AllServers";
import { initForeignServers, prestigeHomeComputer } from "./Server/ServerHelpers";
import { SpecialServers } from "./Server/data/SpecialServers";
import { canAccessStockMarket, deleteStockMarket, initStockMarket } from "./StockMarket/StockMarket";
import { Terminal } from "./Terminal";

import { dialogBoxCreate } from "./ui/React/DialogBox";

import { staneksGift } from "./CotMG/Helper";
import { ProgramsSeen } from "./Programs/ui/ProgramsRoot";
import { InvitationsSeen } from "./Faction/ui/FactionsRoot";
import { CONSTANTS } from "./Constants";
import { LogBoxClearEvents } from "./ui/React/LogBoxManager";
import { initCircadianModulator } from "./Augmentation/Augmentations";
import { Go } from "./Go/Go";
import { calculateExp } from "./PersonObjects/formulas/skill";
import { currentNodeMults } from "./BitNode/BitNodeMultipliers";
import { canAccessBitNodeFeature } from "./BitNode/BitNodeUtils";
import { pendingUIShareJobIds } from "./NetworkShare/Share";
import { getDarkscapeNavigator } from "./DarkNet/effects/effects";
import { CodingContractEventEmitter } from "./CodingContract/CodingContractEventEmitter";
import { showLiterature } from "./Literature/LiteratureHelpers";
import { prestigeDarknetState } from "./DarkNet/models/DarknetState";

const BitNode8StartingMoney = 250e6;
function delayedDialog(message: string, canBeDismissedEasily = true) {
  setTimeout(() => dialogBoxCreate(message, { html: false, canBeDismissedEasily }), 200);
}

function setInitialExpForPlayer() {
  Player.exp.hacking = calculateExp(1, Player.mults.hacking * currentNodeMults.HackingLevelMultiplier);
  Player.exp.strength = calculateExp(1, Player.mults.strength * currentNodeMults.StrengthLevelMultiplier);
  Player.exp.defense = calculateExp(1, Player.mults.defense * currentNodeMults.DefenseLevelMultiplier);
  Player.exp.dexterity = calculateExp(1, Player.mults.dexterity * currentNodeMults.DexterityLevelMultiplier);
  Player.exp.agility = calculateExp(1, Player.mults.agility * currentNodeMults.AgilityLevelMultiplier);
  Player.exp.charisma = calculateExp(1, Player.mults.charisma * currentNodeMults.CharismaLevelMultiplier);
  Player.updateSkillLevels();
  Player.hp.current = Player.hp.max;
}

// Prestige by purchasing augmentation
export function prestigeAugmentation(): void {
  // We must kill all scripts before doing anything else.
  prestigeWorkerScripts();

  initBitNodeMultipliers();

  // Maintain invites to factions with the 'keepOnInstall' flag
  const maintainInvites = new Set<FactionName>();
  for (const facName of [...Player.factions, ...Player.factionInvitations]) {
    if (Factions[facName].getInfo().keep) {
      maintainInvites.add(facName);
    }
  }

  Player.prestigeAugmentation();
  Go.prestigeAugmentation();

  const homeComp = Player.getHomeComputer();
  // Delete all servers except home computer
  prestigeAllServers();

  prestigeDarknetState(false);

  // Reset home computer (only the programs) and add to AllServers
  AddToAllServers(homeComp);
  prestigeHomeComputer(homeComp);

  // Clear all pending share jobs created via UI
  pendingUIShareJobIds.length = 0;

  // Receive starting money and programs from installed augmentations
  for (const ownedAug of Player.augmentations) {
    const aug = Augmentations[ownedAug.name];
    Player.gainMoney(aug.startingMoney, "other");
    for (const program of aug.programs) {
      homeComp.pushProgram(program);
    }
  }
  if (canAccessBitNodeFeature(5)) {
    homeComp.pushProgram(CompletedProgramName.formulas);
  }

  // Re-create foreign servers
  initForeignServers(Player.getHomeComputer());

  if (canAccessBitNodeFeature(15)) {
    getDarkscapeNavigator();
  }

  // Gain favor for Companies and Factions
  for (const company of Object.values(Companies)) company.prestigeAugmentation();
  for (const faction of Object.values(Factions)) faction.prestigeAugmentation();

  // Stop a Terminal action if there is one.
  Terminal.prestige();
  LogBoxClearEvents.emit();

  // Close coding contract modal
  CodingContractEventEmitter.emit({ type: "close" });

  // Recalculate the bonus for circadian modulator aug
  initCircadianModulator();

  Player.factionInvitations = Player.factionInvitations.concat([...maintainInvites]);
  for (const factionName of maintainInvites) {
    Factions[factionName].alreadyInvited = true;
  }
  Player.reapplyAllAugmentations();
  Player.reapplyAllSourceFiles();

  staneksGift.prestigeAugmentation();

  // Apply entropy from grafting
  Player.applyEntropy(Player.entropy);

  // Gang
  const gang = Player.gang;
  if (gang) {
    const faction = Factions[gang.facName];
    if (faction) joinFaction(faction);
    for (const m of gang.members) {
      const results = m.getPostInstallPoints();
      m.hack_asc_points = results.hack;
      m.str_asc_points = results.str;
      m.def_asc_points = results.def;
      m.dex_asc_points = results.dex;
      m.agi_asc_points = results.agi;
      m.cha_asc_points = results.cha;
    }
  }

  // BitNode 3: Corporatocracy
  if (Player.bitNodeN === 3) {
    // Easiest way to comply with type constraint, instead of revalidating the enum member's file path
    homeComp.messages.push(LiteratureName.CorporationManagementHandbook);
  }

  // Cancel Bladeburner action
  if (Player.bladeburner) {
    Player.bladeburner.prestigeAugmentation();
  }

  // BitNode 8: Ghost of Wall Street
  if (Player.bitNodeN === 8) {
    Player.money = BitNode8StartingMoney;
  }
  if (canAccessBitNodeFeature(8)) {
    Player.hasWseAccount = true;
    Player.hasTixApiAccess = true;
  }

  // Reset Stock market
  if (canAccessStockMarket()) {
    initStockMarket();
  } else {
    deleteStockMarket();
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
  } else if (Player.bitNodeN !== 13) {
    if (Player.augmentations.some((a) => a.name !== AugmentationName.NeuroFluxGovernor)) {
      Factions[FactionName.ChurchOfTheMachineGod].isBanned = true;
    }
  }

  // clear recent scripts
  recentScripts.splice(0);
  resetPidCounter();
  ProgramsSeen.clear();
  InvitationsSeen.clear();

  setInitialExpForPlayer();
}

// Prestige by destroying Bit Node and gaining a Source File
export function prestigeSourceFile(isFlume: boolean): void {
  // We must kill all scripts before doing anything else.
  prestigeWorkerScripts();

  initBitNodeMultipliers();

  Player.prestigeSourceFile();
  Go.prestigeSourceFile();

  const homeComp = Player.getHomeComputer();

  // Stop a Terminal action if there is one.
  Terminal.prestige();
  LogBoxClearEvents.emit();

  // Close coding contract modal
  CodingContractEventEmitter.emit({ type: "close" });

  // Delete all servers except home computer
  prestigeAllServers(); // Must be done before initForeignServers()

  prestigeDarknetState(true);

  // Reset home computer (only the programs) and add to AllServers
  AddToAllServers(homeComp);
  prestigeHomeComputer(homeComp);

  // Clear all pending share jobs created via UI
  pendingUIShareJobIds.length = 0;

  // Ram usage needs to be cleared for bitnode-level resets, due to possible change in singularity cost.
  for (const script of homeComp.scripts.values()) script.ramUsage = null;

  // Re-create foreign servers
  initForeignServers(Player.getHomeComputer());

  if (canAccessBitNodeFeature(15)) {
    getDarkscapeNavigator();
  }

  if (Player.activeSourceFileLvl(9) >= 2) {
    homeComp.setMaxRam(128);
  } else if (Player.activeSourceFileLvl(1) > 0) {
    homeComp.setMaxRam(32);
  } else {
    homeComp.setMaxRam(8);
  }
  homeComp.cpuCores = 1;

  // Reset favor for Companies and Factions
  for (const company of Object.values(Companies)) company.prestigeSourceFile();
  for (const faction of Object.values(Factions)) faction.prestigeSourceFile();

  // Give levels of NeuroFluxGovernor for Source-File 12. Must be done here before Augmentations are recalculated
  if (Player.activeSourceFileLvl(12) > 0) {
    Player.augmentations.push({
      name: AugmentationName.NeuroFluxGovernor,
      level: Player.activeSourceFileLvl(12),
    });
  }

  initCircadianModulator();

  Player.reapplyAllAugmentations();
  Player.reapplyAllSourceFiles();

  if (canAccessBitNodeFeature(5)) {
    homeComp.pushProgram(CompletedProgramName.formulas);
  }

  // BitNode 3: Corporatocracy
  if (Player.bitNodeN === 3) {
    // Easiest way to comply with type constraint, instead of revalidating the enum member's file path
    homeComp.messages.push(LiteratureName.CorporationManagementHandbook);
    delayedDialog(
      "你在家用电脑上收到了一本《企业管理工作手册》。这是一份简短的企业管理入门介绍。\n\n你可以在游戏内的文档页查看企业相关文档（文档 -> 高级机制 -> 企业）。这是管理企业最有用且最新的资源。",
      false,
    );
  }

  // BitNode 6: Bladeburners and BitNode 7: Bladeburners 2079
  if (Player.bitNodeN === 6 || Player.bitNodeN === 7) {
    delayedDialog(
      `${CompanyName.NSA} 想在你就绪后与你谈一谈。在前往之前，请先把你的战斗属性训练到 100 级。`,
      false,
    );
  }

  // BitNode 8: Ghost of Wall Street
  if (Player.bitNodeN === 8) {
    Player.money = BitNode8StartingMoney;
  }
  if (canAccessBitNodeFeature(8)) {
    Player.hasWseAccount = true;
    Player.hasTixApiAccess = true;
  }

  // BitNode 10: Digital Carbon
  if (Player.bitNodeN === 10) {
    delayedDialog(
      `如果你想购买一两个新的分身，去找 ${FactionName.TheCovenant}！另外看看 ${CityName.NewTokyo} 的 ${CompanyName.VitaLife} 有什么适合你的`,
      false,
    );
  }

  // BitNode 12: The Recursion
  if (Player.bitNodeN === 12 && Player.sourceFileLvl(12) > 100) {
    delayedDialog("Saynt_Garmo 正在注视着你");
  }

  if (Player.bitNodeN === 13) {
    delayedDialog(`${CityName.Chongqing} 正酝酿着麻烦`, false);
  }

  // Reset Stock market, gang, and corporation
  if (canAccessStockMarket()) {
    initStockMarket();
  } else {
    deleteStockMarket();
  }

  resetIndustryResearchTrees();

  // Source-File 9 (level 3) effect
  // also now applies when entering bn9 until install
  if ((Player.activeSourceFileLvl(9) >= 3 || Player.bitNodeN === 9) && !Player.bitNodeOptions.disableHacknetServer) {
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

  if (Player.bitNodeN === 15 && !homeComp.messages.includes(LiteratureName.DarknetHandbook)) {
    homeComp.messages.push(LiteratureName.DarknetHandbook);
  }
  if (Player.bitNodeN === 15 && Player.sourceFileLvl(15) === 0) {
    showLiterature(LiteratureName.DarknetHandbook);
  }

  // Gain int exp
  if (Player.activeSourceFileLvl(5) !== 0 && !isFlume) {
    Player.gainIntelligenceExp(300);
  }

  // Clear recent scripts
  recentScripts.splice(0, recentScripts.length);
  resetPidCounter();

  setInitialExpForPlayer();

  if (!isFlume && Player.sourceFiles.size === 1 && Player.sourceFileLvl(1) === 1) {
    delayedDialog(
      "恭喜你摧毁了第一个 BitNode！记得查看文档页，现在有许多新页面已解锁。",
      false,
    );
  }
}
