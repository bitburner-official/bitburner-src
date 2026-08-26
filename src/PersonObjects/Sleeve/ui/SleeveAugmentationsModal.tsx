import { Container, Typography, Paper } from "@mui/material";
import React from "react";
import { PurchasableAugmentations } from "../../../Augmentation/ui/PurchasableAugmentations";
import { Modal } from "../../../ui/React/Modal";
import { Sleeve } from "../Sleeve";
import { useRerender } from "../../../ui/React/hooks";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";

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
          你可以为你的分身购买强化。这些强化的效果与你自身使用的强化相同。你只能购买通过派系解锁的强化。如果某个强化对分身无用，它将不会出现在这里。分身安装强化时无需满足其前置条件。
          <br />
          <br />
          为分身购买强化时会立即安装，这意味着该分身会立即失去所有属性经验。
          <br />
          <br />
          可用的强化会显示在下方。
        </Typography>
      </Container>
      <PurchasableAugmentations
        augNames={availableAugs.map((aug) => aug.name)}
        ownedAugNames={ownedAugNames}
        canPurchase={(aug) => {
          return props.sleeve.canPurchaseAugmentation(aug).success;
        }}
        purchaseAugmentation={(aug) => {
          const result = props.sleeve.purchaseAugmentation(aug);
          if (!result.success) {
            dialogBoxCreate(result.message);
            return;
          }
          rerender();
        }}
        rerender={rerender}
        sleeveAugs
      />
    </Modal>
  );
}
