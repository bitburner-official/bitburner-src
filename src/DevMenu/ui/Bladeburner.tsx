import React from "react";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import { Adjuster } from "./Adjuster";
import { Player } from "@player";
import { CityName } from "../../Enums";

const bigNumber = 1e27;

export function Bladeburner(): React.ReactElement {
  if (!Player.bladeburner) return <></>;
  const bladeburner = Player.bladeburner;

  // Rank functions
  const modifyBladeburnerRank = (modify: number) => (rank: number) => bladeburner.changeRank(Player, rank * modify);
  const resetBladeburnerRank = () => {
    bladeburner.rank = 0;
    bladeburner.maxRank = 0;
  };
  const addTonsBladeburnerRank = () => bladeburner.changeRank(Player, bigNumber);

  // Skill point functions
  const modifyBladeburnerSP = (modify: number) => (skillPoints: number) => {
    bladeburner.skillPoints += skillPoints * modify;
  };
  const resetBladeburnerSP = () => {
    bladeburner.skillPoints = 0;
    bladeburner.totalSkillPoints = 0;
  };
  const addTonsBladeburnerSP = () => (bladeburner.skillPoints = bigNumber);

  // Cycles functions
  const modifyBladeburnerCycles = (modify: number) => (cycles: number) => (bladeburner.storedCycles += cycles * modify);
  const resetBladeburnerCycles = () => (bladeburner.storedCycles = 0);
  const addTonsBladeburnerCycles = () => (bladeburner.storedCycles += bigNumber);

  // Chaos functions
  const wipeAllChaos = () => Object.values(CityName).forEach((city) => (bladeburner.cities[city].chaos = 0));
  const wipeActiveCityChaos = () => (bladeburner.cities[bladeburner.city].chaos = 0);
  const addAllChaos = (modify: number) => (chaos: number) => {
    Object.values(CityName).forEach((city) => (bladeburner.cities[city].chaos += chaos * modify));
  };
  const addTonsAllChaos = () => {
    Object.values(CityName).forEach((city) => (bladeburner.cities[city].chaos += bigNumber));
  };

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
      <Button onClick={wipeActiveCityChaos}>Clear Active City's Chaos</Button>
    </Accordion>
  );
}
