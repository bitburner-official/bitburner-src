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
import { sleep } from "../../utils/Utility";
import { getAllMovableDarknetServers } from "../utils/darknetNetworkUtils";

const validateDarknetNetworkAndEmitDarknetEvent = (): void => {
  validateDarknetNetwork();
  DarknetEvents.emit();
};

const cancelled = Symbol("cancelled");

export const launchWebstorm = async (suppressToast = false) => {
  if (DarknetState.mutationLock) {
    return;
  }
  try {
    const cancelPromise = new Promise((res, rej) => {
      DarknetState.mutationLock = () => {
        rej(cancelled);
        DarknetState.mutationLock = null;
      };
    });
    const cancellableSleep = (ms: number) => Promise.race([sleep(ms), cancelPromise]);

    if (!suppressToast) {
      SnackbarEvents.emit(`DARKNET WEBSTORM APPROACHING`, ToastVariant.ERROR, 5000);
    }
    await cancellableSleep(5000);

    const serversToDelete = getAllMovableDarknetServers().length * 0.6 + (Math.random() * getNetDepth() - 6);
    deleteRandomDarknetServers(serversToDelete);
    moveRandomDarknetServers((getAllMovableDarknetServers().length - serversToDelete) * 0.6);
    restartAllDarknetServers();
    validateDarknetNetworkAndEmitDarknetEvent();
    triggerNextUpdate();

    await cancellableSleep(4000);
    addRandomDarknetServers(NET_WIDTH);
    validateDarknetNetworkAndEmitDarknetEvent();
    triggerNextUpdate();

    await cancellableSleep(4000);
    addRandomDarknetServers(NET_WIDTH * 2);
    validateDarknetNetworkAndEmitDarknetEvent();
    triggerNextUpdate();

    await cancellableSleep(4000);
    addRandomDarknetServers(NET_WIDTH * 2);
    validateDarknetNetworkAndEmitDarknetEvent();
    triggerNextUpdate();

    await cancellableSleep(8000);
    balanceDarknetServers();
    validateDarknetNetworkAndEmitDarknetEvent();
    triggerNextUpdate();

    await cancellableSleep(5000);
  } catch (ex) {
    if (ex !== cancelled) throw ex;
  } finally {
    // Maybe a future TypeScript will remove the need for this...
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const dumb = DarknetState.mutationLock!;
    dumb?.();
  }
};

export const handleStormSeed = (server: BaseServer) => {
  server.programs = server.programs.filter((p) => p !== CompletedProgramName.stormSeed);
  DarknetState.lastStormTime = new Date();
  launchWebstorm().catch((error) => console.error(error));
};
