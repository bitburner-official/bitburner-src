import type { IScriptEditorTheme } from "../ScriptEditor/ui/themes";
import type { ITheme } from "../Themes/Themes";
import { JsonSchemaValidator } from "./JsonSchemaValidator";

export function assertMainTheme(data: unknown): asserts data is ITheme {
  const validate = JsonSchemaValidator.MainTheme;
  if (!validate(data)) {
    console.error("validate.errors:", validate.errors);
    // validate.errors is an array of objects, so we need to use JSON.stringify.
    throw new Error(JSON.stringify(validate.errors));
  }
}

export function assertEditorTheme(data: unknown): asserts data is IScriptEditorTheme {
  const validate = JsonSchemaValidator.EditorTheme;
  if (!validate(data)) {
    console.error("validate.errors:", validate.errors);
    // validate.errors is an array of objects, so we need to use JSON.stringify.
    throw new Error(JSON.stringify(validate.errors));
  }
}
