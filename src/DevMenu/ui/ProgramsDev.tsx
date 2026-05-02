import React, { useState } from "react";

import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { Player } from "@player";
import MenuItem from "@mui/material/MenuItem";
import { CompletedProgramName } from "@enums";
import { AutoExpandAccordion } from "../../ui/AutoExpand/AutoExpandAccordion";

export function ProgramsDev(): React.ReactElement {
  const [program, setProgram] = useState(CompletedProgramName.bruteSsh);
  function setProgramDropdown(event: SelectChangeEvent): void {
    setProgram(event.target.value as CompletedProgramName);
  }
  function addProgram(): void {
    Player.getHomeComputer().pushProgram(program);
  }

  function addAllPrograms(): void {
    const home = Player.getHomeComputer();
    for (const name of Object.values(CompletedProgramName)) {
      home.pushProgram(name);
    }
  }

  return (
    <AutoExpandAccordion cacheKey="DEVMENU_ProgramsDev" unmountOnExit={true}>
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
    </AutoExpandAccordion>
  );
}
