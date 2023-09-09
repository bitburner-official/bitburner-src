import React, { useState } from "react";
import { Modal } from "../../../ui/React/Modal";
import { Money } from "../../../ui/React/Money";
import { formatShares } from "../../../ui/formatNumber";
import { Player } from "@player";
import { useCorporation } from "../Context";
import Typography from "@mui/material/Typography";
import { ButtonWithTooltip } from "../../../ui/Components/ButtonWithTooltip";
import { NumberInput } from "../../../ui/React/NumberInput";
import { BuyBackShares } from "../../Actions";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { KEY } from "../../../utils/helpers/keyCodes";
import { isPositiveInteger } from "../../../types";

interface IProps {
  open: boolean;
  onClose: () => void;
  rerender: () => void;
}

// Create a popup that lets the player buyback shares
// This is created when the player clicks the "Buyback Shares" button in the overview panel
export function BuybackSharesModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const [shares, setShares] = useState<number>(corp.issuedShares);

  let profit = 0;
  let sharePrice = 0;
  if (shares <= corp.issuedShares) {
    [profit, sharePrice] = corp.calculateShareSale(-shares);
  }
  const cost = -1.1 * profit;

  const disabledText = !isPositiveInteger(shares)
    ? "Number of shares must be a positive integer"
    : shares > 1e14
    ? `Cannot buy more than ${formatShares(1e14)} shares at once`
    : shares > corp.issuedShares
    ? "There are not enough shares available to buyback this many"
    : cost > Player.money
    ? "Insufficient player funds"
    : "";

  function buy(): void {
    if (disabledText) return;
    try {
      BuyBackShares(corp, shares);
      setShares(corp.issuedShares || NaN);
    } catch (err) {
      dialogBoxCreate(err + "");
    }
    props.onClose();
    props.rerender();
  }

  function CostIndicator(): React.ReactElement {
    if (shares > 0 && sharePrice != 0) {
      return (
        <Typography>
          <b>{corp.name}</b>'s stock price will rise to <Money money={sharePrice} /> per share.
        </Typography>
      );
    } else {
      return <Typography>&nbsp;</Typography>;
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) buy();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography component="div">
        Enter the number of outstanding shares you would like to buy back.
        <ul>
          <li>These shares must be bought at a 10% premium over the market price.</li>
          <li>The stock price will tend to rise due to market forces.</li>
          <li>You purchase these shares with your own money (NOT your Corporation's funds).</li>
        </ul>
        <b>{corp.name}</b> currently has {formatShares(corp.issuedShares)} outstanding stock shares, valued at{" "}
        <Money money={corp.sharePrice} /> per share.
      </Typography>
      <br />
      <NumberInput
        defaultValue={shares || ""}
        autoFocus={true}
        placeholder="Shares to buyback"
        onChange={setShares}
        onKeyDown={onKeyDown}
      />
      <ButtonWithTooltip disabledTooltip={disabledText} onClick={buy}>
        Buy shares
        {cost > 0 ? (
          <>
            &nbsp;-&nbsp;
            <Money money={cost} forPurchase={true} />{" "}
          </>
        ) : (
          <></>
        )}
      </ButtonWithTooltip>
      <br />
      <br />
      <CostIndicator />
    </Modal>
  );
}
