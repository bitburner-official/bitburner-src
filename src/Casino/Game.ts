import { Player } from "@player";
import { dialogBoxCreate } from "../ui/React/DialogBox";

const gainLimit = 10e9;

export function win(n: number): void {
  Player.gainMoney(n, "casino");
}

export function reachedLimit(): boolean {
  const reached = Player.getCasinoWinnings() > gainLimit;
  const closed = Player.bitNodeN === 15;
  if (reached) {
    dialogBoxCreate("Alright cheater get out of here. You're not allowed here anymore.");
  } else if (closed) {
    dialogBoxCreate("I'm sorry, we are closed for rennovations.");
  }
  return reached || closed;
}
