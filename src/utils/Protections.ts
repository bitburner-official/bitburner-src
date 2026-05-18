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
  });
}

// Some players use really old browser versions on unsupported OSes such as Windows 7. Intl.Segmenter and other APIs are
// not supported in these browsers, so they will only see a black screen when loading the game. We should show an alert
// to notify them that they should update their browser, if possible.
if (typeof Intl.Segmenter !== "function") {
  alert(`Your browser is too outdated. Please update your browser.\n\nUserAgent: ${navigator.userAgent}`);
}
