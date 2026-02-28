import { DarknetEvents, DarknetState, triggerNextUpdate } from "../models/DarknetState";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { CompletedProgramName, ToastVariant } from "@enums";
import {
  addRandomDarknetServers,
  balanceDarknetServers,
  deleteRandomDarknetServers,
  moveRandomDarknetServers,
  restartAllDarknetServers,
  validateDarknetNetwork,
} from "../controllers/NetworkMovement";
import { BaseServer } from "../../Server/BaseServer";
import { getNetDepth } from "./labyrinth";
import { NET_WIDTH } from "../Enums";
import { getAllMovableDarknetServers } from "../utils/darknetNetworkUtils";
import { exceptionAlert } from "../../utils/helpers/exceptionAlert";

const validateDarknetNetworkAndEmitDarknetEvent = (): void => {
  validateDarknetNetwork();
  DarknetEvents.emit();
};

export const isInWebstorm = () => {
  return DarknetState.webStormStage > 0;
};

export const processWebstorm = () => {
  if (Date.now() < DarknetState.nextWebStormStageStartTimestamp) {
    return;
  }
  switch (DarknetState.webStormStage) {
    case 1:
      DarknetState.nextWebStormStageStartTimestamp += 5000;
      break;
    case 2:
      {
        const serversToDelete = getAllMovableDarknetServers().length * 0.6 + (Math.random() * getNetDepth() - 6);
        deleteRandomDarknetServers(serversToDelete);
        moveRandomDarknetServers((getAllMovableDarknetServers().length - serversToDelete) * 0.6);
        restartAllDarknetServers();
        DarknetState.nextWebStormStageStartTimestamp += 4000;
      }
      break;
    case 3:
      addRandomDarknetServers(NET_WIDTH);
      DarknetState.nextWebStormStageStartTimestamp += 4000;
      break;
    case 4:
      addRandomDarknetServers(NET_WIDTH * 2);
      DarknetState.nextWebStormStageStartTimestamp += 4000;
      break;
    case 5:
      addRandomDarknetServers(NET_WIDTH * 2);
      DarknetState.nextWebStormStageStartTimestamp += 8000;
      break;
    case 6:
      balanceDarknetServers();
      DarknetState.nextWebStormStageStartTimestamp += 5000;
      break;
    default:
      exceptionAlert(
        new Error(
          `Invalid webstorm state. DarknetState.webStormPhase: ${DarknetState.webStormStage}. ` +
            `DarknetState.nextWebStormPhaseStartTimestamp: ${DarknetState.nextWebStormStageStartTimestamp}`,
        ),
      );
      break;
  }
  validateDarknetNetworkAndEmitDarknetEvent();
  triggerNextUpdate();
  ++DarknetState.webStormStage;
  if (DarknetState.webStormStage > 6) {
    resetWebstorm();
  }
};

export const resetWebstorm = () => {
  DarknetState.webStormStage = 0;
  DarknetState.nextWebStormStageStartTimestamp = 0;
};

export const launchWebstorm = (start = Date.now() + 5000, suppressToast = false) => {
  DarknetState.webStormStage = 1;
  DarknetState.nextWebStormStageStartTimestamp = start;
  if (!suppressToast) {
    SnackbarEvents.emit(`DARKNET WEBSTORM APPROACHING`, ToastVariant.ERROR, 5000);
  }
};

export const handleStormSeed = (server: BaseServer) => {
  server.programs = server.programs.filter((p) => p !== CompletedProgramName.stormSeed);
  DarknetState.lastStormTime = new Date();
  launchWebstorm();
};
