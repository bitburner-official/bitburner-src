import React from "react";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { CONSTANTS } from "../../Constants";
import { Modal } from "../../ui/React/Modal";
import { Money } from "../../ui/React/Money";

interface IProps {
  city: string;
  travel: () => void;

  open: boolean;
  onClose: () => void;
}

export function TravelConfirmationModal(props: IProps): React.ReactElement {
  const cost = CONSTANTS.TravelCost;
  function travel(): void {
    props.travel();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        Would you like to travel to {props.city}? The trip will cost <Money money={cost} forPurchase={true} />.
      </Typography>
      <br />
      <br />
      <Button onClick={travel}>
        <Typography>Travel</Typography>
      </Button>
    </Modal>
  );
}
