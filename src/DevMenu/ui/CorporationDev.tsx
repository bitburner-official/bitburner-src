import React from "react";

import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Adjuster } from "./Adjuster";
import { AutoExpandAccordion } from "../../ui/AutoExpand/AutoExpandAccordion";
import type { Corporation } from "../../Corporation/Corporation";

const bigNumber = 1e27;

export function CorporationDev({ corporation }: { corporation: Corporation }): React.ReactElement {
  function addTonsCorporationFunds(): void {
    corporation.gainFunds(bigNumber, "force majeure");
  }

  function modifyCorporationFunds(modify: number): (x: number) => void {
    return function (funds: number): void {
      corporation.gainFunds(funds * modify, "force majeure");
    };
  }

  function resetCorporationFunds(): void {
    corporation.loseFunds(corporation.funds, "force majeure");
  }

  function addTonsCorporationCycles(): void {
    corporation.storedCycles = bigNumber;
  }

  function modifyCorporationCycles(modify: number): (x: number) => void {
    return function (cycles: number): void {
      corporation.storedCycles += cycles * modify;
    };
  }

  function resetCorporationCycles(): void {
    corporation.storedCycles = 0;
  }

  function finishCorporationProducts(): void {
    for (const division of corporation.divisions.values()) {
      for (const product of division.products.values()) {
        product.developmentProgress = 99.9;
      }
    }
  }

  function addCorporationResearch(): void {
    corporation.divisions.forEach((div) => {
      div.researchPoints += 1e10;
    });
  }

  function resetCorporationCooldowns(): void {
    corporation.shareSaleCooldown = 0;
    corporation.issueNewSharesCooldown = 0;
  }

  return (
    <AutoExpandAccordion cacheKey="DEVMENU_CorporationDev" unmountOnExit={true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Corporation</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <table>
          <tbody>
            <tr>
              <td>
                <Typography>Funds:</Typography>
              </td>
              <td>
                <Adjuster
                  label="set funds"
                  placeholder="amt"
                  tons={addTonsCorporationFunds}
                  add={modifyCorporationFunds(1)}
                  subtract={modifyCorporationFunds(-1)}
                  reset={resetCorporationFunds}
                />
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Cycles:</Typography>
              </td>
              <td>
                <Adjuster
                  label="cycles"
                  placeholder="amt"
                  tons={addTonsCorporationCycles}
                  add={modifyCorporationCycles(1)}
                  subtract={modifyCorporationCycles(-1)}
                  reset={resetCorporationCycles}
                />
              </td>
            </tr>
            <tr>
              <td>
                <Button onClick={finishCorporationProducts}>Finish products</Button>
              </td>
            </tr>
            <tr>
              <td>
                <Button onClick={addCorporationResearch}>Tons of research</Button>
              </td>
            </tr>
            <tr>
              <td>
                <Button onClick={resetCorporationCooldowns}>Reset stock cooldowns</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </AccordionDetails>
    </AutoExpandAccordion>
  );
}
