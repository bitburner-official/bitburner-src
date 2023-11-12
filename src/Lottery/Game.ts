import { Player } from "@player";
import { dialogBoxCreate } from "../ui/React/DialogBox";

const gainLimit = 10e9;

export function win(n: number): void {
  Player.gainMoney(n, "lottery");
}

export function reachedLimit(): boolean {
  const reached = Player.getLotteryWinnings() > gainLimit;
  if (reached) {
    dialogBoxCreate("Alright cheater get out of here. You're not allowed here anymore.");
  }
  return reached;
}
