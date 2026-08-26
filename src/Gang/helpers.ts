import { Result } from "@nsdefs";
import { Player } from "@player";
import { FactionName } from "../Enums";
import { GangConstants } from "./data/Constants";

export function canCreateGang(faction: FactionName): Result {
  if (Player.gang) {
    return { success: false, message: "你已经拥有一个帮派了。" };
  }
  const checkResult = Player.canAccessGang();
  if (!checkResult.success) {
    return { success: false, message: checkResult.message };
  }
  if (!GangConstants.Names.includes(faction)) {
    return {
      success: false,
      message: `${faction} 不允许创建帮派。你只能通过以下派系来创建帮派：${GangConstants.Names.join(
        ", ",
      )}。`,
    };
  }
  if (!Player.factions.includes(faction)) {
    return { success: false, message: `你不是 ${faction} 的成员。` };
  }
  return { success: true };
}
