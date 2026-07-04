import guessingGameContent from "./DiscoverableScriptContents/guessing_game.wip.js?raw";
import upgradeCloudServerContent from "./DiscoverableScriptContents/upgrade_cloud_server.wip.ts?raw";
import portSenderContent from "./DiscoverableScriptContents/port_sender.wip.js?raw";
import portReceiverContent from "./DiscoverableScriptContents/port_receiver.wip.js?raw";
import serverFinderContent from "./DiscoverableScriptContents/server_finder.wip.js?raw";
import customLogScriptContent from "./DiscoverableScriptContents/escaping_your_chains.wip.jsx?raw";
import customContentScriptContent from "./DiscoverableScriptContents/build_new_worlds.wip.jsx?raw";
import hackControllerContent from "./DiscoverableScriptContents/hack_controller.wip.js?raw";
import hackChildScriptContent from "./DiscoverableScriptContents/hack.wip.js?raw";
import { DiscoverableScriptName } from "@enums";

export type DiscoverableScript = { filename: DiscoverableScriptName; content: string };

export const discoverableNetworkScripts: Record<DiscoverableScriptName, DiscoverableScript> = {
  [DiscoverableScriptName.guessingGame]: {
    filename: DiscoverableScriptName.guessingGame,
    content: guessingGameContent,
  },
  [DiscoverableScriptName.cloudServerUpgrades]: {
    filename: DiscoverableScriptName.cloudServerUpgrades,
    content: upgradeCloudServerContent,
  },
  [DiscoverableScriptName.portSender]: {
    filename: DiscoverableScriptName.portSender,
    content: portSenderContent,
  },
  [DiscoverableScriptName.portReceiver]: {
    filename: DiscoverableScriptName.portReceiver,
    content: portReceiverContent,
  },
  [DiscoverableScriptName.serverFinder]: {
    filename: DiscoverableScriptName.serverFinder,
    content: serverFinderContent,
  },
  [DiscoverableScriptName.customLogScript]: {
    filename: DiscoverableScriptName.customLogScript,
    content: customLogScriptContent,
  },
  [DiscoverableScriptName.customContentScript]: {
    filename: DiscoverableScriptName.customContentScript,
    content: customContentScriptContent,
  },
  [DiscoverableScriptName.hackController]: {
    filename: DiscoverableScriptName.hackController,
    content: hackControllerContent,
  },
  [DiscoverableScriptName.hackChildScript]: {
    filename: DiscoverableScriptName.hackChildScript,
    content: hackChildScriptContent,
  },
};
