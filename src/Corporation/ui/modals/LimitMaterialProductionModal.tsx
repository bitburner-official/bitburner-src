import React, { useEffect, useState } from "react";
import * as actions from "../../Actions";
import { Modal } from "../../../ui/React/Modal";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { KEY } from "../../../utils/KeyboardEventKey";
import { Material } from "../../Material";

interface IProps {
  open: boolean;
  onClose: () => void;
  material: Material;
}

// Create a popup that lets the player limit the production of a product
export function LimitMaterialProductionModal(props: IProps): React.ReactElement {
  const [limit, setLimit] = useState<number | null>(null);

  // reset modal internal state on modal close
  useEffect(() => {
    if (!props.open) {
      setLimit(null);
    }
  }, [props.open]);

  function limitMaterialProduction(): void {
    let qty = limit;
    if (qty === null) qty = -1;
    actions.limitMaterialProduction(props.material, qty);
    props.onClose();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) limitMaterialProduction();
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    if (event.target.value === "") setLimit(null);
    else setLimit(parseFloat(event.target.value));
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        输入你每秒想要生产这种材料的数量上限。将输入框留空则不设上限。
        <br />
        <br />
        该上限仅作用于产出，不会影响原料消耗。
        <br />
        <br />
        例如，在农业行业中，假设部门的原始产量为1000。你需要消耗500水和200化学品来生产1000植物和1000食物。如果你把植物和食物的产量上限分别设为200和100，你仍会消耗500水和200化学品，但只会生产200植物和100食物。
      </Typography>
      <br />
      <TextField autoFocus={true} placeholder="上限" type="number" onChange={onChange} onKeyDown={onKeyDown} />
      <Button onClick={limitMaterialProduction}>限制产量</Button>
    </Modal>
  );
}
