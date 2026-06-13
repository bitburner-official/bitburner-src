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
if (typeof Intl.Segmenter !== "function" || typeof String.prototype.toWellFormed !== "function") {
  const errorMessage = `Your browser is too outdated. Please update your browser.\n\nUserAgent: ${navigator.userAgent}`;
  alert(errorMessage);
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerText = errorMessage;
    rootElement.style.color = "red";
    rootElement.style.fontSize = "20px";
    rootElement.style.justifyContent = "center";
  }
  // If the browser does not support Intl.Segmenter, initialization of graphemeSegmenter in StringHelperFunctions.ts
  // will fail, so this throw is technically unnecessary. However, if toWellFormed is not supported, the game can still
  // load normally while darknet initialization fails, potentially causing UI issues such as an empty darknet tab.
  throw new Error(errorMessage);
}
