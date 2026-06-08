import { FactionName } from "@enums";
import { Player } from "@player";
import { AllGangs } from "../../../src/Gang/AllGangs";
import { getNS, getWorkerScriptAndNS, initGameEnvironment, setupBasicTestingEnvironment } from "../Utilities";
import { GangConstants } from "../../../src/Gang/data/Constants";
import { joinFaction } from "../../../src/Faction/FactionHelpers";
import { Factions } from "../../../src/Faction/Factions";

beforeAll(() => {
  initGameEnvironment();
});

beforeEach(() => {
  setupBasicTestingEnvironment();
  Player.sourceFiles.set(2, 3);
});

describe("ns.gang.getAllGangInformation", () => {
  beforeEach(() => {
    // Give the player a gang so gang API is accessible
    Player.startGang(FactionName.SlumSnakes, false);
  });

  test("should return territory and power info for all gangs including the player's", () => {
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

  test("should return copies, not references to the original AllGangs data", () => {
    const ns = getNS();
    const info = ns.gang.getAllGangInformation();

    // Mutating the returned data should not affect AllGangs
    info[FactionName.SlumSnakes].power = 999999;
    expect(AllGangs[FactionName.SlumSnakes].power).not.toBe(999999);
  });
});

describe("createGang", () => {
  test("Success", () => {
    const ns = getNS();
    Player.karma = GangConstants.GangKarmaRequirement;
    joinFaction(Factions[FactionName.SlumSnakes]);
    expect(ns.gang.createGang(FactionName.SlumSnakes)).toBe(true);
  });
  describe("Failure", () => {
    test("Already have a gang", () => {
      const { ws, ns } = getWorkerScriptAndNS();
      Player.karma = GangConstants.GangKarmaRequirement;
      joinFaction(Factions[FactionName.SlumSnakes]);
      expect(ns.gang.createGang(FactionName.SlumSnakes)).toBe(true);

      expect(ns.gang.createGang(FactionName.SlumSnakes)).toBe(false);
      expect(ws.scriptRef.logs[0]).toMatch("You already have a gang");
      expect(ns.gang.createGang(FactionName.Tetrads)).toBe(false);
      expect(ws.scriptRef.logs[1]).toMatch("You already have a gang");
    });
    test("Disabled by advanced options", () => {
      const { ws, ns } = getWorkerScriptAndNS();
      Player.bitNodeOptions.disableGang = true;
      expect(ns.gang.createGang(FactionName.SlumSnakes)).toBe(false);
      expect(ws.scriptRef.logs[0]).toMatch("Gang is disabled by advanced options");
    });
    test("Not have Source-File 2", () => {
      const { ws, ns } = getWorkerScriptAndNS();
      Player.sourceFiles.set(2, 0);
      expect(ns.gang.createGang(FactionName.SlumSnakes)).toBe(false);
      expect(ws.scriptRef.logs[0]).toMatch("You do not have Source-File 2");
    });
    test("Not enough karma", () => {
      const { ws, ns } = getWorkerScriptAndNS();
      expect(ns.gang.createGang(FactionName.SlumSnakes)).toBe(false);
      expect(ws.scriptRef.logs[0]).toMatch("Your karma must be less than or equal to");
    });
    test("Invalid gang faction", () => {
      const { ws, ns } = getWorkerScriptAndNS();
      Player.karma = GangConstants.GangKarmaRequirement;
      joinFaction(Factions[FactionName.SlumSnakes]);
      expect(ns.gang.createGang(FactionName.Illuminati)).toBe(false);
      expect(ws.scriptRef.logs[0]).toMatch("does not allow creating a gang");
    });
    test("Not a faction member", () => {
      const { ws, ns } = getWorkerScriptAndNS();
      Player.karma = GangConstants.GangKarmaRequirement;
      expect(ns.gang.createGang(FactionName.SlumSnakes)).toBe(false);
      expect(ws.scriptRef.logs[0]).toMatch("You are not a member of");
    });
  });
});
