import { Player } from "@player";
import { dialogBoxCreate } from "../ui/React/DialogBox";

const gainLimit = 10e9;

export function win(n: number): void {
  if (reachedLimit()) {
    return;
  }
  Player.gainMoney(n, "casino");
}

export function reachedLimit(): boolean {
  const reached = Player.getCasinoWinnings() > gainLimit;
  if (reached) {
    dialogBoxCreate("好吧，作弊者，请离开。你已经不被允许进入这里了。");
  }
  return reached;
}

export function hasEnoughMoney(bet: number): boolean {
  const result = Player.canAfford(bet);
  if (!result) {
    dialogBoxCreate("你的资金不足。");
  }
  return result;
}
