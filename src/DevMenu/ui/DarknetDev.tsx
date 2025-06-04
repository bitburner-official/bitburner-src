import React from "react";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Button from "@mui/material/Button";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { clearDarknet, populateDarknet } from "../../DarkNet/controllers/NetworkGenerator";
import { DarknetEvents, DarknetState } from "../../DarkNet/models/DarknetState";
import { WEBSTORM } from "../../DarkNet/effects/webstorm";
import { OptionSwitch } from "../../ui/React/OptionSwitch";
import { Router } from "../../ui/GameRoot";
import { SimplePage } from "@enums";

export function DarknetDev(): React.ReactElement {
  const toggleShowFullNetwork = (newValue: boolean): void => {
    DarknetState.showFullNetwork = newValue;
    DarknetEvents.emit();
  };

  return (
    <Accordion TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Darknet</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <OptionSwitch
          checked={DarknetState.showFullNetwork}
          onChange={(newValue) => toggleShowFullNetwork(newValue)}
          text="Show Full Network"
          tooltip={<>If this is set, the full depth of the dark network will be displayed.</>}
        />
        <Tooltip title={<Typography>Create a new darkweb network.</Typography>}>
          <Button
            onClick={() => {
              clearDarknet(true);
              populateDarknet();
              Router.toPage(SimplePage.DarkNet);
            }}
          >
            Generate New Dark Network
          </Button>
        </Tooltip>
        <br />
        <br />
        <Tooltip
          title={
            <Typography>
              Start a violent "webstorm," which will wipe out much of the dark net and replace it.
            </Typography>
          }
        >
          <Button
            onClick={() => {
              void WEBSTORM();
              Router.toPage(SimplePage.DarkNet);
            }}
          >
            START WEBSTORM
          </Button>
        </Tooltip>
      </AccordionDetails>
    </Accordion>
  );
}
