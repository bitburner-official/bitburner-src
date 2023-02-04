import React from "react";
import { formatMoney, formatPercent, formatShares } from "../../../ui/nFormat";
import * as corpConstants from "../../data/Constants";
import { Modal } from "../../../ui/React/Modal";
import { useCorporation } from "../Context";

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
  const val = corporation.valuation;
  if (
    corporation.fundingRound >= corpConstants.fundingRoundShares.length ||
    corporation.fundingRound >= corpConstants.fundingRoundMultiplier.length
  )
    return <></>;
  const percShares = corpConstants.fundingRoundShares[corporation.fundingRound];
  const roundMultiplier = corpConstants.fundingRoundMultiplier[corporation.fundingRound];
  const funding = val * percShares * roundMultiplier;
  const investShares = Math.floor(corpConstants.initialShares * percShares);

  function findInvestors(): void {
    corporation.fundingRound++;
    corporation.addFunds(funding);
    corporation.numShares -= investShares;
    props.rerender();
    props.onClose();
  }
  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        An investment firm has offered you {formatMoney(funding)} in funding in exchange for a{" "}
        {formatPercent(percShares, 3)} stake in the company ({formatShares(investShares)} shares).
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
