import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  RadioGroup,
  Radio,
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ReplyAllIcon from "@mui/icons-material/ReplyAll";
import ReplyIcon from "@mui/icons-material/Reply";
import ChatIcon from "@mui/icons-material/Chat";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";

import { Player } from "@player";
import { FactionName, FactionDiscovery } from "@enums";
import { Adjuster } from "./Adjuster";
import { Factions } from "../../Faction/Factions";
import { getRecordValues } from "../../Types/Record";
import { getEnumHelper } from "../../utils/EnumHelper";

const bigNumber = 1e12;

export function FactionsDev(): React.ReactElement {
  const [factionName, setFactionName] = useState(FactionName.Illuminati);
  const [factionDiscovery, setFactionDiscovery] = useState(Factions[FactionName.Illuminati].discovery);

  function setFactionDropdown(event: SelectChangeEvent): void {
    if (!getEnumHelper("FactionName").isMember(event.target.value)) return;
    setFactionName(event.target.value);
    setFactionDiscovery(Factions[event.target.value].discovery);
  }

  function receiveInvite(): void {
    Player.receiveInvite(factionName);
  }

  function receiveAllInvites(): void {
    Object.values(FactionName).forEach((faction) => Player.receiveInvite(faction));
  }

  function receiveRumor(): void {
    Player.receiveRumor(factionName);
  }

  function receiveAllRumors(): void {
    Object.values(FactionName).forEach((faction) => Player.receiveRumor(faction));
  }

  function resetAllDiscovery(): void {
    Object.values(Factions).forEach((faction) => {
      faction.discovery = FactionDiscovery.unknown;
    });
  }

  function modifyFactionRep(modifier: number): (x: number) => void {
    return function (reputation: number): void {
      const fac = Factions[factionName];
      if (!isNaN(reputation)) {
        fac.playerReputation += reputation * modifier;
      }
    };
  }

  function resetFactionRep(): void {
    const fac = Factions[factionName];
    fac.playerReputation = 0;
  }

  function modifyFactionFavor(modifier: number): (x: number) => void {
    return function (favor: number): void {
      const fac = Factions[factionName];
      if (!isNaN(favor)) {
        fac.favor += favor * modifier;
      }
    };
  }

  function resetFactionFavor(): void {
    const fac = Factions[factionName];
    fac.favor = 0;
  }

  function tonsOfRep(): void {
    for (const faction of getRecordValues(Factions)) {
      faction.playerReputation = bigNumber;
    }
  }

  function resetAllRep(): void {
    for (const faction of getRecordValues(Factions)) {
      faction.playerReputation = 0;
    }
  }

  function tonsOfFactionFavor(): void {
    for (const faction of getRecordValues(Factions)) {
      faction.favor = bigNumber;
    }
  }

  function resetAllFactionFavor(): void {
    for (const faction of getRecordValues(Factions)) {
      faction.favor = 0;
    }
  }

  function setDiscovery(event: React.ChangeEvent<HTMLInputElement>, value: string): void {
    console.log(event, value);
    Factions[factionName].discovery = value as FactionDiscovery;
    setFactionDiscovery(value as FactionDiscovery);
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
                        <Tooltip title={`Hear rumor about ${factionName}`}>
                          <IconButton onClick={receiveRumor} size="large">
                            <ChatIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={`Receive invitation to ${factionName}`}>
                          <IconButton onClick={receiveInvite} size="large">
                            <ReplyIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    }
                  >
                    {Object.values(Factions).map((faction) => (
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
                <Typography>Discovery:</Typography>
              </td>
              <td>
                <FormControl>
                  <RadioGroup onChange={setDiscovery} value={factionDiscovery} row>
                    {Object.entries(FactionDiscovery).map(([discoveryLabel, discovery]) => (
                      <FormControlLabel value={discovery} label={discoveryLabel} control={<Radio />} />
                    ))}
                  </RadioGroup>
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
                <Typography>All Factions:</Typography>
              </td>
              <td>
                <Tooltip title="Forget all discovery">
                  <Button onClick={resetAllDiscovery} size="large">
                    <ChatBubbleIcon />
                  </Button>
                </Tooltip>
                <Tooltip title="Hear all rumors">
                  <Button onClick={receiveAllRumors} size="large">
                    <ChatIcon />
                  </Button>
                </Tooltip>
                <Tooltip title="Receive all invitations">
                  <Button onClick={receiveAllInvites} size="large">
                    <ReplyAllIcon />
                  </Button>
                </Tooltip>
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
