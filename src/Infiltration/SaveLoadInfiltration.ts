import { cleanRecentInfiltrations, InfiltrationState, maxEffectTime } from "./formulas/game";
import { Player } from "@player";

export function getRecentInfiltrationsCount(): number {
  cleanRecentInfiltrations();
  return InfiltrationState.successfulInfiltrationTimestamps.length;
}

export function loadRecentInfiltrations(countString: string): void {
  const count = countString ? +countString || 0 : 0;
  const offlineMS = Date.now() - Player.lastUpdate;

  const percentOfMaxOffline = Math.max(maxEffectTime - offlineMS, 0) / maxEffectTime;

  // Remove a fraction of saved recent infiltrations based on how long it has been since the player was offline.
  const remainingInfils = Math.ceil(percentOfMaxOffline * count);
  InfiltrationState.successfulInfiltrationTimestamps = [];

  // Evenly spread out the remaining recent infiltrations over the last maxEffectTime.
  for (let i = 0; i < remainingInfils; i++) {
    InfiltrationState.successfulInfiltrationTimestamps.push(new Date(Date.now() - ((maxEffectTime * 0.8) / count) * i));
  }
}
