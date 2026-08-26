import React from "react";

import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Player } from "@player";
import { Adjuster } from "./Adjuster";
import { AutoExpandAccordion } from "../../ui/AutoExpand/AutoExpandAccordion";

export function SleevesDev(): React.ReactElement {
  if (Player.sleeves.length === 0) {
    return (
      <AutoExpandAccordion cacheKey="DEVMENU_SleevesDev" unmountOnExit={true} disabled={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>分身</Typography>
        </AccordionSummary>
      </AutoExpandAccordion>
    );
  }

  function sleeveMaxAllShock(): void {
    for (let i = 0; i < Player.sleeves.length; ++i) {
      Player.sleeves[i].shock = 100;
    }
  }

  function sleeveClearAllShock(): void {
    for (let i = 0; i < Player.sleeves.length; ++i) {
      Player.sleeves[i].shock = 0;
    }
  }

  function sleeveSyncMaxAll(): void {
    for (let i = 0; i < Player.sleeves.length; ++i) {
      Player.sleeves[i].sync = 100;
    }
  }

  function sleeveSyncClearAll(): void {
    for (let i = 0; i < Player.sleeves.length; ++i) {
      Player.sleeves[i].sync = 0;
    }
  }

  function sleeveSetStoredCycles(cycles: number): void {
    for (let i = 0; i < Player.sleeves.length; ++i) {
      Player.sleeves[i].storedCycles = cycles;
    }
  }

  return (
    <AutoExpandAccordion cacheKey="DEVMENU_SleevesDev" unmountOnExit={true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>分身</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <table>
          <tbody>
            <tr>
              <td>
                <Typography>震荡：</Typography>
              </td>
              <td>
                <Button onClick={sleeveMaxAllShock}>全部最大</Button>
              </td>
              <td>
                <Button onClick={sleeveClearAllShock}>全部清零</Button>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>同步：</Typography>
              </td>
              <td>
                <Button onClick={sleeveSyncMaxAll}>全部最大</Button>
              </td>
              <td>
                <Button onClick={sleeveSyncClearAll}>全部清零</Button>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>总计：</Typography>
              </td>
            </tr>
            <tr>
              <td colSpan={3}>
                <Adjuster
                  label="已存储周期"
                  placeholder="周期"
                  tons={() => sleeveSetStoredCycles(10000000)}
                  add={sleeveSetStoredCycles}
                  subtract={sleeveSetStoredCycles}
                  reset={() => sleeveSetStoredCycles(0)}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </AccordionDetails>
    </AutoExpandAccordion>
  );
}
