import { IOrderBook } from "./IOrderBook";
import { Stock } from "./Stock";

export type IStockMarket = Record<string, Stock> & {
  lastUpdate: number;
  Orders: IOrderBook;
  storedCycles: number;
  ticksUntilCycle: number;
};
