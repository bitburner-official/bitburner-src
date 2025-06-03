import { SimplePage } from "../../../src/Enums";
import { assertAndSanitizeKeyBindings } from "../../../src/JsonSchema/JSONSchemaAssertion";
import { JsonSchemaValidator } from "../../../src/JsonSchema/JsonSchemaValidator";
import { DefaultKeyBindings } from "../../../src/utils/KeyBindingUtils";

const sampleKeySetup = {
  control: false,
  alt: true,
  shift: false,
  meta: false,
  key: "t",
};

describe("Valid", () => {
  test("Default key bindings", () => {
    expect(JsonSchemaValidator.KeyBindingsSchema(DefaultKeyBindings)).toStrictEqual(true);
  });
  test("Partial key bindings", () => {
    const keyBindings = {
      [SimplePage.Terminal]: [sampleKeySetup, null],
    };
    expect(JsonSchemaValidator.KeyBindingsSchema(keyBindings)).toStrictEqual(true);
  });
});

describe("Invalid", () => {
  test(`Invalid key setup`, () => {
    const keyBindings = {
      [SimplePage.Terminal]: [
        {
          control: false,
          alt: true,
          shift: false,
          meta: false,
        },
        null,
      ],
    };
    expect(JsonSchemaValidator.KeyBindingsSchema(keyBindings)).toStrictEqual(false);
  });
  test(`Missing key setup`, () => {
    const keyBindings = {
      [SimplePage.Terminal]: [sampleKeySetup],
    };
    expect(JsonSchemaValidator.KeyBindingsSchema(keyBindings)).toStrictEqual(false);
  });
});

describe("assertAndSanitizeKeyBindings", () => {
  test("Unknown properties are removed", () => {
    const keyBindings = {
      [SimplePage.Terminal]: [sampleKeySetup, null],
      UnknownPage: [sampleKeySetup, null],
    };
    assertAndSanitizeKeyBindings(keyBindings);
    expect(keyBindings.UnknownPage).toStrictEqual(undefined);
  });
});
