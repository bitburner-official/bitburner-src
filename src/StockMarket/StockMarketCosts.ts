import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { StockMarketConstants } from "./data/Constants";

export function getStockMarket4SDataCost(): number {
  return StockMarketConstants.MarketData4SCost * currentNodeMults.FourSigmaMarketDataCost;
}

export function getStockMarket4STixApiCost(): number {
  return StockMarketConstants.MarketDataTixApi4SCost * currentNodeMults.FourSigmaMarketDataApiCost;
}

export function getStockMarketWseCost(): number {
  return StockMarketConstants.WseAccountCost;
}

export function getStockMarketTixApiCost(): number {
  return StockMarketConstants.TixApiCost;
}
