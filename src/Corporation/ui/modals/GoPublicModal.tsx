import React, { useState } from "react";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Modal } from "../../../ui/React/Modal";
import { formatMoney, formatShares } from "../../../ui/nFormat";
import { useCorporation } from "../Context";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { NumberInput } from "../../../ui/React/NumberInput";
import Box from "@mui/material/Box";
import { KEY } from "../../../utils/helpers/keyCodes";

interface IProps {
  open: boolean;
  onClose: () => void;
  rerender: () => void;
}

// Create a popup that lets the player manage exports
export function GoPublicModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const [shares, setShares] = useState<number>(NaN);
  const initialSharePrice = corp.valuation / corp.totalShares;

  function goPublic(): void {
    const initialSharePrice = corp.valuation / corp.totalShares;
    if (isNaN(shares)) {
      dialogBoxCreate("Invalid value for number of issued shares");
      return;
    }
    if (shares > corp.numShares) {
      dialogBoxCreate("Error: You don't have that many shares to issue!");
      return;
    }
    corp.public = true;
    corp.sharePrice = initialSharePrice;
    corp.issuedShares = shares;
    corp.numShares -= shares;
    corp.addFunds(shares * initialSharePrice);
    props.rerender();
    dialogBoxCreate(
      `You took your ${corp.name} public and earned ` + `${formatMoney(shares * initialSharePrice)} in your IPO`,
    );
    props.onClose();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) goPublic();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        Enter the number of shares you would like to issue for your IPO. These shares will be publicly sold and you will
        no longer own them. Your Corporation will receive {formatMoney(initialSharePrice)} per share (the IPO money will
        be deposited directly into your Corporation's funds).
        <br />
        <br />
        You have a total of {formatShares(corp.numShares)} shares that you can issue.
      </Typography>
      <Box display="flex" alignItems="center">
        <NumberInput onChange={setShares} autoFocus placeholder="Shares to issue" onKeyDown={onKeyDown} />
        <Button disabled={shares < 0 || shares > corp.numShares} sx={{ mx: 1 }} onClick={goPublic}>
          Go Public
        </Button>
      </Box>
    </Modal>
  );
}
