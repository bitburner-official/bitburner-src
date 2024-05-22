import { Skills } from "@nsdefs";

import { loadAliases, loadGlobalAliases, Aliases, GlobalAliases } from "./Alias";
import { getCompaniesSave, loadCompanies } from "./Company/Companies";
import { CONSTANTS } from "./Constants";
import { getFactionsSave, loadFactions } from "./Faction/Factions";
import { loadAllGangs, AllGangs } from "./Gang/AllGangs";
import { Player, setPlayer, loadPlayer } from "./Player";
import {
  saveAllServers,
  loadAllServers,
  GetAllServers,
  createUniqueRandomIp,
  AddToAllServers,
  GetServer,
} from "./Server/AllServers";
import { Settings } from "./Settings/Settings";
import { loadStockMarket, StockMarket } from "./StockMarket/StockMarket";
import { staneksGift, loadStaneksGift } from "./CotMG/Helper";

import { SnackbarEvents } from "./ui/React/Snackbar";

import * as ExportBonus from "./ExportBonus";

import { dialogBoxCreate } from "./ui/React/DialogBox";
import { Reviver, constructorsForReviver, Generic_toJSON, Generic_fromJSON, IReviverValue } from "./utils/JSONReviver";
import { save } from "./db";
import { AwardNFG, v1APIBreak } from "./utils/v1APIBreak";
import { AugmentationName, LocationName, ToastVariant } from "@enums";
import { PlayerOwnedAugmentation } from "./Augmentation/PlayerOwnedAugmentation";
import { pushGameSaved } from "./Electron";
import { defaultMonacoTheme } from "./ScriptEditor/ui/themes";
import { safelyCreateUniqueServer } from "./Server/ServerHelpers";
import { SpecialServers } from "./Server/data/SpecialServers";
import { v2APIBreak } from "./utils/v2APIBreak";
import { Corporation } from "./Corporation/Corporation";
import { Terminal } from "./Terminal";
import { getRecordValues } from "./Types/Record";
import { exportMaterial } from "./Corporation/Actions";
import { getGoSave, loadGo } from "./Go/SaveLoad";
import { SaveData } from "./types";
import { SaveDataError, canUseBinaryFormat, decodeSaveData, encodeJsonSaveString } from "./utils/SaveDataUtils";
import { isBinaryFormat } from "../electron/saveDataBinaryFormat";
import { downloadContentAsFile } from "./utils/FileUtils";
import { showAPIBreaks } from "./utils/APIBreaks/APIBreak";
import { breakInfos261 } from "./utils/APIBreaks/2.6.1";
import { handleGetSaveDataError } from "./Netscript/ErrorMessages";

/* SaveObject.js
 *  Defines the object used to save/load games
 */

/**
 * This interface is only for transferring game data to electron-related code.
 */
export interface ElectronGameData {
  playerIdentifier: string;
  fileName: string;
  save: SaveData;
  savedOn: number;
}

export interface ImportData {
  saveData: SaveData;
  playerData?: ImportPlayerData;
}

export interface ImportPlayerData {
  identifier: string;
  lastSave: number;
  totalPlaytime: number;

  money: number;
  skills: Skills;

  augmentations: number;
  factions: number;
  achievements: number;

  bitNode: number;
  bitNodeLevel: number;
  sourceFiles: number;
  exploits: number;
}

class BitburnerSaveObject {
  PlayerSave = "";
  AllServersSave = "";
  CompaniesSave = "";
  FactionsSave = "";
  AliasesSave = "";
  GlobalAliasesSave = "";
  StockMarketSave = "";
  SettingsSave = "";
  VersionSave = "";
  AllGangsSave = "";
  LastExportBonus = "0";
  StaneksGiftSave = "";
  GoSave = "";

  async getSaveData(forceExcludeRunningScripts = false): Promise<SaveData> {
    this.PlayerSave = JSON.stringify(Player);

    // For the servers save, overwrite the ExcludeRunningScripts setting if forced
    const originalExcludeSetting = Settings.ExcludeRunningScriptsFromSave;
    if (forceExcludeRunningScripts) Settings.ExcludeRunningScriptsFromSave = true;
    this.AllServersSave = saveAllServers();
    Settings.ExcludeRunningScriptsFromSave = originalExcludeSetting;

    this.CompaniesSave = JSON.stringify(getCompaniesSave());
    this.FactionsSave = JSON.stringify(getFactionsSave());
    this.AliasesSave = JSON.stringify(Object.fromEntries(Aliases.entries()));
    this.GlobalAliasesSave = JSON.stringify(Object.fromEntries(GlobalAliases.entries()));
    this.StockMarketSave = JSON.stringify(StockMarket);
    this.SettingsSave = JSON.stringify(Settings);
    this.VersionSave = JSON.stringify(CONSTANTS.VersionNumber);
    this.LastExportBonus = JSON.stringify(ExportBonus.LastExportBonus);
    this.StaneksGiftSave = JSON.stringify(staneksGift);
    this.GoSave = JSON.stringify(getGoSave());

    if (Player.gang) this.AllGangsSave = JSON.stringify(AllGangs);

    return await encodeJsonSaveString(JSON.stringify(this));
  }

  async saveGame(emitToastEvent = true): Promise<void> {
    const savedOn = new Date().getTime();
    Player.lastSave = savedOn;
    let saveData;
    try {
      saveData = await this.getSaveData();
    } catch (error) {
      handleGetSaveDataError(error);
      return;
    }
    try {
      await save(saveData);
    } catch (error) {
      console.error(error);
      dialogBoxCreate(`Cannot save game: ${error}`);
      return;
    }
    const electronGameData: ElectronGameData = {
      playerIdentifier: Player.identifier,
      fileName: this.getSaveFileName(),
      save: saveData,
      savedOn,
    };
    pushGameSaved(electronGameData);

    if (emitToastEvent) {
      SnackbarEvents.emit("Game Saved!", ToastVariant.INFO, 2000);
    }
  }

  getSaveFileName(): string {
    // Save file name is based on current timestamp and BitNode
    const epochTime = Math.round(Date.now() / 1000);
    const bn = Player.bitNodeN;
    /**
     * - Binary format: save file uses .json.gz extension. Save data is the compressed json save string.
     * - Base64 format: save file uses .json extension. Save data is the base64-encoded json save string.
     */
    const extension = canUseBinaryFormat() ? "json.gz" : "json";
    return `bitburnerSave_${epochTime}_BN${bn}x${Player.sourceFileLvl(bn) + 1}.${extension}`;
  }

  async exportGame(): Promise<void> {
    let saveData;
    try {
      saveData = await this.getSaveData();
    } catch (error) {
      handleGetSaveDataError(error);
      return;
    }
    const filename = this.getSaveFileName();
    downloadContentAsFile(saveData, filename);
  }

  async importGame(saveData: SaveData, reload = true): Promise<void> {
    if (!saveData || saveData.length === 0) {
      throw new Error("Invalid import string");
    }
    try {
      await save(saveData);
    } catch (error) {
      console.error(error);
      dialogBoxCreate(`Cannot import save data: ${error}`);
      return;
    }
    if (reload) {
      setTimeout(() => location.reload(), 1000);
    }
  }

  async getSaveDataFromFile(files: FileList | null): Promise<SaveData> {
    if (files === null) return Promise.reject(new Error("No file selected"));
    const file = files[0];
    if (!file) return Promise.reject(new Error("Invalid file selected"));

    const rawData = new Uint8Array(await file.arrayBuffer());
    if (isBinaryFormat(rawData)) {
      return rawData;
    } else {
      return new TextDecoder().decode(rawData);
    }
  }

  async getImportDataFromSaveData(saveData: SaveData): Promise<ImportData> {
    if (!saveData || saveData.length === 0) throw new Error("Invalid save data");

    let decodedSaveData;
    try {
      decodedSaveData = await decodeSaveData(saveData);
    } catch (error) {
      console.error(error);
      if (error instanceof SaveDataError) {
        return Promise.reject(error);
      }
    }

    if (!decodedSaveData || decodedSaveData === "") {
      return Promise.reject(new Error("Save game is invalid"));
    }

    let parsedSaveData;
    try {
      parsedSaveData = JSON.parse(decodedSaveData);
    } catch (error) {
      console.error(error); // We'll handle below
    }

    if (!parsedSaveData || parsedSaveData.ctor !== "BitburnerSaveObject" || !parsedSaveData.data) {
      return Promise.reject(new Error("Save game did not seem valid"));
    }

    const data: ImportData = {
      saveData: saveData,
    };

    const importedPlayer = loadPlayer(parsedSaveData.data.PlayerSave);

    const playerData: ImportPlayerData = {
      identifier: importedPlayer.identifier,
      lastSave: importedPlayer.lastSave,
      totalPlaytime: importedPlayer.totalPlaytime,

      money: importedPlayer.money,
      skills: importedPlayer.skills,

      augmentations: importedPlayer.augmentations?.reduce<number>((total, current) => (total += current.level), 0) ?? 0,
      factions: importedPlayer.factions?.length ?? 0,
      achievements: importedPlayer.achievements?.length ?? 0,

      bitNode: importedPlayer.bitNodeN,
      bitNodeLevel: importedPlayer.sourceFileLvl(Player.bitNodeN) + 1,
      sourceFiles: [...importedPlayer.sourceFiles].reduce<number>((total, [__bn, lvl]) => (total += lvl), 0),
      exploits: importedPlayer.exploits.length,
    };

    data.playerData = playerData;
    return Promise.resolve(data);
  }

  toJSON(): IReviverValue {
    return Generic_toJSON("BitburnerSaveObject", this);
  }

  static fromJSON(value: IReviverValue): BitburnerSaveObject {
    return Generic_fromJSON(BitburnerSaveObject, value.data);
  }
}

/** Function for performing a series of defined replacements. See 0.58.0 for usage */
function convert(code: string, changes: [RegExp, string][]): string {
  for (const change of changes) {
    code = code.replace(change[0], change[1]);
  }
  return code;
}

// Makes necessary changes to the loaded/imported data to ensure
// the game stills works with new versions
function evaluateVersionCompatibility(ver: string | number): void {
  // We have to do this because ts won't let us otherwise
  const anyPlayer = Player as any;
  if (typeof ver === "string") {
    // This version refactored the Company/job-related code
    if (ver <= "0.41.2") {
      // Player's company position is now a string
      if (anyPlayer.companyPosition != null && typeof anyPlayer.companyPosition !== "string") {
        anyPlayer.companyPosition = anyPlayer.companyPosition.data.positionName;
        if (anyPlayer.companyPosition == null) {
          anyPlayer.companyPosition = "";
        }
      }
    }

    // This version allowed players to hold multiple jobs
    if (ver < "0.43.0") {
      if (anyPlayer.companyName !== "" && anyPlayer.companyPosition != null && anyPlayer.companyPosition !== "") {
        anyPlayer.jobs[anyPlayer.companyName] = anyPlayer.companyPosition;
      }

      delete anyPlayer.companyPosition;
    }
    if (ver < "0.56.0") {
      for (const q of anyPlayer.queuedAugmentations) {
        if (q.name === "Graphene BranchiBlades Upgrade") {
          q.name = "Graphene BrachiBlades Upgrade";
        }
      }
      for (const q of anyPlayer.augmentations) {
        if (q.name === "Graphene BranchiBlades Upgrade") {
          q.name = "Graphene BrachiBlades Upgrade";
        }
      }
    }
    if (ver < "0.56.1") {
      if (anyPlayer.bladeburner === 0) {
        anyPlayer.bladeburner = null;
      }
      if (anyPlayer.gang === 0) {
        anyPlayer.gang = null;
      }
      // convert all Messages to just filename to save space.
      const home = anyPlayer.getHomeComputer();
      for (let i = 0; i < home.messages.length; i++) {
        if (home.messages[i].filename) {
          home.messages[i] = home.messages[i].filename;
        }
      }
    }
    if (ver < "0.58.0") {
      const changes: [RegExp, string][] = [
        [/getStockSymbols/g, "stock.getSymbols"],
        [/getStockPrice/g, "stock.getPrice"],
        [/getStockAskPrice/g, "stock.getAskPrice"],
        [/getStockBidPrice/g, "stock.getBidPrice"],
        [/getStockPosition/g, "stock.getPosition"],
        [/getStockMaxShares/g, "stock.getMaxShares"],
        [/getStockPurchaseCost/g, "stock.getPurchaseCost"],
        [/getStockSaleGain/g, "stock.getSaleGain"],
        [/buyStock/g, "stock.buy"],
        [/sellStock/g, "stock.sell"],
        [/shortStock/g, "stock.short"],
        [/sellShort/g, "stock.sellShort"],
        [/placeOrder/g, "stock.placeOrder"],
        [/cancelOrder/g, "stock.cancelOrder"],
        [/getOrders/g, "stock.getOrders"],
        [/getStockVolatility/g, "stock.getVolatility"],
        [/getStockForecast/g, "stock.getForecast"],
        [/purchase4SMarketData/g, "stock.purchase4SMarketData"],
        [/purchase4SMarketDataTixApi/g, "stock.purchase4SMarketDataTixApi"],
      ];
      for (const server of GetAllServers()) {
        for (const script of server.scripts.values()) {
          script.content = convert(script.code, changes);
        }
      }
    }
    v1APIBreak();
    ver = 1;
  }
  if (typeof ver !== "number") return;
  if (ver < 2) {
    AwardNFG(10);
    Player.reapplyAllAugmentations();
    Player.reapplyAllSourceFiles();
  }
  if (ver < 3) {
    anyPlayer.money = parseFloat(anyPlayer.money);
  }
  if (ver < 9) {
    if (Object.hasOwn(StockMarket, "Joes Guns")) {
      const s = StockMarket["Joes Guns"];
      delete StockMarket["Joes Guns"];
      StockMarket[LocationName.Sector12JoesGuns] = s;
    }
  }
  if (ver < 10) {
    // Augmentation name was changed in 0.56.0 but sleeves aug list was missed.
    if (anyPlayer.sleeves && anyPlayer.sleeves.length > 0) {
      for (const sleeve of anyPlayer.sleeves) {
        if (!sleeve.augmentations || sleeve.augmentations.length === 0) continue;
        for (const augmentation of sleeve.augmentations) {
          if (augmentation.name !== "Graphene BranchiBlades Upgrade") continue;
          augmentation.name = "Graphene BrachiBlades Upgrade";
        }
      }
    }
  }
  if (ver < 12) {
    if (anyPlayer.resleeves !== undefined) {
      delete anyPlayer.resleeves;
    }
  }

  if (ver < 15) {
    Settings.EditorTheme = { ...defaultMonacoTheme };
  }
  //Fix contract names
  if (ver < 16) {
    //Iterate over all contracts on all servers
    for (const server of GetAllServers()) {
      for (const contract of server.contracts) {
        //Rename old "HammingCodes: Integer to encoded Binary" contracts
        //to "HammingCodes: Integer to Encoded Binary"
        if (contract.type == "HammingCodes: Integer to encoded Binary") {
          contract.type = "HammingCodes: Integer to Encoded Binary";
        }
      }
    }
  }

  const v22PlayerBreak = () => {
    // reset HP correctly to avoid crash
    anyPlayer.hp = { current: 1, max: 1 };
    for (const sleeve of anyPlayer.sleeves) {
      sleeve.hp = { current: 1, max: 1 };
    }

    // transfer over old exp to new struct
    anyPlayer.exp.hacking = anyPlayer.hacking_exp;
    anyPlayer.exp.strength = anyPlayer.strength_exp;
    anyPlayer.exp.defense = anyPlayer.defense_exp;
    anyPlayer.exp.dexterity = anyPlayer.dexterity_exp;
    anyPlayer.exp.agility = anyPlayer.agility_exp;
    anyPlayer.exp.charisma = anyPlayer.charisma_exp;
    anyPlayer.exp.intelligence = anyPlayer.intelligence_exp;
  };

  // Fix bugged NFG accumulation in owned augmentations
  if (ver < 17) {
    let ownedNFGs = [...Player.augmentations];
    ownedNFGs = ownedNFGs.filter((aug) => aug.name === AugmentationName.NeuroFluxGovernor);
    const newNFG = new PlayerOwnedAugmentation(AugmentationName.NeuroFluxGovernor);
    newNFG.level = 0;

    for (const nfg of ownedNFGs) {
      newNFG.level += nfg.level;
    }

    Player.augmentations = [
      ...Player.augmentations.filter((aug) => aug.name !== AugmentationName.NeuroFluxGovernor),
      newNFG,
    ];

    v22PlayerBreak();
    Player.reapplyAllAugmentations();
    Player.reapplyAllSourceFiles();
  }

  if (ver < 20) {
    // Create the darkweb for everyone but it won't be linked
    const dw = GetServer(SpecialServers.DarkWeb);
    if (!dw) {
      const darkweb = safelyCreateUniqueServer({
        ip: createUniqueRandomIp(),
        hostname: SpecialServers.DarkWeb,
        organizationName: "",
        isConnectedTo: false,
        adminRights: false,
        purchasedByPlayer: false,
        maxRam: 1,
      });
      AddToAllServers(darkweb);
    }
  }
  if (ver < 21) {
    // 2.0.0 work rework
    AwardNFG(10);
    const create = anyPlayer.createProgramName;
    if (create) Player.getHomeComputer().pushProgram(create);
    const graft = anyPlayer.graftAugmentationName;
    if (graft) Player.augmentations.push({ name: graft, level: 1 });
  }
  if (ver < 22) {
    v22PlayerBreak();
    v2APIBreak();
  }
  if (ver < 23) {
    anyPlayer.currentWork = null;
  }
  if (ver < 25) {
    const removePlayerFields = [
      "hacking_chance_mult",
      "hacking_speed_mult",
      "hacking_money_mult",
      "hacking_grow_mult",
      "hacking_mult",
      "strength_mult",
      "defense_mult",
      "dexterity_mult",
      "agility_mult",
      "charisma_mult",
      "hacking_exp_mult",
      "strength_exp_mult",
      "defense_exp_mult",
      "dexterity_exp_mult",
      "agility_exp_mult",
      "charisma_exp_mult",
      "company_rep_mult",
      "faction_rep_mult",
      "crime_money_mult",
      "crime_success_mult",
      "work_money_mult",
      "hacknet_node_money_mult",
      "hacknet_node_purchase_cost_mult",
      "hacknet_node_ram_cost_mult",
      "hacknet_node_core_cost_mult",
      "hacknet_node_level_cost_mult",
      "bladeburner_max_stamina_mult",
      "bladeburner_stamina_gain_mult",
      "bladeburner_analysis_mult",
      "bladeburner_success_chance_mult",
      "hacking_exp",
      "strength_exp",
      "defense_exp",
      "dexterity_exp",
      "agility_exp",
      "charisma_exp",
      "intelligence_exp",
      "companyName",
      "isWorking",
      "workType",
      "workCostMult",
      "workExpMult",
      "currentWorkFactionName",
      "currentWorkFactionDescription",
      "workHackExpGainRate",
      "workStrExpGainRate",
      "workDefExpGainRate",
      "workDexExpGainRate",
      "workAgiExpGainRate",
      "workChaExpGainRate",
      "workRepGainRate",
      "workMoneyGainRate",
      "workMoneyLossRate",
      "workHackExpGained",
      "workStrExpGained",
      "workDefExpGained",
      "workDexExpGained",
      "workAgiExpGained",
      "workChaExpGained",
      "workRepGained",
      "workMoneyGained",
      "createProgramName",
      "createProgramReqLvl",
      "graftAugmentationName",
      "timeWorkedGraftAugmentation",
      "className",
      "crimeType",
      "timeWorked",
      "timeWorkedCreateProgram",
      "timeNeededToCompleteWork",
      "factionWorkType",
      "committingCrimeThruSingFn",
      "singFnCrimeWorkerScript",
      "hacking",
      "max_hp",
      "strength",
      "defense",
      "dexterity",
      "agility",
      "charisma",
      "intelligence",
    ];
    const removeSleeveFields = [
      "gymStatType",
      "bbAction",
      "bbContract",
      "hacking",
      "strength",
      "defense",
      "dexterity",
      "agility",
      "charisma",
      "intelligence",
      "max_hp",
      "hacking_exp",
      "strength_exp",
      "defense_exp",
      "dexterity_exp",
      "agility_exp",
      "charisma_exp",
      "intelligence_exp",
      "hacking_mult",
      "strength_mult",
      "defense_mult",
      "dexterity_mult",
      "agility_mult",
      "charisma_mult",
      "hacking_exp_mult",
      "strength_exp_mult",
      "defense_exp_mult",
      "dexterity_exp_mult",
      "agility_exp_mult",
      "charisma_exp_mult",
      "hacking_chance_mult",
      "hacking_speed_mult",
      "hacking_money_mult",
      "hacking_grow_mult",
      "company_rep_mult",
      "faction_rep_mult",
      "crime_money_mult",
      "crime_success_mult",
      "work_money_mult",
      "hacknet_node_money_mult",
      "hacknet_node_purchase_cost_mult",
      "hacknet_node_ram_cost_mult",
      "hacknet_node_core_cost_mult",
      "hacknet_node_level_cost_mult",
      "bladeburner_max_stamina_mult",
      "bladeburner_stamina_gain_mult",
      "bladeburner_analysis_mult",
      "bladeburner_success_chance_mult",
      "className",
      "crimeType",
      "currentTask",
      "currentTaskLocation",
      "currentTaskMaxTime",
      "currentTaskTime",
      "earningsForSleeves",
      "earningsForPlayer",
      "earningsForTask",
      "factionWorkType",
      "gainRatesForTask",
      "logs",
    ];
    let intExp = Number(anyPlayer.intelligence_exp);
    if (isNaN(intExp)) intExp = 0;
    anyPlayer.exp.intelligence += intExp;
    for (const field of removePlayerFields) {
      delete anyPlayer[field];
    }
    for (const sleeve of anyPlayer.sleeves) {
      const anySleeve = sleeve;
      let intExp = Number(anySleeve.intelligence_exp);
      if (isNaN(intExp)) intExp = 0;
      anySleeve.exp.intelligence += intExp;
      for (const field of removeSleeveFields) {
        delete sleeve[field];
      }
    }
  }
  if (ver < 27) {
    // Prior to v2.2.0, sleeve shock was 0 to 100 internally but displayed as 100 to 0. This unifies them as 100 to 0.
    for (const sleeve of Player.sleeves) sleeve.shock = 100 - sleeve.shock;
  }
  // Some 2.3 changes are actually in BaseServer.js fromJSONBase function
  if (ver < 31) {
    Terminal.warn("Migrating to 2.3.0, loading with no scripts.");
    for (const server of GetAllServers()) {
      // Do not load any saved scripts on migration
      server.savedScripts = [];
    }
    if (anyPlayer.hashManager?.upgrades) {
      anyPlayer.hashManager.upgrades["Company Favor"] ??= 0;
    }
    if (!anyPlayer.lastAugReset || anyPlayer.lastAugReset === -1) {
      anyPlayer.lastAugReset = anyPlayer.lastUpdate - anyPlayer.playtimeSinceLastAug;
    }
    if (!anyPlayer.lastNodeRest || anyPlayer.lastNodeReset === -1) {
      anyPlayer.lastNodeReset = anyPlayer.lastUpdate - anyPlayer.playtimeSinceLastBitnode;
    }

    // Reset corporation to new format.
    const oldCorp = anyPlayer.corporation as Corporation | null | 0;
    if (oldCorp && Array.isArray(oldCorp.divisions)) {
      // Corp needs to be reset to new format, just keep some valuation data
      let valuation = oldCorp.valuation * 2 + oldCorp.revenue * 100;
      if (isNaN(valuation)) valuation = 300e9;
      Player.startCorporation(String(oldCorp.name), !!oldCorp.seedFunded);
      Player.corporation?.gainFunds(valuation, "force majeure");
      Terminal.warn("Loading corporation from version prior to 2.3. Corporation has been reset.");
    }
    // End 2.3 changes
  }
  //2.3 hotfix changes and 2.3.1 changes
  if (ver < 32) {
    // Sanitize corporation exports
    let anyExportsFailed = false;
    if (Player.corporation) {
      for (const division of Player.corporation.divisions.values()) {
        for (const warehouse of getRecordValues(division.warehouses)) {
          for (const material of getRecordValues(warehouse.materials)) {
            const originalExports = material.exports;
            // Clear all exports for the material
            material.exports = [];
            for (const originalExport of originalExports) {
              // Throw if there was a failure re-establishing an export
              try {
                const targetDivision = Player.corporation.divisions.get(originalExport.division);
                if (!targetDivision) throw new Error(`Target division ${originalExport.division} did not exist`);
                // Set the export again. ExportMaterial throws on failure
                exportMaterial(targetDivision, originalExport.city, material, originalExport.amount);
              } catch (e) {
                anyExportsFailed = true;
                // We just need the text error, not a full stack trace
                console.error(`Failed to load export of material ${material.name} (${division.name} ${warehouse.city})
Original export details: ${JSON.stringify(originalExport)}
Error: ${e}`);
              }
            }
          }
        }
      }
    }
    if (anyExportsFailed)
      Terminal.error(
        "Some material exports failed to validate while loading and have been removed. See console for more info.",
      );
  }
  if (ver < 33) {
    // 2.3.2 fixed what should be the last issue with scripts having the wrong server assigned..
    for (const server of GetAllServers()) {
      for (const script of server.scripts.values()) {
        if (script.server !== server.hostname) {
          console.warn(
            `Detected script ${script.filename} on ${server.hostname} with incorrect server property: ${script.server}. Repairing.`,
          );
          script.server = server.hostname;
        }
      }
    }
  }
  v2_60: if (ver < 38 && "go" in Player) {
    const goData = Player.go;
    // Remove outdated savedata
    delete Player.go;
    // Attempt to load back in at least the stats object. The current game will not be loaded.
    if (!goData || typeof goData !== "object") break v2_60;
    const stats = "status" in goData ? goData.status : "stats" in goData ? goData.stats : null;
    if (!stats || typeof stats !== "object") break v2_60;
    const freshSaveData = getGoSave();
    Object.assign(freshSaveData.stats, stats);
    loadGo(JSON.stringify(freshSaveData));
  }
  if (ver < 39) {
    showAPIBreaks("2.6.1", ...breakInfos261);
  }
}

async function loadGame(saveData: SaveData): Promise<boolean> {
  createScamUpdateText();
  if (!saveData) return false;
  const jsonSaveString = await decodeSaveData(saveData);

  const saveObj = JSON.parse(jsonSaveString, Reviver);

  setPlayer(loadPlayer(saveObj.PlayerSave));
  loadAllServers(saveObj.AllServersSave);
  loadCompanies(saveObj.CompaniesSave);
  loadFactions(saveObj.FactionsSave, Player);
  loadGo(saveObj.GoSave);

  if (Object.hasOwn(saveObj, "StaneksGiftSave")) {
    loadStaneksGift(saveObj.StaneksGiftSave);
  } else {
    console.warn(`Could not load Staneks Gift from save`);
    loadStaneksGift("");
  }
  if (Object.hasOwn(saveObj, "AliasesSave")) {
    try {
      loadAliases(saveObj.AliasesSave);
    } catch (e) {
      console.warn(`Could not load Aliases from save`);
      loadAliases("");
    }
  } else {
    console.warn(`Save file did not contain an Aliases property`);
    loadAliases("");
  }
  if (Object.hasOwn(saveObj, "GlobalAliasesSave")) {
    try {
      loadGlobalAliases(saveObj.GlobalAliasesSave);
    } catch (e) {
      console.warn(`Could not load GlobalAliases from save`);
      loadGlobalAliases("");
    }
  } else {
    console.warn(`Save file did not contain a GlobalAliases property`);
    loadGlobalAliases("");
  }
  if (Object.hasOwn(saveObj, "StockMarketSave")) {
    try {
      loadStockMarket(saveObj.StockMarketSave);
    } catch (e) {
      console.error("Couldn't load stock market:", e);
      loadStockMarket("");
    }
  } else {
    loadStockMarket("");
  }
  if (Object.hasOwn(saveObj, "SettingsSave")) {
    try {
      // Try to set saved settings.
      Settings.load(saveObj.SettingsSave);
    } catch (e) {
      console.error("SettingsSave was present but an error occurred while loading:");
      console.error(e);
    }
  }
  if (Object.hasOwn(saveObj, "LastExportBonus")) {
    try {
      ExportBonus.setLastExportBonus(JSON.parse(saveObj.LastExportBonus));
    } catch (err) {
      ExportBonus.setLastExportBonus(new Date().getTime());
      console.error("ERROR: Failed to parse last export bonus Settings " + err);
    }
  }
  if (Player.gang && Object.hasOwn(saveObj, "AllGangsSave")) {
    try {
      loadAllGangs(saveObj.AllGangsSave);
    } catch (e) {
      console.error("ERROR: Failed to parse AllGangsSave: " + e);
    }
  }
  if (Object.hasOwn(saveObj, "VersionSave")) {
    try {
      const ver = JSON.parse(saveObj.VersionSave, Reviver);
      evaluateVersionCompatibility(ver);
      if (CONSTANTS.isDevBranch) {
        // Beta branch, always show changes
        createBetaUpdateText();
      } else if (ver !== CONSTANTS.VersionNumber) {
        createNewUpdateText();
      }
    } catch (e) {
      console.error("Error upgrading versions:", e);
      createNewUpdateText();
    }
  } else {
    createNewUpdateText();
  }
  return true;
}

function createScamUpdateText(): void {
  if (navigator.userAgent.includes("wv") && navigator.userAgent.includes("Chrome/")) {
    setInterval(() => {
      dialogBoxCreate("SCAM ALERT. This app is not official and you should uninstall it.");
    }, 1000);
  }
}

function createNewUpdateText() {
  setTimeout(
    () =>
      dialogBoxCreate(
        "New update!\n" +
          "Please report any bugs/issues through the GitHub repository " +
          "or the Bitburner subreddit (reddit.com/r/bitburner).\n\n" +
          CONSTANTS.LatestUpdate,
      ),
    1000,
  );
}

function createBetaUpdateText() {
  setTimeout(
    () =>
      dialogBoxCreate(
        "You are playing on the beta environment! This branch of the game " +
          "features the latest developments in the game. This version may be unstable.\n" +
          "Please report any bugs/issues through the github repository (https://github.com/bitburner-official/bitburner-src/issues) " +
          "or the Bitburner subreddit (reddit.com/r/bitburner).\n\n" +
          CONSTANTS.LatestUpdate,
      ),
    1000,
  );
}

constructorsForReviver.BitburnerSaveObject = BitburnerSaveObject;

export { saveObject, loadGame };

const saveObject = new BitburnerSaveObject();
