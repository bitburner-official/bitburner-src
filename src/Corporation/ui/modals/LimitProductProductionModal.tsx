import React, { useEffect, useState } from "react";
import type { CityName } from "@enums";
import type { Product } from "../../Product";
import * as actions from "../../Actions";
import { Modal } from "../../../ui/React/Modal";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { KEY } from "../../../utils/KeyboardEventKey";

interface IProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  city: CityName;
}

// Create a popup that lets the player limit the production of a product
export function LimitProductProductionModal(props: IProps): React.ReactElement {
  const [limit, setLimit] = useState<number | null>(null);

  // reset modal internal state on modal close
  useEffect(() => {
    if (!props.open) {
      setLimit(null);
    }
  }, [props.open]);

  function limitProductProduction(): void {
    let qty = limit;
    if (qty === null) qty = -1;
    actions.limitProductProduction(props.product, props.city, qty);
    props.onClose();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) limitProductProduction();
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    if (event.target.value === "") setLimit(null);
    else setLimit(parseFloat(event.target.value));
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        输入你每秒想要生产这种产品的数量上限。将输入框留空则不设上限。
      </Typography>
      <TextField autoFocus={true} placeholder="上限" type="number" onChange={onChange} onKeyDown={onKeyDown} />
      <Button onClick={limitProductProduction}>限制产量</Button>
    </Modal>
  );
}
