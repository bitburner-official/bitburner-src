import { UserInterface as IUserInterface } from "@nsdefs";
import { Settings } from "../Settings/Settings";
import { ThemeEvents } from "../Themes/ui/Theme";
import { defaultTheme } from "../Themes/Themes";
import { defaultStyles } from "../Themes/Styles";
import { CONSTANTS } from "../Constants";
import { commitHash } from "../utils/helpers/commitHash";
import { InternalAPI } from "../Netscript/APIWrapper";
import { Terminal } from "../../src/Terminal";
import { helpers } from "../Netscript/NetscriptHelpers";
import { assertAndSanitizeMainTheme, assertAndSanitizeStyles } from "../JsonSchema/JSONSchemaAssertion";

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
      let newData: unknown;
      try {
        /**
         * assertAndSanitizeMainTheme may mutate its parameter, so we have to clone the user-provided data here.
         */
        newData = structuredClone(newTheme);
        assertAndSanitizeMainTheme(newData);
      } catch (error) {
        helpers.log(ctx, () => `Failed to set theme. Errors: ${error}`);
        return;
      }
      Object.assign(Settings.theme, newData);
      ThemeEvents.emit();
      helpers.log(ctx, () => `Successfully set theme`);
    },

    setStyles: (ctx) => (newStyles) => {
      let newData: unknown;
      try {
        /**
         * assertAndSanitizeStyles may mutate its parameter, so we have to clone the user-provided data here.
         */
        newData = structuredClone(newStyles);
        assertAndSanitizeStyles(newData);
      } catch (error) {
        helpers.log(ctx, () => `Failed to set styles. Errors: ${error}`);
        return;
      }
      Object.assign(Settings.styles, newData);
      ThemeEvents.emit();
      helpers.log(ctx, () => `Successfully set styles`);
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
      const commit = commitHash();
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
