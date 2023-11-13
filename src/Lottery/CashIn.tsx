import React from "react";
import { BadRNG } from "../Casino/RNG";
//import { win, reachedLimit } from "./Game";
import { Player } from "@player";
//import { ToastVariant } from "@enums";
import { TicketRecord, GameType, GameOptions } from "./LotteryStoreLocationInside";
//import { SnackbarEvents } from "../ui/React/Snackbar";
import Typography from "@mui/material/Typography";
import { formatNumber } from "../ui/formatNumber";
//import TextField from "@mui/material/TextField";
//import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
//import { number } from "prop-types";
import { LotteryConstants } from "./data/LotteryConstants";
import { dialogBoxCreate } from "../ui/React/DialogBox";

const l649: TicketRecord[] = [];
const pick2: TicketRecord[] = [];
const pick3Straight: TicketRecord[] = [];
const pick3Box: TicketRecord[] = [];
const pick3StraightBox: TicketRecord[] = [];
const pick4Straight: TicketRecord[] = [];
const pick4Box: TicketRecord[] = [];
const keno: TicketRecord[] = [];
const balls: number[] = [];
const l649WinNums: number[] = [];
const l649WinNumsBonus: number[] = [];
const pick2WinNums: number[] = [];
const pick3WinNums: number[] = [];
const pick4WinNums: number[] = [];
const kenoWinNums: number[] = [];
let l649Winnings: number;
let kenoWinnings: number;
let pick2Winnings: number;
let pick3Winnings: number;
let pick4Winnings: number;

export function CashIn(): React.ReactElement {
  function totalPick4(): number {
    return pick4Straight.length + pick4Box.length;
  }
  function totalPick3(): number {
    return pick3Straight.length + pick3Box.length + pick3StraightBox.length;
  }
  function processTickets(): void {
    l649Winnings = 0;
    kenoWinnings = 0;
    pick2Winnings = 0;
    pick3Winnings = 0;
    pick4Winnings = 0;

    // Lotto 6/49 grouping
    let l649correct = 0;
    let l649bonus = false;
    for (const l649ticket of l649) {
      l649correct = 0;
      l649bonus = false;
      for (const num of l649ticket.Numbers) {
        if (l649WinNums.includes(num)) {
          l649correct++;
        }
        if (l649WinNumsBonus.includes(num)) {
          l649bonus = true;
        }
      }
      //What do we have?
      if (l649correct == 6) {
        l649Winnings += (5e6 / 3) * l649ticket.Wager;
      } else if (l649correct == 5 && l649bonus) {
        l649Winnings += (16e5 / 3) * l649ticket.Wager;
      } else if (l649correct == 5) {
        l649Winnings += 225000 * l649ticket.Wager;
      } else if (l649correct == 4) {
        l649Winnings += (2e5 / 3) * l649ticket.Wager;
      } else if (l649correct == 3) {
        l649Winnings += (10 / 3) * l649ticket.Wager;
      } else if (l649correct == 2 && l649bonus) {
        l649Winnings += (5 / 3) * l649ticket.Wager;
      } else if (l649correct == 2) {
        l649Winnings += l649ticket.Wager;
      }
    }

    // Lotto Pick 2 grouping
    let pfirst = false;
    let psecond = false;

    for (const p2ticket of pick2) {
      pfirst = false;
      psecond = false;

      if (p2ticket.Numbers[0] === pick2WinNums[0]) {
        pfirst = true;
      } else {
        continue;
      }
      // We have our first number already, do we have a second?
      if (p2ticket.Numbers[1] === pick2WinNums[1]) {
        psecond = true;
      }
      if (psecond) {
        pick2Winnings += 49.5 * p2ticket.Wager;
      } else if (pfirst) {
        pick2Winnings += p2ticket.Wager;
      }
    }

    // Lotto Pick 3 grouping
    let waybet = 0;
    for (const p3ticket of pick3Straight) {
      // Straight first.
      if (
        p3ticket.Numbers[0] === pick3WinNums[0] &&
        p3ticket.Numbers[1] === pick3WinNums[1] &&
        p3ticket.Numbers[2] === pick3WinNums[2]
      ) {
        pick3Winnings += p3ticket.Wager * 500;
      } else {
        continue;
      }
    }

    for (const p3ticket of pick3Box) {
      // Box Next.
      waybet = whichWayP3(p3ticket.Numbers); // 3 or 6 way bet
      if (waybet === 3 && isP3BoxWinner(p3ticket.Numbers, 3)) {
        // Process a 3-way Box ex: 445
        pick3Winnings += p3ticket.Wager * 160;
      } else if (waybet === 6 && isP3BoxWinner(p3ticket.Numbers, 6)) {
        // Process a 6-way Box  ex: 456
        pick3Winnings += p3ticket.Wager * 40;
      }
    }

    for (const p3ticket of pick3StraightBox) {
      // Straight-Box Next.
      waybet = whichWayP3(p3ticket.Numbers); // 3 or 6 way bet
      if (waybet === 3 && isP3StraightBoxExactWinner(p3ticket.Numbers)) {
        // Process a 3-way Straight-Box ex: 445
        pick3Winnings += p3ticket.Wager * 330;
      } else if (waybet === 3 && isP3StraightBoxAnyOrderWinner(p3ticket.Numbers, 3)) {
        pick3Winnings += p3ticket.Wager * 80;
      } else if (waybet === 6 && isP3StraightBoxExactWinner(p3ticket.Numbers)) {
        // Process a 6-way Box  ex: 456
        pick3Winnings += p3ticket.Wager * 290;
      } else if (waybet === 6 && isP3StraightBoxAnyOrderWinner(p3ticket.Numbers, 6)) {
        // Process a 6-way Box  ex: 456
        pick3Winnings += p3ticket.Wager * 40;
      }
    }

    // Pick 4 ticket grouping
    for (const p4ticket of pick4Straight) {
      // Straight first.
      if (
        p4ticket.Numbers[0] === pick4WinNums[0] &&
        p4ticket.Numbers[1] === pick4WinNums[1] &&
        p4ticket.Numbers[2] === pick4WinNums[2] &&
        p4ticket.Numbers[3] === pick4WinNums[3]
      ) {
        pick4Winnings += p4ticket.Wager * 5000;
      } else {
        continue;
      }
    }

    for (const p4ticket of pick4Box) {
      // Box Next.
      waybet = whichWayP4(p4ticket.Numbers);
      if (waybet === 4 && isP4BoxWinner(p4ticket.Numbers, 4)) {
        // Process a 4-way Box
        pick4Winnings += p4ticket.Wager * 1200;
      } else if (waybet === 6 && isP4BoxWinner(p4ticket.Numbers, 6)) {
        // Process a 6-way Box
        pick4Winnings += p4ticket.Wager * 800;
      } else if (waybet === 12 && isP4BoxWinner(p4ticket.Numbers, 12)) {
        // Process a 12-way Box
        pick4Winnings += p4ticket.Wager * 400;
      } else if (waybet === 24 && isP4BoxWinner(p4ticket.Numbers, 24)) {
        // Process a 24-way Box
        pick4Winnings += p4ticket.Wager * 200;
      }
    }

    for (const kenoticket of keno) {
      if (kenoticket.Numbers.length === 1 && kenoMatches(kenoticket.Numbers) === 1) {
        kenoWinnings += kenoticket.Wager * 2;
      } else if (kenoticket.Numbers.length === 2 && kenoMatches(kenoticket.Numbers) === 2) {
        kenoWinnings += kenoticket.Wager * 10;
      } else if (kenoticket.Numbers.length === 3 && kenoMatches(kenoticket.Numbers) === 3) {
        kenoWinnings += kenoticket.Wager * 20;
      } else if (kenoticket.Numbers.length === 3 && kenoMatches(kenoticket.Numbers) === 2) {
        kenoWinnings += kenoticket.Wager * 2;
      } else if (kenoticket.Numbers.length === 4 && kenoMatches(kenoticket.Numbers) === 4) {
        kenoWinnings += kenoticket.Wager * 50;
      } else if (kenoticket.Numbers.length === 4 && kenoMatches(kenoticket.Numbers) === 3) {
        kenoWinnings += kenoticket.Wager * 5;
      } else if (kenoticket.Numbers.length === 4 && kenoMatches(kenoticket.Numbers) === 2) {
        kenoWinnings += kenoticket.Wager * 1;
      } else if (kenoticket.Numbers.length === 5 && kenoMatches(kenoticket.Numbers) === 5) {
        kenoWinnings += kenoticket.Wager * 400;
      } else if (kenoticket.Numbers.length === 5 && kenoMatches(kenoticket.Numbers) === 4) {
        kenoWinnings += kenoticket.Wager * 15;
      } else if (kenoticket.Numbers.length === 5 && kenoMatches(kenoticket.Numbers) === 3) {
        kenoWinnings += kenoticket.Wager * 2;
      } else if (kenoticket.Numbers.length === 6 && kenoMatches(kenoticket.Numbers) === 6) {
        kenoWinnings += kenoticket.Wager * 1500;
      } else if (kenoticket.Numbers.length === 6 && kenoMatches(kenoticket.Numbers) === 5) {
        kenoWinnings += kenoticket.Wager * 50;
      } else if (kenoticket.Numbers.length === 6 && kenoMatches(kenoticket.Numbers) === 4) {
        kenoWinnings += kenoticket.Wager * 5;
      } else if (kenoticket.Numbers.length === 6 && kenoMatches(kenoticket.Numbers) === 3) {
        kenoWinnings += kenoticket.Wager * 1;
      } else if (kenoticket.Numbers.length === 7 && kenoMatches(kenoticket.Numbers) === 7) {
        kenoWinnings += kenoticket.Wager * 5000;
      } else if (kenoticket.Numbers.length === 7 && kenoMatches(kenoticket.Numbers) === 6) {
        kenoWinnings += kenoticket.Wager * 100;
      } else if (kenoticket.Numbers.length === 7 && kenoMatches(kenoticket.Numbers) === 5) {
        kenoWinnings += kenoticket.Wager * 15;
      } else if (kenoticket.Numbers.length === 7 && kenoMatches(kenoticket.Numbers) === 4) {
        kenoWinnings += kenoticket.Wager * 2;
      } else if (kenoticket.Numbers.length === 7 && kenoMatches(kenoticket.Numbers) === 3) {
        kenoWinnings += kenoticket.Wager * 1;
      } else if (kenoticket.Numbers.length === 8 && kenoMatches(kenoticket.Numbers) === 8) {
        kenoWinnings += kenoticket.Wager * 10000;
      } else if (kenoticket.Numbers.length === 8 && kenoMatches(kenoticket.Numbers) === 7) {
        kenoWinnings += kenoticket.Wager * 400;
      } else if (kenoticket.Numbers.length === 8 && kenoMatches(kenoticket.Numbers) === 6) {
        kenoWinnings += kenoticket.Wager * 50;
      } else if (kenoticket.Numbers.length === 8 && kenoMatches(kenoticket.Numbers) === 5) {
        kenoWinnings += kenoticket.Wager * 10;
      } else if (kenoticket.Numbers.length === 8 && kenoMatches(kenoticket.Numbers) === 4) {
        kenoWinnings += kenoticket.Wager * 2;
      } else if (kenoticket.Numbers.length === 9 && kenoMatches(kenoticket.Numbers) === 9) {
        kenoWinnings += kenoticket.Wager * 25000;
      } else if (kenoticket.Numbers.length === 9 && kenoMatches(kenoticket.Numbers) === 8) {
        kenoWinnings += kenoticket.Wager * 2500;
      } else if (kenoticket.Numbers.length === 9 && kenoMatches(kenoticket.Numbers) === 7) {
        kenoWinnings += kenoticket.Wager * 200;
      } else if (kenoticket.Numbers.length === 9 && kenoMatches(kenoticket.Numbers) === 6) {
        kenoWinnings += kenoticket.Wager * 25;
      } else if (kenoticket.Numbers.length === 9 && kenoMatches(kenoticket.Numbers) === 5) {
        kenoWinnings += kenoticket.Wager * 4;
      } else if (kenoticket.Numbers.length === 9 && kenoMatches(kenoticket.Numbers) === 4) {
        kenoWinnings += kenoticket.Wager * 1;
      } else if (kenoticket.Numbers.length === 10 && kenoMatches(kenoticket.Numbers) === 10) {
        kenoWinnings += kenoticket.Wager * 100000;
      } else if (kenoticket.Numbers.length === 10 && kenoMatches(kenoticket.Numbers) === 9) {
        kenoWinnings += kenoticket.Wager * 5000;
      } else if (kenoticket.Numbers.length === 10 && kenoMatches(kenoticket.Numbers) === 8) {
        kenoWinnings += kenoticket.Wager * 500;
      } else if (kenoticket.Numbers.length === 10 && kenoMatches(kenoticket.Numbers) === 7) {
        kenoWinnings += kenoticket.Wager * 50;
      } else if (kenoticket.Numbers.length === 10 && kenoMatches(kenoticket.Numbers) === 6) {
        kenoWinnings += kenoticket.Wager * 10;
      } else if (kenoticket.Numbers.length === 10 && kenoMatches(kenoticket.Numbers) === 5) {
        kenoWinnings += kenoticket.Wager * 3;
      } else if (kenoticket.Numbers.length === 10 && kenoMatches(kenoticket.Numbers) === 0) {
        kenoWinnings += kenoticket.Wager * 3;
      }
    }
  }
  function processWinnings(): void {
    if (
      l649Winnings + kenoWinnings + pick2Winnings + pick3Winnings + pick4Winnings + Player.getLotteryWinnings() >
      LotteryConstants.GainLimits
    ) {
      dialogBoxCreate(
        "An error occured with the lottery system.  We could not process all winnings.  We are sorry for the inconvenience.",
      );
    }

    if (Player.getLotteryWinnings() + l649Winnings > LotteryConstants.GainLimits) {
      l649Winnings = LotteryConstants.GainLimits - Player.getLotteryWinnings();
    }
    Player.gainMoney(l649Winnings, "lottery");

    if (Player.getLotteryWinnings() + kenoWinnings > LotteryConstants.GainLimits) {
      kenoWinnings = LotteryConstants.GainLimits - Player.getLotteryWinnings();
    }
    Player.gainMoney(kenoWinnings, "lottery");

    if (Player.getLotteryWinnings() + pick2Winnings > LotteryConstants.GainLimits) {
      pick2Winnings = LotteryConstants.GainLimits - Player.getLotteryWinnings();
    }
    Player.gainMoney(pick2Winnings, "lottery");

    if (Player.getLotteryWinnings() + pick3Winnings > LotteryConstants.GainLimits) {
      pick3Winnings = LotteryConstants.GainLimits - Player.getLotteryWinnings();
    }
    Player.gainMoney(pick3Winnings, "lottery");

    if (Player.getLotteryWinnings() + pick4Winnings > LotteryConstants.GainLimits) {
      pick4Winnings = LotteryConstants.GainLimits - Player.getLotteryWinnings();
    }
    Player.gainMoney(pick4Winnings, "lottery");
  }
  function initTickets(): void {
    l649.length = 0;
    pick2.length = 0;
    pick3Straight.length = 0;
    pick3Box.length = 0;
    pick3StraightBox.length = 0;
    pick4Straight.length = 0;
    pick4Box.length = 0;
    keno.length = 0;
    balls.length = 0;
    l649WinNums.length = 0;
    l649WinNumsBonus.length = 0;
    pick2WinNums.length = 0;
    pick3WinNums.length = 0;
    pick4WinNums.length = 0;
    kenoWinNums.length = 0;
    l649Winnings = 0;
    kenoWinnings = 0;
    pick2Winnings = 0;
    pick3Winnings = 0;
    pick4Winnings = 0;
    Player.lotteryTickets.length = 0;
  }
  function initBalls(upTo: number): void {
    balls.length = 0;
    for (let i = 1; i <= upTo; i++) {
      balls.push(i);
    }
  }
  function pullBall(): number {
    const ball = balls.splice(Math.floor(balls.length * BadRNG.random()), 1);
    return parseInt(String(ball));
  }
  function sortTickets(): void {
    while (Player.lotteryTickets.length > 0) {
      const ticket = Player.lotteryTickets.pop();
      switch (ticket?.Type) {
        case GameType.L649:
          l649.push(ticket);
          break;
        case GameType.Pick2:
          pick2.push(ticket);
          break;
        case GameType.Pick3:
          switch (ticket.Option) {
            case GameOptions.Straight:
              pick3Straight.push(ticket);
              break;
            case GameOptions.Box:
              pick3Box.push(ticket);
              break;
            case GameOptions.StraightBox:
              pick3StraightBox.push(ticket);
              break;
            default:
              break;
          }
          break;
        case GameType.Pick4:
          switch (ticket.Option) {
            case GameOptions.Straight:
              pick4Straight.push(ticket);
              break;
            case GameOptions.Box:
              pick4Box.push(ticket);
              break;
            default:
              break;
          }
          break;
        case GameType.Keno:
          keno.push(ticket);
          break;
        default:
          break;
      }
    }
  }
  function getWinningNumbers(): void {
    l649WinNums.length = 0;
    l649WinNumsBonus.length = 0;
    pick2WinNums.length = 0;
    pick3WinNums.length = 0;
    pick4WinNums.length = 0;
    kenoWinNums.length = 0;

    for (let p2 = 0; p2 < 2; p2++) {
      // Pick 2 numbers
      pick2WinNums.push(Math.floor(BadRNG.random() * 10));
    }

    for (let p3 = 0; p3 < 3; p3++) {
      // Pick 3 numbers
      pick3WinNums.push(Math.floor(BadRNG.random() * 10));
    }

    for (let p4 = 0; p4 < 4; p4++) {
      // Pick 4 numbers
      pick4WinNums.push(Math.floor(BadRNG.random() * 10));
    }

    initBalls(49); //Get balls ready for the 6/49.
    for (let lot6 = 0; lot6 < 6; lot6++) {
      // 7 balls total.  6 for 6/46 and 1 bonus ball
      l649WinNums.push(pullBall());
    } //We sort to throw things off a bit
    l649WinNumsBonus.push(pullBall());
    l649WinNums.sort((a, b) => {
      return b - a;
    });

    initBalls(80); //Get ready for Keno
    for (let lotk = 0; lotk < 20; lotk++) {
      //20 balls for Keno ...  Why did I chose Keno?
      kenoWinNums.push(pullBall());
    }
    kenoWinNums.sort((a, b) => {
      return b - a;
    });
  }
  function whichWayP3(numarray: number[]): number {
    //Box play requires 2 of 3 unique digits, so 223 and 234 are good, but 444 is not.
    let highest = 1;
    for (const num of numarray) {
      if (numarray.filter((x) => x === num).length > highest) {
        highest = numarray.filter((x) => x === num).length;
      }
    }

    if (highest === 1 || highest == 3) {
      return 6;
    } else if (highest === 2) {
      return 3;
    } else {
      return 0;
    }
  }
  function whichWayP4(numarray: number[]): number {
    //Box play requires 2 of 4 unique digits, so 2223 and 234 are good, but 4444 is not.
    let highest = 1;
    let count = 0;
    for (const num of numarray) {
      if (numarray.filter((x) => x === num).length > highest) {
        highest = numarray.filter((x) => x === num).length;
        count++;
      } else if ((numarray.filter((x) => x === num).length = highest)) {
        count++;
      }
    }

    if (highest === 1) {
      return 24;
    } else if (highest === 2 && count === 2) {
      return 12;
    } else if (highest === 2 && count === 4) {
      return 6;
    } else if (highest === 3) {
      return 4;
    } else if (highest === 4) {
      dialogBoxCreate("Error with calculating box type");
      return 0;
    }
    dialogBoxCreate("Error with calculating box type");
    return 0;
  }
  function isP3BoxWinner(numarray: number[], way: number): boolean {
    if (way === 3) {
      // Process a 3-way box
      const winnums: number[] = [];
      winnums.push(...pick3WinNums);
      winnums.sort((a, b) => {
        return b - a;
      });
      numarray.sort((a, b) => {
        return b - a;
      });
      while (numarray.length > 0) {
        const num = numarray.pop();
        const winnum = winnums.pop();
        if (num === winnum) {
          continue;
        } else return false;
      }
      return true;
    } else {
      // Process a 6-way box
      if (
        pick3WinNums.includes(numarray[0]) &&
        pick3WinNums.includes(numarray[1]) &&
        pick3WinNums.includes(numarray[2])
      ) {
        return true;
      } else {
        return false;
      }
    }
  }
  function isP4BoxWinner(numarray: number[], way: number): boolean {
    if (way === 24) {
      // Process a 24-way box
      if (
        pick4WinNums.includes(numarray[0]) &&
        pick4WinNums.includes(numarray[1]) &&
        pick4WinNums.includes(numarray[2]) &&
        pick4WinNums.includes(numarray[3])
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      const winnums: number[] = [];
      winnums.push(...pick4WinNums);
      winnums.sort((a, b) => {
        return b - a;
      });
      numarray.sort((a, b) => {
        return b - a;
      });
      while (numarray.length > 0) {
        const num = numarray.pop();
        const winnum = winnums.pop();
        if (num === winnum) {
          continue;
        } else return false;
      }
      return true;
    }
  }
  function isP3StraightBoxExactWinner(numarray: number[]): boolean {
    return numarray[0] === pick3WinNums[0] && numarray[1] === pick3WinNums[1] && numarray[2] === pick3WinNums[2];
  }
  function isP3StraightBoxAnyOrderWinner(numarray: number[], way: number): boolean {
    if (way === 3) {
      // Process a 3-way box
      const winnums = pick3WinNums;
      while (numarray.length > 0) {
        const num = numarray.pop();
        if (num === undefined) {
          return false;
        }
        if (winnums.includes(num)) {
          winnums.slice(winnums.indexOf(num));
        } else {
          return false;
        }
      }
      return true;
    } else {
      // Process a 6-way box
      if (
        pick3WinNums.includes(numarray[0]) &&
        pick3WinNums.includes(numarray[1]) &&
        pick3WinNums.includes(numarray[2])
      ) {
        return true;
      } else {
        return false;
      }
    }
  }
  function kenoMatches(numarray: number[]): number {
    let count = 0;
    for (const num of numarray) {
      if (kenoWinNums.includes(num)) {
        count++;
      }
    }
    return count;
  }

  sortTickets();
  getWinningNumbers();
  processTickets();
  processWinnings();

  const br = (
    <Typography>
      {" "}
      <br />{" "}
    </Typography>
  );
  const l649display = (
    <Typography>
      {" "}
      Lotto 6/49: &nbsp;{l649WinNums.pop()}, {l649WinNums.pop()}, {l649WinNums.pop()}, {l649WinNums.pop()},{" "}
      {l649WinNums.pop()}, {l649WinNums.pop()} Bonus: {l649WinNumsBonus.pop()}
    </Typography>
  );

  const pick2display = (
    <Typography>
      Pick 2: &nbsp;{pick2WinNums.pop()}, {pick2WinNums.pop()}
    </Typography>
  );

  const pick3display = (
    <Typography>
      Pick 3: &nbsp;{pick3WinNums.pop()}, {pick3WinNums.pop()}, {pick3WinNums.pop()}
    </Typography>
  );

  const pick4display = (
    <Typography>
      Pick 4: &nbsp;{pick4WinNums.pop()}, {pick4WinNums.pop()}, {pick4WinNums.pop()}, {pick4WinNums.pop()}
    </Typography>
  );

  const kenodisplay = (
    <Typography>
      Keno: &nbsp;{kenoWinNums.pop()}, {kenoWinNums.pop()}, {kenoWinNums.pop()}, {kenoWinNums.pop()},{" "}
      {kenoWinNums.pop()}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{kenoWinNums.pop()}, {kenoWinNums.pop()}, {kenoWinNums.pop()},{" "}
      {kenoWinNums.pop()}, {kenoWinNums.pop()}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{kenoWinNums.pop()}, {kenoWinNums.pop()}, {kenoWinNums.pop()},{" "}
      {kenoWinNums.pop()}, {kenoWinNums.pop()}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{kenoWinNums.pop()}, {kenoWinNums.pop()}, {kenoWinNums.pop()},{" "}
      {kenoWinNums.pop()}, {kenoWinNums.pop()}
    </Typography>
  );

  const l649windisp =
    l649Winnings > 0 ? (
      <Typography>
        Lotto 6/49 Winnings from {l649.length}x tickets: ${formatNumber(l649Winnings)}
      </Typography>
    ) : (
      <Typography>Lotto 6/49 Winnings from {l649.length}x tickets : $0</Typography>
    );
  const pick2windisp =
    pick2Winnings > 0 ? (
      <Typography>
        Lotto Pick2 Winnings from {pick2.length}x tickets: ${formatNumber(pick2Winnings)}
      </Typography>
    ) : (
      <Typography>Lotto Pick2 Winnings from {pick2.length}x tickets : $0</Typography>
    );
  const pick3windisp =
    pick3Winnings > 0 ? (
      <Typography>
        Lotto Pick3 Winnings from {totalPick3()}x tickets: ${formatNumber(pick3Winnings)}
      </Typography>
    ) : (
      <Typography>Lotto Pick3 Winnings from {totalPick3()}x tickets : $0</Typography>
    );
  const pick4windisp =
    pick4Winnings > 0 ? (
      <Typography>
        Lotto Pick4 Winnings from {totalPick4()}x tickets: ${formatNumber(pick4Winnings)}
      </Typography>
    ) : (
      <Typography>Lotto Pick4 Winnings from {totalPick4()}x tickets : $0</Typography>
    );
  const kenowindisp =
    kenoWinnings > 0 ? (
      <Typography>
        Lotto Keno Winnings from {keno.length}x tickets: ${formatNumber(kenoWinnings)}
      </Typography>
    ) : (
      <Typography>Lotto Keno Winnings from {keno.length}x tickets : $0</Typography>
    );

  initTickets();

  return (
    <>
      <Box display="grid" alignItems="center">
        <Typography>!!!!Winning Numbers!!!!</Typography>
        {br}
        {l649display}
        {kenodisplay}
        {pick2display}
        {pick3display}
        {pick4display}
        {br}
        {l649windisp}
        {kenowindisp}
        {pick2windisp}
        {pick3windisp}
        {pick4windisp}
      </Box>
    </>
  );
}
