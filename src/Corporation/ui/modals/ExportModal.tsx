import React, { useState } from "react";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Material } from "../../Material";
import { Export } from "../../Export";
import { Industry } from "../../Industry";
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
import { CityName } from "../../../Enums";
import { useRerender } from "../../../ui/React/hooks";

interface IProps {
  open: boolean;
  onClose: () => void;
  mat: Material;
}

// Create a popup that lets the player manage exports
export function ExportModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const possibleDivisions = [...corp.divisions.values()].filter((division: Industry) => {
    return isRelevantMaterial(props.mat.name, division);
  });
  if (possibleDivisions.length === 0) throw new Error("Export popup created with no divisions.");
  const defaultDivision = possibleDivisions[0];
  if (Object.keys(defaultDivision.warehouses).length === 0)
    throw new Error("Export popup created in a division with no warehouses.");
  const [division, setDivision] = useState(defaultDivision);
  const [city, setCity] = useState(Object.keys(defaultDivision.warehouses)[0] as CityName);
  const [amt, setAmt] = useState("");
  const rerender = useRerender();

  function onCityChange(event: SelectChangeEvent<CityName>): void {
    setCity(event.target.value as CityName);
  }

  function onIndustryChange(event: SelectChangeEvent): void {
    const division = corp.divisions.get(event.target.value);
    if (!division) return;
    setDivision(division);
  }

  function onAmtChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setAmt(event.target.value);
  }

  function exportMaterial(): void {
    try {
      ExportMaterial(division.name, city, props.mat, amt, division);
    } catch (err) {
      dialogBoxCreate(err + "");
    }
    props.onClose();
  }

  function removeExport(exp: Export): void {
    for (let i = 0; i < props.mat.exp.length; ++i) {
      if (props.mat.exp[i].ind !== exp.ind || props.mat.exp[i].city !== exp.city || props.mat.exp[i].amt !== exp.amt)
        continue;
      props.mat.exp.splice(i, 1);
      break;
    }
    rerender();
  }

  const possibleCities = (Object.keys(division.warehouses) as CityName[]).filter(
    (city) => division.warehouses[city] !== 0,
  );
  if (possibleCities.length > 0 && !possibleCities.includes(city)) {
    setCity(possibleCities[0]);
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
      <Select onChange={onIndustryChange} value={division.name}>
        {[...corp.divisions.values()]
          .filter((div) => isRelevantMaterial(props.mat.name, div))
          .map((div) => (
            <MenuItem key={div.name} value={div.name}>
              {div.name}
            </MenuItem>
          ))}
      </Select>
      <Select onChange={onCityChange} value={city}>
        {possibleCities.map((cityName) => {
          if (division.warehouses[cityName] === 0) return;
          return (
            <MenuItem key={cityName} value={cityName}>
              {cityName}
            </MenuItem>
          );
        })}
      </Select>
      <TextField placeholder="Export amount / s" onChange={onAmtChange} value={amt} />
      <Button onClick={exportMaterial}>Export</Button>
      <Typography>
        Below is a list of all current exports of this material from this warehouse. Clicking on one of the exports
        below will REMOVE that export.
      </Typography>
      {props.mat.exp.map((exp: Export, index: number) => (
        <Box display="flex" alignItems="center" key={index}>
          <Button sx={{ mx: 2 }} onClick={() => removeExport(exp)}>
            delete
          </Button>
          <Typography>
            Industry: {exp.ind}
            <br />
            City: {exp.city}
            <br />
            Amount/s: {exp.amt}
          </Typography>
        </Box>
      ))}
    </Modal>
  );
}
