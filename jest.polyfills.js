const { TextEncoder, TextDecoder } = require("node:util");

Object.defineProperties(globalThis, {
  TextEncoder: { value: TextEncoder },
  TextDecoder: { value: TextDecoder },
});
