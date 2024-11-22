import type { ValidateFunction } from "ajv/dist/types";
import type { IStyleSettings } from "../ScriptEditor/NetscriptDefinitions";
import type { IScriptEditorTheme } from "../ScriptEditor/ui/themes";
import type { ITheme } from "../Themes/Themes";
import { JsonSchemaValidator } from "./JsonSchemaValidator";

function assertAndSanitize(data: unknown, validate: ValidateFunction<unknown>): void {
  if (!validate(data)) {
    console.error("validate.errors:", validate.errors);
    // validate.errors is an array of objects, so we need to use JSON.stringify.
    throw new Error(JSON.stringify(validate.errors));
  }
}

/**
 * This function validates the unknown data and removes properties not defined in MainThemeSchema.
 */
export function assertAndSanitizeMainTheme(data: unknown): asserts data is ITheme {
  assertAndSanitize(data, JsonSchemaValidator.MainTheme);
}

/**
 * This function validates the unknown data and removes properties not defined in EditorThemeSchema.
 */
export function assertAndSanitizeEditorTheme(data: unknown): asserts data is IScriptEditorTheme {
  assertAndSanitize(data, JsonSchemaValidator.EditorTheme);
}

/**
 * This function validates the unknown data and removes properties not defined in StylesSchema.
 */
export function assertAndSanitizeStyles(data: unknown): asserts data is IStyleSettings {
  assertAndSanitize(data, JsonSchemaValidator.Styles);
}
