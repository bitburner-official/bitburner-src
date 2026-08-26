import React from "react";

import { hasHacknetServers, hasMaxNumberHacknetServers } from "../HacknetHelpers";
import { Player } from "@player";
import { Money } from "../../ui/React/Money";

import Button from "@mui/material/Button";

interface IProps {
  multiplier: number | string;
  onClick: () => void;
  cost: number;
}

/** React Component for the button that is used to purchase new Hacknet Nodes */
export function PurchaseButton(props: IProps): React.ReactElement {
  const cost = props.cost;
  let text;
  if (hasHacknetServers()) {
    if (hasMaxNumberHacknetServers()) {
      text = <>已达到 Hacknet 服务器数量上限</>;
    } else {
      text = (
        <>
          购买 Hacknet 服务器 -&nbsp;
          <Money money={cost} forPurchase={true} />
        </>
      );
    }
  } else {
    text = (
      <>
        购买 Hacknet 节点 -&nbsp;
        <Money money={cost} forPurchase={true} />
      </>
    );
  }

  return (
    <Button disabled={!Player.canAfford(cost)} onClick={props.onClick}>
      {text}
    </Button>
  );
}
