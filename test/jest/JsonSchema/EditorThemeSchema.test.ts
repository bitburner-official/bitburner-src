import { assertAndSanitizeEditorTheme } from "../../../src/JsonSchema/JSONSchemaAssertion";
import { JsonSchemaValidator } from "../../../src/JsonSchema/JsonSchemaValidator";
import { defaultMonacoTheme } from "../../../src/ScriptEditor/ui/themes";

const invalidHexColor = "#FFFF";

function getCloneOfDefaultEditorTheme() {
  return structuredClone(defaultMonacoTheme) as unknown as Record<string, unknown>;
}

/**
 * This function does not support objects containing Map, Set, etc. It's till good for our purposes, though.
 */
function traverseObject(
  object: Record<string, unknown>,
  keyPath: string[],
  callback: (key: string, keyPath: string[]) => void,
): void {
  for (const key of Object.getOwnPropertyNames(object)) {
    callback(key, keyPath);
    if (typeof object[key] === "object" && object[key] != null) {
      traverseObject(object[key] as Record<string, unknown>, [...keyPath, key], callback);
    }
  }
}

describe("Valid", () => {
  test("Default editor theme", () => {
    expect(JsonSchemaValidator.EditorTheme(getCloneOfDefaultEditorTheme())).toStrictEqual(true);
  });
  test("Partial theme", () => {
    const theme = {
      inherit: true,
    };
    expect(JsonSchemaValidator.EditorTheme(theme)).toStrictEqual(true);
  });
});

describe("Invalid", () => {
  const theme = getCloneOfDefaultEditorTheme();
  traverseObject(theme, [], (key, keyPath) => {
    test(`Invalid [${keyPath}].${key}`, () => {
      const theme = getCloneOfDefaultEditorTheme();
      let nestedObject = theme;
      for (const outerKey of keyPath) {
        if (typeof nestedObject[outerKey] !== "object" || nestedObject[outerKey] == null) {
          throw new Error(
            `Error occurred while traversing default editor theme. outerKey: ${outerKey}. keyPath: ${keyPath}. Theme: ${JSON.stringify(
              theme,
            )}`,
          );
        }
        nestedObject = nestedObject[outerKey] as Record<string, unknown>;
      }
      nestedObject[key] = invalidHexColor;
      expect(JsonSchemaValidator.EditorTheme(theme)).toStrictEqual(false);
    });
  });
});

describe("assertAndSanitizeEditorTheme", () => {
  test("Unknown properties are removed", () => {
    const theme = {
      inherit: true,
      unknownProperty: {},
    };
    assertAndSanitizeEditorTheme(theme);
    expect(theme.unknownProperty).toStrictEqual(undefined);
  });
});
