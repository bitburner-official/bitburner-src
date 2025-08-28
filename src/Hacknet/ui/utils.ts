import { PlayerObject } from "src/PersonObjects/Player/PlayerObject";
import { HacknetServer } from "../HacknetServer";
import { HacknetNode } from "../HacknetNode";
import { GetServer } from "../../Server/AllServers";

export function safeGetHacknetServer(p: PlayerObject, index: number): HacknetServer | undefined {
  const node = p.hacknetNodes[index];
  if (node instanceof HacknetNode) return undefined;
  const hserver = GetServer(node);
  if (hserver == null) return undefined;
  if (!(hserver instanceof HacknetServer)) return undefined;
  return hserver;
}

export function safeGetHacknetNode(p: PlayerObject, index: number): HacknetNode | undefined {
  const node = p.hacknetNodes[index];
  if (!(node instanceof HacknetNode)) return undefined;
  return node;
}
