import React, { useState } from "react";
import { formatMoney, formatShares } from "../../../ui/nFormat";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Modal } from "../../../ui/React/Modal";
import { useCorporation } from "../Context";
import Typography from "@mui/material/Typography";
import { NumberInput } from "../../../ui/React/NumberInput";
import Button from "@mui/material/Button";
import { KEY } from "../../../utils/helpers/keyCodes";
import { IssueNewShares } from "../../Actions";

interface IEffectTextProps {
  shares: number | null;
}

function EffectText(props: IEffectTextProps): React.ReactElement {
  const corp = useCorporation();
  if (props.shares === null) return <></>;
  const newSharePrice = Math.round(corp.sharePrice * 0.9);
  const maxNewShares = corp.calculateMaxNewShares();
  let newShares = props.shares;
  if (isNaN(newShares)) {
    return <Typography>Invalid input</Typography>;
  }

  // Round to nearest ten-millionth
  newShares /= 10e6;
  newShares = Math.round(newShares) * 10e6;

  if (newShares < 10e6) {
    return <Typography>Must issue at least 10 million new shares</Typography>;
  }

  if (newShares > maxNewShares) {
    return <Typography>You cannot issue that many shares</Typography>;
  }

  return (
    <Typography>
      Issue {formatShares(newShares)} new shares for {formatMoney(newShares * newSharePrice)}?
    </Typography>
  );
}

interface IProps {
  open: boolean;
  onClose: () => void;
}

// Create a popup that lets the player issue new shares
// This is created when the player clicks the "Issue New Shares" buttons in the overview panel
export function IssueNewSharesModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const [shares, setShares] = useState<number>(NaN);
  const maxNewShares = corp.calculateMaxNewShares();

  const newShares = Math.round((shares || 0) / 10e6) * 10e6;
  const disabled = isNaN(shares) || isNaN(newShares) || newShares < 10e6 || newShares > maxNewShares;

  function issueNewShares(): void {
    if (isNaN(shares)) return;
    if (disabled) return;
    const [profit, newShares, privateShares] = IssueNewShares(corp, shares);

    props.onClose();

    let dialogContents =
      `Issued ${formatShares(newShares)} new shares` + ` and raised ${formatMoney(profit)}.` + (privateShares > 0)
        ? "\n" + formatShares(privateShares) + "of these shares were bought by private investors."
        : "";
    dialogContents += `\n\nStock price decreased to ${formatMoney(corp.sharePrice)}`;
    dialogBoxCreate(dialogContents);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) issueNewShares();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        You can issue new equity shares (i.e. stocks) in order to raise capital for your corporation.
        <br />
        <br />
        &nbsp;* You can issue at most {formatShares(maxNewShares)} new shares
        <br />
        &nbsp;* New shares are sold at a 10% discount
        <br />
        &nbsp;* You can only issue new shares once every 12 hours
        <br />
        &nbsp;* Issuing new shares causes dilution, resulting in a decrease in stock price and lower dividends per share
        <br />
        &nbsp;* Number of new shares issued must be a multiple of 10 million
        <br />
        <br />
        When you choose to issue new equity, private shareholders have first priority for up to 0.5n% of the new shares,
        where n is the percentage of the company currently owned by private shareholders. If they choose to exercise
        this option, these newly issued shares become private, restricted shares, which means you cannot buy them back.
      </Typography>
      <EffectText shares={shares} />
      <NumberInput autoFocus placeholder="# New Shares" onChange={setShares} onKeyDown={onKeyDown} />
      <Button disabled={disabled} onClick={issueNewShares} sx={{ mx: 1 }}>
        Issue New Shares
      </Button>
    </Modal>
  );
}
