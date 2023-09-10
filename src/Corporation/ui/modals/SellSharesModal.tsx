import React, { useState } from "react";
import { formatShares } from "../../../ui/formatNumber";
import { Modal } from "../../../ui/React/Modal";
import { Money } from "../../../ui/React/Money";
import { useCorporation } from "../Context";
import * as corpConstants from "../../data/Constants";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { SellShares } from "../../Actions";
import { KEY } from "../../../utils/helpers/keyCodes";
import { NumberInput } from "../../../ui/React/NumberInput";
interface IProps {
  open: boolean;
  onClose: () => void;
  rerender: () => void;
}

// Create a popup that lets the player sell Corporation shares
// This is created when the player clicks the "Sell Shares" button in the overview panel
export function SellSharesModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const [shares, setShares] = useState<number>(NaN);

  const [canSell, disabledText] = corp.canSellShares(shares);
  const [profit, sharePrice] = corp.calculateShareSale(shares);

  function ProfitIndicator(): React.ReactElement {
    if (disabledText) {
      return <Typography>{disabledText}</Typography>;
    } else {
      return (
        <Typography>
          Sell {formatShares(shares)} shares?
          <br />
          <b>{corp.name}</b>'s stock price will fall to <Money money={sharePrice} /> per share.
          <br />
          You will receive <Money money={profit} />.
        </Typography>
      );
    }
  }

  function sell(): void {
    if (!canSell) return;
    // hack to prevent re-rendering during modal close animation
    setTimeout(() => {
      SellShares(corp, shares);
    }, 1);
    props.onClose();
    props.rerender();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) sell();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        Enter the number of shares you would like to sell.
        <ul>
          <li>Selling shares will cause stock price to fall due to market forces.</li>
          <li>The money from selling your shares will go directly to you (NOT your Corporation).</li>
          <li>
            You will not be able to sell shares again (or dissolve the corporation) for{" "}
            <b>{corp.convertCooldownToString(corpConstants.sellSharesCooldown)}</b>.
          </li>
        </ul>
        You currently have {formatShares(corp.numShares)} shares of <b>{corp.name}</b> stock, valued at{" "}
        <Money money={corp.sharePrice} /> per share.
      </Typography>
      <br />
      <NumberInput
        defaultValue={shares || ""}
        variant="standard"
        autoFocus
        placeholder="Shares to sell"
        onChange={setShares}
        onKeyDown={onKeyDown}
      />
      <Button disabled={!canSell} onClick={sell} sx={{ mx: 1 }}>
        Sell shares
      </Button>
      <br />
      <br />
      <ProfitIndicator />
    </Modal>
  );
}
