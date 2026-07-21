import { IStyleSettings, UserInterfaceTheme } from "../../../src/ScriptEditor/NetscriptDefinitions";
import { Settings } from "../../../src/Settings/Settings";
import { defaultStyles } from "../../../src/Themes/Styles";
import { defaultTheme } from "../../../src/Themes/Themes";
import { getNS, initGameEnvironment, setupBasicTestingEnvironment } from "../Utilities";
import { SpecialServers } from "../../../src/Server/data/SpecialServers";
import { AddToAllServers, GetServerOrThrow, prestigeAllServers, connectServers } from "../../../src/Server/AllServers";
import { Player } from "@player";
import { CompletedProgramName } from "@enums";
import { validateConnections } from "../../../src/Server/ServerHelpers";
import { Server } from "../../../src/Server/Server";
import type { IPAddress } from "../../../src/Types/strings";

const themeHexColor = "#abc";
const fontFamily = "monospace";

beforeAll(() => {
  initGameEnvironment();
});

beforeEach(() => {
  setupBasicTestingEnvironment();
});

describe("setTheme", () => {
  beforeEach(() => {
    Settings.theme = { ...defaultTheme };
  });

  describe("Success", () => {
    test("Full theme", () => {
      const ns = getNS();
      const newTheme = ns.ui.getTheme();
      newTheme.primary = themeHexColor;
      ns.ui.setTheme(newTheme);
      const result = ns.ui.getTheme();
      expect(result.primary).toStrictEqual(themeHexColor);
      expect(result.secondary).toStrictEqual(defaultTheme.secondary);
    });
    test("Partial theme", () => {
      const ns = getNS();
      const newTheme = {
        primary: themeHexColor,
      };
      ns.ui.setTheme(newTheme as unknown as UserInterfaceTheme);
      const result = ns.ui.getTheme();
      expect(result.primary).toStrictEqual(themeHexColor);
      expect(result.secondary).toStrictEqual(defaultTheme.secondary);
    });
    test("Unknown property", () => {
      const ns = getNS();
      const newTheme = {
        primary: themeHexColor,
        unknownProperty: themeHexColor,
      };
      ns.ui.setTheme(newTheme as unknown as UserInterfaceTheme);
      const result = ns.ui.getTheme();
      expect(result.primary).toStrictEqual(themeHexColor);
      expect(result.secondary).toStrictEqual(defaultTheme.secondary);

      // "unknownProperty" of newTheme is not changed.
      expect(newTheme.unknownProperty).toStrictEqual(themeHexColor);

      // "unknownProperty" is ignored when being processed.
      expect((result as unknown as { unknownProperty: unknown }).unknownProperty).toBeUndefined();
    });
  });

  describe("Failure", () => {
    let spyConErr: jest.Spied<typeof console.error>;
    beforeEach(() => {
      spyConErr = jest.spyOn(console, "error").mockImplementation(() => null);
    });
    test("Full theme", () => {
      const ns = getNS();
      const newTheme = ns.ui.getTheme();
      newTheme.primary = "";
      ns.ui.setTheme(newTheme);
      const result = ns.ui.getTheme();
      expect(spyConErr).toHaveBeenCalled();
      expect(result.primary).toStrictEqual(defaultTheme.primary);
    });
    test("Partial theme", () => {
      const ns = getNS();
      const newTheme = {
        primary: "",
      };
      ns.ui.setTheme(newTheme as unknown as UserInterfaceTheme);
      const result = ns.ui.getTheme();
      expect(spyConErr).toHaveBeenCalled();
      expect(result.primary).toStrictEqual(defaultTheme.primary);
    });
    afterEach(() => {
      spyConErr.mockRestore();
    });
  });
});

describe("setStyles", () => {
  beforeEach(() => {
    Settings.styles = { ...defaultStyles };
  });

  describe("Success", () => {
    test("Full styles", () => {
      const ns = getNS();
      const newStyles = ns.ui.getStyles();
      newStyles.fontFamily = fontFamily;
      ns.ui.setStyles(newStyles);
      const result = ns.ui.getStyles();
      expect(result.fontFamily).toStrictEqual(fontFamily);
      expect(result.fontSize).toStrictEqual(defaultStyles.fontSize);
    });
    test("Partial styles", () => {
      const ns = getNS();
      const newStyles = {
        fontFamily: fontFamily,
      };
      ns.ui.setStyles(newStyles as unknown as IStyleSettings);
      const result = ns.ui.getStyles();
      expect(result.fontFamily).toStrictEqual(fontFamily);
      expect(result.fontSize).toStrictEqual(defaultStyles.fontSize);
    });
    test("Unknown property", () => {
      const ns = getNS();
      const newStyles = {
        fontFamily: fontFamily,
        unknownProperty: themeHexColor,
      };
      ns.ui.setStyles(newStyles as unknown as IStyleSettings);
      const result = ns.ui.getStyles();
      expect(result.fontFamily).toStrictEqual(fontFamily);
      expect(result.fontSize).toStrictEqual(defaultStyles.fontSize);

      // "unknownProperty" of newStyles is not changed.
      expect(newStyles.unknownProperty).toStrictEqual(themeHexColor);

      // "unknownProperty" is ignored when being processed.
      expect((result as unknown as { unknownProperty: unknown }).unknownProperty).toBeUndefined();
    });
  });

  describe("Failure", () => {
    let spyConErr: jest.Spied<typeof console.error>;
    beforeEach(() => {
      spyConErr = jest.spyOn(console, "error").mockImplementation(() => null);
    });
    test("Full styles", () => {
      const ns = getNS();
      const newStyles = ns.ui.getStyles();
      (newStyles.fontFamily as unknown) = 123;
      ns.ui.setStyles(newStyles);
      const result = ns.ui.getStyles();
      expect(spyConErr).toHaveBeenCalled();
      expect(result.fontFamily).toStrictEqual(defaultStyles.fontFamily);
    });
    test("Partial styles", () => {
      const ns = getNS();
      const newStyles = {
        fontFamily: 123,
      };
      ns.ui.setStyles(newStyles as unknown as IStyleSettings);
      const result = ns.ui.getStyles();
      expect(spyConErr).toHaveBeenCalled();
      expect(result.fontFamily).toStrictEqual(defaultStyles.fontFamily);
    });
    afterEach(() => {
      spyConErr.mockRestore();
    });
  });
});

test("alias", () => {
  const ns = getNS();
  ns.ui.alias("foo", "run foo.js");
  expect(ns.ui.getAllAliases().get("foo")?.substitution).toBe("run foo.js");

  ns.ui.alias("foo", "   run foo.js   ");
  expect(ns.ui.getAllAliases().get("foo")?.substitution).toBe("run foo.js");

  ns.ui.alias("foo", "   ");
  expect(ns.ui.getAllAliases().get("foo")?.substitution).toBe("");

  expect(() => ns.ui.alias("", "bar")).toThrow();
  expect(() => ns.ui.alias("   ", "bar")).toThrow();
  expect(() => ns.ui.alias("^", "bar")).toThrow();
});

test("createConnectLink", () => {
  const ns = getNS();

  expect(() => ns.ui.createConnectLink([SpecialServers.Home])).toThrow("Requires AutoLink");
  Player.getHomeComputer().pushProgram(CompletedProgramName.autoLink);
  ns.ui.createConnectLink([SpecialServers.Home]);

  expect(() => ns.ui.createConnectLink([SpecialServers.WorldDaemon])).toThrow("Invalid host");
  connectServers(GetServerOrThrow(SpecialServers.WorldDaemon), GetServerOrThrow(SpecialServers.DaedalusServer));
  ns.ui.createConnectLink([SpecialServers.WorldDaemon]);

  expect(() => ns.ui.createConnectLink([SpecialServers.DarkWeb])).toThrow("Invalid host");
  ns.singularity.purchaseTor();
  ns.ui.createConnectLink([SpecialServers.DarkWeb]);

  expect(() => ns.ui.createConnectLink(["name of server that does not exist"])).toThrow("Invalid host");
});

type Expected =
  | {
      success: true;
      destination: string;
    }
  | {
      success: false;
      message: string;
    };
// ┗ home 1.1.1.1
//   ┣ a 2.2.2.2
//   ┃ ┗ b
//   ┣ c 4.4.4.4
//   ┃ ┗ d
//   ┗ backdoored
const cases: [string, string[], Expected][] = [
  ["b", ["a", "home", "c"], { success: true, destination: "c" }],
  ["b", ["2.2.2.2", "1.1.1.1", "4.4.4.4"], { success: true, destination: "c" }],
  ["b", ["c"], { success: false, message: "Cannot directly connect" }],
  ["b", ["backdoored"], { success: true, destination: "backdoored" }],
  ["b", ["a", "foo", "c"], { success: false, message: "Invalid host" }],
  // the path is written as if we are starting from b, but we are actually starting from d
  ["d", ["a", "home", "c"], { success: false, message: "Cannot directly connect" }],
  // a path from home works regardless of where we are
  ["d", ["home", "c"], { success: true, destination: "c" }],
  ["b", [], { success: true, destination: "b" }],
  ["b", ["b"], { success: true, destination: "b" }],
];
test.each(cases)("validateConnections($s, $p)", (start, path, expected) => {
  const home = GetServerOrThrow(SpecialServers.Home);
  if (!(home instanceof Server)) {
    throw new Error("home is not a Server");
  }
  prestigeAllServers();
  home.ip = "1.1.1.1" as IPAddress;
  AddToAllServers(home);
  const a = new Server({ hostname: "a", ip: "2.2.2.2" as IPAddress });
  AddToAllServers(a);
  const b = new Server({ hostname: "b" });
  AddToAllServers(b);
  const c = new Server({ hostname: "c", ip: "4.4.4.4" as IPAddress });
  AddToAllServers(c);
  const d = new Server({ hostname: "d" });
  AddToAllServers(d);
  const backdoored = new Server({ hostname: "backdoored" });
  backdoored.backdoorInstalled = true;
  AddToAllServers(backdoored);
  connectServers(home, a);
  connectServers(home, c);
  connectServers(home, backdoored);
  connectServers(a, b);
  connectServers(c, d);

  const startingServer = { a, b, c, d }[start];
  if (!startingServer) {
    throw new Error("Invalid starting server");
  }
  const result = validateConnections(startingServer, path);
  if (expected.success) {
    expect(result).toMatchObject(expected);
  } else {
    expect(result.success).toBe(expected.success);
    expect(result.message).toContain(expected.message);
  }
});
