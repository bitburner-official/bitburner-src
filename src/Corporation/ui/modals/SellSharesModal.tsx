import React, { useState } from "react";
import { formatShares } from "../../../ui/formatNumber";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Modal } from "../../../ui/React/Modal";
import { Money } from "../../../ui/React/Money";
import { useCorporation } from "../Context";
import { Corporation } from "../../Corporation";
import * as corpConstants from "../../data/Constants";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { SellShares } from "../../Actions";
import { KEY } from "../../../utils/helpers/keyCodes";
import { NumberInput } from "../../../ui/React/NumberInput";
import { isInteger } from "lodash";
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

  const disabled = isNaN(shares) || shares <= 0 || shares >= corp.numShares;

  function ProfitIndicator(props: { shares: number | null; corp: Corporation }): React.ReactElement {
    if (props.shares === null || isNaN(props.shares)) return <></>;
    if (props.shares < 0 || !isInteger(props.shares)) {
      return <Typography>ERROR: Invalid value entered for number of shares to sell</Typography>;
    } else if (props.shares > corp.numShares) {
      return <Typography>You don't have this many shares to sell!</Typography>;
    } else if (props.shares === corp.numShares) {
      return <Typography>You can not sell all your shares!</Typography>;
    } else if (props.shares > 1e14) {
      return <Typography>You can't sell more than 100t shares at once!</Typography>;
    } else {
      const [profit, sharePrice] = corp.calculateShareSale(props.shares);
      return (
        <Typography>
          Sell {formatShares(props.shares)} shares for a total of <Money money={profit} />?
          <br />
          <b>{corp.name}</b>'s stock price will fall to <Money money={sharePrice} /> per share.
        </Typography>
      );
    }
  }

  function sell(): void {
    if (disabled) return;
    try {
      const profit = SellShares(corp, shares);
      props.onClose();
      dialogBoxCreate(
        <>
          Sold {formatShares(shares)} shares for <Money money={profit} />.
          <br />
          <b>{corp.name}</b>'s stock price fell to <Money money={corp.sharePrice} />.
        </>,
      );

      props.rerender();
    } catch (err) {
      dialogBoxCreate(err + "");
    }
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
            {corp.convertCooldownToString(corpConstants.sellSharesCooldown)}.
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
      <Button disabled={disabled} onClick={sell} sx={{ mx: 1 }}>
        Sell shares
      </Button>
      <br />
      <br />
      <ProfitIndicator shares={shares} corp={corp} />
    </Modal>
  );
}
