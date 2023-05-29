import { sanitizeExploits } from "./Exploits/Exploit";
import type { PlayerObject } from "./PersonObjects/Player/PlayerObject";
import { Reviver } from "./utils/JSONReviver";

export let Player: PlayerObject;

export function setPlayer(playerObj: PlayerObject): void {
  Player = playerObj;
}

export function loadPlayer(saveString: string): PlayerObject {
  const player = JSON.parse(saveString, Reviver);
  player.money = parseFloat(player.money + "");
  player.exploits = sanitizeExploits(player.exploits);
  return player;
}
