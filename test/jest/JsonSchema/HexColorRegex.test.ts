import { editorThemeHexColorRegex, themeHexColorRegex } from "../../../src/JsonSchema/Data/ThemeSchema";

const validThemeHexColors = ["#FF0011", "#FF001122", "#FFF"];

const invalidThemeHexColors = [
  "qwe",
  "",
  "0",
  String(null),
  String(undefined),
  String(NaN),
  String(Infinity),
  "FF0011",
  "FF001122",
  "FFF",
  "#F",
  "F",
  "#FF",
  "FF",
  "#FFFF",
  "FFFF",
  "#FFFFF",
  "FFFFF",
  "#FF00112",
  "FF00112",
  "##FF0011",
  "##FFF",
];

const validEditorThemeHexColors = ["FF0011", "FF001122", "FFF"];

const invalidEditorThemeHexColors = [
  "qwe",
  "",
  "0",
  String(null),
  String(undefined),
  String(NaN),
  String(Infinity),
  "#FF0011",
  "#FF001122",
  "#FFF",
  "#F",
  "F",
  "#FF",
  "FF",
  "#FFFF",
  "FFFF",
  "#FFFFF",
  "FFFFF",
  "#FF00112",
  "FF00112",
  "##FF0011",
  "##FFF",
];

describe("Theme", () => {
  describe("Valid", () => {
    for (const validHexColor of validThemeHexColors) {
      test(`Theme: Valid: ${validHexColor}`, () => {
        expect(themeHexColorRegex.test(validHexColor)).toStrictEqual(true);
      });
    }
  });

  describe("Invalid", () => {
    for (const invalidHexColor of invalidThemeHexColors) {
      test(`Theme: Invalid: ${invalidHexColor}`, () => {
        expect(themeHexColorRegex.test(invalidHexColor)).toStrictEqual(false);
      });
    }
  });
});

describe("Editor theme", () => {
  describe("Valid", () => {
    for (const validHexColor of validEditorThemeHexColors) {
      test(`Editor theme: Valid: ${validHexColor}`, () => {
        expect(editorThemeHexColorRegex.test(validHexColor)).toStrictEqual(true);
      });
    }
  });

  describe("Invalid", () => {
    for (const invalidHexColor of invalidEditorThemeHexColors) {
      test(`Editor theme: Invalid: ${invalidHexColor}`, () => {
        expect(editorThemeHexColorRegex.test(invalidHexColor)).toStrictEqual(false);
      });
    }
  });
});
