import React from "react";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import { Adjuster } from "./Adjuster";
import { Player } from "@player";

const bigNumber = 1e27;

export function Bladeburner(): React.ReactElement {
  const bladeburner = Player.bladeburner;
  if (bladeburner === null) return <></>;
  function modifyBladeburnerRank(modify: number): (x: number) => void {
    return function (rank: number): void {
      if (!bladeburner) return;
      bladeburner.changeRank(Player, rank * modify);
    };
  }

  function resetBladeburnerRank(): void {
    if (!bladeburner) return;
    bladeburner.rank = 0;
    bladeburner.maxRank = 0;
  }

  function addTonsBladeburnerRank(): void {
    if (!bladeburner) return;
    bladeburner.changeRank(Player, bigNumber);
  }

  function modifyBladeburnerSP(modify: number): (x: number) => void {
    return function (skillPoints: number): void {
      if (!bladeburner) return;
      bladeburner.skillPoints += skillPoints * modify;
    };
  }

  function resetBladeburnerSP(): void {
    if (!bladeburner) return;
    bladeburner.skillPoints = 0;
    bladeburner.totalSkillPoints = 0;
  }

  function addTonsBladeburnerSP(): void {
    if (!bladeburner) return;
    bladeburner.skillPoints = bigNumber;
  }

  function modifyBladeburnerCycles(modify: number): (x: number) => void {
    return function (cycles: number): void {
      if (!bladeburner) return;
      bladeburner.storedCycles += cycles * modify;
    };
  }

  function resetBladeburnerCycles(): void {
    if (!bladeburner) return;
    bladeburner.storedCycles = 0;
  }

  function addTonsBladeburnerCycles(): void {
    if (!bladeburner) return;
    bladeburner.storedCycles += bigNumber;
  }

  function wipeAllChaos(): void {
    if (!bladeburner) return;
    bladeburner.cities["Sector-12"].chaos = 0;
    bladeburner.cities.Aevum.chaos = 0;
    bladeburner.cities.Chongqing.chaos = 0;
    bladeburner.cities["New Tokyo"].chaos = 0;
    bladeburner.cities.Ishima.chaos = 0;
    bladeburner.cities.Volhaven.chaos = 0;
  }

  function wipeActiveCityChaos(): void {
    if (!bladeburner) return;
    bladeburner.cities[bladeburner.getCurrentCity().name].chaos = 0;
  }

  function addAllChaos(modify: number): (x: number) => void {
    return function (chaos: number): void {
      if (!bladeburner) return;
      bladeburner.cities["Sector-12"].chaos += chaos * modify;
      bladeburner.cities.Aevum.chaos += chaos * modify;
      bladeburner.cities.Chongqing.chaos += chaos * modify;
      bladeburner.cities["New Tokyo"].chaos += chaos * modify;
      bladeburner.cities.Ishima.chaos += chaos * modify;
      bladeburner.cities.Volhaven.chaos += chaos * modify;
    };
  }

  function addTonsAllChaos(): void {
    if (!bladeburner) return;
    bladeburner.cities["Sector-12"].chaos += bigNumber;
    bladeburner.cities.Aevum.chaos += bigNumber;
    bladeburner.cities.Chongqing.chaos += bigNumber;
    bladeburner.cities["New Tokyo"].chaos += bigNumber;
    bladeburner.cities.Ishima.chaos += bigNumber;
    bladeburner.cities.Volhaven.chaos += bigNumber;
  }

  return (
    <Accordion TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Bladeburner</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <table>
          <tbody>
            <tr>
              <td>
                <Typography>Rank:</Typography>
              </td>
              <td>
                <Adjuster
                  label="rank"
                  placeholder="amt"
                  tons={addTonsBladeburnerRank}
                  add={modifyBladeburnerRank(1)}
                  subtract={modifyBladeburnerRank(-1)}
                  reset={resetBladeburnerRank}
                />
              </td>
            </tr>
            <tr>
              <td>
                <Typography>SP:</Typography>
              </td>
              <td>
                <Adjuster
                  label="skill points"
                  placeholder="amt"
                  tons={addTonsBladeburnerSP}
                  add={modifyBladeburnerSP(1)}
                  subtract={modifyBladeburnerSP(-1)}
                  reset={resetBladeburnerSP}
                />
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Cycles: </Typography>
              </td>
              <td>
                <Adjuster
                  label="cycles"
                  placeholder="amt"
                  tons={addTonsBladeburnerCycles}
                  add={modifyBladeburnerCycles(1)}
                  subtract={modifyBladeburnerCycles(-1)}
                  reset={resetBladeburnerCycles}
                />
              </td>
            </tr>
            <tr>
              <td>
                <Typography title="This is for ALL cities">Chaos:</Typography>
              </td>
              <td>
                <Adjuster
                  label="chaos in all cities"
                  placeholder="amt"
                  tons={addTonsAllChaos}
                  add={addAllChaos(1)}
                  subtract={addAllChaos(-1)}
                  reset={wipeAllChaos}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </AccordionDetails>
      <Button onClick={wipeActiveCityChaos}>Clear Active Cities Chaos</Button>
    </Accordion>
  );
}
