import { Player } from "@player";
import { TicketRecord, GameType, GameOptions } from "./LotteryStoreLocationInside";
import { LotteryConstants } from "./data/LotteryConstants";
import { getRandomInt } from "../utils/helpers/getRandomInt";

export function buyRandomTicket(): void {
  if (Player.lotteryTickets.length >= LotteryConstants.MaxTickets) {
    return;
  }

  const wager = LotteryConstants.MaxPlay;

  //We have a valid wager.

  let gtype = GameType.None;
  let rnd = getRandomInt(1, 5);

  switch (rnd) {
    case 1:
      gtype = GameType.Pick2;
      break;
    case 2:
      gtype = GameType.Pick3;
      break;
    case 3:
      gtype = GameType.Pick4;
      break;
    case 4:
      gtype = GameType.Keno;
      break;
    case 5:
      gtype = GameType.L649;
      break;
  }

  // Type aquired.  Need options.
  let opt = GameOptions.None;
  rnd = getRandomInt(1, 3);

  switch (gtype) {
    case GameType.Pick2:
      opt = GameOptions.Straight;
      break;
    case GameType.Pick3:
      opt = rnd === 1 ? GameOptions.Straight : rnd === 2 ? GameOptions.Box : GameOptions.StraightBox;
      break;
    case GameType.Pick4:
      opt = getRandomInt(1, 2) === 1 ? GameOptions.Straight : (opt = GameOptions.Box);
      break;
    case GameType.Keno:
    case GameType.L649:
      opt = GameOptions.None;
      break;
  }

  // Need numbers.
  const numbers: number[] = [];

  switch (gtype) {
    case GameType.Pick2:
      numbers.push(getRandomInt(0, 9));
      numbers.push(getRandomInt(0, 9));
      break;
    case GameType.Pick3:
      switch (opt) {
        case GameOptions.Straight:
          numbers.push(getRandomInt(0, 9));
          numbers.push(getRandomInt(0, 9));
          numbers.push(getRandomInt(0, 9));
          break;
        case GameOptions.StraightBox:
        case GameOptions.Box: {
          while (!canBuyP3Box(numbers)) {
            numbers.length = 0;
            numbers.push(getRandomInt(0, 9));
            numbers.push(getRandomInt(0, 9));
            numbers.push(getRandomInt(0, 9));
          }
          break;
        }
        default:
          break;
      }
      break;
    case GameType.Pick4:
      {
        switch (opt) {
          case GameOptions.Straight:
            numbers.push(getRandomInt(0, 9));
            numbers.push(getRandomInt(0, 9));
            numbers.push(getRandomInt(0, 9));
            numbers.push(getRandomInt(0, 9));
            break;
          case GameOptions.Box: {
            while (!canBuyP4Box(numbers)) {
              numbers.length = 0;
              numbers.push(getRandomInt(0, 9));
              numbers.push(getRandomInt(0, 9));
              numbers.push(getRandomInt(0, 9));
              numbers.push(getRandomInt(0, 9));
            }
            break;
          }
          default:
            break;
        }
      }
      break;
    case GameType.L649:
      numbers.push(getRandomInt(1, 49));
      while (numbers.length < 6) {
        const num = getRandomInt(1, 49);
        if (!numbers.includes(num)) {
          numbers.push(num);
        }
      }
      break;
    case GameType.Keno: {
      const kenonums = getRandomInt(1, 10);
      numbers.push(getRandomInt(1, 80));
      while (numbers.length < kenonums) {
        const num = getRandomInt(1, 80);
        if (!numbers.includes(num)) {
          numbers.push(num);
        }
      }
      break;
    }
  }

  function canBuyP3Box(numarray: number[]): boolean {
    //Box play requires 2 of 3 unique digits, so 223 and 234 are good, but 444 is not.
    let highest = 1;
    for (const num of numarray) {
      if (numarray.filter((x) => x === num).length > highest) {
        highest = numarray.filter((x) => x === num).length;
      }
    }

    if (highest === 3) return false;
    else return true;
  }

  function canBuyP4Box(numarray: number[]): boolean {
    //Box play requires 2 of 4 unique digits, so 2223 and 234 are good, but 4444 is not.
    let highest = 1;
    for (const num of numarray) {
      if (numarray.filter((x) => x === num).length > highest) {
        highest = numarray.filter((x) => x === num).length; // Highest Count of a single number
      }
    }

    if (highest === 4) return false;
    else return true;
  }

  // We have our numbers.  Check against options.  Straight, anything goes.  Box, 2/4 must be unique.
  const ticket = new TicketRecord(gtype, numbers, wager, opt);
  Player.lotteryTickets.push(ticket);
}
