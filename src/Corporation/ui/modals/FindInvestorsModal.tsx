import React from "react";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { formatPercent, formatShares } from "../../../ui/formatNumber";
import { Modal } from "../../../ui/React/Modal";
import { Money } from "../../../ui/React/Money";
import { useCorporation } from "../Context";
import { acceptInvestmentOffer } from "../../Actions";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

interface IProps {
  open: boolean;
  onClose: () => void;
  rerender: () => void;
}

// Create a popup that lets the player manage investment offers
export function FindInvestorsModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const { funds, shares } = corp.getInvestmentOffer();

  function findInvestors(): void {
    if (shares === 0) return;
    try {
      acceptInvestmentOffer(corp);
      dialogBoxCreate(
        <>
          <Typography>You accepted the investment offer.</Typography>
          <Typography>
            <b>{corp.name}</b> received <Money money={funds} />.
          </Typography>
          <Typography>
            Your remaining equity is <b>{formatPercent(corp.numShares / corp.totalShares, 1)}</b>.
          </Typography>
        </>,
      );
      props.onClose();
      props.rerender();
    } catch (err) {
      dialogBoxCreate(`${err}`);
    }
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        An investment firm has offered to buy {formatShares(shares)} shares of stock (a{" "}
        <b>{formatPercent(shares / corp.totalShares, 1)}</b> stake in the company).
        <br />
        <br />
        <b>{corp.name}</b> will receive <Money money={funds} />.
        <br />
        Your equity will fall to <b>{formatPercent((corp.numShares - shares) / corp.totalShares, 1)}</b>.
        <br />
        <br />
        <b>Hint</b>: Investment firms will offer more money if your Corporation is turning a profit.
        <br />
        <br />
        Do you accept this offer?
      </Typography>
      <br />
      <Button onClick={findInvestors}>Accept</Button> <Button onClick={props.onClose}>Ignore</Button>
    </Modal>
  );
}
