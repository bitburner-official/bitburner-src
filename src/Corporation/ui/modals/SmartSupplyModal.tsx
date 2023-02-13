import React, { useState } from "react";

import { Warehouse } from "../../Warehouse";
import { SetSmartSupply, SetSmartSupplyUseLeftovers } from "../../Actions";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Modal } from "../../../ui/React/Modal";
import { useDivision } from "../Context";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { CorpMaterialName } from "@nsdefs";
import { materialNames } from "../../data/Constants";
import { useRerender } from "../../../ui/React/hooks";

interface ILeftoverProps {
  matName: CorpMaterialName;
  warehouse: Warehouse;
}

function Leftover(props: ILeftoverProps): React.ReactElement {
  const [checked, setChecked] = useState(!!props.warehouse.smartSupplyUseLeftovers[props.matName]);

  function onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    try {
      const matName = props.matName;
      const material = props.warehouse.materials[matName];
      SetSmartSupplyUseLeftovers(props.warehouse, material, event.target.checked);
    } catch (err) {
      dialogBoxCreate(err + "");
    }
    setChecked(event.target.checked);
  }

  return (
    <>
      <FormControlLabel
        control={<Switch checked={checked} onChange={onChange} />}
        label={<Typography>{props.warehouse.materials[props.matName].name}</Typography>}
      />
      <br />
    </>
  );
}

interface IProps {
  open: boolean;
  onClose: () => void;
  warehouse: Warehouse;
}

export function SmartSupplyModal(props: IProps): React.ReactElement {
  const division = useDivision();
  const rerender = useRerender();

  // Smart Supply Checkbox
  function smartSupplyOnChange(e: React.ChangeEvent<HTMLInputElement>): void {
    SetSmartSupply(props.warehouse, e.target.checked);
    rerender();
  }

  // Create React components for materials
  const mats = [];
  for (const matName of Object.values(materialNames)) {
    if (!props.warehouse.materials[matName]) continue;
    if (!Object.keys(division.reqMats).includes(matName)) continue;
    mats.push(<Leftover key={matName} warehouse={props.warehouse} matName={matName} />);
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <>
        <FormControlLabel
          control={<Switch checked={props.warehouse.smartSupplyEnabled} onChange={smartSupplyOnChange} />}
          label={<Typography>Enable Smart Supply</Typography>}
        />
        <br />
        <Typography>Use materials already in the warehouse instead of buying new ones, if available:</Typography>
        {mats}
      </>
    </Modal>
  );
}
