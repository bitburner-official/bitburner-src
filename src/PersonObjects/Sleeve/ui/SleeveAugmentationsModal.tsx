import { Container, Typography, Paper } from "@mui/material";
import React from "react";
import { PurchasableAugmentations } from "../../../Augmentation/ui/PurchasableAugmentations";
import { Player } from "@player";
import { Modal } from "../../../ui/React/Modal";
import { Sleeve } from "../Sleeve";
import { useRerender } from "../../../ui/React/hooks";

interface IProps {
  open: boolean;
  onClose: () => void;
  sleeve: Sleeve;
}

export function SleeveAugmentationsModal(props: IProps): React.ReactElement {
  const rerender = useRerender(150);

  // Array of all owned Augmentations. Names only
  const ownedAugNames = props.sleeve.augmentations.map((e) => e.name);

  // You can only purchase Augmentations that are actually available from
  // your factions. I.e. you must be in a faction that has the Augmentation
  // and you must also have enough rep in that faction in order to purchase it.
  const availableAugs = props.sleeve.findPurchasableAugs();

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Container component={Paper} disableGutters maxWidth="lg" sx={{ mx: 0, mb: 1, p: 1 }}>
        <Typography>
          You can purchase augmentations for your Sleeves. These augmentations have the same effect as they would for
          you. You can only purchase augmentations that you unlocked through factions. If an augmentation is useless for
          Sleeves, it will not be available. Sleeves can install an augmentation without its prerequisites.
          <br />
          <br />
          When purchasing an augmentation for a Sleeve, it is immediately installed. This means that the Sleeve will
          immediately lose all of its stat experience.
          <br />
          <br />
          Augmentations will appear below as they become available.
        </Typography>
      </Container>
      <PurchasableAugmentations
        augNames={availableAugs.map((aug) => aug.name)}
        ownedAugNames={ownedAugNames}
        canPurchase={(aug) => {
          return Player.money > aug.baseCost;
        }}
        purchaseAugmentation={(aug) => {
          props.sleeve.tryBuyAugmentation(aug);
          rerender();
        }}
        rerender={rerender}
        sleeveAugs
      />
    </Modal>
  );
}
