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
import * as actions from "../../Actions";

interface IProps {
  open: boolean;
  onClose: () => void;
  rerender: () => void;
}

// Create a popup that lets the player manage exports
export function GoPublicModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const [shares, setShares] = useState<number>(NaN);

  const ceoOwnership = (corp.numShares - (shares || 0)) / corp.totalShares;
  const initialSharePrice = corp.getTargetSharePrice(ceoOwnership);

  const disabledText =
    shares >= corp.numShares
      ? "Cannot issue this many shares"
      : shares !== 0 && !isPositiveInteger(shares)
      ? "Must issue an non-negative integer number of shares"
      : "";

  function goPublic(): void {
    if (disabledText) return;
    try {
      actions.goPublic(corp, shares);
      dialogBoxCreate(
        <Typography>
          <b>{corp.name}</b> went public and earned <Money money={shares * initialSharePrice} /> in its IPO.
        </Typography>,
      );
      props.onClose();
      props.rerender();
      setShares(NaN);
    } catch (err) {
      dialogBoxCreate(`${err}`);
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) goPublic();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography component="div">
        Enter the number of shares you would like to issue for your IPO.
        <ul>
          <li>These shares will be publicly sold and you will no longer own them.</li>
          <li>The IPO money will be deposited directly into your Corporation's funds.</li>
        </ul>
        You can issue some, but not all, of your {formatShares(corp.numShares)} shares.
      </Typography>
      <br />
      <Box display="flex" alignItems="center">
        <NumberInput
          defaultValue={shares || ""}
          onChange={setShares}
          autoFocus
          placeholder="Shares to issue"
          onKeyDown={onKeyDown}
        />
        <ButtonWithTooltip disabledTooltip={disabledText} onClick={goPublic}>
          Go Public
        </ButtonWithTooltip>
      </Box>
      <br />
      <Typography sx={{ minHeight: "3em" }}>
        {isNaN(shares) ? null : disabledText ? (
          disabledText
        ) : (
          <>
            Go public at <Money money={initialSharePrice} /> per share?
            <br />
            <b>{corp.name}</b> will receive <Money money={initialSharePrice * (shares || 0)} />.
          </>
        )}
      </Typography>
    </Modal>
  );
}
