import { assertAndSanitizeStyles } from "../../../src/JsonSchema/JSONSchemaAssertion";
import { JsonSchemaValidator } from "../../../src/JsonSchema/JsonSchemaValidator";
import { defaultStyles } from "../../../src/Themes/Styles";

function getCloneOfDefaultStyles() {
  return structuredClone(defaultStyles) as unknown as Record<string, unknown>;
}

describe("Valid", () => {
  test("Default styles", () => {
    expect(JsonSchemaValidator.Styles(getCloneOfDefaultStyles())).toStrictEqual(true);
  });
  test("Partial styles", () => {
    const styles = {
      fontSize: 15,
    };
    expect(JsonSchemaValidator.Styles(styles)).toStrictEqual(true);
  });
});

describe("Invalid", () => {
  for (const key of Object.keys(defaultStyles)) {
    test(`Invalid ${key}`, () => {
      const styles = getCloneOfDefaultStyles();
      styles[key] = {};
      expect(JsonSchemaValidator.Styles(styles)).toStrictEqual(false);
    });
  }
});

describe("assertAndSanitizeStyles", () => {
  test("Unknown properties are removed", () => {
    const styles = {
      fontSize: 15,
      unknownStyle: 15,
    };
    assertAndSanitizeStyles(styles);
    expect(styles.unknownStyle).toStrictEqual(undefined);
  });
});
