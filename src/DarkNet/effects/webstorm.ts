import { DarknetState } from "../models/DarknetState";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { CompletedProgramName, ToastVariant } from "@enums";
import {
  addRandomDarknetServers,
  balanceDarknetServers,
  deleteRandomDarknetServers,
  moveRandomDarknetServers,
  restartAllDarknetServers,
} from "../controllers/NetworkMovement";
import { BaseServer } from "../../Server/BaseServer";
import { getNetDepth } from "./labyrinth";
import { NET_WIDTH } from "../Enums";
import { sleep } from "../../utils/Utility";
import { getAllMobileDarknetServers } from "../utils/darknetNetworkUtils";

export const launchWebstorm = async (suppressToast = false) => {
  DarknetState.isMutating = false;
  if (!suppressToast) {
    SnackbarEvents.emit(`DARKNET WEBSTORM APPROACHING`, ToastVariant.ERROR, 5000);
  }
  await sleep(5000);

  const serversToDelete = getAllMobileDarknetServers().length * 0.6 + (Math.random() * getNetDepth() - 6);
  deleteRandomDarknetServers(serversToDelete);
  moveRandomDarknetServers((getAllMobileDarknetServers().length - serversToDelete) * 0.6);
  restartAllDarknetServers();

  await sleep(4000);
  addRandomDarknetServers(NET_WIDTH);
  await sleep(4000);
  addRandomDarknetServers(NET_WIDTH * 2);
  await sleep(4000);
  addRandomDarknetServers(NET_WIDTH * 2);
  await sleep(8000);
  balanceDarknetServers();
  await sleep(5000);
  DarknetState.isMutating = true;
};

// TODO: launch this if the player has been offline for long enough?
export const applyOfflineWebstorm = () => {
  const serversToDelete = getAllMobileDarknetServers().length * 0.5 + (Math.random() * getNetDepth() - 4);
  deleteRandomDarknetServers(serversToDelete);
  restartAllDarknetServers();

  balanceDarknetServers();
};

export const handleStormSeed = (server: BaseServer) => {
  server.programs = server.programs.filter((p) => p !== CompletedProgramName.stormSeed);
  DarknetState.lastStormTime = new Date();
  void launchWebstorm();
};
