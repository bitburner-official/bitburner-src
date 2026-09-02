import type { Result } from "@nsdefs";
import { toggleSuppressErrorModals } from "../ErrorHandling/ErrorState";
import {
  assertAndSanitizeEditorTheme,
  assertAndSanitizeKeyBindings,
  assertAndSanitizeMainTheme,
  assertAndSanitizeStyles,
} from "../JsonSchema/JSONSchemaAssertion";
import { mergePlayerDefinedKeyBindings } from "../utils/KeyBindingUtils";
import { assertObject } from "../utils/TypeAssertion";
import { Settings } from "./Settings";

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

/**
 * Checks whether the input is a valid RFA port configuration value.
 *
 * Port 0 is normally invalid, but it is used to disable RFA, so this function treats 0 as valid.
 */
export function isValidRFAConnectionPortSetting(port: number): Result {
  // 0 is not a valid port, but it is a valid configuration value that disables RFA.
  if (!Number.isFinite(port) || port < 0 || port > 65535) {
    return { success: false, message: "Invalid port" };
  }
  return { success: true };
}

/**
 * Checks whether the input is a valid RFA port before starting a new connection.
 */
export function isValidConnectionPort(port: number): boolean {
  return isValidRFAConnectionPortSetting(port).success && port !== 0;
}

export function loadSettings(saveString: string) {
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
  if (!isValidRFAConnectionPortSetting(Settings.RemoteFileApiPort).success) {
    Settings.RemoteFileApiPort = 0;
  }

  // Merge Settings.KeyBindings with DefaultKeyBindings.
  mergePlayerDefinedKeyBindings(Settings.KeyBindings);

  // Set up initial state for error modal suppression
  toggleSuppressErrorModals(Settings.SuppressErrorModals, true);

  // Disable this feature for existing save files.
  if (save.MonacoAutoSaveOnFocusChange === undefined) {
    Settings.MonacoAutoSaveOnFocusChange = false;
  }
}
