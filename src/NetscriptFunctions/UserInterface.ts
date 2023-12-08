import { UserInterface as IUserInterface } from "@nsdefs";
import { Settings } from "../Settings/Settings";
import { ThemeEvents } from "../Themes/ui/Theme";
import { defaultTheme } from "../Themes/Themes";
import { defaultStyles } from "../Themes/Styles";
import { CONSTANTS } from "../Constants";
import { hash } from "../hash/hash";
import { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import { Terminal } from "../../src/Terminal";
import { helpers, makeRuntimeErrorMsg } from "../Netscript/NetscriptHelpers";

/** Will probably remove the below function in favor of a different approach to object type assertion.
 *  This method cannot be used to handle optional properties. */
export function assertObjectType<T extends object>(
  ctx: NetscriptContext,
  name: string,
  obj: unknown,
  desiredObject: T,
): asserts obj is T {
  if (typeof obj !== "object" || obj === null) {
    throw makeRuntimeErrorMsg(
      ctx,
      `Type ${obj === null ? "null" : typeof obj} provided for ${name}. Must be an object.`,
      "TYPE",
    );
  }
  for (const [key, val] of Object.entries(desiredObject)) {
    if (!Object.hasOwn(obj, key)) {
      throw makeRuntimeErrorMsg(
        ctx,
        `Object provided for argument ${name} is missing required property ${key}.`,
        "TYPE",
      );
    }
    const objVal = (obj as Record<string, unknown>)[key];
    if (typeof val !== typeof objVal) {
      throw makeRuntimeErrorMsg(
        ctx,
        `Incorrect type ${typeof objVal} provided for property ${key} on ${name} argument. Should be type ${typeof val}.`,
        "TYPE",
      );
    }
  }
}

export function NetscriptUserInterface(): InternalAPI<IUserInterface> {
  return {
    windowSize: () => () => {
      return [window.innerWidth, window.innerHeight];
    },
    getTheme: () => () => {
      return { ...Settings.theme };
    },

    getStyles: () => () => {
      return { ...Settings.styles };
    },

    setTheme: (ctx) => (newTheme) => {
      const themeValidator: Record<string, string | undefined> = {};
      assertObjectType(ctx, "newTheme", newTheme, themeValidator);
      const hex = /^(#)((?:[A-Fa-f0-9]{2}){3,4}|(?:[A-Fa-f0-9]{3}))$/;
      const currentTheme = { ...Settings.theme };
      const errors: string[] = [];
      for (const key of Object.keys(newTheme)) {
        if (!currentTheme[key]) {
          // Invalid key
          errors.push(`Invalid key "${key}"`);
        } else if (!hex.test(newTheme[key] ?? "")) {
          errors.push(`Invalid color "${key}": ${newTheme[key]}`);
        } else {
          currentTheme[key] = newTheme[key];
        }
      }

      if (errors.length === 0) {
        Object.assign(Settings.theme, currentTheme);
        ThemeEvents.emit();
        helpers.log(ctx, () => `Successfully set theme`);
      } else {
        helpers.log(ctx, () => `Failed to set theme. Errors: ${errors.join(", ")}`);
      }
    },

    setStyles: (ctx) => (newStyles) => {
      const styleValidator: Record<string, string | number | undefined> = {};
      assertObjectType(ctx, "newStyles", newStyles, styleValidator);
      const currentStyles = { ...Settings.styles };
      const errors: string[] = [];
      for (const key of Object.keys(newStyles)) {
        if (!(currentStyles as any)[key]) {
          // Invalid key
          errors.push(`Invalid key "${key}"`);
        } else {
          (currentStyles as any)[key] = newStyles[key];
        }
      }

      if (errors.length === 0) {
        Object.assign(Settings.styles, currentStyles);
        ThemeEvents.emit();
        helpers.log(ctx, () => `Successfully set styles`);
      } else {
        helpers.log(ctx, () => `Failed to set styles. Errors: ${errors.join(", ")}`);
      }
    },

    resetTheme: (ctx) => () => {
      Settings.theme = { ...defaultTheme };
      ThemeEvents.emit();
      helpers.log(ctx, () => `Reinitialized theme to default`);
    },

    resetStyles: (ctx) => () => {
      Settings.styles = { ...defaultStyles };
      ThemeEvents.emit();
      helpers.log(ctx, () => `Reinitialized styles to default`);
    },

    getGameInfo: () => () => {
      const version = CONSTANTS.VersionString;
      const commit = hash();
      const platform = navigator.userAgent.toLowerCase().includes(" electron/") ? "Steam" : "Browser";

      const gameInfo = {
        version,
        commit,
        platform,
      };

      return gameInfo;
    },

    clearTerminal: (ctx) => () => {
      helpers.log(ctx, () => `Clearing terminal`);
      Terminal.clear();
    },
  };
}
