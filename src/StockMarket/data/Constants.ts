import { StockMarketConstants as ConstantsType } from "@nsdefs";

export const StockMarketConstants: ConstantsType = {
  msPerStockUpdate: 6e3,
  msPerStockUpdateMin: 4e3,
  TicksPerCycle: 75,
  WSEAccountCost: 200e6,
  TIXAPICost: 5e9,
  MarketData4SCost: 1e9,
  MarketDataTixApi4SCost: 25e9,
  StockMarketCommission: 100e3,
  forecastChangePerPriceMovement: 0.006,
  forecastForecastChangeFromHack: 0.1,
  forecastForecastChangeFromCompanyWork: 0.001,
};
