import { Milestone } from "./Milestone";
import { Player } from "@player";
import { Factions } from "../Faction/Factions";
import { Faction } from "../Faction/Faction";
import { GetServer } from "../Server/AllServers";
import { AugmentationName, FactionName } from "@enums";
import { Server } from "../Server/Server";

function allFactionAugs(faction: Faction): boolean {
  for (const factionAugName of faction.augmentations) {
    if (factionAugName === AugmentationName.NeuroFluxGovernor) continue;
    if (
      !Player.augmentations.some((aug) => {
        return aug.name == factionAugName;
      })
    )
      return false;
  }
  return true;
}

export const Milestones: Milestone[] = [
  {
    title: "Gain root access on CSEC",
    fulfilled: (): boolean => {
      const server = GetServer("CSEC");
      if (!server || !Object.hasOwn(server, "hasAdminRights")) return false;
      return server instanceof Server && server.hasAdminRights;
    },
  },
  {
    title: "Install the backdoor on CSEC",
    fulfilled: (): boolean => {
      const server = GetServer("CSEC");
      if (!server || !Object.hasOwn(server, "backdoorInstalled")) return false;
      return server instanceof Server && server.backdoorInstalled;
    },
  },
  {
    title: "Join the faction hinted at in csec-test.msg",
    fulfilled: (): boolean => {
      return Player.factions.includes(FactionName.CyberSec);
    },
  },
  {
    title: `Install all the Augmentations from ${FactionName.CyberSec}`,
    fulfilled: (): boolean => {
      return allFactionAugs(Factions[FactionName.CyberSec]);
    },
  },
  {
    title: "Join the faction hinted at in nitesec-test.msg",
    fulfilled: (): boolean => {
      return Player.factions.includes(FactionName.NiteSec);
    },
  },
  {
    title: `Install all the Augmentations from ${FactionName.NiteSec}`,
    fulfilled: (): boolean => {
      return allFactionAugs(Factions[FactionName.NiteSec]);
    },
  },
  {
    title: "Join the faction hinted at in j3.msg",
    fulfilled: (): boolean => {
      return Player.factions.includes(FactionName.TheBlackHand);
    },
  },
  {
    title: `Install all the Augmentations from ${FactionName.TheBlackHand}`,
    fulfilled: (): boolean => {
      return allFactionAugs(Factions[FactionName.TheBlackHand]);
    },
  },
  {
    title: "Join the faction hinted at in 19dfj3l1nd.msg",
    fulfilled: (): boolean => {
      return Player.factions.includes(FactionName.BitRunners);
    },
  },
  {
    title: `Install all the Augmentations from ${FactionName.BitRunners}`,
    fulfilled: (): boolean => {
      return allFactionAugs(Factions[FactionName.BitRunners]);
    },
  },
  {
    title: "Complete fl1ght.exe",
    fulfilled: (): boolean => {
      // technically wrong but whatever
      return Player.factions.includes(FactionName.Daedalus);
    },
  },
  {
    title: `Install the special Augmentation from ${FactionName.Daedalus}`,
    fulfilled: (): boolean => {
      return Player.augmentations.some((aug) => aug.name == "The Red Pill");
    },
  },
  {
    title: "Install the final backdoor and free yourself.",
    fulfilled: (): boolean => {
      return false;
    },
  },
];
