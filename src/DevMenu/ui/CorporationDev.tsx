import React from "react";

import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Player } from "@player";
import { Adjuster } from "./Adjuster";
import { AutoExpandAccordion } from "../../ui/AutoExpand/AutoExpandAccordion";

const bigNumber = 1e27;

export function CorporationDev(): React.ReactElement {
  if (!Player.corporation) {
    return (
      <AutoExpandAccordion cacheKey="DEVMENU_CorporationDev" unmountOnExit={true} disabled={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>企业</Typography>
        </AccordionSummary>
      </AutoExpandAccordion>
    );
  }
  const corporation = Player.corporation;
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
        <Typography>企业</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <table>
          <tbody>
            <tr>
              <td>
                <Typography>资金：</Typography>
              </td>
              <td>
                <Adjuster
                  label="设置资金"
                  placeholder="数量"
                  tons={addTonsCorporationFunds}
                  add={modifyCorporationFunds(1)}
                  subtract={modifyCorporationFunds(-1)}
                  reset={resetCorporationFunds}
                />
              </td>
            </tr>
            <tr>
              <td>
                <Typography>周期：</Typography>
              </td>
              <td>
                <Adjuster
                  label="周期"
                  placeholder="数量"
                  tons={addTonsCorporationCycles}
                  add={modifyCorporationCycles(1)}
                  subtract={modifyCorporationCycles(-1)}
                  reset={resetCorporationCycles}
                />
              </td>
            </tr>
            <tr>
              <td>
                <Button onClick={finishCorporationProducts}>完成产品研发</Button>
              </td>
            </tr>
            <tr>
              <td>
                <Button onClick={addCorporationResearch}>海量研究点数</Button>
              </td>
            </tr>
            <tr>
              <td>
                <Button onClick={resetCorporationCooldowns}>重置股票冷却时间</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </AccordionDetails>
    </AutoExpandAccordion>
  );
}
