import React from "react";
import { CONSTANTS } from "../../Constants";
import { Money } from "../../ui/React/Money";
import { Modal } from "../../ui/React/Modal";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

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
      <Button onClick={() => props.onClose()}>Cancel</Button>
    </Modal>
  );
}
