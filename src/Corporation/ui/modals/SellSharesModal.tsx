import React, { useState } from "react";
import { formatMoney, formatShares } from "../../../ui/formatNumber";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Modal } from "../../../ui/React/Modal";
import { Money } from "../../../ui/React/Money";
import { useCorporation } from "../Context";
import { Corporation } from "../../Corporation";
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
    if (props.shares === null) return <></>;
    let text = "";
    if (isNaN(props.shares) || props.shares <= 0 || !isInteger(props.shares)) {
      text = `ERROR: Invalid value entered for number of shares to sell`;
    } else if (props.shares > corp.numShares) {
      text = `You don't have this many shares to sell!`;
    } else if (props.shares === corp.numShares) {
      text = `You can not sell all your shares!`;
    } else if (props.shares > 1e14) {
      text = `You can't sell more than 100t shares at once!`;
    } else {
      const stockSaleResults = corp.calculateShareSale(props.shares);
      const profit = stockSaleResults[0];
      text = `Sell ${props.shares} shares for a total of ${formatMoney(profit)}`;
    }

    return (
      <Typography>
        <small>{text}</small>
      </Typography>
    );
  }

  function sell(): void {
    if (disabled) return;
    try {
      const profit = SellShares(corp, shares);
      props.onClose();
      dialogBoxCreate(
        <>
          Sold {formatShares(shares)} shares for <Money money={profit} />. The corporation's stock price fell to{" "}
          <Money money={corp.sharePrice} />
          as a result of dilution.
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
        Enter the number of shares you would like to sell. The money from selling your shares will go directly to you
        (NOT your Corporation).
        <br />
        <br />
        The amount sold must be an integer between 1 and 100t.
        <br />
        <br />
        Selling your shares will cause your corporation's stock price to fall due to dilution. Furthermore, selling a
        large number of shares all at once will have an immediate effect in reducing your stock price.
        <br />
        <br />
        The current price of your company's stock is <Money money={corp.sharePrice} />
      </Typography>
      <br />
      <NumberInput
        variant="standard"
        autoFocus
        placeholder="Shares to sell"
        onChange={setShares}
        onKeyDown={onKeyDown}
      />
      <Button disabled={disabled} onClick={sell} sx={{ mx: 1 }}>
        Sell shares
      </Button>
      <ProfitIndicator shares={shares} corp={corp} />
    </Modal>
  );
}
