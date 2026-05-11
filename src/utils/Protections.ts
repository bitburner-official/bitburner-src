// This file is imported for side effects only.
/* Prevent inadvertently redefining certain window properties,
   which are known to cause unrecoverable game errors when redefined.
   The player is able to redefine these properties as writable if desired. */
Object.defineProperties(window, {
  Number: { writable: false },
  Object: { writable: false },
  String: { writable: false },
});

// Prevent accidentally manipulating IndexedDB APIs.
Object.freeze(IDBFactory.prototype);
Object.freeze(IDBDatabase.prototype);
Object.freeze(IDBTransaction.prototype);
Object.freeze(IDBObjectStore.prototype);
Object.freeze(IDBRequest.prototype);
Object.freeze(IDBOpenDBRequest.prototype);
if (window.indexedDB) {
  Object.freeze(window.indexedDB);
  Object.defineProperty(window, "indexedDB", {
    value: window.indexedDB,
    writable: false,
    configurable: false,
  });
}
