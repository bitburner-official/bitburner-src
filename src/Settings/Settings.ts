import { OwnedAugmentationsOrderSetting, PurchaseAugmentationsOrderSetting } from "./SettingEnums";
import { defaultTheme } from "../Themes/Themes";
import { defaultStyles } from "../Themes/Styles";
import { CursorStyle, CursorBlinking, WordWrapOptions } from "../ScriptEditor/ui/Options";
import { defaultMonacoTheme } from "../ScriptEditor/ui/themes";
import { assertObject } from "../utils/TypeAssertion";
import { Result } from "../types";
import {
  assertAndSanitizeEditorTheme,
  assertAndSanitizeKeyBindings,
  assertAndSanitizeMainTheme,
  assertAndSanitizeStyles,
} from "../JsonSchema/JSONSchemaAssertion";
import { mergePlayerDefinedKeyBindings, type PlayerDefinedKeyBindingsType } from "../utils/KeyBindingUtils";
import { toggleSuppressErrorModals } from "../ErrorHandling/ErrorState";

/**
 * This function won't be able to catch **all** invalid hostnames. In order to validate a hostname properly, we need to
 * import a good validation library or write one by ourselves. Considering that we only need to catch common mistakes,
 * it's not worth the effort.
 *
 * Some invalid hostnames that we don't catch:
 * - Invalid/missing TLD: "abc".
 * - Use space character: "a a.com"
 * - Use non-http schemes in the hostname: "ftp://a.com"
 * - etc.
 */
export function isValidConnectionHostname(hostname: string): Result {
  // Return a user-friendly error message.
  if (hostname === "") {
    return {
      success: false,
      message: "Hostname cannot be empty",
    };
  }
  /**
   * We expect a hostname, but the player may mistakenly put other unexpected things. We will try to catch common mistakes:
   * - Specify a scheme: http or https.
   * - Specify a port.
   * - Specify a pathname or search params.
   */
  try {
    // Check scheme.
    if (hostname.startsWith("http://") || hostname.startsWith("https://")) {
      return {
        success: false,
        message: "Do not specify scheme (e.g., http, https)",
      };
    }
    // Parse to a URL with a default scheme.
    const url = new URL(`http://${hostname}`);
    // Check port, pathname, and search params.
    if (url.port !== "" || url.pathname !== "/" || url.search !== "") {
      return {
        success: false,
        message: "Do not specify port, pathname, or search parameters",
      };
    }
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: `Invalid hostname: ${hostname}`,
    };
  }
  return { success: true };
}

export function isValidConnectionPort(port: number): Result {
  // 0 is a special value for port. It's an invalid port, but the player can use it to disable RFA.
  if (!Number.isFinite(port) || port < 0 || port > 65535) {
    return { success: false, message: "Invalid port" };
  }
  return { success: true };
}

/** The current options the player has customized to their play style. */
export const Settings = {
  /** How many servers per page */
  ActiveScriptsServerPageSize: 10,
  /** How many scripts per page */
  ActiveScriptsScriptPageSize: 10,
  /** Script + args to launch on game load */
  AutoexecScript: "",
  /** How often the game should autosave the player's progress, in seconds. */
  AutosaveInterval: 60,
  /** Whether to render city as list of buttons. */
  DisableASCIIArt: false,
  /** Whether global keyboard shortcuts should be disabled throughout the game. */
  DisableHotkeys: false,
  /** Whether text effects such as corruption should be disabled. */
  DisableTextEffects: false,
  /** Whether overview progress bars should be visible. */
  DisableOverviewProgressBars: false,
  /** Whether to enable bash hotkeys */
  EnableBashHotkeys: false,
  /** Whether to enable terminal history search */
  EnableHistorySearch: false,
  /** Whether to show IPvGO in a traditional stone-and-shell-on-wood style, or the cyberpunk style */
  GoTraditionalStyle: false,
  /** Timestamps format string */
  TimestampsFormat: "",
  /** Locale used for display numbers. */
  Locale: "en",
  /** Limit the number of recently killed script entries being tracked. */
  MaxRecentScriptsCapacity: 50,
  /** Limit the number of log entries for each script being executed on each server. */
  MaxLogCapacity: 50,
  /** Limit how many entries can be written to a Netscript Port before entries start to get pushed out. */
  MaxPortCapacity: 50,
  /** Limit the number of entries in the terminal. */
  MaxTerminalCapacity: 500,
  /** IP address the Remote File API client will try to connect to. Default localhost . */
  RemoteFileApiAddress: "localhost",
  /** Port the Remote File API client will try to connect to. 0 to disable. */
  RemoteFileApiPort: 0,
  /** Automatically reconnect to the Remote File API client after this delay. Set it 0 to disable. */
  RemoteFileApiReconnectionDelay: 0,
  /** Use wss instead of ws when connecting to RFA clients */
  UseWssForRemoteFileApi: false,
  /** Whether to save the game when the player saves any file. */
  SaveGameOnFileSave: true,
  /** Whether to hide the confirmation dialog for augmentation purchases. */
  SuppressBuyAugmentationConfirmation: false,
  /** Whether to hide the info dialog for script errors. */
  SuppressErrorModals: false,
  /** Whether to hide the dialog showing new faction invites. */
  SuppressFactionInvites: false,
  /** Whether to hide the dialog when the player receives a new message file. */
  SuppressMessages: false,
  /** Whether to hide the confirmation dialog when the player attempts to travel between cities. */
  SuppressTravelConfirmation: false,
  /** Whether to hide the dialog when the player's Bladeburner actions are cancelled. */
  SuppressBladeburnerPopup: false,
  /** Whether to hide dialogs for stock market actions. */
  SuppressTIXPopup: false,
  /** Whether to hide the toast alert when the game is saved. */
  SuppressSavedGameToast: false,
  /** Whether to hide the toast warning when the autosave is disabled. */
  SuppressAutosaveDisabledWarnings: false,
  /** Whether to GiB instead of GB. */
  UseIEC60027_2: false,
  /** Whether to display intermediary time unit when their value is null */
  ShowMiddleNullTimeUnit: false,
  /** Whether the game should skip saving the running scripts to the save file. */
  ExcludeRunningScriptsFromSave: false,
  /**  Whether the game's sidebar is opened. */
  IsSidebarOpened: true,
  /** Tail rendering intervall in ms */
  TailRenderInterval: 1000,
  /** Theme colors. */
  theme: { ...defaultTheme },
  /** Interface styles. */
  styles: { ...defaultStyles },
  /** Character overview settings. */
  overview: { x: 0, y: 0, opened: true },
  /**  Script editor theme data. */
  EditorTheme: { ...defaultMonacoTheme },
  /** Order to display the player's owned Augmentations/Source Files. */
  OwnedAugmentationsOrder: OwnedAugmentationsOrderSetting.AcquirementTime,
  /** What order the Augmentations should be displayed in when purchasing from a Faction. */
  PurchaseAugmentationsOrder: PurchaseAugmentationsOrderSetting.Default,
  /** Script editor theme. */
  MonacoTheme: "monokai",
  /** Whether to use spaces instead of tabs for indentation */
  MonacoInsertSpaces: true,
  /** Size of indentation */
  MonacoTabSize: 2,
  /** Whether to auto detect indentation settings per-file based on contents */
  MonacoDetectIndentation: false,
  /** Font Family for script editor. */
  MonacoFontFamily: "JetBrainsMono",
  /** Text size for script editor. */
  MonacoFontSize: 20,
  /** Whether to use font ligatures in the script editor */
  MonacoFontLigatures: false,
  /** Whether to use Vim mod by default in the script editor */
  MonacoDefaultToVim: false,
  /** Word wrap setting for Script Editor. */
  MonacoWordWrap: "off" as WordWrapOptions,
  /** Whether to run Beautify code formatter on save */
  MonacoBeautifyOnSave: false,
  /** Control the cursor style*/
  MonacoCursorStyle: "line" as CursorStyle,
  /** Control the cursor animation style */
  MonacoCursorBlinking: "blink" as CursorBlinking,
  /** Whether to hide trailing zeroes on fractional part of decimal */
  hideTrailingDecimalZeros: false,
  /** Whether to hide thousands separators. */
  hideThousandsSeparator: false,
  /** Whether to use engineering notation instead of scientific for exponential form. */
  useEngineeringNotation: false,
  /** Whether to disable suffixes and always use exponential form (scientific or engineering). */
  disableSuffixes: false,
  /**
   * Player-defined key bindings. Don't use this property directly. It must be merged with DefaultKeyBindings in
   * src\utils\KeyBindingUtils.ts.
   */
  KeyBindings: {} as PlayerDefinedKeyBindingsType,
  /** Whether to sync Steam achievements */
  SyncSteamAchievements: true,

  load(saveString: string) {
    const save: unknown = JSON.parse(saveString);
    assertObject(save);
    save.overview && Object.assign(Settings.overview, save.overview);
    try {
      // Sanitize theme data. Invalid theme data may crash the game or make it stuck in the loading page.
      assertAndSanitizeMainTheme(save.theme);
      Object.assign(Settings.theme, save.theme);
    } catch (error) {
      console.error(error);
    }
    try {
      // Sanitize editor theme data. Invalid editor theme data may crash the game when the player opens the script editor.
      assertAndSanitizeEditorTheme(save.EditorTheme);
      Object.assign(Settings.EditorTheme, save.EditorTheme);
    } catch (error) {
      console.error(error);
    }
    try {
      // Sanitize styles.
      assertAndSanitizeStyles(save.styles);
      Object.assign(Settings.styles, save.styles);
    } catch (error) {
      console.error(error);
    }
    /**
     * KeyBindings data does not exist in old save files. Technically, this check is unnecessary. If KeyBindings is
     * undefined, assertAndSanitizeKeyBindings will throw an error, and that error will be caught here. However, it
     * means that there will be an error logged in the console every time the player loads an old save file, and this
     * logged error is kind of a "false positive" one.
     */
    if (save.KeyBindings !== undefined) {
      try {
        // Sanitize key bindings.
        assertAndSanitizeKeyBindings(save.KeyBindings);
        Object.assign(Settings.KeyBindings, save.KeyBindings);
      } catch (error) {
        console.error(error);
      }
    }
    Object.assign(Settings, save, {
      overview: Settings.overview,
      theme: Settings.theme,
      EditorTheme: Settings.EditorTheme,
      styles: Settings.styles,
      KeyBindings: Settings.KeyBindings,
    });
    /**
     * The hostname and port of RFA have not been validated properly, so the save data may contain invalid data. In that
     * case, we set them to the default value.
     */
    if (!isValidConnectionHostname(Settings.RemoteFileApiAddress).success) {
      Settings.RemoteFileApiAddress = "localhost";
    }
    if (!isValidConnectionPort(Settings.RemoteFileApiPort).success) {
      Settings.RemoteFileApiPort = 0;
    }

    // Merge Settings.KeyBindings with DefaultKeyBindings.
    mergePlayerDefinedKeyBindings(Settings.KeyBindings);

    // Set up initial state for error modal suppression
    toggleSuppressErrorModals(Settings.SuppressErrorModals, true);
  },
};
