import React, { useState } from "react";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Modal } from "../../../ui/React/Modal";
import { Money } from "../../../ui/React/Money";
import { formatShares } from "../../../ui/formatNumber";
import { useCorporation } from "../Context";
import Typography from "@mui/material/Typography";
import { ButtonWithTooltip } from "../../../ui/Components/ButtonWithTooltip";
import { NumberInput } from "../../../ui/React/NumberInput";
import { buyBackShares } from "../../Actions";
import { KEY } from "../../../utils/helpers/keyCodes";
import { buybackSharesFailureReason } from "../../helpers";

interface IProps {
  open: boolean;
  onClose: () => void;
  rerender: () => void;
}

// Create a popup that lets the player buyback shares
// This is created when the player clicks the "Buyback Shares" button in the overview panel
export function BuybackSharesModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const [shares, setShares] = useState<number>(NaN);

  const [cost, sharePrice] = corp.calculateShareBuyback((props.open && shares) || 0);
  const disabledText = buybackSharesFailureReason(corp, shares);

  function buy(): void {
    if (disabledText) return;
    try {
      buyBackShares(corp, shares);
      dialogBoxCreate(
        <>
          <Typography>
            You bought {formatShares(shares)} shares for <Money money={cost} />.
          </Typography>
          <Typography>
            <b>{corp.name}</b>'s stock price rose to <Money money={sharePrice} /> per share.
          </Typography>
        </>,
      );
      props.onClose();
      props.rerender();
      setShares(NaN);
    } catch (err) {
      dialogBoxCreate(`${err}`);
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
          <li>Buying back shares will cause the stock price to rise due to market forces.</li>
          <li>These shares must be bought at a 10% premium over the market price.</li>
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
      <Typography sx={{ minHeight: "1.5em" }}>
        {!shares ? null : disabledText ? (
          disabledText
        ) : (
          <>
            <b>{corp.name}</b>'s stock price will settle at <Money money={sharePrice} /> per share.
          </>
        )}
      </Typography>
    </Modal>
  );
}
