import React, { useState } from "react";

import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Money } from "../../ui/React/Money";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { canAccessStockMarket, StockMarket as SM } from "../../StockMarket/StockMarket";
import { Stock } from "../../StockMarket/Stock";
import { AutoExpandAccordion } from "../../ui/AutoExpand/AutoExpandAccordion";

export function StockMarketDev(): React.ReactElement {
  const [stockPrice, setStockPrice] = useState(0);
  const [stockSymbol, setStockSymbol] = useState("");
  if (!canAccessStockMarket()) {
    return (
      <AutoExpandAccordion cacheKey="DEVMENU_StockMarketDev" unmountOnExit={true} disabled={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>股票市场</Typography>
        </AccordionSummary>
      </AutoExpandAccordion>
    );
  }

  function setStockPriceField(event: React.ChangeEvent<HTMLInputElement>): void {
    setStockPrice(parseFloat(event.target.value));
  }

  function setStockSymbolField(event: React.ChangeEvent<HTMLInputElement>): void {
    setStockSymbol(event.target.value);
  }

  function processStocks(sub: (arg0: Stock) => void): void {
    const inputSymbols = stockSymbol.replace(/\s/g, "");

    let match: (symbol: string) => boolean = (): boolean => {
      return true;
    };

    if (inputSymbols !== "" && inputSymbols !== "all") {
      match = function (symbol: string): boolean {
        return inputSymbols.split(",").includes(symbol);
      };
    }

    for (const name of Object.keys(SM)) {
      if (Object.hasOwn(SM, name)) {
        const stock = SM[name];
        if (stock instanceof Stock && match(stock.symbol)) {
          sub(stock);
        }
      }
    }
  }

  function doSetStockPrice(): void {
    if (!isNaN(stockPrice)) {
      processStocks((stock: Stock) => {
        stock.price = stockPrice;
      });
    }
  }

  function viewStockCaps(): void {
    const stocks: JSX.Element[] = [];
    processStocks((stock: Stock) => {
      stocks.push(
        <tr key={stock.symbol}>
          <td>{stock.symbol}</td>
          <td style={{ textAlign: "right" }}>
            <Money money={stock.cap} />
          </td>
        </tr>,
      );
    });
    dialogBoxCreate(
      <table>
        <tbody>
          <tr>
            <th>股票</th>
            <th>价格上限</th>
          </tr>
          {stocks}
        </tbody>
      </table>,
    );
  }
  return (
    <AutoExpandAccordion cacheKey="DEVMENU_StockMarketDev" unmountOnExit={true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>股票市场</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <table>
          <tbody>
            <tr>
              <td>
                <Typography>代码：</Typography>
              </td>
              <td>
                <TextField placeholder="代码/'all'" onChange={setStockSymbolField} />
              </td>
            </tr>
            <tr>
              <td>
                <Typography>价格：</Typography>
              </td>
              <td>
                <TextField placeholder="$$$" onChange={setStockPriceField} />
                <Button onClick={doSetStockPrice}>设置</Button>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>上限：</Typography>
              </td>
              <td>
                <Button onClick={viewStockCaps}>查看股价上限</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </AccordionDetails>
    </AutoExpandAccordion>
  );
}
