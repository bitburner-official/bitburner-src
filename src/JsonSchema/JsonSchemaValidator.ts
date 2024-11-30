import Ajv from "ajv";
import { AllGangsSchema } from "./Data/AllGangsSchema";
import { StockMarketSchema } from "./Data/StockMarketSchema";

const ajv = new Ajv();

export const JsonSchemaValidator = {
  AllGangs: ajv.compile(AllGangsSchema),
  StockMarket: ajv.compile(StockMarketSchema),
};
