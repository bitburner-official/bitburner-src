import type { JSONSchemaType } from "ajv";
import type { IStyleSettings } from "../../ScriptEditor/NetscriptDefinitions";

export const StylesSchema: JSONSchemaType<IStyleSettings> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    lineHeight: {
      type: "number",
    },
    fontSize: {
      type: "number",
    },
    tailFontSize: {
      type: "number",
    },
    fontFamily: {
      type: "string",
    },
  },
  // JSONSchemaType requires us to define "required", even when it's empty.
  required: [],
};
