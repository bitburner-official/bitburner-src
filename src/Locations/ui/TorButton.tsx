import React from "react";
import Button from "@mui/material/Button";

import { dialogBoxCreate } from "../../ui/React/DialogBox";

import { CONSTANTS } from "../../Constants";
import { Player } from "@player";

import { Money } from "../../ui/React/Money";
import { getTorRouter } from "../../Server/ServerHelpers";

/** Attempt to purchase a TOR router using the button. */
export function purchaseTorRouter(): void {
  if (Player.hasTorRouter()) {
    dialogBoxCreate(`你已经拥有一台 TOR 路由器！`);
    return;
  }
  if (!Player.canAfford(CONSTANTS.TorRouterCost)) {
    dialogBoxCreate("你的资金不足以购买 TOR 路由器！");
    return;
  }
  Player.loseMoney(CONSTANTS.TorRouterCost, "other");

  getTorRouter();
  dialogBoxCreate(
    "你购买了一台 TOR 路由器！\n" +
      "现在可以从家用电脑访问暗网了。\n" +
      `在终端中使用 "buy" 命令购买程序。`,
  );
}

interface IProps {
  rerender: () => void;
}

export function TorButton(props: IProps): React.ReactElement {
  function buy(): void {
    purchaseTorRouter();
    props.rerender();
  }

  const hasTorRouter = Player.hasTorRouter();

  return (
    <Button disabled={!Player.canAfford(CONSTANTS.TorRouterCost) || hasTorRouter} onClick={buy}>
      购买 TOR 路由器 -&nbsp;
      {hasTorRouter ? "已购买" : <Money money={CONSTANTS.TorRouterCost} forPurchase={true} />}
    </Button>
  );
}
