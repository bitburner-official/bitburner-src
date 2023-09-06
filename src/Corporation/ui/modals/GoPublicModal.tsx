import React, { useState } from "react";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Modal } from "../../../ui/React/Modal";
import { Money } from "../../../ui/React/Money";
import { formatShares } from "../../../ui/formatNumber";
import { useCorporation } from "../Context";
import Typography from "@mui/material/Typography";
import { ButtonWithTooltip } from "../../../ui/Components/ButtonWithTooltip";
import { NumberInput } from "../../../ui/React/NumberInput";
import Box from "@mui/material/Box";
import { KEY } from "../../../utils/helpers/keyCodes";
import { isPositiveInteger } from "../../../types";
import { GoPublic } from "../../Actions";

interface IProps {
  open: boolean;
  onClose: () => void;
  rerender: () => void;
}

// Create a popup that lets the player manage exports
export function GoPublicModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const [shares, setShares] = useState<number>(NaN);
  const initialSharePrice = corp.getTargetSharePrice();

  function goPublic(): void {
    GoPublic(corp, shares);
    if (shares >= corp.numShares || (shares !== 0 && !isPositiveInteger(shares))) return;
    props.rerender();
    dialogBoxCreate(
      <Typography>
        You took <b>{corp.name}</b> public and earned <Money money={shares * initialSharePrice} /> in your IPO.
      </Typography>,
    );
    props.onClose();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) goPublic();
  }

  const disabledText =
    shares >= corp.numShares
      ? "Cannot issue this many shares"
      : shares !== 0 && !isPositiveInteger(shares)
      ? "Must issue an non-negative integer number of shares"
      : "";

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        Enter the number of shares you would like to issue for your IPO. These shares will be publicly sold and you will
        no longer own them. Your Corporation will receive <Money money={initialSharePrice} /> per share (the IPO money
        will be deposited directly into your Corporation's funds).
        <br />
        <br />
        You can issue some, but not all, of your {formatShares(corp.numShares)} shares.
      </Typography>
      <Box display="flex" alignItems="center">
        <NumberInput onChange={setShares} autoFocus placeholder="Shares to issue" onKeyDown={onKeyDown} />
        <ButtonWithTooltip disabledTooltip={disabledText} onClick={goPublic}>
          Go Public
        </ButtonWithTooltip>
      </Box>
    </Modal>
  );
}
