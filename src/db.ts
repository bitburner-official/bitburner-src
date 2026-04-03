import type { SaveData } from "./types";

export class IndexedDBVersionError extends Error {
  constructor(message: string, options: ErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

function getDB(): Promise<IDBObjectStore> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject("Indexed DB does not exists");
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
      reject(this.error ?? new Error("Failed to get IDB"));
    };

    indexedDbRequest.onsuccess = function (this: IDBRequest<IDBDatabase>) {
      const db = this.result;
      if (!db) {
        reject(new Error("database loading result was undefined"));
        return;
      }
      resolve(db.transaction(["savestring"], "readwrite").objectStore("savestring"));
    };
  });
}

export function load(): Promise<SaveData> {
  return getDB().then((db) => {
    return new Promise<SaveData>((resolve, reject) => {
      const request = db.get("save") as IDBRequest<SaveData>;
      request.onerror = function (this: IDBRequest<SaveData>) {
        reject(new Error("Error in Database request to get save data", { cause: this.error }));
      };

      request.onsuccess = function (this: IDBRequest<SaveData>) {
        resolve(this.result);
      };
    });
  });
}

export function save(saveData: SaveData): Promise<void> {
  return getDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      // We'll save to IndexedDB
      const request = db.put(saveData, "save");

      request.onerror = function (this: IDBRequest<IDBValidKey>) {
        reject(new Error("Error saving game to IndexedDB", { cause: this.error }));
      };

      request.onsuccess = () => resolve();
    });
  });
}

export function deleteGame(): Promise<void> {
  return getDB().then((db) => {
    db.delete("save");
  });
}
