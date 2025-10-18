import React from "react";

import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Button from "@mui/material/Button";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { clearDarknet, populateDarknet } from "../../DarkNet/controllers/NetworkGenerator";
import { DarknetEvents, DarknetState } from "../../DarkNet/models/DarknetState";
import { launchWebstorm } from "../../DarkNet/effects/webstorm";
import { OptionSwitch } from "../../ui/React/OptionSwitch";
import { Router } from "../../ui/GameRoot";
import { CompletedProgramName, SimplePage, ToastVariant } from "@enums";
import { getDarkscapeNavigator, handleSuccessfulAuth } from "../../DarkNet/effects/effects";
import { isLabyrinthServer } from "../../DarkNet/effects/labyrinth";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { AutoExpandAccordion } from "../../ui/AutoExpand/AutoExpandAccordion";
import { getAllMovableDarknetServers } from "../../DarkNet/utils/darknetNetworkUtils";

export function DarknetDev(): React.ReactElement {
  const toggleShowFullNetwork = (newValue: boolean): void => {
    DarknetState.showFullNetwork = newValue;
    DarknetEvents.emit();
  };

  return (
    <AutoExpandAccordion cacheKey="DEVMENU_DarknetDev" unmountOnExit={true}>
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
        <Tooltip title={<Typography>Gain access to the darkweb network.</Typography>}>
          <Button
            onClick={() => {
              getDarkscapeNavigator();
            }}
          >
            Get {CompletedProgramName.darkscape}
          </Button>
        </Tooltip>
        <br />
        <br />
        <Tooltip title={<Typography>Create a new darkweb network.</Typography>}>
          <Button
            onClick={() => {
              clearDarknet(true);
              populateDarknet();
              SnackbarEvents.emit("New dark network generated", ToastVariant.SUCCESS, 2000);
            }}
          >
            Generate New Dark Network
          </Button>
        </Tooltip>
        <br />
        <br />
        <Tooltip title={<Typography>Root all standard darknet servers.</Typography>}>
          <Button
            onClick={() => {
              getAllMovableDarknetServers().forEach((server) => {
                if (!isLabyrinthServer(server.hostname)) {
                  handleSuccessfulAuth(server, 1);
                }
              });
              SnackbarEvents.emit("Gained darknet server admin rights", ToastVariant.SUCCESS, 2000);
            }}
          >
            Gain admin access to all darknet servers
          </Button>
        </Tooltip>
        <br />
        <br />
        <Tooltip title={<Typography>Root all darknet labyrinth servers.</Typography>}>
          <Button
            onClick={() => {
              getAllMovableDarknetServers().forEach((server) => {
                if (isLabyrinthServer(server.hostname)) {
                  server.hasAdminRights = true;
                }
              });
              SnackbarEvents.emit("Gained lab admin rights", ToastVariant.SUCCESS, 2000);
            }}
          >
            Gain admin access to labyrinth server
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
              void launchWebstorm();
              Router.toPage(SimplePage.DarkNet);
            }}
          >
            START WEBSTORM
          </Button>
        </Tooltip>
      </AccordionDetails>
    </AutoExpandAccordion>
  );
}
