import React, { useState } from "react";
import { getRandomInt } from "../utils/helpers/getRandomInt";
import { Player } from "@player";
import { ToastVariant } from "@enums";
import { TicketRecord, GameType, GameOptions } from "./LotteryStoreLocationInside";
import { LotteryConstants } from "./data/LotteryConstants"
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
  const [result, setBet] = useState(1000);
  const [betnumber, setBetNumberResult] = useState(1000);

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
    let chosen: number = parseInt(e.currentTarget.value);
    if (isNaN(chosen)) {
      e.currentTarget.value = "";
      numbers = -1;
    }
    else if (e.currentTarget.value.length > 3) {
      e.currentTarget.value = "";
      numbers = -1;
    }
    else {
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
    if (!option || (option !== GameOptions.Straight && option !== GameOptions.Box && option !== GameOptions.StraightBox)) {
      dialogBoxCreate("No Game Option selected");
      return;
    }
    if (option === GameOptions.Box && !canBuyBox()) {
      dialogBoxCreate("Invalid numbers selected for a Box bet");
      return;
    }
    let numstring = String(numbers);
    let numarray: number[] = [];
    if (numstring.length === 0) {
      numarray.push(0);
      numarray.push(0);
      numarray.push(0);
    }
    else if (numstring.length === 1) {
      numarray.push(0);
      numarray.push(0);
    }
    else if (numstring.length === 1) {
      numarray.push(0);
    }
    for (let i = 0; i < numstring.length; i++) {
      numarray.push(parseInt(numstring[i]));
    }
    let betrecord = new TicketRecord(
      GameType.Pick3,
      numarray,
      wager,
      option,
    )
    Player.loseMoney(wager, "lottery");
    Player.lotteryTickets.push(betrecord)

    const PurchaseToast = (
      <>
        Purchased a ticket! Type:{betrecord.Type}  Bet:{betrecord.Wager}  Numbers:{numarray[0]},{numarray[1]},{numarray[2]}  Options:{betrecord.Option}
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
    }
    else {
      numbers = getRandomInt(0, 999);
    }

    let numstring = String(numbers);
    let numarray = [];
    if (numstring.length === 0) {
      numarray.push(0);
      numarray.push(0);
      numarray.push(0);
    }
    else if (numstring.length === 1) {
      numarray.push(0);
      numarray.push(0);
    }
    else if (numstring.length === 2) {
      numarray.push(0);
    }
    for (let i = 0; i < numstring.length; i++) {
      numarray.push(parseInt(numstring[i]));
    }
    let betrecord = new TicketRecord(
      GameType.Pick3,
      numarray,
      wager,
      option,
    )
    Player.loseMoney(wager, "lottery");
    Player.lotteryTickets.push(betrecord)

    const PurchaseToast = (
      <>
        Purchased a ticket! Type:{betrecord.Type}  Bet:{betrecord.Wager}  Numbers:{numarray[0]},{numarray[1]},{numarray[2]}  Options:{betrecord.Option}
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
    }
    else if (numstring.length === 1) {
      numarray.push(0);
      numarray.push(0);
    }
    else if (numstring.length === 2) {
      numarray.push(0);
    }
    for (let i = 0; i < numstring.length; i++) {
      numarray.push(parseInt(numstring[i]));
    }
    //Box play requires 2 of 3 unique digits, so 223 and 234 are good, but 444 is not.
    let highest = 1;
    for (let num of numarray) {
      if (numarray.filter(x => x === num).length > highest) {
        highest = numarray.filter(x => x === num).length;
      }
    }

    if (highest === 3) {
      return false;
    }
    else {
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
  
  return (
    <>
      <Typography>Pick 3</Typography>
      <Typography><br /></Typography>
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
        <Typography>Numbers Chosen - 1, 2 or 3 numbers. 1 will cause a leading 0. EX: 45 = 045, 4 = 004, Nothing is 000</Typography>
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
      <Button onClick={() => buyTicket()}>Buy ticket</Button>, <Button onClick={() => buyRandomTicket()}>Buy random ticket</Button>
    </>
  );
 
}
