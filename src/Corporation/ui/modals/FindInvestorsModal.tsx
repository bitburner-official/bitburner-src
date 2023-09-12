import React from "react";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { formatPercent, formatShares } from "../../../ui/formatNumber";
import { Modal } from "../../../ui/React/Modal";
import { Money } from "../../../ui/React/Money";
import { useCorporation } from "../Context";
import { GetInvestmentOffer, AcceptInvestmentOffer } from "../../Actions";

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
  const { funds, shares } = GetInvestmentOffer(corp);
  if (shares === 0) {
    return <></>;
  }
  const percShares = shares / corp.totalShares;

  function findInvestors(): void {
    if (!props.open) return;
    props.onClose();

    setTimeout(() => {
      AcceptInvestmentOffer(corp);
      dialogBoxCreate(
        <>
          <Typography>You accept the investment offer.</Typography>
          <Typography>
            <b>{corp.name}</b> received <Money money={funds} />.
          </Typography>
          <Typography>Your remaining equity is {formatPercent(corp.numShares / corp.totalShares, 1)}.</Typography>
        </>,
      );
      props.rerender();
    }, 100);
  }
  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        An investment firm has offered <Money money={funds} /> in exchange for {formatShares(shares)} shares (a{" "}
        {formatPercent(percShares, 1)} stake in the company).
        <br />
        <br />
        Hint: Investment firms will offer more money if your Corporation is turning a profit.
      </Typography>
      <br />
      <Button onClick={findInvestors}>Accept</Button>
      <br />
      <br />
      <Typography>Do you accept this offer?</Typography>
      <Typography>
        Your equity will fall to {formatPercent((corp.numShares - shares) / corp.totalShares, 1)}.
      </Typography>
      <Typography>
        <b>{corp.name}</b> will receive <Money money={funds} />.
      </Typography>
    </Modal>
  );
}
