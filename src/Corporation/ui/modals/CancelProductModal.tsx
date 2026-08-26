import React from "react";

import { Product } from "../../Product";
import { Modal } from "../../../ui/React/Modal";
import { useDivision } from "../Context";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

interface IProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  rerender: () => void;
}

// Create a popup that lets the player cancel a product
export function CancelProductModal(props: IProps): React.ReactElement {
  const division = useDivision();
  function cancel(): void {
    division.discontinueProduct(props.product.name);
    props.onClose();
    props.rerender();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        你确定要这样做吗？取消产品会将其完全且永久地移除。这样做不会退还任何资金
      </Typography>
      <Button onClick={cancel}>取消</Button>
    </Modal>
  );
}
