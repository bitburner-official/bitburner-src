import React, { useState } from "react";
import {
  AccordionSummary,
  AccordionDetails,
  Button,
  FormControl,
  FormControlLabel,
  Typography,
  RadioGroup,
  Radio,
  Box,
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
import { useRerender } from "../../ui/React/hooks";
import { MaxFavor } from "../../Faction/formulas/favor";
import { FactionChooser } from "./FactionChooser";
import { AutoExpandAccordion } from "../../ui/AutoExpand/AutoExpandAccordion";

const largeAmountOfReputation = 1e12;

export function FactionsDev(): React.ReactElement {
  const [selectedFaction, setSelectedFaction] = useState(Factions[FactionName.Illuminati]);
  const rerender = useRerender();

  function receiveInvite(): void {
    Player.receiveInvite(selectedFaction.name);
    selectedFaction.alreadyInvited = true;
    rerender();
  }

  function receiveAllInvites(): void {
    getRecordValues(Factions).forEach((faction) => {
      Player.receiveInvite(faction.name);
      faction.alreadyInvited = true;
    });
    rerender();
  }

  function receiveRumor(): void {
    Player.receiveRumor(selectedFaction.name);
    rerender();
  }

  function receiveAllRumors(): void {
    getRecordValues(FactionName).forEach((factionName) => Player.receiveRumor(factionName));
    rerender();
  }

  function resetAllDiscovery(): void {
    getRecordValues(Factions).forEach((faction) => (faction.discovery = FactionDiscovery.unknown));
    Player.factionRumors.clear();
    rerender();
  }

  function modifyFactionRep(modifier: number): (x: number) => void {
    return function (reputation: number): void {
      if (!isNaN(reputation)) {
        selectedFaction.playerReputation += reputation * modifier;
      }
    };
  }

  function resetFactionRep(): void {
    selectedFaction.playerReputation = 0;
  }

  function modifyFactionFavor(modifier: number): (x: number) => void {
    return function (favor: number): void {
      if (!isNaN(favor)) {
        selectedFaction.setFavor(selectedFaction.favor + favor * modifier);
      }
    };
  }

  function resetFactionFavor(): void {
    selectedFaction.setFavor(0);
  }

  function tonsOfRep(): void {
    for (const faction of getRecordValues(Factions)) {
      faction.playerReputation = largeAmountOfReputation;
    }
  }

  function resetAllRep(): void {
    for (const faction of getRecordValues(Factions)) {
      faction.playerReputation = 0;
    }
  }

  function tonsOfFactionFavor(): void {
    for (const faction of getRecordValues(Factions)) {
      faction.setFavor(MaxFavor);
    }
  }

  function resetAllFactionFavor(): void {
    for (const faction of getRecordValues(Factions)) {
      faction.setFavor(0);
    }
  }

  function setDiscovery(_: React.ChangeEvent<HTMLInputElement>, value: string): void {
    if (!getEnumHelper("FactionDiscovery").isMember(value)) return;
    selectedFaction.discovery = value;
    rerender();
  }

  return (
    <AutoExpandAccordion cacheKey="DEVMENU_FactionsDev" unmountOnExit={true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>派系</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <table>
          <tbody>
            <tr>
              <td>
                <Typography>派系：</Typography>
              </td>
              <td>
                <Box display="flex">
                  <Tooltip title={`听说关于 ${selectedFaction.name} 的传闻`}>
                    <Button onClick={receiveRumor} size="large">
                      <ChatIcon />
                    </Button>
                  </Tooltip>
                  <Tooltip title={`收到加入 ${selectedFaction.name} 的邀请`}>
                    <Button onClick={receiveInvite} size="large">
                      <ReplyIcon />
                    </Button>
                  </Tooltip>
                  <FactionChooser
                    faction={selectedFaction}
                    onChange={setSelectedFaction}
                    style={{ marginLeft: "8px" }}
                  />
                </Box>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>发现状态：</Typography>
              </td>
              <td>
                <FormControl>
                  <RadioGroup onChange={setDiscovery} value={selectedFaction.discovery} row>
                    {getRecordValues(FactionDiscovery).map((discovery) => (
                      <FormControlLabel key={discovery} value={discovery} label={discovery} control={<Radio />} />
                    ))}
                  </RadioGroup>
                </FormControl>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>声望：</Typography>
              </td>
              <td>
                <Adjuster
                  label="声望"
                  placeholder="数量"
                  tons={() => modifyFactionRep(1)(largeAmountOfReputation)}
                  add={modifyFactionRep(1)}
                  subtract={modifyFactionRep(-1)}
                  reset={resetFactionRep}
                />
              </td>
            </tr>
            <tr>
              <td>
                <Typography>好感：</Typography>
              </td>
              <td>
                <Adjuster
                  label="好感"
                  placeholder="数量"
                  tons={() => modifyFactionFavor(1)(MaxFavor)}
                  add={modifyFactionFavor(1)}
                  subtract={modifyFactionFavor(-1)}
                  reset={resetFactionFavor}
                />
              </td>
            </tr>
            <tr>
              <td>
                <Typography>所有派系：</Typography>
              </td>
              <td>
                <Tooltip title="忘记全部发现状态">
                  <Button onClick={resetAllDiscovery} size="large">
                    <ChatBubbleIcon />
                  </Button>
                </Tooltip>
                <Tooltip title="听取全部传闻">
                  <Button onClick={receiveAllRumors} size="large">
                    <ChatIcon />
                  </Button>
                </Tooltip>
                <Tooltip title="接收全部邀请">
                  <Button onClick={receiveAllInvites} size="large">
                    <ReplyAllIcon />
                  </Button>
                </Tooltip>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>全部声望：</Typography>
              </td>
              <td>
                <Button onClick={tonsOfRep}>海量</Button>
                <Button onClick={resetAllRep}>重置</Button>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>全部好感：</Typography>
              </td>
              <td>
                <Button onClick={tonsOfFactionFavor}>海量</Button>
                <Button onClick={resetAllFactionFavor}>重置</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </AccordionDetails>
    </AutoExpandAccordion>
  );
}
