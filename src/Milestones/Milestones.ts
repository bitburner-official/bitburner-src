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
    title: () => "获得 CSEC 的 root 权限",
    fulfilled: (): boolean => {
      const server = GetServer("CSEC");
      if (!server || !Object.hasOwn(server, "hasAdminRights")) return false;
      return server instanceof Server && server.hasAdminRights;
    },
  },
  {
    title: () => "在 CSEC 上安插后门",
    fulfilled: (): boolean => {
      const server = GetServer("CSEC");
      if (!server || !Object.hasOwn(server, "backdoorInstalled")) return false;
      return server instanceof Server && server.backdoorInstalled;
    },
  },
  {
    title: () => "加入 csec-test.msg 中暗示的派系",
    fulfilled: (): boolean => {
      return Player.factions.includes(FactionName.CyberSec);
    },
  },
  {
    title: () => `安装 ${FactionName.CyberSec} 的所有强化`,
    fulfilled: (): boolean => {
      return allFactionAugs(Factions[FactionName.CyberSec]);
    },
  },
  {
    title: () => "加入 nitesec-test.msg 中暗示的派系",
    fulfilled: (): boolean => {
      return Player.factions.includes(FactionName.NiteSec);
    },
  },
  {
    title: () => `安装 ${FactionName.NiteSec} 的所有强化`,
    fulfilled: (): boolean => {
      return allFactionAugs(Factions[FactionName.NiteSec]);
    },
  },
  {
    title: () => "加入 j3.msg 中暗示的派系",
    fulfilled: (): boolean => {
      return Player.factions.includes(FactionName.TheBlackHand);
    },
  },
  {
    title: () => `安装 ${FactionName.TheBlackHand} 的所有强化`,
    fulfilled: (): boolean => {
      return allFactionAugs(Factions[FactionName.TheBlackHand]);
    },
  },
  {
    title: () => "加入 19dfj3l1nd.msg 中暗示的派系",
    fulfilled: (): boolean => {
      return Player.factions.includes(FactionName.BitRunners);
    },
  },
  {
    title: () => `安装 ${FactionName.BitRunners} 的所有强化`,
    fulfilled: (): boolean => {
      return allFactionAugs(Factions[FactionName.BitRunners]);
    },
  },
  {
    title: () => "完成 fl1ght.exe",
    fulfilled: (): boolean => {
      // technically wrong but whatever
      return Player.factions.includes(FactionName.Daedalus);
    },
  },
  {
    title: () =>
      Player.bitNodeN === 15
        ? `在暗网中的某处找到 The Red Pill`
        : `安装 ${FactionName.Daedalus} 的特殊强化`,
    fulfilled: (): boolean => {
      return Player.augmentations.some((aug) => aug.name == "The Red Pill");
    },
  },
  {
    title: () => "安装最终的后门，解放你自己。",
    fulfilled: (): boolean => {
      return false;
    },
  },
];
