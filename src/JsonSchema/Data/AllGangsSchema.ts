import type { JSONSchemaType } from "ajv";
import type { AllGangs } from "../../Gang/AllGangs";
import { GangConstants } from "../../Gang/data/Constants";

/**
 * If we add/remove gangs, we must change 4 things:
 * - src\Gang\AllGangs.ts: getDefaultAllGangs
 * - src\Gang\data\Constants.ts: GangConstants.Names
 * - src\Gang\data\power.ts: PowerMultiplier
 * - Save file migration code.
 *
 * Gang code assumes that save data contains exactly gangs defined in these places.
 */
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
    enum: GangConstants.Names,
  },
  required: GangConstants.Names,
};
