import { IStyleSettings, UserInterfaceTheme } from "../../../src/ScriptEditor/NetscriptDefinitions";
import { Settings } from "../../../src/Settings/Settings";
import { defaultStyles } from "../../../src/Themes/Styles";
import { defaultTheme } from "../../../src/Themes/Themes";
import { getNS, initGameEnvironment, setupBasicTestingEnvironment } from "./Utilities";

const themeHexColor = "#abc";
const fontFamily = "monospace";

beforeAll(() => {
  initGameEnvironment();
});

describe("setTheme", () => {
  beforeEach(() => {
    setupBasicTestingEnvironment();
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
    test("Full theme", () => {
      const ns = getNS();
      const newTheme = ns.ui.getTheme();
      newTheme.primary = "";
      ns.ui.setTheme(newTheme);
      const result = ns.ui.getTheme();
      expect(result.primary).toStrictEqual(defaultTheme.primary);
    });
    test("Partial theme", () => {
      const ns = getNS();
      const newTheme = {
        primary: "",
      };
      ns.ui.setTheme(newTheme as unknown as UserInterfaceTheme);
      const result = ns.ui.getTheme();
      expect(result.primary).toStrictEqual(defaultTheme.primary);
    });
  });
});

describe("setStyles", () => {
  beforeEach(() => {
    setupBasicTestingEnvironment();
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
    test("Full styles", () => {
      const ns = getNS();
      const newStyles = ns.ui.getStyles();
      (newStyles.fontFamily as unknown) = 123;
      ns.ui.setStyles(newStyles);
      const result = ns.ui.getStyles();
      expect(result.fontFamily).toStrictEqual(defaultStyles.fontFamily);
    });
    test("Partial styles", () => {
      const ns = getNS();
      const newStyles = {
        fontFamily: 123,
      };
      ns.ui.setStyles(newStyles as unknown as IStyleSettings);
      const result = ns.ui.getStyles();
      expect(result.fontFamily).toStrictEqual(defaultStyles.fontFamily);
    });
  });
});
