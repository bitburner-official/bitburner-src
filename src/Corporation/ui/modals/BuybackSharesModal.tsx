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

  const ceoOwnership = (corp.numShares + shares) / corp.totalShares;
  const buybackPrice = corp.getTargetSharePrice(ceoOwnership);
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
          There are not this many shares available to buy back. There are only {formatShares(corp.issuedShares)}{" "}
          outstanding shares.
        </>
      );
    } else {
      return (
        <>
          Purchase {shares} shares for a total of <Money money={shares * buybackPrice} forPurchase={true} />
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
        Enter the number of outstanding shares you would like to buy back.
        <ul>
          <li>
            Repurchasing shares from the market will lead to an increase in <b>{corp.name}</b>'s stock price.
          </li>
          <li>All of these shares must be bought at the higher price.</li>
          <li>You purchase these shares with your own money (NOT your Corporation's funds).</li>
        </ul>
        The current buyback price of <b>{corp.name}</b>'s stock is <Money money={buybackPrice} forPurchase={true} />.
        <b>{corp.name}</b> currently has {formatShares(corp.issuedShares)} outstanding stock shares.
      </Typography>
      <CostIndicator />
      <br />
      <NumberInput
        defaultValue={shares}
        autoFocus={true}
        placeholder="Shares to buyback"
        onChange={setShares}
        onKeyDown={onKeyDown}
      />
      <ButtonWithTooltip disabledTooltip={disabledText} onClick={buy}>
        Buy shares
      </ButtonWithTooltip>
    </Modal>
  );
}
