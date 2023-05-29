import React, { useState } from "react";

import Typography from "@mui/material/Typography";
import { Player } from "@player";

import { isPositiveInteger } from "../../../types";
import { ButtonWithTooltip } from "../../../ui/Components/ButtonWithTooltip";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Modal } from "../../../ui/React/Modal";
import { NumberInput } from "../../../ui/React/NumberInput";
import { formatBigNumber, formatMoney } from "../../../ui/formatNumber";
import { KEY } from "../../../utils/helpers/keyCodes";
import { BuyBackShares } from "../../Actions";
import { useCorporation } from "../Context";

interface IProps {
  open: boolean;
  onClose: () => void;
  rerender: () => void;
}

// Create a popup that lets the player buyback shares
// This is created when the player clicks the "Buyback Shares" button in the overview panel
export function BuybackSharesModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const [shares, setShares] = useState<number>(NaN);

  const currentStockPrice = corp.sharePrice;
  const buybackPrice = currentStockPrice * 1.1;
  const disabledText = !isPositiveInteger(shares)
    ? "Number of shares must be a positive integer"
    : shares > corp.issuedShares
    ? "There are not enough shares available to buyback this many"
    : shares * buybackPrice > Player.money
    ? "Insufficient player funds"
    : "";

  function buy(): void {
    if (disabledText) return;
    try {
      BuyBackShares(corp, shares);
    } catch (err) {
      dialogBoxCreate(err + "");
    }
    props.onClose();
    props.rerender();
  }

  function CostIndicator(): React.ReactElement {
    if (shares === null) return <></>;
    if (isNaN(shares) || shares <= 0) {
      return <>ERROR: Invalid value entered for number of shares to buyback</>;
    } else if (shares > corp.issuedShares) {
      return (
        <>
          There are not this many shares available to buy back. There are only {formatBigNumber(corp.issuedShares)}{" "}
          outstanding shares.
        </>
      );
    } else {
      return (
        <>
          Purchase {shares} shares for a total of {formatMoney(shares * buybackPrice)}
        </>
      );
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) buy();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        Enter the number of outstanding shares you would like to buy back. These shares must be bought at a 10% premium.
        However, repurchasing shares from the market tends to lead to an increase in stock price.
        <br />
        <br />
        To purchase these shares, you must use your own money (NOT your Corporation's funds).
        <br />
        <br />
        The current buyback price of your company's stock is {formatMoney(buybackPrice)}. Your company currently has{" "}
        {formatBigNumber(corp.issuedShares)} outstanding stock shares.
      </Typography>
      <CostIndicator />
      <br />
      <NumberInput autoFocus={true} placeholder="Shares to buyback" onChange={setShares} onKeyDown={onKeyDown} />
      <ButtonWithTooltip disabledTooltip={disabledText} onClick={buy}>
        Buy shares
      </ButtonWithTooltip>
    </Modal>
  );
}
