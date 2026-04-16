import type { SaveData } from "./types";
import { isSaveData } from "./utils/TypeAssertion";

export class IndexedDBVersionError extends Error {
  constructor(message: string, options: ErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("This browser does not support IndexedDB"));
    }
    /**
     * DB is called bitburnerSave
     * Object store is called savestring
     * key for the Object store is called save
     * Version `2` is important. When increasing the version, remember to update the code in electron/export.html.
     *
     * Version 1 is the initial version. We found a bug that caused the database to be missing the expected object
     * store. In order to add the missing object store, we need to either increase the database version or delete and
     * recreate the database. Increasing the version number is simpler. For more information, please check
     * https://github.com/bitburner-official/bitburner-src/pull/2590
     */
    const indexedDbRequest: IDBOpenDBRequest = window.indexedDB.open("bitburnerSave", 2);

    // This is called when there's no db to begin with. It's important, don't remove it.
    indexedDbRequest.onupgradeneeded = function (this: IDBRequest<IDBDatabase>) {
      const db = this.result;
      if (db.objectStoreNames.contains("savestring")) {
        return;
      }
      db.createObjectStore("savestring");
    };

    indexedDbRequest.onerror = function (this: IDBRequest<IDBDatabase>) {
      if (this.error?.name === "VersionError") {
        reject(new IndexedDBVersionError(this.error.message, { cause: this.error }));
      }
      reject(this.error ?? new Error("Cannot open a connection to IndexedDB"));
    };
    indexedDbRequest.onblocked = function (this: IDBRequest<IDBDatabase>) {
      reject(
        new Error("Database in use by another tab. Please close all other Bitburner tabs.", { cause: this.error }),
      );
    };

    indexedDbRequest.onsuccess = function (this: IDBRequest<IDBDatabase>) {
      const db = this.result;
      // This should never happen unless the browser is buggy.
      if (!db) {
        reject(new Error("Database opened successfully, but the result is somehow falsy."));
        return;
      }
      resolve(db);
    };
  });
}

/**
 * Load the save data from IndexedDB.
 *
 * Note that if skipCheckingLoadedData is true, there is no guarantee the resolved data is valid SaveData. Only pass
 * true to skipCheckingLoadedData if you don't care if the loaded data is valid SaveData (e.g., download a backup of the
 * save data, regardless of what it is).
 *
 * @param skipCheckingLoadedData
 * @returns
 */
export async function load(skipCheckingLoadedData = false): Promise<SaveData | undefined> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["savestring"], "readonly");
    const rejectHandler = () => {
      reject(transaction.error ?? new Error("Cannot load game data. Transaction aborted or encountered an error."));
    };
    transaction.onerror = rejectHandler;
    transaction.onabort = rejectHandler;

    const objectStore = transaction.objectStore("savestring");
    const request = objectStore.get("save");

    request.onsuccess = function () {
      const result: unknown = request.result;
      // In some cases, we don't care if the loaded data is valid SaveData.
      if (skipCheckingLoadedData) {
        resolve(result as SaveData | undefined);
        return;
      }
      if (result !== undefined && !isSaveData(result)) {
        console.error("Invalid save data in IndexedDB:", result);
        reject(new Error("Save data exists, but its type is invalid."));
        return;
      }
      resolve(result);
    };
  });
}

export async function save(saveData: SaveData): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["savestring"], "readwrite");
    const rejectHandler = () => {
      reject(transaction.error ?? new Error("Cannot save game data. Transaction aborted or encountered an error."));
    };
    transaction.onerror = rejectHandler;
    transaction.onabort = rejectHandler;

    const objectStore = transaction.objectStore("savestring");
    objectStore.put(saveData, "save");

    // transaction.oncomplete is used instead of request.onsuccess to ensure durability.
    // A request can succeed in memory, but the transaction may still fail to commit due to disk I/O errors, quota
    // limits, or system interruptions.
    transaction.oncomplete = () => resolve();
  });
}

export function deleteGame(): Promise<void> {
  const request = window.indexedDB.deleteDatabase("bitburnerSave");
  return new Promise((resolve, reject) => {
    request.onerror = function () {
      reject(request.error ?? new Error("Cannot delete save data"));
    };
    request.onblocked = function () {
      reject(new Error("Database in use by another tab. Please close all other Bitburner tabs."));
    };

    request.onsuccess = () => resolve();
  });
}
