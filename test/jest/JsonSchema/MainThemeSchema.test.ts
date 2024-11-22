import { assertAndSanitizeMainTheme } from "../../../src/JsonSchema/JSONSchemaAssertion";
import { JsonSchemaValidator } from "../../../src/JsonSchema/JsonSchemaValidator";
import { defaultTheme } from "../../../src/Themes/Themes";

const validHexColor = "#FFF";
const invalidHexColor = "#FFFF";

function getCloneOfDefaultMainTheme() {
  return structuredClone(defaultTheme) as unknown as Record<string, unknown>;
}

describe("Valid", () => {
  test("Default main theme", () => {
    expect(JsonSchemaValidator.MainTheme(getCloneOfDefaultMainTheme())).toStrictEqual(true);
  });
  test("Partial theme", () => {
    const theme = {
      primary: validHexColor,
    };
    expect(JsonSchemaValidator.MainTheme(theme)).toStrictEqual(true);
  });
});

describe("Invalid", () => {
  for (const key of Object.keys(defaultTheme)) {
    test(`Invalid ${key}`, () => {
      const theme = getCloneOfDefaultMainTheme();
      theme[key] = invalidHexColor;
      expect(JsonSchemaValidator.MainTheme(theme)).toStrictEqual(false);
    });
  }
});

describe("assertAndSanitizeMainTheme", () => {
  test("Unknown properties are removed", () => {
    const theme = {
      primary: validHexColor,
      unknownColor1: validHexColor,
    };
    assertAndSanitizeMainTheme(theme);
    expect(theme.unknownColor1).toStrictEqual(undefined);
  });
});
