import React, { useState } from "react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { Player } from "@player";

import { CompletedProgramName } from "../../Programs/Programs";

export function Programs(): React.ReactElement {
  const [program, setProgram] = useState(CompletedProgramName.bruteSsh);
  function setProgramDropdown(event: SelectChangeEvent): void {
    setProgram(event.target.value as CompletedProgramName);
  }
  function addProgram(): void {
    if (!Player.hasProgram(program)) Player.getHomeComputer().programs.push(program);
  }

  function addAllPrograms(): void {
    for (const name of Object.values(CompletedProgramName)) {
      if (!Player.hasProgram(name)) Player.getHomeComputer().programs.push(name);
    }
  }

  return (
    <Accordion TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Programs</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <table>
          <tbody>
            <tr>
              <td>
                <Typography>Program:</Typography>
              </td>
              <td>
                <Select onChange={setProgramDropdown} value={program}>
                  {Object.values(CompletedProgramName).map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Add:</Typography>
              </td>
              <td>
                <Button onClick={addProgram}>One</Button>
                <Button onClick={addAllPrograms}>All</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </AccordionDetails>
    </Accordion>
  );
}
