import { KeyBindingTypes } from "../../utils/KeyBindingUtils";

function getKeyBindingsSchemaProperties() {
  const result: Record<string, unknown> = {};
  for (const keyBindingType of KeyBindingTypes) {
    result[keyBindingType] = {
      type: "array",
      minItems: 2,
      items: {
        type: "object",
        nullable: true,
        properties: {
          control: {
            type: "boolean",
          },
          alt: {
            type: "boolean",
          },
          shift: {
            type: "boolean",
          },
          meta: {
            type: "boolean",
          },
          key: {
            type: "string",
          },
        },
        required: ["control", "alt", "shift", "meta", "key"],
      },
    };
  }
  return result;
}

export const KeyBindingsSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: getKeyBindingsSchemaProperties(),
};
