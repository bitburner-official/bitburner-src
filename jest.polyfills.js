const { TextEncoder, TextDecoder } = require("node:util");
require("compression-streams-polyfill");

Object.defineProperties(globalThis, {
  TextEncoder: { value: TextEncoder },
  TextDecoder: { value: TextDecoder },
});
