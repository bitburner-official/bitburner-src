import { sanitizeExploits } from "./Exploits/Exploit";

import { Reviver } from "./utils/JSONReviver";

import type { PlayerObject } from "./PersonObjects/Player/PlayerObject";

export let Player: PlayerObject;

export function setPlayer(playerObj: PlayerObject): void {
  Player = playerObj;
}

export function loadPlayer(saveString: string): void {
  Player = JSON.parse(saveString, Reviver);
  Player.money = parseFloat(Player.money + "");
  Player.exploits = sanitizeExploits(Player.exploits);
}
