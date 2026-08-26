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

// Create a popup that lets the player discontinue a product
export function DiscontinueProductModal(props: IProps): React.ReactElement {
  const division = useDivision();
  function discontinue(): void {
    division.discontinueProduct(props.product.name);
    props.onClose();
    props.rerender();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        你确定要这样做吗？停产一款产品会将其完全且永久地移除。你将不再生产该产品，其所有现有库存都会被移除且无法售出
      </Typography>
      <Button onClick={discontinue}>停产</Button>
    </Modal>
  );
}
