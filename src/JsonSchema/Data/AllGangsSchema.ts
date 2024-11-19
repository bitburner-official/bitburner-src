import { JSONSchemaType } from "ajv";
import type { AllGangs } from "../../Gang/AllGangs";
import { FactionName } from "@enums";

export const AllGangsSchema: JSONSchemaType<typeof AllGangs> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  patternProperties: {
    ".*": {
      type: "object",
      properties: {
        power: {
          type: "number",
        },
        territory: {
          type: "number",
        },
      },
      required: ["power", "territory"],
    },
  },
  propertyNames: {
    enum: [
      FactionName.SlumSnakes,
      FactionName.Tetrads,
      FactionName.TheSyndicate,
      FactionName.TheDarkArmy,
      FactionName.SpeakersForTheDead,
      FactionName.NiteSec,
      FactionName.TheBlackHand,
    ],
  },
  required: [
    FactionName.SlumSnakes,
    FactionName.Tetrads,
    FactionName.TheSyndicate,
    FactionName.TheDarkArmy,
    FactionName.SpeakersForTheDead,
    FactionName.NiteSec,
    FactionName.TheBlackHand,
  ],
};
