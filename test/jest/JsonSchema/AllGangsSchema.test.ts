import { getDefaultAllGangs } from "../../../src/Gang/AllGangs";
import { JsonSchemaValidator } from "../../../src/JsonSchema/JsonSchemaValidator";

describe("Success", () => {
  test("Default AllGangs", () => {
    const defaultAllGangs = getDefaultAllGangs();
    expect(JsonSchemaValidator.AllGangs(defaultAllGangs)).toStrictEqual(true);
  });
});

describe("Failure", () => {
  test("Do not have all gangs", () => {
    const defaultAllGangs = getDefaultAllGangs() as Record<string, unknown>;
    delete defaultAllGangs["Slum Snakes"];
    expect(JsonSchemaValidator.AllGangs(defaultAllGangs)).toStrictEqual(false);
  });
  test("Have an unexpected gang", () => {
    const defaultAllGangs = getDefaultAllGangs() as Record<string, unknown>;
    defaultAllGangs["CyberSec"] = {
      power: 1,
      territory: 1 / 7,
    };
    expect(JsonSchemaValidator.AllGangs(defaultAllGangs)).toStrictEqual(false);
  });
  test("Have invalid power", () => {
    const defaultAllGangs = getDefaultAllGangs() as Record<string, unknown>;
    defaultAllGangs["Slum Snakes"] = {
      power: "1",
      territory: 1 / 7,
    };
    expect(JsonSchemaValidator.AllGangs(defaultAllGangs)).toStrictEqual(false);
  });
  test("Have invalid territory", () => {
    const defaultAllGangs = getDefaultAllGangs() as Record<string, unknown>;
    defaultAllGangs["Slum Snakes"] = {
      power: 1,
      territory: "1 / 7",
    };
    expect(JsonSchemaValidator.AllGangs(defaultAllGangs)).toStrictEqual(false);
  });
});
