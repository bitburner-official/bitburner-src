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
    dialogBoxCreate("Alright cheater get out of here. You're not allowed here anymore.");
  }
  return reached;
}

export function hasEnoughMoney(bet: number): boolean {
  const result = Player.canAfford(bet);
  if (!result) {
    dialogBoxCreate("You do not have enough money.");
  }
  return result;
}
