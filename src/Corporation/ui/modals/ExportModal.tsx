import React, { useState } from "react";
import { CityName } from "@enums";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Material } from "../../Material";
import { Export } from "../../Export";
import { Division } from "../../Division";
import { ExportMaterial } from "../../Actions";
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

interface IProps {
  open: boolean;
  onClose: () => void;
  mat: Material;
}

// Create a popup that lets the player manage exports
export function ExportModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const possibleDivisions = [...corp.divisions.values()].filter((division: Division) => {
    return isRelevantMaterial(props.mat.name, division);
  });
  if (possibleDivisions.length === 0) throw new Error("Export popup created with no divisions.");
  const defaultDivision = possibleDivisions[0];
  if (Object.keys(defaultDivision.warehouses).length === 0)
    throw new Error("Export popup created in a division with no warehouses.");
  const [targetDivision, setTargetDivision] = useState(defaultDivision);
  const [targetCity, setTargetCity] = useState(CityName.Sector12);
  const [exportAmount, setExportAmount] = useState("");
  const rerender = useRerender();

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
      ExportMaterial(targetDivision, targetCity, props.mat, exportAmount);
    } catch (err) {
      dialogBoxCreate(err + "");
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

  const possibleCities = getRecordKeys(targetDivision.warehouses);
  if (possibleCities.length > 0 && !possibleCities.includes(targetCity)) {
    setTargetCity(possibleCities[0]);
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        Select the industry and city to export this material to, as well as how much of this material to export per
        second.
        <br />
        <br />
        You can use 'MAX', 'EINV', 'IINV', 'EPROD' or 'IPROD' in the amount for:
        <br />
        - 'MAX' to export maximum amount possible.
        <br />
        - 'EINV' export city's inventory of the material.
        <br />
        - 'IINV' import city's inventory of the material.
        <br />
        - 'EPROD' export city's per second production of the material
        <br />
        - 'IPROD' import city's per second production of the material
        <br />
        Note: Consumption is negative production.
        <br />
        <br />
        For example: setting the amount "(EINV-20)/10" would try to export all except 20 of the material.
      </Typography>
      <Select onChange={onTargetDivisionChange} value={targetDivision.name}>
        {[...corp.divisions.values()]
          .filter((division) => isRelevantMaterial(props.mat.name, division))
          .map((division) => (
            <MenuItem key={division.name} value={division.name}>
              {division.name}
            </MenuItem>
          ))}
      </Select>
      <Select onChange={onCityChange} value={targetCity}>
        {possibleCities.map((cityName) => (
          <MenuItem key={cityName} value={cityName}>
            {cityName}
          </MenuItem>
        ))}
      </Select>
      <TextField placeholder="Export amount / s" onChange={onAmtChange} value={exportAmount} />
      <Button onClick={exportMaterial}>Export</Button>
      <Typography>
        Below is a list of all current exports of this material from this warehouse. Clicking on one of the exports
        below will REMOVE that export.
      </Typography>
      {props.mat.exports.map((exp: Export, index: number) => (
        <Box display="flex" alignItems="center" key={index}>
          <Button sx={{ mx: 2 }} onClick={() => removeExport(exp)}>
            delete
          </Button>
          <Typography>
            Industry: {exp.division}
            <br />
            City: {exp.city}
            <br />
            Amount/s: {exp.amount}
          </Typography>
        </Box>
      ))}
    </Modal>
  );
}
