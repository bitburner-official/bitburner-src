import React, { useState } from "react";

import { Warehouse } from "../../Warehouse";
import { SetSmartSupply, SetSmartSupplyOption } from "../../Actions";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Modal } from "../../../ui/React/Modal";
import { useDivision } from "../Context";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { CorpMaterialName } from "@nsdefs";
import { materialNames } from "../../data/Constants";
import { useRerender } from "../../../ui/React/hooks";

interface ISSoptionProps {
  matName: CorpMaterialName;
  warehouse: Warehouse;
}

function SSoption(props: ISSoptionProps): React.ReactElement {
  const [value, setChecked] = useState(props.warehouse.smartSupplyOptions[props.matName]);

  //leftover switch
  function onLOChange(): void {
    const newValue = value != "leftovers" ? "leftovers" : "none";
    try {
      const matName = props.matName;
      const material = props.warehouse.materials[matName];
      SetSmartSupplyOption(props.warehouse, material, newValue);
    } catch (err) {
      dialogBoxCreate(err + "");
    }
    setChecked(newValue);
  }

  //imports switch
  function onIChange(): void {
    const newValue = value != "imports" ? "imports" : "none";
    try {
      const matName = props.matName;
      const material = props.warehouse.materials[matName];
      SetSmartSupplyOption(props.warehouse, material, newValue);
    } catch (err) {
      dialogBoxCreate(err + "");
    }
    setChecked(newValue);
  }

  return (
    <>
      label={<Typography>{props.warehouse.materials[props.matName].name}</Typography>}
      <FormControlLabel
        control={<Switch checked={value == "leftovers"} onChange={onLOChange} />}
        label={<Typography>{"Use leftovers"}</Typography>}
      />
      <FormControlLabel
        control={<Switch checked={value == "imports"} onChange={onIChange} />}
        label={<Typography>{"Use imported"}</Typography>}
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
    mats.push(<SSoption key={matName} warehouse={props.warehouse} matName={matName} />);
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <>
        <Typography>Smart Supply purchases the exact amount of materials needed for maximal production.</Typography>
        <br />
        <FormControlLabel
          control={<Switch checked={props.warehouse.smartSupplyEnabled} onChange={smartSupplyOnChange} />}
          label={<Typography>Enable Smart Supply</Typography>}
        />
        <br />
        <Typography>
          Options:
          <br />
          - Use leftovers takes the amount of that material already in storage into account when purchasing new ones.
          <br />
          - Use imported takes the amount of that materials that was imported in previous cycle into account.
          <br />
          if neither is toggled on, Smart Supply will ignore any materials in store and attempts to buy as much as is
          needed for production.
        </Typography>
        {mats}
      </>
    </Modal>
  );
}
