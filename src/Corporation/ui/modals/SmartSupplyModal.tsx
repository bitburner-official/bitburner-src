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
    } catch (error) {
      dialogBoxCreate(String(error));
      return;
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
    } catch (error) {
      dialogBoxCreate(String(error));
      return;
    }
    setChecked(newValue);
  }

  return (
    <>
      {<Typography>{props.warehouse.materials[props.matName].name}</Typography>}
      <FormControlLabel
        control={<Switch checked={value == "leftovers"} onChange={onLOChange} />}
        label={<Typography>{"利用库存"}</Typography>}
      />
      <FormControlLabel
        control={<Switch checked={value == "imports"} onChange={onIChange} />}
        label={<Typography>{"利用进口"}</Typography>}
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
        <Typography>智能供应会购买实现最大产量所需的精确材料数量。</Typography>
        <br />
        <FormControlLabel
          control={<Switch checked={props.warehouse.smartSupplyEnabled} onChange={smartSupplyOnChange} />}
          label={<Typography>启用智能供应</Typography>}
        />
        <br />
        <Typography component="div">
          选项：
          <ul>
            <li>
              "利用库存"会在购买新材料时把仓库中已有的该材料数量考虑在内。这也会把进口量计算在内，因为在购买时它们也算作"库存"。
              <br />
              <i>这通常是你想要的选项。</i>
            </li>
            <li>
              "利用进口"只把上一周期进口的该材料数量考虑在内。这在处理特殊情况下很有用，比如进口的材料同时也能提升产量。
            </li>
          </ul>
          如果两者都未开启，智能供应将忽略任何已存储的材料，并尝试购买生产所需的最大数量。
        </Typography>
        {mats}
      </>
    </Modal>
  );
}
