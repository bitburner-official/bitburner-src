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
  function travel(): void {
    props.travel();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        你想前往 {props.city} 吗？此行将花费{" "}
        <Money money={CONSTANTS.TravelCost} forPurchase={true} />。
      </Typography>
      <br />
      <br />
      <Button onClick={travel}>
        <Typography>旅行</Typography>
      </Button>
      <Button onClick={() => props.onClose()}>取消</Button>
    </Modal>
  );
}
