import Ajv from "ajv";
import { AllGangsSchema } from "./Data/AllGangsSchema";
import { StockMarketSchema } from "./Data/StockMarketSchema";
import { StylesSchema } from "./Data/StylesSchema";
import { EditorThemeSchema, MainThemeSchema } from "./Data/ThemeSchema";

const ajv = new Ajv();

export const JsonSchemaValidator = {
  AllGangs: ajv.compile(AllGangsSchema),
  StockMarket: ajv.compile(StockMarketSchema),
  MainTheme: ajv.compile(MainThemeSchema),
  EditorTheme: ajv.compile(EditorThemeSchema),
  Styles: ajv.compile(StylesSchema),
};
