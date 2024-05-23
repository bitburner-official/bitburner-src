import { OwnedAugmentationsOrderSetting, PurchaseAugmentationsOrderSetting } from "./SettingEnums";
import { defaultTheme } from "../Themes/Themes";
import { defaultStyles } from "../Themes/Styles";
import { CursorStyle, CursorBlinking, WordWrapOptions } from "../ScriptEditor/ui/Options";
import { defaultMonacoTheme } from "../ScriptEditor/ui/themes";

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
  /** How many milliseconds between execution points for Netscript 1 statements. */
  CodeInstructionRunTime: 25,
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
  /** Whether to save the game when the player saves any file. */
  SaveGameOnFileSave: true,
  /** Whether to hide the confirmation dialog for augmentation purchases. */
  SuppressBuyAugmentationConfirmation: false,
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
  /** Whether to use font ligatures */
  MonacoFontLigatures: false,
  /** Whether to use Vim mod by default in the script editor */
  MonacoVim: false,
  /** Word wrap setting for Script Editor. */
  MonacoWordWrap: "off" as WordWrapOptions,
  /** Control the cursor style*/
  MonacoCursorStyle: "line" as CursorStyle,
  /** Control the cursor animation style */
  MonacoCursorBlinking: "blink" as CursorBlinking,
  /** Whether to hide trailing zeroes on fractional part of decimal */
  hideTrailingDecimalZeros: false,
  /** Whether to hide thousands separators. */
  hideThousandsSeparator: false,
  /** Whether to use engineering notation instead of scientific for exponentials. */
  useEngineeringNotation: false,
  /** Whether to disable suffixes and always use exponential form (scientific or engineering). */
  disableSuffixes: false,

  load(saveString: string) {
    const save = JSON.parse(saveString);
    save.theme && Object.assign(Settings.theme, save.theme);
    save.styles && Object.assign(Settings.styles, save.styles);
    save.overview && Object.assign(Settings.overview, save.overview);
    save.EditorTheme && Object.assign(Settings.EditorTheme, save.EditorTheme);
    delete save.theme, save.styles, save.overview, save.EditorTheme;
    Object.assign(Settings, save);
  },
};
