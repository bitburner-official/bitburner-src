import { Skills } from "@nsdefs";

import { loadAliases, loadGlobalAliases, Aliases, GlobalAliases } from "./Alias";
import { getCompaniesSave, loadCompanies } from "./Company/Companies";
import { CONSTANTS } from "./Constants";
import { getFactionsSave, loadFactions } from "./Faction/Factions";
import { loadAllGangs, AllGangs } from "./Gang/AllGangs";
import { Player, setPlayer, loadPlayer } from "./Player";
import { saveAllServers, loadAllServers } from "./Server/AllServers";
import { Settings } from "./Settings/Settings";
import { loadStockMarket, StockMarket } from "./StockMarket/StockMarket";
import { staneksGift, loadStaneksGift } from "./CotMG/Helper";

import { SnackbarEvents } from "./ui/React/Snackbar";

import * as ExportBonus from "./ExportBonus";

import { dialogBoxCreate } from "./ui/React/DialogBox";
import { constructorsForReviver, Generic_toJSON, Generic_fromJSON, type IReviverValue } from "./utils/JSONReviver";
import { save } from "./db";
import { ToastVariant } from "@enums";
import { pushGameSaved, pushImportResult } from "./Electron";
import { getGoSave, loadGo } from "./Go/SaveLoad";
import { SaveData } from "./types";
import { SaveDataError, canUseBinaryFormat, decodeSaveData, encodeJsonSaveString } from "./utils/SaveDataUtils";
import { isBinaryFormat } from "../electron/saveDataBinaryFormat";
import { downloadContentAsFile } from "./utils/FileUtils";
import { handleGetSaveDataInfoError } from "./utils/ErrorHandler";
import { isObject, assertObject } from "./utils/TypeAssertion";
import { evaluateVersionCompatibility } from "./utils/SaveDataMigrationUtils";
import { Reviver } from "./utils/GenericReviver";
import { giveExportBonus } from "./ExportBonus";
import { loadInfiltrations } from "./Infiltration/SaveLoadInfiltration";
import { InfiltrationState } from "./Infiltration/formulas/game";

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
  syncSteamAchievements: boolean;
}

export type BitburnerSaveObjectType = {
  PlayerSave: string;
  AllServersSave: string;
  CompaniesSave: string;
  FactionsSave: string;
  AliasesSave: string;
  GlobalAliasesSave: string;
  StockMarketSave: string;
  SettingsSave?: string;
  VersionSave?: string;
  AllGangsSave?: string;
  LastExportBonus?: string;
  StaneksGiftSave: string;
  GoSave: unknown; // "loadGo" function can process unknown data
  InfiltrationsSave: unknown;
};

type ParsedSaveData = {
  data: {
    PlayerSave: string;
    SettingsSave: unknown;
  };
};

/**
 * This function asserts the unknown saveObject.
 *
 * In "loadGame", we parse a json save string to saveObject, then load data from this object. When we do that, we have
 * to ensure that this object contains valid data. Due to how "loadGame" uses other "loader" functions, we split
 * properties of saveObject into 3 groups:
 * - "Mandatory". "loadGame" always loads these properties. The respective loaders require string values. We assert
 * that the values are strings.
 * - "Optional 1": "loadGame" always loads these properties. The respective loaders require string values, but they have
 * special handlers for the empty string case. These handlers might be designed as a "safety net" for invalid/legacy
 * save data. If saveObject does not have these properties, we will only print a warning, then use an empty string as a
 * fallback value; otherwise, we check if their values are strings.
 * - "Optional 2": "loadGame" only loads these properties if they exist. The respective loaders require string values.
 * If saveObject has these properties, we check if their values are strings.
 */
function assertBitburnerSaveObjectType(saveObject: unknown): asserts saveObject is BitburnerSaveObjectType {
  assertObject(saveObject);

  const mandatoryKeysOfSaveObj = [
    "PlayerSave",
    "AllServersSave",
    "CompaniesSave",
    "FactionsSave",
    "AliasesSave",
    "GlobalAliasesSave",
  ];
  for (const key of mandatoryKeysOfSaveObj) {
    const value = saveObject[key];
    if (typeof value !== "string") {
      throw new Error(`Save data contains invalid data. Value of ${key} is not a string.`);
    }
  }

  const optional1KeysOfSaveObj = ["StaneksGiftSave", "StockMarketSave"];
  for (const key of optional1KeysOfSaveObj) {
    if (Object.hasOwn(saveObject, key)) {
      if (typeof saveObject[key] !== "string") {
        throw new Error(`Save data contains invalid data. Value of ${key} is not a string.`);
      }
    } else {
      console.warn(`Save data does not have ${key}.`);
      saveObject[key] = "";
    }
  }

  const optional2KeysOfSaveObj = ["SettingsSave", "LastExportBonus", "AllGangsSave", "VersionSave"];
  for (const key of optional2KeysOfSaveObj) {
    if (Object.hasOwn(saveObject, key) && typeof saveObject[key] !== "string") {
      throw new Error(`Save data contains invalid data. Value of ${key} is not a string.`);
    }
  }
}

function assertParsedSaveData(parsedSaveData: unknown): asserts parsedSaveData is ParsedSaveData {
  if (
    !isObject(parsedSaveData) ||
    parsedSaveData.ctor !== "BitburnerSaveObject" ||
    !isObject(parsedSaveData.data) ||
    typeof parsedSaveData.data.PlayerSave !== "string"
  ) {
    console.error("parsedSaveData:", parsedSaveData);
    throw new Error("The parsed save data is not valid.");
  }
}

class BitburnerSaveObject implements BitburnerSaveObjectType {
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
  InfiltrationsSave = "";

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
    this.InfiltrationsSave = JSON.stringify(InfiltrationState);

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
      handleGetSaveDataInfoError(error);
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
    // Give the export bonus before exporting the save data
    giveExportBonus();
    let saveData;
    try {
      saveData = await this.getSaveData();
    } catch (error) {
      handleGetSaveDataInfoError(error);
      return;
    }
    const filename = this.getSaveFileName();
    downloadContentAsFile(saveData, filename);
  }

  async importGame(
    saveData: SaveData,
    overrideSettings?: {
      SyncSteamAchievements: boolean;
    },
  ): Promise<void> {
    if (!saveData || saveData.length === 0) {
      dialogBoxCreate("Invalid save data");
      return;
    }
    // Modify settings in save data if needed (i.e., toggle SyncSteamAchievements before importing).
    if (overrideSettings) {
      let parsedSaveData;
      try {
        parsedSaveData = await this.getParsedSaveData(saveData);
        // Validate SettingsSave
        if (parsedSaveData.data.SettingsSave && typeof parsedSaveData.data.SettingsSave === "string") {
          // Parse settings from data.SettingsSave
          const settings: unknown = JSON.parse(parsedSaveData.data.SettingsSave);
          assertObject(settings);
          // Modify setting
          settings.SyncSteamAchievements = overrideSettings.SyncSteamAchievements;
          // Save modified data back to saveData
          parsedSaveData.data.SettingsSave = JSON.stringify(settings);
          saveData = await encodeJsonSaveString(JSON.stringify(parsedSaveData));
        }
      } catch (error) {
        console.error(error);
        dialogBoxCreate(`Cannot override settings: ${error}`);
        return;
      }
    }
    try {
      await save(saveData);
      /**
       * Notify Electron code that the player imported a save file. "restoreIfNewerExists" will be disabled for a brief
       * period of time.
       */
      pushImportResult(true);
    } catch (error) {
      console.error(error);
      dialogBoxCreate(`Cannot import save data: ${error}`);
      return;
    }
    setTimeout(() => location.reload(), 1000);
  }

  async getSaveDataFromFile(files: FileList | null): Promise<SaveData> {
    if (files === null) {
      throw new Error("No file selected");
    }
    const file = files[0];
    if (!file) {
      throw new Error("Invalid file selected");
    }

    const rawData = new Uint8Array(await file.arrayBuffer());
    if (isBinaryFormat(rawData)) {
      return rawData;
    }
    return new TextDecoder().decode(rawData);
  }

  async getParsedSaveData(saveData: SaveData): Promise<ParsedSaveData> {
    if (!saveData || saveData.length === 0) {
      throw new Error("Invalid save data");
    }

    if (typeof saveData === "string" && saveData.startsWith(`{"ctor"`)) {
      throw new Error(
        "The save data is invalid. You must import the original save file. If it's a .gz file, don't decompress it.",
      );
    }

    let decodedSaveData;
    try {
      decodedSaveData = await decodeSaveData(saveData);
    } catch (error) {
      console.error(error);
      // Rethrow immediately if the error is SaveDataError; otherwise, handle it below.
      if (error instanceof SaveDataError) {
        throw error;
      }
    }

    if (!decodedSaveData || decodedSaveData === "") {
      console.error("decodedSaveData:", decodedSaveData);
      console.error("saveData:", saveData);
      throw new Error("The save data cannot be decoded.");
    }

    let parsedSaveData: unknown;
    try {
      parsedSaveData = JSON.parse(decodedSaveData);
    } catch (error) {
      console.error("decodedSaveData:", decodedSaveData);
      throw new Error("The decoded save data is not valid.");
    }

    assertParsedSaveData(parsedSaveData);

    return parsedSaveData;
  }

  async getImportDataFromSaveData(saveData: SaveData): Promise<ImportData> {
    const parsedSaveData = await this.getParsedSaveData(saveData);

    const data: ImportData = {
      saveData: saveData,
    };

    const importedPlayer = loadPlayer(parsedSaveData.data.PlayerSave);

    let syncSteamAchievements = true;
    // Parse data.SettingsSave to get syncSteamAchievements.
    if (parsedSaveData.data.SettingsSave && typeof parsedSaveData.data.SettingsSave === "string") {
      try {
        const settings: unknown = JSON.parse(parsedSaveData.data.SettingsSave);
        assertObject(settings);
        if (typeof settings.SyncSteamAchievements === "boolean") {
          syncSteamAchievements = settings.SyncSteamAchievements;
        }
      } catch (error) {
        console.error(error);
      }
    }

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

      syncSteamAchievements,
    };

    data.playerData = playerData;
    return data;
  }

  toJSON(): IReviverValue {
    return Generic_toJSON("BitburnerSaveObject", this);
  }

  static fromJSON(value: IReviverValue): BitburnerSaveObject {
    return Generic_fromJSON(BitburnerSaveObject, value.data);
  }
}

async function loadGame(saveData: SaveData): Promise<boolean> {
  createScamUpdateText();
  if (!saveData) {
    return false;
  }
  const jsonSaveString = await decodeSaveData(saveData);

  const saveObj: unknown = JSON.parse(jsonSaveString, Reviver);
  assertBitburnerSaveObjectType(saveObj);

  // "Mandatory"
  setPlayer(loadPlayer(saveObj.PlayerSave));
  loadAllServers(saveObj.AllServersSave);
  loadCompanies(saveObj.CompaniesSave);
  loadFactions(saveObj.FactionsSave, Player);
  loadGo(saveObj.GoSave);
  loadInfiltrations(saveObj.InfiltrationsSave);
  try {
    loadAliases(saveObj.AliasesSave);
  } catch (e) {
    console.warn(`Could not load Aliases from save`);
  }
  try {
    loadGlobalAliases(saveObj.GlobalAliasesSave);
  } catch (e) {
    console.warn(`Could not load GlobalAliases from save`);
  }

  // "Optional 1"
  loadStaneksGift(saveObj.StaneksGiftSave);
  try {
    loadStockMarket(saveObj.StockMarketSave);
  } catch (e) {
    console.error("Couldn't load stock market:", e);
    loadStockMarket("");
  }

  // "Optional 2"
  if (saveObj.SettingsSave) {
    try {
      // Try to set saved settings.
      Settings.load(saveObj.SettingsSave);
    } catch (e) {
      console.error("SettingsSave was present but an error occurred while loading:");
      console.error(e);
    }
  }
  if (saveObj.LastExportBonus) {
    try {
      const lastExportBonus: unknown = JSON.parse(saveObj.LastExportBonus);
      if (typeof lastExportBonus !== "number" || !Number.isFinite(lastExportBonus)) {
        throw new Error(`Invalid LastExportBonus: ${saveObj.LastExportBonus}`);
      }
      ExportBonus.setLastExportBonus(lastExportBonus);
    } catch (error) {
      ExportBonus.setLastExportBonus(new Date().getTime());
      console.error(`ERROR: Failed to parse last export bonus setting. Error: ${error}.`, error);
    }
  }
  if (Player.gang && saveObj.AllGangsSave) {
    try {
      loadAllGangs(saveObj.AllGangsSave);
    } catch (error) {
      console.error(`ERROR: Failed to parse AllGangsSave. Error: ${error}.`, error);
    }
  }
  if (saveObj.VersionSave) {
    try {
      const ver: unknown = JSON.parse(saveObj.VersionSave, Reviver);
      if (typeof ver !== "string" && typeof ver !== "number") {
        throw new Error(`Invalid VersionSave: ${saveObj.VersionSave}`);
      }
      await evaluateVersionCompatibility(ver);
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
          "Please report any bugs/issues through the GitHub repository (https://github.com/bitburner-official/bitburner-src/issues) " +
          "or the #bug-report channel on Discord (https://discord.com/channels/415207508303544321/415213413745164318).\n\n" +
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
          "or the #bug-report channel on Discord (https://discord.com/channels/415207508303544321/415213413745164318).\n\n" +
          CONSTANTS.LatestUpdate,
      ),
    1000,
  );
}

constructorsForReviver.BitburnerSaveObject = BitburnerSaveObject;

export { saveObject, loadGame };

const saveObject = new BitburnerSaveObject();
