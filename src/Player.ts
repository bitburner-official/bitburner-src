import { sanitizeExploits } from "./Exploits/Exploit";

import { Reviver } from "./utils/GenericReviver";

import type { PlayerObject } from "./PersonObjects/Player/PlayerObject";

export let Player: PlayerObject;

export function setPlayer(playerObj: PlayerObject): void {
  Player = playerObj;
}

export function loadPlayer(saveString: string): PlayerObject {
  /**
   * If we want to check player with "instanceof PlayerObject", we have to import PlayerObject normally (not "import
   * type"). It will create a cyclic dependency. Fixing this cyclic dependency is really hard. It's not worth the
   * effort, so we typecast it here.
   */
  const player = JSON.parse(saveString, Reviver) as PlayerObject;
  player.money = parseFloat(player.money + "");
  player.exploits = sanitizeExploits(player.exploits);
  return player;
}
