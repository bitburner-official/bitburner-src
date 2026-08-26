/**
 * React component for the Stock Market UI. This component displays
 * general information about the stock market, buttons for the various purchases,
 * and a link to the documentation (Investopedia)
 */
import React, { useState } from "react";

import { getStockMarket4SDataCost, getStockMarket4STixApiCost } from "../StockMarketCosts";

import { StockMarketConstants } from "../data/Constants";
import { Player } from "@player";
import { Money } from "../../ui/React/Money";
import { initStockMarket, isStockMarketInitialized } from "../StockMarket";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import HelpIcon from "@mui/icons-material/Help";
import CheckIcon from "@mui/icons-material/Check";
import { StaticModal } from "../../ui/React/StaticModal";
import { FactionName } from "@enums";

interface IProps {
  rerender: () => void;
}

function Purchase4SMarketDataTixApiAccessButton(props: IProps): React.ReactElement {
  function purchase4SMarketDataTixApiAccess(): void {
    if (Player.has4SDataTixApi) {
      return;
    }
    if (Player.bitNodeOptions.disable4SData) {
      return;
    }
    if (!Player.hasTixApiAccess) {
      return;
    }
    if (!Player.canAfford(getStockMarket4STixApiCost())) {
      return;
    }
    Player.has4SDataTixApi = true;
    Player.loseMoney(getStockMarket4STixApiCost(), "stock");
    props.rerender();
  }

  if (Player.has4SDataTixApi) {
    return (
      <Typography>
        4S 市场数据 TIX API 访问权限 <CheckIcon />
      </Typography>
    );
  }
  const cost = getStockMarket4STixApiCost();
  let tooltipTitle = "让你通过 Netscript 访问 4S 市场数据";
  if (Player.bitNodeOptions.disable4SData) {
    tooltipTitle = "4S 市场数据已在 BitNode 高级选项中禁用";
  } else if (!Player.hasTixApiAccess) {
    tooltipTitle = "需要 TIX API 访问权限";
  } else if (!Player.canAfford(cost)) {
    tooltipTitle = "你的资金不足";
  }
  return (
    <Tooltip title={<Typography>{tooltipTitle}</Typography>}>
      <span>
        <Button
          disabled={Player.bitNodeOptions.disable4SData || !Player.hasTixApiAccess || !Player.canAfford(cost)}
          onClick={purchase4SMarketDataTixApiAccess}
        >
          购买 4S 市场数据 TIX API 访问权限 -&nbsp;
          <Money money={cost} forPurchase={true} />
        </Button>
      </span>
    </Tooltip>
  );
}

function PurchaseWseAccountButton(props: IProps): React.ReactElement {
  if (Player.hasWseAccount) {
    return (
      <Typography>
        WSE 账户 <CheckIcon />
      </Typography>
    );
  }
  function purchaseWseAccount(): void {
    if (Player.hasWseAccount) {
      return;
    }
    if (!Player.canAfford(StockMarketConstants.WseAccountCost)) {
      return;
    }
    Player.hasWseAccount = true;
    if (!isStockMarketInitialized()) {
      initStockMarket();
    }
    Player.loseMoney(StockMarketConstants.WseAccountCost, "stock");
    props.rerender();
  }

  const cost = StockMarketConstants.WseAccountCost;
  let tooltipTitle = "让你通过界面（UI）交易股票";
  if (!Player.canAfford(cost)) {
    tooltipTitle = "你的资金不足";
  }
  return (
    <>
      <Typography>如果你想通过股票市场面板（UI）进行交易，必须购买 WSE 账户。</Typography>
      <Tooltip title={<Typography>{tooltipTitle}</Typography>}>
        <span>
          <Button disabled={!Player.canAfford(cost)} onClick={purchaseWseAccount}>
            购买 WSE 账户 -&nbsp;
            <Money money={cost} forPurchase={true} />
          </Button>
        </span>
      </Tooltip>
    </>
  );
}

function PurchaseTixApiAccessButton(props: IProps): React.ReactElement {
  function purchaseTixApiAccess(): void {
    if (Player.hasTixApiAccess) {
      return;
    }
    if (!Player.canAfford(StockMarketConstants.TixApiCost)) {
      return;
    }
    Player.hasTixApiAccess = true;
    if (!isStockMarketInitialized()) {
      initStockMarket();
    }
    Player.loseMoney(StockMarketConstants.TixApiCost, "stock");
    props.rerender();
  }

  if (Player.hasTixApiAccess) {
    return (
      <Typography>
        TIX API 访问权限 <CheckIcon />
      </Typography>
    );
  }
  const cost = StockMarketConstants.TixApiCost;
  let tooltipTitle = "让你通过 NS API 交易股票";
  if (!Player.canAfford(cost)) {
    tooltipTitle = "你的资金不足";
  }
  return (
    <>
      <Typography>
        TIX 是 Trade Information eXchange 的缩写，是世界股票交易所（WSE）使用的通信协议。购买 TIX API
        访问权限后，你可以编写代码来构建自己的算法化/自动化交易策略。
      </Typography>
      <Typography>如果你想通过 NS API 进行交易，必须购买 TIX API 访问权限。</Typography>
      <Tooltip title={<Typography>{tooltipTitle}</Typography>}>
        <span>
          <Button disabled={!Player.canAfford(cost)} onClick={purchaseTixApiAccess}>
            购买 Trade Information eXchange（TIX）API 访问权限 -&nbsp;
            <Money money={cost} forPurchase={true} />
          </Button>
        </span>
      </Tooltip>
    </>
  );
}

function Purchase4SMarketDataButton(props: IProps): React.ReactElement {
  function purchase4SMarketData(): void {
    if (Player.has4SData) {
      return;
    }
    if (Player.bitNodeOptions.disable4SData) {
      return;
    }
    if (!Player.hasWseAccount) {
      return;
    }
    if (!Player.canAfford(getStockMarket4SDataCost())) {
      return;
    }
    Player.has4SData = true;
    Player.loseMoney(getStockMarket4SDataCost(), "stock");
    props.rerender();
  }
  if (Player.has4SData) {
    return (
      <Typography>
        4S 市场数据界面访问权限 <CheckIcon />
      </Typography>
    );
  }
  const cost = getStockMarket4SDataCost();
  let tooltipTitle = "让你查看关于股票的额外价格与波动率信息";
  if (Player.bitNodeOptions.disable4SData) {
    tooltipTitle = "4S 市场数据已在 BitNode 高级选项中禁用";
  } else if (!Player.hasWseAccount) {
    tooltipTitle = "需要 WSE 账户";
  } else if (!Player.canAfford(cost)) {
    tooltipTitle = "你的资金不足";
  }
  return (
    <Tooltip title={<Typography>{tooltipTitle}</Typography>}>
      <span>
        <Button
          disabled={Player.bitNodeOptions.disable4SData || !Player.hasWseAccount || !Player.canAfford(cost)}
          onClick={purchase4SMarketData}
        >
          购买 4S 市场数据访问权限 -&nbsp;
          <Money money={cost} forPurchase={true} />
        </Button>
      </span>
    </Tooltip>
  );
}

export function InfoAndPurchases(props: IProps): React.ReactElement {
  const [helpOpen, setHelpOpen] = useState(false);
  return (
    <>
      <Typography variant="h4">欢迎来到世界股票交易所（WSE）！</Typography>

      <Typography variant="h5" color="primary">
        WSE 账户
      </Typography>
      <PurchaseWseAccountButton {...props} />

      <Typography variant="h5" color="primary">
        Trade Information eXchange（TIX）API
      </Typography>
      <PurchaseTixApiAccessButton {...props} />

      <Typography variant="h5" color="primary">
        {FactionName.FourSigma}（4S）市场数据源
      </Typography>
      <Typography>
        {FactionName.FourSigma}
        （4S）市场数据源提供有关股票的信息，可帮助你制定交易策略。
        <IconButton onClick={() => setHelpOpen(true)}>
          <HelpIcon />
        </IconButton>
      </Typography>
      <Purchase4SMarketDataTixApiAccessButton {...props} />
      <Purchase4SMarketDataButton {...props} />

      <Typography>
        手续费：你所进行的每笔交易都需要支付{" "}
        <Money money={StockMarketConstants.StockMarketCommission} forPurchase={true} /> 的佣金。
      </Typography>
      <br />
      <Typography>
        警告：安装强化后进行重置时，股票市场也会被重置。你将保留 WSE 账户、TIX API
        访问权限以及 4S 市场数据访问权限。但你所有的股票持仓都会丢失，因此请务必在安装强化前卖掉你的股票！
      </Typography>
      <StaticModal open={helpOpen} onClose={() => setHelpOpen(false)}>
        <Typography>
          访问 4S 市场数据源后，每只股票会额外显示两项信息：价格预测与波动率
          <br />
          <br />
          价格预测表示股票上涨或下跌的概率。“+”预测意味着该股票上涨的可能性大于下跌，“-”则相反。“+/-”
          符号的数量用于体现这些概率的大小。例如，“+++”表示该股票上涨的可能性远大于下跌，而“+”则表示仅略微偏高。
          <br />
          <br />
          波动率表示股票价格每个 tick 可能变化的最大百分比（游戏运行时每隔几秒会发生一个 tick）。
          <br />
          <br />股票的价格预测会随时间而变化，这同样受波动率影响。股票的波动性越大，其价格预测的变化幅度也越大。
        </Typography>
      </StaticModal>
    </>
  );
}
