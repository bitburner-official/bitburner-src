import Ajv from "ajv";
import { AllGangsSchema } from "./Data/AllGangsSchema";
import { StockMarketSchema } from "./Data/StockMarketSchema";
import { StylesSchema } from "./Data/StylesSchema";
import { EditorThemeSchema, MainThemeSchema } from "./Data/ThemeSchema";

const ajv = new Ajv();
const ajvWithRemoveAdditionalOption = new Ajv({ removeAdditional: "all" });

export const JsonSchemaValidator = {
  AllGangs: ajv.compile(AllGangsSchema),
  StockMarket: ajv.compile(StockMarketSchema),
  MainTheme: ajvWithRemoveAdditionalOption.compile(MainThemeSchema),
  EditorTheme: ajvWithRemoveAdditionalOption.compile(EditorThemeSchema),
  Styles: ajvWithRemoveAdditionalOption.compile(StylesSchema),
};
