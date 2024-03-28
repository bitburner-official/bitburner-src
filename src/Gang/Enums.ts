import { Settings } from "../Settings/Settings";

export enum GangMemberType {
  Hacker = "Hacker",
  Enforcer = "Enforcer",
}

export const gangMemberTypeColor = {
  [GangMemberType.Enforcer]: Settings.theme.combat,
  [GangMemberType.Hacker]: Settings.theme.hack,
};
