// This file is just for providing the ability to not load an invalid work.
import type { PlayerObject } from "../PersonObjects/Player/PlayerObject";
import type { Sleeve } from "../PersonObjects/Sleeve/Sleeve";
import type { SleeveWork } from "../PersonObjects/Sleeve/Work/Work";
import type { Work } from "./Work";

// Type verifications to validate that Player.currentWork and sleeve.currentWork are allowed to be null.
const __canPlayerWorkBeNull: null extends PlayerObject["currentWork"] ? true : false = true;
const __canSleeveWorkBeNull: null extends Sleeve["currentWork"] ? true : false = true;

export function invalidWork<W extends Work | SleeveWork>(): W {
  return null as unknown as W;
}
