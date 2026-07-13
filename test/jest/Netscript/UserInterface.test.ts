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

  expect(() => ns.ui.createConnectLink([SpecialServers.Home])).toThrow();
  Player.getHomeComputer().pushProgram(CompletedProgramName.autoLink);
  ns.ui.createConnectLink([SpecialServers.Home]);

  expect(() => ns.ui.createConnectLink([])).toThrow();

  expect(() => ns.ui.createConnectLink([SpecialServers.WorldDaemon])).toThrow();
  connectServers(GetServerOrThrow(SpecialServers.WorldDaemon), GetServerOrThrow(SpecialServers.DaedalusServer));
  ns.ui.createConnectLink([SpecialServers.WorldDaemon]);

  expect(() => ns.ui.createConnectLink([SpecialServers.DarkWeb])).toThrow();
  ns.singularity.purchaseTor();
  ns.ui.createConnectLink([SpecialServers.DarkWeb]);

  expect(() => ns.ui.createConnectLink(["name of server that does not exist"])).toThrow();
});

describe("validateConnections", () => {
  const initialize = () => {
    const home = GetServerOrThrow(SpecialServers.Home);
    if (!(home instanceof Server)) {
      throw new Error("home is not a Server");
    }
    prestigeAllServers();
    AddToAllServers(home);
    const a = new Server({ hostname: "a" });
    AddToAllServers(a);
    const b = new Server({ hostname: "b" });
    AddToAllServers(b);
    const c = new Server({ hostname: "c" });
    AddToAllServers(c);
    const d = new Server({ hostname: "d" });
    AddToAllServers(d);
    // ┗ home
    //   ┣ a
    //   ┃ ┗ b
    //   ┗ c
    //     ┗ d
    connectServers(home, a);
    connectServers(home, c);
    connectServers(a, b);
    connectServers(c, d);
    return { home, a, b, c, d };
  };
  it("connects by host name", () => {
    const { b } = initialize();
    expect(validateConnections(b, ["a", "home", "c"])).toMatchObject({
      status: "ok",
      destination: { hostname: "c" },
    });
  });
  it("connects by ip", () => {
    const { home, a, b, c } = initialize();
    expect(validateConnections(b, [a.ip, home.ip, c.ip])).toMatchObject({
      status: "ok",
      destination: { hostname: "c" },
    });
  });
  it("fails to connect if we skip a server", () => {
    const { b } = initialize();
    expect(validateConnections(b, ["a", "home", "d"]).status).toBe("no connection");
  });
  it("fails to connect if server does not exist", () => {
    const { b } = initialize();
    expect(validateConnections(b, ["a", "foo", "c"]).status).toBe("server not found");
  });
  it("fails to connect if the starting point is wrong", () => {
    const { d } = initialize();
    // the path is written as if we are starting from b, but we are actually starting from d
    expect(validateConnections(d, ["a", "home", "c"]).status).toBe("no connection");
  });
  it("a path from home works regardless of where we are", () => {
    const { d } = initialize();
    expect(validateConnections(d, ["home", "c"])).toMatchObject({
      status: "ok",
      destination: { hostname: "c" },
    });
  });
  it("uses a backdoor", () => {
    const { b, c } = initialize();
    c.backdoorInstalled = true;
    expect(validateConnections(b, ["c"])).toMatchObject({
      status: "ok",
      destination: { hostname: "c" },
    });
  });
});
