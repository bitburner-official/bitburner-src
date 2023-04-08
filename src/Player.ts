import { sanitizeExploits } from "./Exploits/Exploit";

import { Reviver, JSONMap } from "./utils/JSONReviver";

import type { PlayerObject } from "./PersonObjects/Player/PlayerObject";

export let Player: PlayerObject;

export function setPlayer(playerObj: PlayerObject): void {
  Player = playerObj;
}

export function loadPlayer(saveString: string): PlayerObject {
  const player = JSON.parse(saveString, Reviver);
  player.money = parseFloat(player.money + "");
  player.exploits = sanitizeExploits(player.exploits);
  if (!(player.sourceFiles instanceof Map)) {
    if (!((player.sourceFiles as unknown) instanceof Array)) {
      console.error("Bad sourceFiles encoding, resetting! This is probably a bug.");
      player.sourceFiles = new JSONMap();
    } else {
      // Convert from old version
      type PlayerOwnedSourceFile = { n: number; lvl: number };
      const oldData = player.sourceFiles as unknown as PlayerOwnedSourceFile[];
      player.sourceFiles = new JSONMap(oldData.map(({ n, lvl }) => [n, lvl]));
    }
  }
  return player;
}
