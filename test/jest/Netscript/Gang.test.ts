import { FactionName } from "@enums";
import { Player } from "@player";
import { Gang } from "../../../src/Gang/Gang";
import { AllGangs } from "../../../src/Gang/AllGangs";
import { getNS, initGameEnvironment, setupBasicTestingEnvironment } from "../Utilities";

beforeAll(() => {
  initGameEnvironment();
});

beforeEach(() => {
  setupBasicTestingEnvironment();
  // Give the player a gang so gang API is accessible
  Player.gang = new Gang(FactionName.SlumSnakes, false);
});

describe("ns.gang.getAllGangInformation", () => {
  it("should return territory and power info for all gangs including the player's", () => {
    const ns = getNS();
    const info = ns.gang.getAllGangInformation();
    const gangNames = Object.keys(info);

    // Should include all 7 gangs
    expect(gangNames).toHaveLength(Object.keys(AllGangs).length);

    // Should include the player's own gang
    expect(info[FactionName.SlumSnakes]).toBeDefined();

    // Each entry should have power and territory
    for (const name of gangNames) {
      expect(info[name]).toHaveProperty("power");
      expect(info[name]).toHaveProperty("territory");
      expect(typeof info[name].power).toBe("number");
      expect(typeof info[name].territory).toBe("number");
    }
  });

  it("should return copies, not references to the original AllGangs data", () => {
    const ns = getNS();
    const info = ns.gang.getAllGangInformation();

    // Mutating the returned data should not affect AllGangs
    info[FactionName.SlumSnakes].power = 999999;
    expect(AllGangs[FactionName.SlumSnakes].power).not.toBe(999999);
  });
});
