import React, { useState } from "react";
import { getRandomInt } from "../utils/helpers/getRandomInt";
import { Player } from "@player";
import { ToastVariant } from "@enums";
import { TicketRecord, GameType, GameOptions } from "./LotteryStoreLocationInside";
import { LotteryConstants } from "./data/LotteryConstants";
import { SnackbarEvents } from "../ui/React/Snackbar";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

let wager = -1;
let numbers = -1;
let option: GameOptions;

export function Pick3(): React.ReactElement {
  const [, setBet] = useState(1000);
  const [, setBetNumberResult] = useState(1000);

  function updateBet(e: React.ChangeEvent<HTMLInputElement>): void {
    let bet: number = parseInt(e.currentTarget.value);
    if (isNaN(bet)) {
      bet = -1;
    }
    if (bet > LotteryConstants.MaxPlay) {
      bet = LotteryConstants.MaxPlay;
    }
    if (bet < LotteryConstants.MinPlay) {
      bet = -1;
    }
    setBet(bet);
    wager = bet;
    e.currentTarget.value = bet > 0 ? bet.toString() : "";
  }
  function updateNumbersPick3(e: React.ChangeEvent<HTMLInputElement>): void {
    const chosen: number = parseInt(e.currentTarget.value);
    if (isNaN(chosen)) {
      e.currentTarget.value = "";
      numbers = -1;
    } else if (e.currentTarget.value.length > 3) {
      e.currentTarget.value = "";
      numbers = -1;
    } else {
      setBetNumberResult(chosen);
      numbers = chosen;
    }
  }

  function buyTicket(): void {
    if (wager <= 0) {
      dialogBoxCreate("You must wager something");
      return;
    }
    if (numbers < 0) {
      dialogBoxCreate("You must select your numbers");
      return;
    }
    if (Player.lotteryTickets.length >= LotteryConstants.MaxTickets) {
      dialogBoxCreate("You cannot hold any more tickets.");
      return;
    }
    if (
      !option ||
      (option !== GameOptions.Straight && option !== GameOptions.Box && option !== GameOptions.StraightBox)
    ) {
      dialogBoxCreate("No Game Option selected");
      return;
    }
    if (option === GameOptions.Box && !canBuyBox()) {
      dialogBoxCreate("Invalid numbers selected for a Box bet");
      return;
    }
    const numstring = String(numbers);
    const numarray: number[] = [];
    if (numstring.length === 0) {
      numarray.push(0);
      numarray.push(0);
      numarray.push(0);
    } else if (numstring.length === 1) {
      numarray.push(0);
      numarray.push(0);
    } else if (numstring.length === 2) {
      numarray.push(0);
    }
    for (let i = 0; i < numstring.length; i++) {
      numarray.push(parseInt(numstring[i]));
    }
    const betrecord = new TicketRecord(GameType.Pick3, numarray, wager, option);
    Player.loseMoney(wager, "lottery");
    Player.lotteryTickets.push(betrecord);

    const PurchaseToast = (
      <>
        Purchased a ticket! Type:{betrecord.Type} Bet:{betrecord.Wager} Numbers:{numarray[0]},{numarray[1]},
        {numarray[2]} Options:{betrecord.Option}
      </>
    );
    SnackbarEvents.emit(PurchaseToast, ToastVariant.INFO, 2000);
  }

  function buyRandomTicket(): void {
    if (wager <= 0) {
      dialogBoxCreate("You must wager something");
      return;
    }
    if (Player.lotteryTickets.length >= LotteryConstants.MaxTickets) {
      dialogBoxCreate("You cannot hold any more tickets.");
      return;
    }
    if (option !== GameOptions.Straight && option !== GameOptions.Box && option !== GameOptions.StraightBox) {
      dialogBoxCreate("No Game Option selected");
      return;
    }
    numbers = 0;

    if (option === GameOptions.Box || option === GameOptions.StraightBox) {
      while (!canBuyBox()) {
        numbers = getRandomInt(0, 999);
      }
    } else {
      numbers = getRandomInt(0, 999);
    }

    const numstring = String(numbers);
    const numarray = [];
    if (numstring.length === 0) {
      numarray.push(0);
      numarray.push(0);
      numarray.push(0);
    } else if (numstring.length === 1) {
      numarray.push(0);
      numarray.push(0);
    } else if (numstring.length === 2) {
      numarray.push(0);
    }
    for (let i = 0; i < numstring.length; i++) {
      numarray.push(parseInt(numstring[i]));
    }
    const betrecord = new TicketRecord(GameType.Pick3, numarray, wager, option);
    Player.loseMoney(wager, "lottery");
    Player.lotteryTickets.push(betrecord);

    const PurchaseToast = (
      <>
        Purchased a ticket! Type:{betrecord.Type} Bet:{betrecord.Wager} Numbers:{numarray[0]},{numarray[1]},
        {numarray[2]} Options:{betrecord.Option}
      </>
    );
    SnackbarEvents.emit(PurchaseToast, ToastVariant.INFO, 2000);
    setBetNumberResult(numbers);
  }

  function canBuyBox(): boolean {
    const numstring = String(numbers);
    const numarray: number[] = [];

    if (numstring.length === 0) {
      numarray.push(0);
      numarray.push(0);
      numarray.push(0);
    } else if (numstring.length === 1) {
      numarray.push(0);
      numarray.push(0);
    } else if (numstring.length === 2) {
      numarray.push(0);
    }
    for (let i = 0; i < numstring.length; i++) {
      numarray.push(parseInt(numstring[i]));
    }
    //Box play requires 2 of 3 unique digits, so 223 and 234 are good, but 444 is not.
    let highest = 1;
    for (const num of numarray) {
      if (numarray.filter((x) => x === num).length > highest) {
        highest = numarray.filter((x) => x === num).length;
      }
    }

    if (highest === 3) {
      return false;
    } else {
      return true;
    }
  }
  function updateOptionBox(e: React.ChangeEvent<HTMLInputElement>): void {
    if (e.currentTarget.checked) {
      option = GameOptions.Box;
    }
  }
  function updateOptionStraight(e: React.ChangeEvent<HTMLInputElement>): void {
    if (e.currentTarget.checked) {
      option = GameOptions.Straight;
    }
  }
  function updateOptionStraightBox(e: React.ChangeEvent<HTMLInputElement>): void {
    if (e.currentTarget.checked) {
      option = GameOptions.StraightBox;
    }
  }
  function showOdds(): void {
    dialogBoxCreate(
      "Pick 3 Winnings.\n" +
        "Based on a $1 bet\n" +
        "   Straight:          Box:            Straight/Box\n" +
        "Straight : $500  3-way Box: $160    3-way Straight: $330\n" +
        "                 6-way Box: $80     6-way Straight: $290\n" +
        "                                    3-way Box     : $80\n" +
        "                                    6-way Box     : $40",
    );
  }

  return (
    <>
      <Typography>Pick 3</Typography>
      <Typography>
        <br />
      </Typography>
      <Typography>Bet:</Typography>
      <Box display="flex" alignItems="center">
        <TextField
          type="number"
          style={{
            width: "100px",
          }}
          onChange={updateBet}
          placeholder={String(wager)}
        />
        <Typography>Bet Amount - Up to $500 per ticket</Typography>
      </Box>
      <br />
      <Typography>Numbers:</Typography>
      <Box display="flex" alignItems="center">
        <TextField
          type="number"
          style={{
            width: "100px",
          }}
          onChange={updateNumbersPick3}
          placeholder={String(numbers)}
        />
        <Typography>
          Numbers Chosen - 1, 2 or 3 numbers. 1 will cause a leading 0. EX: 45 = 045, 4 = 004, Nothing is 000
        </Typography>
      </Box>
      <br />
      <Typography>Option chosen:</Typography>
      <div>
        <Box display="flex" alignItems="center">
          <Typography>Straight:</Typography>
          <input type="radio" name="optionp3" id={GameOptions.Straight} onChange={updateOptionStraight}></input>
          <Typography>&nbsp;&nbsp;Box:</Typography>
          <input type="radio" name="optionp3" id={GameOptions.Box} onChange={updateOptionBox}></input>
          <Typography>&nbsp;&nbsp;Straight/Box:</Typography>
          <input type="radio" name="optionp3" id={GameOptions.Box} onChange={updateOptionStraightBox}></input>
        </Box>
      </div>
      <br />
      <Button onClick={() => buyTicket()}>Buy ticket</Button>,{" "}
      <Button onClick={() => buyRandomTicket()}>Buy random ticket</Button>
      <Box display="-ms-grid" alignItems="left" whiteSpace="pre">
        <Typography>----------------------------</Typography>
        <br />
        <Typography>Rules:</Typography>
        <br />
        <Typography>Pick 3 numbers, between 0 - 9.</Typography>
        <Typography>These will be paddded with leading 0's Ex: 234, 56(056) or even 0(000)</Typography>
        <br />
        <Typography>Play Types:</Typography>
        <Typography>-----------</Typography>
        <Typography>-Straight : Requires that the numbers be in the correct order.</Typography>
        <Typography>-Box : Numbers can be in any order. Must have 2 Unique numbers.</Typography>
        <Typography>
          -Straight/Box: Numbers tested for both a Straight and a Box. Must have 2 unique numbers.
        </Typography>
        <Button onClick={() => showOdds()}>Show Winnings Chart</Button>
      </Box>
    </>
  );
}
