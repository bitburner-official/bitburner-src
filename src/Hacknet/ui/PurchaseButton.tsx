import React from "react";

import { hasHacknetServers, hasMaxNumberHacknetServers } from "../HacknetHelpers";
import { MoneyCost } from "./Components/MoneyCost";
import { MoneyButton } from "./Components/MoneyButton";

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
      text = <>Hacknet Server limit reached</>;
    } else {
      text = (
        <>
          Purchase Hacknet Server -&nbsp;
          <MoneyCost cost={cost} />
        </>
      );
    }
  } else {
    text = (
      <>
        Purchase Hacknet Node -&nbsp;
        <MoneyCost cost={cost} />
      </>
    );
  }

  return (
    <MoneyButton cost={cost} onClick={props.onClick}>
      {text}
    </MoneyButton>
  );
}
