import guessingGameContent from "./DiscoverableScriptContent/guessing_game.wip.js?raw";
import upgradeCloudServerContent from "./DiscoverableScriptContent/upgrade_cloud_server.wip.ts?raw";
import portSenderContent from "./DiscoverableScriptContent/port_sender.wip.js?raw";
import portReceiverContent from "./DiscoverableScriptContent/port_receiver.wip.js?raw";
import serverFinderContent from "./DiscoverableScriptContent/server_finder.wip.js?raw";
import customLogScriptContent from "./DiscoverableScriptContent/escaping_your_chains.wip.jsx?raw";
import customContentScriptContent from "./DiscoverableScriptContent/build_new_worlds.wip.jsx?raw";
import hackControllerContent from "./DiscoverableScriptContent/hack_controller.wip.js?raw";
import hackChildScriptContent from "./DiscoverableScriptContent/hack.wip.js?raw";
import { DiscoverableScriptName, type DiscoverableScriptNameType } from "@enums";

export type DiscoverableScript = { filename: DiscoverableScriptNameType; content: string };

export const discoverableNetworkScripts: Record<DiscoverableScriptNameType, DiscoverableScript> = {
  [DiscoverableScriptName.GuessingGame]: {
    filename: DiscoverableScriptName.GuessingGame,
    content: guessingGameContent,
  },
  [DiscoverableScriptName.CloudServerUpgrades]: {
    filename: DiscoverableScriptName.CloudServerUpgrades,
    content: upgradeCloudServerContent,
  },
  [DiscoverableScriptName.PortSender]: {
    filename: DiscoverableScriptName.PortSender,
    content: portSenderContent,
  },
  [DiscoverableScriptName.PortReceiver]: {
    filename: DiscoverableScriptName.PortReceiver,
    content: portReceiverContent,
  },
  [DiscoverableScriptName.ServerFinder]: {
    filename: DiscoverableScriptName.ServerFinder,
    content: serverFinderContent,
  },
  [DiscoverableScriptName.CustomLogScript]: {
    filename: DiscoverableScriptName.CustomLogScript,
    content: customLogScriptContent,
  },
  [DiscoverableScriptName.CustomContentScript]: {
    filename: DiscoverableScriptName.CustomContentScript,
    content: customContentScriptContent,
  },
  [DiscoverableScriptName.HackController]: {
    filename: DiscoverableScriptName.HackController,
    content: hackControllerContent,
  },
  [DiscoverableScriptName.HackChildScript]: {
    filename: DiscoverableScriptName.HackChildScript,
    content: hackChildScriptContent,
  },
};
