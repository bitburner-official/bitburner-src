import { DarknetEvents, DarknetState } from "../models/DarknetState";
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
import { sleep } from "../../utils/Utility";
import { getAllMovableDarknetServers } from "../utils/darknetNetworkUtils";

const validateDarknetNetworkAndEmitDarknetEvent = (): void => {
  validateDarknetNetwork();
  DarknetEvents.emit();
};

export const launchWebstorm = async (suppressToast = false) => {
  DarknetState.allowMutating = false;
  if (!suppressToast) {
    SnackbarEvents.emit(`DARKNET WEBSTORM APPROACHING`, ToastVariant.ERROR, 5000);
  }
  await sleep(5000);

  const serversToDelete = getAllMovableDarknetServers().length * 0.6 + (Math.random() * getNetDepth() - 6);
  deleteRandomDarknetServers(serversToDelete);
  moveRandomDarknetServers((getAllMovableDarknetServers().length - serversToDelete) * 0.6);
  restartAllDarknetServers();
  validateDarknetNetworkAndEmitDarknetEvent();

  await sleep(4000);
  addRandomDarknetServers(NET_WIDTH);
  validateDarknetNetworkAndEmitDarknetEvent();

  await sleep(4000);
  addRandomDarknetServers(NET_WIDTH * 2);
  validateDarknetNetworkAndEmitDarknetEvent();

  await sleep(4000);
  addRandomDarknetServers(NET_WIDTH * 2);
  validateDarknetNetworkAndEmitDarknetEvent();

  await sleep(8000);
  balanceDarknetServers();
  validateDarknetNetworkAndEmitDarknetEvent();

  await sleep(5000);
  DarknetState.allowMutating = true;
};

export const handleStormSeed = (server: BaseServer) => {
  server.programs = server.programs.filter((p) => p !== CompletedProgramName.stormSeed);
  DarknetState.lastStormTime = new Date();
  launchWebstorm().catch((error) => console.error(error));
};
