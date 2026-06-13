import { Result } from "@nsdefs";
import { Player } from "@player";
import { FactionName } from "../Enums";
import { GangConstants } from "./data/Constants";

export function canCreateGang(faction: FactionName): Result {
  if (Player.gang) {
    return { success: false, message: "You already have a gang." };
  }
  const checkResult = Player.canAccessGang();
  if (!checkResult.success) {
    return { success: false, message: checkResult.message };
  }
  if (!GangConstants.Names.includes(faction)) {
    return {
      success: false,
      message: `${faction} does not allow creating a gang. You can only do that with ${GangConstants.Names.join(
        ", ",
      )}.`,
    };
  }
  if (!Player.factions.includes(faction)) {
    return { success: false, message: `You are not a member of ${faction}.` };
  }
  return { success: true };
}
