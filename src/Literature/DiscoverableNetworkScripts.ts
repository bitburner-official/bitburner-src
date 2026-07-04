import { ScriptFilePath } from "../Paths/ScriptFilePath";
import guessingGameContent from "./DiscoverableScriptContents/guessing_game.wip.js?raw";
import upgradeCloudServerContent from "./DiscoverableScriptContents/upgrade_cloud_server.wip.ts?raw";
import portSenderContent from "./DiscoverableScriptContents/port_sender.wip.js?raw";
import portReceiverContent from "./DiscoverableScriptContents/port_receiver.wip.js?raw";
import serverFinderContent from "./DiscoverableScriptContents/server_finder.wip.js?raw";
import customLogScriptContent from "./DiscoverableScriptContents/escaping_your_chains.wip.jsx?raw";
import customContentScriptContent from "./DiscoverableScriptContents/build_new_worlds.wip.jsx?raw";
import batcherContent from "./DiscoverableScriptContents/batch_hack.wip.js?raw";
import hackChildScriptContent from "./DiscoverableScriptContents/hack.wip.js?raw";

export const DiscoverableScriptNames = {
  guessingGame: "guessing_game.wip.js",
  cloudServerUpgrades: "upgrade_cloud_server.wip.ts",
  portSender: "port_sender.wip.js",
  portReceiver: "port_receiver.wip.js",
  serverFinder: "server_finder.wip.js",
  customLogScript: "escaping_your_chains.wip.jsx",
  customContentScript: "build_new_worlds.wip.jsx",
  batcher: "batch_hack.wip.js",
  hackChildScript: "hack.wip.js",
} as const;

export type DiscoverableScriptNamesType = (typeof DiscoverableScriptNames)[keyof typeof DiscoverableScriptNames];
export type DiscoverableScript = { filename: DiscoverableScriptNamesType; content: string };

export const discoverableNetworkScripts: Record<DiscoverableScriptNamesType, DiscoverableScript> = {
  [DiscoverableScriptNames.guessingGame]: {
    filename: DiscoverableScriptNames.guessingGame,
    content: guessingGameContent,
  },
  [DiscoverableScriptNames.cloudServerUpgrades]: {
    filename: DiscoverableScriptNames.cloudServerUpgrades,
    content: upgradeCloudServerContent,
  },
  [DiscoverableScriptNames.portSender]: {
    filename: DiscoverableScriptNames.portSender,
    content: portSenderContent,
  },
  [DiscoverableScriptNames.portReceiver]: {
    filename: DiscoverableScriptNames.portReceiver,
    content: portReceiverContent,
  },
  [DiscoverableScriptNames.serverFinder]: {
    filename: DiscoverableScriptNames.serverFinder,
    content: serverFinderContent,
  },
  [DiscoverableScriptNames.customLogScript]: {
    filename: DiscoverableScriptNames.customLogScript,
    content: customLogScriptContent,
  },
  [DiscoverableScriptNames.customContentScript]: {
    filename: DiscoverableScriptNames.customContentScript,
    content: customContentScriptContent,
  },
  [DiscoverableScriptNames.batcher]: {
    filename: DiscoverableScriptNames.batcher,
    content: batcherContent,
  },
  [DiscoverableScriptNames.hackChildScript]: {
    filename: DiscoverableScriptNames.hackChildScript,
    content: hackChildScriptContent,
  },
};
