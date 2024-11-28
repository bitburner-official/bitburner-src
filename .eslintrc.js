module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: false,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 8,
    sourceType: "module",
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
    },
    project: ["./tsconfig.json", "./test/tsconfig.json", "./tools/tsconfig.json"],
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^__",
        varsIgnorePattern: "^__",
        caughtErrorsIgnorePattern: "^__",
      },
    ],
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "react/no-unescaped-entities": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/no-unsafe-enum-comparison": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  overrides: [
    /**
     * Some enums are subsets of other enums. For example, UniversityLocationName contains locations of 3 universities.
     * With each member, we refer to the respective LocationName's member instead of using a literal string. This usage
     * is okay, but it triggers the "prefer-literal-enum-member" rule. This rule is not useful in this case, so we
     * suppress it in NetscriptDefinitions.d.ts.
     */
    {
      files: ["src/ScriptEditor/NetscriptDefinitions.d.ts"],
      rules: {
        "@typescript-eslint/prefer-literal-enum-member": ["off"],
      },
    },
  ],
};
