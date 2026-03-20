module.exports = {
  // The default value of sourceType is "module", so we can omit this config. We can also specify "unambiguous" to let
  // Babel infer the source type and avoid explicitly setting it for saveDataBinaryFormat.js. However, being explicit is
  // preferable, since we know all of our modules use ES modules except for those in the Electron folder.
  sourceType: "module",
  presets: [
    "@babel/preset-react",
    [
      "@babel/preset-env",
      {
        useBuiltIns: "usage",
        corejs: "3.49",
      },
    ],
    "@babel/preset-typescript",
  ],
  overrides: [
    {
      test: ["./electron/saveDataBinaryFormat.js"],
      sourceType: "commonjs",
    },
  ],
};
