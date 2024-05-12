import React, { useState } from "react";

import { Warehouse } from "../../Warehouse";
import { setSmartSupply, setSmartSupplyOption } from "../../Actions";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Modal } from "../../../ui/React/Modal";
import { useDivision } from "../Context";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { CorpMaterialName } from "@nsdefs";
import { useRerender } from "../../../ui/React/hooks";
import { getRecordKeys } from "../../../Types/Record";

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
      setSmartSupplyOption(props.warehouse, material, newValue);
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
      setSmartSupplyOption(props.warehouse, material, newValue);
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
    setSmartSupply(props.warehouse, e.target.checked);
    rerender();
  }

  // Create React components for materials
  const mats = [];
  for (const matName of getRecordKeys(division.requiredMaterials)) {
    if (!props.warehouse.materials[matName]) continue;
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
        <Typography component="div">
          Options:
          <ul>
            <li>
              Use leftovers takes the amount of that material already in storage into account when purchasing new ones.
              This also accounts for imports, since they are "leftovers" by the time purchasing happens.
              <br />
              <i>This is usually the option you want.</i>
            </li>
            <li>
              Use imported takes <b>only</b> the amount of that materials that were imported in the previous cycle into
              account. This is useful when dealing with specialty situations, like importing materials that also boost
              production.
            </li>
          </ul>
          If neither is toggled on, Smart Supply will ignore any materials stored and attempts to buy as much as is
          needed for production.
        </Typography>
        {mats}
      </>
    </Modal>
  );
}
