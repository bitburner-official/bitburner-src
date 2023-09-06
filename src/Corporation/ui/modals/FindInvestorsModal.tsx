import React from "react";
import { formatPercent, formatShares } from "../../../ui/formatNumber";
import * as corpConstants from "../../data/Constants";
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

// Create a popup that lets the player manage exports
export function FindInvestorsModal(props: IProps): React.ReactElement {
  const corporation = useCorporation();
  const { funds, shares } = GetInvestmentOffer(corporation);
  if (shares === 0) {
    return <></>;
  }
  const percShares = corpConstants.fundingRoundShares[corporation.fundingRound];

  function findInvestors(): void {
    AcceptInvestmentOffer(corporation);
    props.rerender();
    props.onClose();
  }
  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        An investment firm has offered you <Money money={funds} /> in funding in exchange for a{" "}
        {formatPercent(percShares, 3)} stake in the company ({formatShares(shares)} shares).
        <br />
        <br />
        Do you accept or reject this offer?
        <br />
        <br />
        Hint: Investment firms will offer more money if your corporation is turning a profit
      </Typography>
      <Button onClick={findInvestors}>Accept</Button>
    </Modal>
  );
}
