import React, { useState, useMemo } from "react";
import { isInteger } from "lodash";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { formatShares } from "../../../ui/formatNumber";
import { Modal } from "../../../ui/React/Modal";
import { Money } from "../../../ui/React/Money";
import { useCorporation } from "../Context";
import * as corpConstants from "../../data/Constants";
import Typography from "@mui/material/Typography";
import { ButtonWithTooltip } from "../../../ui/Components/ButtonWithTooltip";
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
  const [profit, sharePrice] = corp.calculateShareSale((props.open && shares) || 0);

  let disabledText = "";
  if (isNaN(shares) || !isInteger(shares)) {
    disabledText = "Invalid value for number of shares.";
  } else if (shares < 0) {
    disabledText = "Cannot sell a negative number of shares.";
  } else if (shares > corp.numShares) {
    disabledText = "You do not have that many shares to sell.";
  } else if (shares === corp.numShares) {
    disabledText = "You cannot sell all your shares.";
  } else if (shares > 1e14) {
    disabledText = `Cannot sell more than ${formatShares(1e14)} shares at a time.`;
  } else if (!corp.public) {
    disabledText = "Cannot sell shares before going public.";
  } else if (corp.shareSaleCooldown) {
    disabledText = `Cannot sell shares for another ${corp.convertCooldownToString(corp.shareSaleCooldown)}.`;
  }

  function sell(): void {
    if (disabledText != "") return;

    try {
      SellShares(corp, shares);
      dialogBoxCreate(
        <>
          <Typography>
            You sold {formatShares(shares)} shares for <Money money={profit} />.
          </Typography>
          <Typography>
            <b>{corp.name}</b>'s stock price fell to <Money money={sharePrice} /> per share.
          </Typography>
        </>,
      );
      props.onClose();
      props.rerender();
      setShares(NaN);
    }
    catch (err) {
      dialogBoxCreate(`${err as Error}`);
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) sell();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography component="div">
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
      <ButtonWithTooltip disabledTooltip={disabledText} onClick={sell}>
        Sell shares
      </ButtonWithTooltip>
      <br />
      <br />
      <Typography>Sell {formatShares(shares || 0)} shares?</Typography>
      <Typography>
        <b>{corp.name}</b>'s stock price will fall to <Money money={sharePrice} /> per share.
      </Typography>
      <Typography>
        You will receive <Money money={profit} />.
      </Typography>
    </Modal>
  );
}
