import React, { useState } from "react";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { Adjuster } from "./Adjuster";
import { Player } from "@player";
import { Factions as AllFaction } from "../../Faction/Factions";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import ReplyAllIcon from "@mui/icons-material/ReplyAll";
import ReplyIcon from "@mui/icons-material/Reply";
import InputLabel from "@mui/material/InputLabel";
import { FactionName } from "../../Faction/data/Enums";

const bigNumber = 1e12;

export function Factions(): React.ReactElement {
  const [factionName, setFactionName] = useState(FactionName.Illuminati);

  function setFactionDropdown(event: SelectChangeEvent<string>): void {
    setFactionName(event.target.value as FactionName);
  }

  function receiveInvite(): void {
    Player.receiveInvite(factionName);
  }

  function receiveAllInvites(): void {
    Object.values(FactionName).forEach((faction) => Player.receiveInvite(faction));
  }

  function modifyFactionRep(modifier: number): (x: number) => void {
    return function (reputation: number): void {
      if (!isNaN(reputation)) AllFaction[factionName].playerReputation += reputation * modifier;
    };
  }

  function resetFactionRep(): void {
    AllFaction[factionName].playerReputation = 0;
  }

  function modifyFactionFavor(modifier: number): (x: number) => void {
    return function (favor: number): void {
      if (!isNaN(favor)) AllFaction[factionName].favor += favor * modifier;
    };
  }

  function resetFactionFavor(): void {
    AllFaction[factionName].favor = 0;
  }

  function tonsOfRep(): void {
    for (const faction of Object.values(AllFaction)) faction.playerReputation = bigNumber;
  }

  function resetAllRep(): void {
    for (const faction of Object.values(AllFaction)) faction.playerReputation = 0;
  }

  function tonsOfFactionFavor(): void {
    for (const faction of Object.values(AllFaction)) faction.favor = bigNumber;
  }

  function resetAllFactionFavor(): void {
    for (const faction of Object.values(AllFaction)) faction.favor = 0;
  }

  return (
    <Accordion TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Factions</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <table>
          <tbody>
            <tr>
              <td>
                <Typography>Faction:</Typography>
              </td>
              <td>
                <FormControl>
                  <InputLabel id="factions-select">Faction</InputLabel>
                  <Select
                    labelId="factions-select"
                    id="factions-dropdown"
                    onChange={setFactionDropdown}
                    value={factionName}
                    startAdornment={
                      <>
                        <IconButton onClick={receiveAllInvites} size="large" arial-label="receive-all-invitation">
                          <ReplyAllIcon />
                        </IconButton>
                        <IconButton onClick={receiveInvite} size="large" arial-label="receive-one-invitation">
                          <ReplyIcon />
                        </IconButton>
                      </>
                    }
                  >
                    {Object.values(AllFaction).map((faction) => (
                      <MenuItem key={faction.name} value={faction.name}>
                        {faction.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Reputation:</Typography>
              </td>
              <td>
                <Adjuster
                  label="reputation"
                  placeholder="amt"
                  tons={() => modifyFactionRep(1)(bigNumber)}
                  add={modifyFactionRep(1)}
                  subtract={modifyFactionRep(-1)}
                  reset={resetFactionRep}
                />
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Favor:</Typography>
              </td>
              <td>
                <Adjuster
                  label="favor"
                  placeholder="amt"
                  tons={() => modifyFactionFavor(1)(2000)}
                  add={modifyFactionFavor(1)}
                  subtract={modifyFactionFavor(-1)}
                  reset={resetFactionFavor}
                />
              </td>
            </tr>
            <tr>
              <td>
                <Typography>All Reputation:</Typography>
              </td>
              <td>
                <Button onClick={tonsOfRep}>Tons</Button>
                <Button onClick={resetAllRep}>Reset</Button>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>All Favor:</Typography>
              </td>
              <td>
                <Button onClick={tonsOfFactionFavor}>Tons</Button>
                <Button onClick={resetAllFactionFavor}>Reset</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </AccordionDetails>
    </Accordion>
  );
}
