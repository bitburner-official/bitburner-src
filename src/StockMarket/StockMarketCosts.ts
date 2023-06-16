import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { CONSTANTS } from "../Constants";

export function getStockMarket4SDataCost(): number {
  return CONSTANTS.MarketData4SCost * currentNodeMults.FourSigmaMarketDataCost;
}

export function getStockMarket4STixApiCost(): number {
  return CONSTANTS.MarketDataTixApi4SCost * currentNodeMults.FourSigmaMarketDataApiCost;
}

export function getStockMarketWseCost(): number {
  return CONSTANTS.WSEAccountCost;
}

export function getStockMarketTixApiCost(): number {
  return CONSTANTS.TIXAPICost;
}
