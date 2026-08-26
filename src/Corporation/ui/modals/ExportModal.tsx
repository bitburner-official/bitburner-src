import React, { useState } from "react";
import { CityName } from "@enums";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Material } from "../../Material";
import { Export } from "../../Export";
import { Division } from "../../Division";
import * as actions from "../../Actions";
import { Modal } from "../../../ui/React/Modal";
import { useCorporation } from "../Context";
import { isRelevantMaterial } from "../Helpers";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useRerender } from "../../../ui/React/hooks";
import { getRecordKeys } from "../../../Types/Record";
import { ButtonWithTooltip } from "../../../ui/Components/ButtonWithTooltip";

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  mat: Material;
}

// Create a popup that lets the player manage exports
export function ExportModal(props: ExportModalProps): React.ReactElement {
  const corp = useCorporation();
  const [exportAmount, setExportAmount] = useState("");
  const rerender = useRerender();

  const possibleDivisions = [...corp.divisions.values()].filter((division: Division) => {
    return isRelevantMaterial(props.mat.name, division);
  });
  // This weird assignment is used because ts thinks possibleDivisions[0] is always a division
  const defaultDivision = possibleDivisions.length ? possibleDivisions[0] : null;
  const [targetDivision, setTargetDivision] = useState<Division | null>(defaultDivision);

  const possibleCities = targetDivision ? getRecordKeys(targetDivision.warehouses) : [];
  const defaultCity = possibleCities.length ? possibleCities[0] : null;
  const [targetCity, setTargetCity] = useState(defaultCity);

  function onCityChange(event: SelectChangeEvent<CityName>): void {
    setTargetCity(event.target.value as CityName);
  }

  function onTargetDivisionChange(event: SelectChangeEvent): void {
    const division = corp.divisions.get(event.target.value);
    if (!division) return;
    setTargetDivision(division);
  }

  function onAmtChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setExportAmount(event.target.value);
  }

  function exportMaterial(): void {
    try {
      if (!targetDivision || !targetCity) return;
      actions.exportMaterial(targetDivision, targetCity, props.mat, exportAmount);
    } catch (error) {
      dialogBoxCreate(String(error));
    }
    props.onClose();
  }

  function removeExport(exp: Export): void {
    for (let i = 0; i < props.mat.exports.length; ++i) {
      if (
        props.mat.exports[i].division !== exp.division ||
        props.mat.exports[i].city !== exp.city ||
        props.mat.exports[i].amount !== exp.amount
      )
        continue;
      props.mat.exports.splice(i, 1);
      break;
    }
    rerender();
  }

  if (targetCity && !possibleCities.includes(targetCity as CityName)) {
    setTargetCity(possibleCities.length ? possibleCities[0] : null);
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        选择要将这种材料出口到的行业和城市，以及每秒要出口的数量。
        <br />
        <br />
        你可以在数量中使用'MAX'、'EINV'、'IINV'、'EPROD'或'IPROD'：
        <br />
        - 'MAX'：导出尽可能多的数量。
        <br />
        - 'EINV'：导出城市的材料库存量。
        <br />
        - 'IINV'：进口城市的材料库存量。
        <br />
        - 'EPROD'：导出城市每秒的材料产量
        <br />
        - 'IPROD'：进口城市每秒的材料产量
        <br />
        注意：消耗即为负的产量。
        <br />
        <br />
        例如：把数量设为"(EINV-20)/10"会尝试导出该材料中除20以外的全部库存。
      </Typography>
      <Select onChange={onTargetDivisionChange} value={targetDivision?.name ?? ""}>
        {possibleDivisions.map((division) => (
          <MenuItem key={division.name} value={division.name}>
            {division.name}
          </MenuItem>
        ))}
      </Select>
      <Select onChange={onCityChange} value={targetCity ?? ""}>
        {possibleCities.map((cityName) => (
          <MenuItem key={cityName} value={cityName}>
            {cityName}
          </MenuItem>
        ))}
      </Select>
      <TextField placeholder="每秒出口数量" onChange={onAmtChange} value={exportAmount} />
      <ButtonWithTooltip
        disabledTooltip={!targetDivision ? "未选择目标部门" : !targetCity ? "未选择目标城市" : ""}
        onClick={exportMaterial}
      >
        出口
      </ButtonWithTooltip>
      <Typography>
        下方列出了此仓库当前对该材料的所有出口。点击其中一项将移除该出口。
      </Typography>
      {props.mat.exports.map((exp: Export, index: number) => (
        <Box display="flex" alignItems="center" key={index}>
          <Button sx={{ mx: 2 }} onClick={() => removeExport(exp)}>
            删除
          </Button>
          <Typography>
            行业：{exp.division}
            <br />
            城市：{exp.city}
            <br />
            每秒数量：{exp.amount}
          </Typography>
        </Box>
      ))}
    </Modal>
  );
}
