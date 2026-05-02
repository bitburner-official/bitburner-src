/** @import { BrowserWindow } from "electron" */
/** @typedef {string | Uint8Array} SaveData */
/* eslint-disable @typescript-eslint/no-var-requires */
const { app, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs/promises");

const log = require("electron-log");
const flatten = require("lodash/flatten");
const Store = require("electron-store");
const { decodeBase64BytesToBytes, isBinaryFormat, isSteamCloudFormat } = require("./saveDataBinaryFormat");
const store = new Store();
const { steamworksClient } = require("./steamworksUtils");

/** @param {string} directory */
// https://stackoverflow.com/a/69418940
const dirSize = async (directory) => {
  const files = await fs.readdir(directory);
  const stats = files.map((file) => fs.stat(path.join(directory, file)));
  return (await Promise.all(stats)).reduce((accumulator, { size }) => accumulator + size, 0);
};

/** @param {string} directory */
const getDirFileStats = async (directory) => {
  const files = await fs.readdir(directory);
  const stats = files.map((f) => {
    const file = path.join(directory, f);
    return fs.stat(file).then((stat) => ({ file, stat }));
  });
  const data = await Promise.all(stats);
  return data;
};

/** @param {string} directory */
const getNewestFile = async (directory) => {
  const data = await getDirFileStats(directory);
  return data.sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime())[0];
};

/** @param {BrowserWindow} window */
const getAllSaves = async (window) => {
  const rootDirectory = getSaveFolder(window, true);
  const data = await fs.readdir(rootDirectory, { withFileTypes: true });
  const savesPromises = data
    .filter((e) => e.isDirectory())
    .map((dir) => path.join(rootDirectory, dir.name))
    .map((dir) => getDirFileStats(dir));
  const saves = await Promise.all(savesPromises);
  const flat = flatten(saves);
  return flat;
};

/** @param {BrowserWindow} window */
async function prepareSaveFolders(window) {
  const rootFolder = getSaveFolder(window, true);
  const currentFolder = getSaveFolder(window);
  const backupsFolder = path.join(rootFolder, "/_backups");
  await prepareFolders(rootFolder, currentFolder, backupsFolder);
}

/** @param {...string} folders */
async function prepareFolders(...folders) {
  for (const folder of folders) {
    try {
      // Making sure the folder exists
      await fs.stat(folder);
    } catch (error) {
      // @ts-expect-error - Node.js guarantees that errors thrown by its APIs are instances of the standard Error class
      // and include an error.code property.
      if (error.code === "ENOENT") {
        log.warn(`'${folder}' not found, creating it...`);
        await fs.mkdir(folder);
      } else {
        log.error(error);
      }
    }
  }
}

// TODO: Check callers of this function. They currently don't properly handle the case where this function returns
// undefined due to errors when reading folder stats.
/** @param {string} saveFolder */
async function getFolderSizeInBytes(saveFolder) {
  try {
    return await dirSize(saveFolder);
  } catch (error) {
    log.error(error);
  }
}

/** @param {boolean} value */
function setAutosaveConfig(value) {
  store.set("autosave-enabled", value);
}

function isAutosaveEnabled() {
  return store.get("autosave-enabled", true);
}

/** @param {boolean} value */
function setCloudEnabledConfig(value) {
  store.set("cloud-enabled", value);
}

function isMenuHideEnabled() {
  return store.get("autoHideMenuBar", false);
}

/** @param {boolean} value */
function setMenuHideConfig(value) {
  return store.set("autoHideMenuBar", value);
}

/**
 * @param {BrowserWindow} window
 * @param {boolean} [root]
 */
function getSaveFolder(window, root = false) {
  if (root) {
    return path.join(app.getPath("userData"), "/saves");
  }
  // TODO: check undefined gameInfo case
  const identifier = window.gameInfo?.player?.identifier ?? "";
  return path.join(app.getPath("userData"), "/saves", `/${identifier}`);
}

function isCloudEnabled() {
  // If the Steam API could not be initialized on game start, we'll abort this.
  if (!steamworksClient) {
    return false;
  }

  // If the user disables it in Steam there's nothing we can do
  if (!steamworksClient.cloud.isEnabledForAccount()) {
    return false;
  }

  // Let's check the config file to see if it's been overridden
  if (!store.get("cloud-enabled", true)) {
    return false;
  }

  if (!steamworksClient.cloud.isEnabledForApp()) {
    steamworksClient.cloud.setEnabledForApp(true);
  }

  return true;
}

/**
 * @param {string} name
 * @param {string} content
 */
function saveCloudFile(name, content) {
  if (!steamworksClient) {
    return;
  }
  const result = steamworksClient.cloud.writeFile(name, content);
  if (!result) {
    log.warn(`Cannot write Steam Cloud save file: ${name}`);
  }
}

/** @param {import("@catloversg/steamworks.js/client").cloud.FileInfo[]} files */
function logCloudFiles(files) {
  for (const file of files) {
    log.debug(
      `Name: ${file.name}. Size: ${file.size}. ` +
        `isFilePersisted: ${steamworksClient?.cloud.isFilePersisted(file.name)}. ` +
        `timestamp: ${steamworksClient?.cloud.fileTimestamp(file.name)}`,
    );
  }
}

function getFilenameOfMostRecentlyPersistedCloudFile() {
  if (!steamworksClient) {
    return null;
  }
  const files = steamworksClient.cloud.listFiles();
  if (files.length === 0) {
    return null;
  }
  const filteredFiles = files
    // @ts-expect-error - https://github.com/microsoft/TypeScript/issues/9998
    .filter((file) => steamworksClient.cloud.isFilePersisted(file.name))
    .map((file) => ({
      file,
      // @ts-expect-error - https://github.com/microsoft/TypeScript/issues/9998
      timestamp: steamworksClient.cloud.fileTimestamp(file.name),
    }))
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((item) => item.file);
  if (filteredFiles.length === 0) {
    log.warn("Found cloud file(s) but none are persisted");
    logCloudFiles(files);
    return null;
  }
  if (filteredFiles.length > 1) {
    log.warn("Found more than 1 persisted cloud file");
    logCloudFiles(files);
  }
  const file = filteredFiles[0];
  log.debug(`Found ${filteredFiles.length} files.`);
  log.debug(`First File: ${file.name} (${file.size} bytes)`);
  return file.name;
}

function getCloudFile() {
  if (!steamworksClient) {
    return null;
  }
  const filename = getFilenameOfMostRecentlyPersistedCloudFile();
  if (filename === null) {
    return null;
  }
  return steamworksClient.cloud.readFile(filename);
}

function deleteCloudFiles() {
  if (!steamworksClient) {
    return;
  }
  for (const file of steamworksClient.cloud.listFiles()) {
    if (steamworksClient.cloud.deleteFile(file.name)) {
      log.info(`Deleted Steam cloud file: ${file.name}`);
    } else {
      log.warn(`Cannot delete Steam cloud file: ${file.name}`);
    }
  }
}

/** @param {string} currentPlayerId */
async function backupSteamDataToDisk(currentPlayerId) {
  if (!steamworksClient) {
    return;
  }
  const files = steamworksClient.cloud.listFiles();
  if (files.length === 0) {
    return;
  }

  const file = files[0];
  const previousPlayerId = file.name.replace(".json.gz", "");
  if (previousPlayerId !== currentPlayerId) {
    const backupSaveData = await getSteamCloudSaveData();
    const backupFile = path.join(app.getPath("userData"), "/saves/_backups", `${previousPlayerId}.json.gz`);
    await fs.writeFile(backupFile, backupSaveData, "utf8");
    log.debug(`Saved backup game to '${backupFile}`);
  }
}

/**
 * The name of save file is `${currentPlayerId}.json.gz`. The content of save file is weird: it's a base64 string of the
 * binary data of compressed json save string. It's weird because the extension is .json.gz while the content is a
 * base64 string. Check the comments in the implementation to see why it is like that.
 *
 * @param {SaveData} saveData
 * @param {string} currentPlayerId
 * @returns
 */
async function pushSaveDataToSteamCloud(saveData, currentPlayerId) {
  // TODO: Check whether we really need to throw an error here or if we can log and return.
  if (!isCloudEnabled()) {
    throw new Error("Steam Cloud is not enabled");
  }

  // TODO: Refactor this function and backupSteamDataToDisk. backupSteamDataToDisk is not really useful (it tries to
  // back up the first cloud file). In the case of having multiple cloud files, calling backupSteamDataToDisk and
  // saveCloudFile like this is useless.
  try {
    await backupSteamDataToDisk(currentPlayerId);
  } catch (error) {
    log.error("Cannot back up Steam data to disk", error);
  }

  const steamSaveName = `${currentPlayerId}.json.gz`;

  /**
   * When we push save file to Steam Cloud, we use steamworksClient.cloud.writeFile. This function requires a string as
   * the file content. That is why saveData is encoded in base64 and pushed to Steam Cloud as a text file.
   *
   * Encoding saveData in UTF-8 (with buffer.toString("utf8")) is not the proper way to convert binary data to string.
   * Quote from buffer's documentation: "If encoding is 'utf8' and a byte sequence in the input is not valid UTF-8, then
   * each invalid byte is replaced with the replacement character U+FFFD.". The proper way to do it is to use
   * String.fromCharCode or String.fromCodePoint.
   *
   * Instead of implementing it, the old code (encoding in base64) is used here for backward compatibility.
   */
  const content = Buffer.from(saveData).toString("base64");
  log.debug(`saveData: ${saveData.length} bytes`);
  log.debug(`Base64 string of saveData: ${content.length} bytes`);
  log.debug(`Saving to Steam Cloud as ${steamSaveName}`);

  try {
    saveCloudFile(steamSaveName, content);
  } catch (error) {
    log.error("Cannot save cloud file", error);
  }
}

/**
 * This function processes the save file in Steam Cloud and returns the save data in the binary format.
 */
async function getSteamCloudSaveData() {
  if (!isCloudEnabled()) {
    throw new Error("Steam Cloud is not enabled");
  }
  log.debug("Fetching Save in Steam Cloud");
  const cloudString = getCloudFile();
  // TODO: Refactor this function and its callers. Not having a cloud file is a valid case.
  if (cloudString === null) {
    throw new Error("Cannot get cloud file");
  }
  // Decode cloudString to get save data back.
  const saveData = Buffer.from(cloudString, "base64");
  log.debug(`SaveData: ${saveData.length} bytes`);
  return saveData;
}

/**
 * @param {BrowserWindow} window
 * @param {{save: SaveData, fileName: string}} electronGameData
 * @returns
 */
async function saveGameToDisk(window, electronGameData) {
  const currentFolder = getSaveFolder(window);
  let saveFolderSizeBytes = await getFolderSizeInBytes(currentFolder);
  const maxFolderSizeBytes = store.get("autosave-quota", 1e8); // 100Mb
  const remainingSpaceBytes = maxFolderSizeBytes - saveFolderSizeBytes;
  log.debug(`Folder Usage: ${saveFolderSizeBytes} bytes`);
  log.debug(`Folder Capacity: ${maxFolderSizeBytes} bytes`);
  log.debug(
    `Remaining: ${remainingSpaceBytes} bytes (${((saveFolderSizeBytes / maxFolderSizeBytes) * 100).toFixed(2)}% used)`,
  );
  let saveData = electronGameData.save;
  const file = path.join(currentFolder, electronGameData.fileName);
  try {
    await fs.writeFile(file, saveData, "utf8");
    log.debug(`Saved Game to '${file}'`);
    log.debug(`Save Size: ${saveData.length} bytes`);
  } catch (error) {
    log.error(error);
  }

  const fileStats = await getDirFileStats(currentFolder);
  const oldestFiles = fileStats
    .sort((a, b) => a.stat.mtime.getTime() - b.stat.mtime.getTime())
    .map((f) => f.file)
    .filter((f) => f !== file);

  while (saveFolderSizeBytes > maxFolderSizeBytes && oldestFiles.length > 0) {
    const fileToRemove = oldestFiles.shift();
    log.debug(`Over Quota -> Removing "${fileToRemove}"`);
    try {
      await fs.unlink(fileToRemove);
    } catch (error) {
      log.error(error);
    }

    saveFolderSizeBytes = await getFolderSizeInBytes(currentFolder);
    log.debug(`Save Folder: ${saveFolderSizeBytes} bytes`);
    log.debug(
      `Remaining: ${maxFolderSizeBytes - saveFolderSizeBytes} bytes (${(
        (saveFolderSizeBytes / maxFolderSizeBytes) *
        100
      ).toFixed(2)}% used)`,
    );
  }

  return file;
}

/** @param {BrowserWindow} window */
async function loadLastFromDisk(window) {
  const folder = getSaveFolder(window);
  const last = await getNewestFile(folder);
  log.debug(`Last modified file: "${last.file}" (${last.stat.mtime.toLocaleString()})`);
  return loadFileFromDisk(last.file);
}

/** @param {string} path */
async function loadFileFromDisk(path) {
  const buffer = await fs.readFile(path);
  let content;
  if (isBinaryFormat(buffer)) {
    // Save file is in the binary format.
    content = buffer;
  } else if (isSteamCloudFormat(buffer)) {
    // Save file is in the Steam Cloud format.
    content = decodeBase64BytesToBytes(buffer);
  } else {
    // Save file is in the base64 format.
    content = buffer.toString("utf8");
  }
  log.debug(`Loaded file with ${content.length} bytes`);
  return content;
}

/**
 * @param {BrowserWindow} window
 * @param {SaveData} save
 */
function getSaveInformation(window, save) {
  return new Promise((resolve) => {
    ipcMain.once("get-save-info-response", (__event, data) => {
      resolve(data);
    });
    window.webContents.send("get-save-info-request", save);
  });
}

/** @param {BrowserWindow} window */
function getCurrentSave(window) {
  return new Promise((resolve) => {
    ipcMain.once("get-save-data-response", (__event, data) => {
      resolve(data);
    });
    window.webContents.send("get-save-data-request");
  });
}

/**
 * @param {BrowserWindow} window
 * @param {SaveData} save
 * @param {boolean} automatic
 */
function pushSaveGameForImport(window, save, automatic) {
  ipcMain.once("push-import-result", (__event, arg) => {
    log.debug(`Was save imported? ${arg.wasImported ? "Yes" : "No"}`);
  });
  window.webContents.send("push-save-request", { save, automatic });
}

/** @param {BrowserWindow} window */
async function restoreIfNewerExists(window) {
  const currentSave = await getCurrentSave(window);
  const currentData = await getSaveInformation(window, currentSave.save);
  const steam = {};
  const disk = {};

  if (isCloudEnabled()) {
    // TODO: Check if we can refactor to avoid using a try-catch block.
    try {
      steam.save = await getSteamCloudSaveData();
      steam.data = await getSaveInformation(window, steam.save);
    } catch (error) {
      log.error("Could not retrieve Steam cloud file", error);
    }
  }

  try {
    const saves = (await getAllSaves(window)).sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime());
    if (saves.length > 0) {
      disk.save = await loadFileFromDisk(saves[0].file);
      disk.data = await getSaveInformation(window, disk.save);
    }
  } catch (error) {
    log.error("Could not retrieve disk file");
    log.debug(error);
  }

  const lowPlaytime = 1000 * 60 * 15;
  let bestMatch;
  if (!steam.data && !disk.data) {
    log.info("No data to import");
  } else if (!steam.data) {
    // We'll just compare using the lastSave field for now.
    log.debug("Best potential save match: Disk");
    bestMatch = disk;
  } else if (!disk.data) {
    log.debug("Best potential save match: Steam Cloud");
    bestMatch = steam;
  } else if (steam.data.lastSave >= disk.data.lastSave || steam.data.playtime + lowPlaytime > disk.data.playtime) {
    // We want to prioritze steam data if the playtime is very close
    log.debug("Best potential save match: Steam Cloud");
    bestMatch = steam;
  } else {
    log.debug("Best potential save match: disk");
    bestMatch = disk;
  }
  if (bestMatch) {
    if (bestMatch.data.lastSave > currentData.lastSave + 5000) {
      // We add a few seconds to the currentSave's lastSave to prioritize it
      log.info("Found newer data than the current's save file");
      log.silly(bestMatch.data);
      pushSaveGameForImport(window, bestMatch.save, true);
      return true;
    } else if (bestMatch.data.playtime > currentData.playtime && currentData.playtime < lowPlaytime) {
      log.info("Found older save, but with more playtime, and current less than 15 mins played");
      log.silly(bestMatch.data);
      pushSaveGameForImport(window, bestMatch.save, true);
      return true;
    } else {
      log.debug("Current save data is the freshest");
      return false;
    }
  }
}

module.exports = {
  getCurrentSave,
  getSaveInformation,
  restoreIfNewerExists,
  pushSaveGameForImport,
  pushSaveDataToSteamCloud,
  getSteamCloudSaveData,
  deleteCloudFiles,
  saveGameToDisk,
  loadLastFromDisk,
  loadFileFromDisk,
  getSaveFolder,
  prepareSaveFolders,
  getAllSaves,
  isCloudEnabled,
  setCloudEnabledConfig,
  isAutosaveEnabled,
  setAutosaveConfig,
  isMenuHideEnabled,
  setMenuHideConfig,
};
