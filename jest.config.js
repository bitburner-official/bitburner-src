module.exports = {
  roots: ["<rootDir>/src/", "<rootDir>/test/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!react-markdown)/"],
  testPathIgnorePatterns: [".cypress", "node_modules", "dist"],
  testEnvironment: "./FixJSDOMEnvironment.ts",
  setupFiles: ["./jest.polyfills.js"],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/test/__mocks__/fileMock.js",
    "\\.(css|less)$": "<rootDir>/test/__mocks__/NullMock.js",
    ".*?raw$": "<rootDir>/test/__mocks__/fileMock.js",
    "worker-url$": "<rootDir>/test/__mocks__/fileMock.js",
    "@player": "<rootDir>/src/Player",
    "@enums": "<rootDir>/src/Enums",
    "@nsdefs": "<rootDir>/src/ScriptEditor/NetscriptDefinitions",
    "^monaco-editor$": "<rootDir>/test/__mocks__/NullMock.js",
    "^monaco-vim$": "<rootDir>/test/__mocks__/NullMock.js",
    "/utils/Protections$": "<rootDir>/test/__mocks__/NullMock.js",
    "@swc/wasm-web": "@swc/core",
  },
};
