import React from "react";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Player } from "@player";

import { Faction } from "../../Faction/Faction";
import { purchaseAugmentation } from "../../Faction/FactionHelpers";
import { Modal } from "../../ui/React/Modal";
import { Money } from "../../ui/React/Money";
import { Augmentation } from "../Augmentation";
import { isRepeatableAug } from "../AugmentationHelpers";

interface IProps {
  open: boolean;
  onClose: () => void;
  faction?: Faction;
  aug?: Augmentation;
}

export function PurchaseAugmentationModal({ aug, faction, onClose, open }: IProps): React.ReactElement {
  if (!aug || !faction || (!isRepeatableAug(aug) && Player.hasAugmentation(aug.name))) {
    return <></>;
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Typography variant="h4">{aug.name}</Typography>
      <Typography>
        {aug.info}
        <br />
        <br />
        {aug.stats}
        <br />
        <br />
        Would you like to purchase the {aug.name} Augmentation for&nbsp;
        <Money money={aug.getCost().moneyCost} />?
        <br />
        <br />
      </Typography>
      <Button
        autoFocus
        onClick={() => {
          purchaseAugmentation(aug, faction);
          onClose();
        }}
      >
        Purchase
      </Button>
    </Modal>
  );
}
