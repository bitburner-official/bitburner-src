import { getRecordEntries } from "../../Types/Record";
import { StockSymbol } from "@enums";

export const TickerHeaderFormatData = {
  longestName: 0,
  longestSymbol: 0,
};

for (const [key, symbol] of getRecordEntries(StockSymbol)) {
  TickerHeaderFormatData.longestName = Math.max(key.length, TickerHeaderFormatData.longestName);
  TickerHeaderFormatData.longestSymbol = Math.max(symbol.length, TickerHeaderFormatData.longestSymbol);
}
