import React from "react";

import { Augmentation } from "../Augmentation";
import { Faction } from "../../Faction/Faction";
import { purchaseAugmentation } from "../../Faction/FactionHelpers";
import { getAugCost, isRepeatableAug } from "../AugmentationHelpers";
import { Money } from "../../ui/React/Money";
import { Modal } from "../../ui/React/Modal";
import { Player } from "@player";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

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
      <Typography whiteSpace={"pre-wrap"}>
        {aug.info}
        <br />
        <br />
        {aug.stats}
        <br />
        <br />
        是否要以&nbsp;
        <Money money={getAugCost(aug).moneyCost} /> 购买 {aug.name} 强化？
        <br />
        <br />
      </Typography>
      <Button
        autoFocus
        onClick={() => {
          purchaseAugmentation(faction, aug);
          onClose();
        }}
      >
        购买
      </Button>
    </Modal>
  );
}
