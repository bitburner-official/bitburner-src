import React from "react";

import Typography from "@mui/material/Typography";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { Player } from "@player";
import { Adjuster } from "./Adjuster";
import { AutoExpandAccordion } from "../../ui/AutoExpand/AutoExpandAccordion";

const bigNumber = 1e27;

export function GangDev(): React.ReactElement {
  if (!Player.gang) {
    return (
      <AutoExpandAccordion cacheKey="DEVMENU_GangDev" unmountOnExit={true} disabled={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Gang</Typography>
        </AccordionSummary>
      </AutoExpandAccordion>
    );
  }
  const gang = Player.gang;
  function addTonsGangCycles(): void {
    gang.storedCycles = bigNumber;
  }

  function modifyGangCycles(modify: number): (x: number) => void {
    return function (cycles: number): void {
      gang.storedCycles += cycles * modify;
    };
  }

  function resetGangCycles(): void {
    gang.storedCycles = 0;
  }

  return (
    <AutoExpandAccordion cacheKey="DEVMENU_GangDev" unmountOnExit={true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Gang</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <table>
          <tbody>
            <tr>
              <td>
                <Typography>Cycles:</Typography>
              </td>
              <td>
                <Adjuster
                  label="cycles"
                  placeholder="amt"
                  tons={addTonsGangCycles}
                  add={modifyGangCycles(1)}
                  subtract={modifyGangCycles(-1)}
                  reset={resetGangCycles}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </AccordionDetails>
    </AutoExpandAccordion>
  );
}
