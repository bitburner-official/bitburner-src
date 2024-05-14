import React, { useState } from "react";

import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { IndustriesData } from "../data/IndustryData";
import { IndustryType } from "@enums";
import { useCorporation } from "./Context";
import { createDivision } from "../Actions";

import { ButtonWithTooltip } from "../../ui/Components/ButtonWithTooltip";
import { KEY } from "../../utils/helpers/keyCodes";
import { IndustryDescription } from "./IndustryDescription";
interface IProps {
  setDivisionName: (name: string) => void;
}

export function NewDivisionTab(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const allIndustries = Object.values(IndustryType).sort();
  const [industry, setIndustry] = useState(allIndustries[0]);
  const [name, setName] = useState("");

  const data = IndustriesData[industry];
  if (!data) return <></>;

  const disabledText =
    corp.divisions.size >= corp.maxDivisions
      ? "Corporation already has the maximum number of divisions"
      : corp.funds < data.startingCost
      ? "Insufficient corporation funds"
      : "";

  function newDivision(): void {
    if (disabledText) return;
    try {
      createDivision(corp, industry, name);
    } catch (err) {
      dialogBoxCreate(err + "");
      return;
    }

    // Set routing to the new division so that the UI automatically switches to it
    props.setDivisionName(name);
  }

  function onNameChange(event: React.ChangeEvent<HTMLInputElement>): void {
    // [a-zA-Z0-9-_]
    setName(event.target.value);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) newDivision();
  }

  function onIndustryChange(event: SelectChangeEvent): void {
    setIndustry(event.target.value as IndustryType);
  }

  return (
    <>
      <Typography>
        {corp.name} has {corp.divisions.size} of {corp.maxDivisions} divisions.
      </Typography>
      <Typography>Create a new division to expand into a new industry:</Typography>
      <Select value={industry} onChange={onIndustryChange}>
        {allIndustries.map((industry) => (
          <MenuItem key={industry} value={industry}>
            {industry}
          </MenuItem>
        ))}
      </Select>
      <IndustryDescription industry={industry} corp={corp} />
      <br />
      <br />

      <Typography>Division name:</Typography>

      <Box display="flex" alignItems="center">
        <TextField autoFocus={true} value={name} onChange={onNameChange} onKeyDown={onKeyDown} type="text"></TextField>{" "}
        <ButtonWithTooltip disabledTooltip={disabledText} onClick={newDivision}>
          Expand
        </ButtonWithTooltip>
      </Box>
    </>
  );
}
