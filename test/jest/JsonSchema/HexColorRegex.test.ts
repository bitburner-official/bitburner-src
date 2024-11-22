import { hexColorRegex } from "../../../src/JsonSchema/Data/ThemeSchema";

const validHexColors = ["#FF0011", "FF0011", "#FF001122", "FF001122", "#FFF", "FFF"];
const invalidHexColors = [
  "qwe",
  "",
  "0",
  String(null),
  String(undefined),
  String(NaN),
  String(Infinity),
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

describe("Valid", () => {
  for (const validHexColor of validHexColors) {
    test(validHexColor, () => {
      expect(hexColorRegex.test(validHexColor)).toStrictEqual(true);
    });
  }
});

describe("Invalid", () => {
  for (const invalidHexColor of invalidHexColors) {
    test(invalidHexColor, () => {
      expect(hexColorRegex.test(invalidHexColor)).toStrictEqual(false);
    });
  }
});
