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
        Enter a limit to the amount of this material you would like to produce per second. Leave the box empty to set no
        limit.
        <br />
        <br />
        This limit applies only to output; it does not affect input consumption.
        <br />
        <br />
        For example, in Agriculture, assume the division's raw production is 1000. You need to consume 500 Water and 200
        Chemicals to produce 1000 Plants and 1000 Food. If you set the limits for Plants and Food to 200 and 100
        respectively, you will still consume 500 Water and 200 Chemicals, but only produce 200 Plants and 100 Food.
      </Typography>
      <br />
      <TextField autoFocus={true} placeholder="Limit" type="number" onChange={onChange} onKeyDown={onKeyDown} />
      <Button onClick={limitMaterialProduction}>Limit production</Button>
    </Modal>
  );
}
