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
let num1 = -1;
let num2 = -1;
let num3 = -1;
let num4 = -1;
let num5 = -1;
let num6 = -1;

export function L649(): React.ReactElement {
  const [result, setBet] = useState(1000);
  const [betnum1, setBetNum1Result] = useState(1000);
  const [betnum2, setBetNum2Result] = useState(1000);
  const [betnum3, setBetNum3Result] = useState(1000);
  const [betnum4, setBetNum4Result] = useState(1000);
  const [betnum5, setBetNum5Result] = useState(1000);
  const [betnum6, setBetNum6Result] = useState(1000);

  function resetBet(): void {
    setBetNum1Result(-1);
    setBetNum2Result(-1);
    setBetNum3Result(-1);
    setBetNum4Result(-1);
    setBetNum5Result(-1);
    setBetNum6Result(-1);
    num1 = -1;
    num2 = -1;
    num3 = -1;
    num4 = -1;
    num5 = -1;
    num6 = -1;
    let elems = document.getElementsByTagName('input');
    for (const elem of elems) {
      if (elem.name === "betnum") {
        elem.value = "";
      }
    }
  }
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
  function updateNum1(e: React.ChangeEvent<HTMLInputElement>): void {
    let chosen: number = parseInt(e.currentTarget.value);
    if (isNaN(chosen)) {
      e.currentTarget.value = "";
      num1 = -1;
    }
    else if (chosen > 49) {
      e.currentTarget.value = "";
      num1 = -1;
    }
    else {
      setBetNum1Result(chosen);
      num1 = chosen;
    }
  }
  function updateNum2(e: React.ChangeEvent<HTMLInputElement>): void {
    let chosen: number = parseInt(e.currentTarget.value);
    if (isNaN(chosen)) {
      e.currentTarget.value = "";
      num2 = -1;
    }
    else if (chosen > 49) {
      e.currentTarget.value = "";
      num2 = -1;
    }
    else {
      setBetNum2Result(chosen);
      num2 = chosen;
    }
  }
  function updateNum3(e: React.ChangeEvent<HTMLInputElement>): void {
    let chosen: number = parseInt(e.currentTarget.value);
    if (isNaN(chosen)) {
      e.currentTarget.value = "";
      num3 = -1;
    }
    else if (chosen > 49) {
      e.currentTarget.value = "";
      num3 = -1;
    }
    else {
      setBetNum3Result(chosen);
      num3 = chosen;
    }
  }
  function updateNum4(e: React.ChangeEvent<HTMLInputElement>): void {
    let chosen: number = parseInt(e.currentTarget.value);
    if (isNaN(chosen)) {
      e.currentTarget.value = "";
      num4 = -1;
    }
    else if (chosen > 49) {
      e.currentTarget.value = "";
      num4 = -1;
    }
    else {
      setBetNum4Result(chosen);
      num4 = chosen;
    }
  }
  function updateNum5(e: React.ChangeEvent<HTMLInputElement>): void {
    let chosen: number = parseInt(e.currentTarget.value);
    if (isNaN(chosen)) {
      e.currentTarget.value = "";
      num5 = -1;
    }
    else if (chosen > 49) {
      e.currentTarget.value = "";
      num5 = -1;
    }
    else {
      setBetNum5Result(chosen);
      num5 = chosen;
    }
  }
  function updateNum6(e: React.ChangeEvent<HTMLInputElement>): void {
    let chosen: number = parseInt(e.currentTarget.value);
    if (isNaN(chosen)) {
      e.currentTarget.value = "";
      num6 = -1;
    }
    else if (chosen > 49) {
      e.currentTarget.value = "";
      num6 = -1;
    }
    else {
      setBetNum6Result(chosen);
      num6 = chosen;
    }
  }
  function canBuy(): boolean { // Used for checking the buy condition
    let numcollection: number[] = [];
    if (num1 > 0) {
      numcollection.push(num1);
    }
    if (num2 > 0) {
      numcollection.push(num2);
    }
    if (num3 > 0) {
      numcollection.push(num3);
    }
    if (num4 > 0) {
      numcollection.push(num4);
    }
    if (num5 > 0) {
      numcollection.push(num5);
    }
    if (num6 > 0) {
      numcollection.push(num6);
    }
    if (numcollection.length !== 6) {
      return false;
    }

    for (let num of numcollection) {
      if (numcollection.filter(x => x === num).length > 1)
        return false;
    }
    return true;
  }

  function buyTicket(): void {
    if (wager <= 0) {
      dialogBoxCreate("You must wager something");
      return;
    }
    if (!canBuy()) {
      dialogBoxCreate("You must pick 6 unique numbers, between 1-49");
      return;
    }
    if (Player.lotteryTickets.length >= LotteryConstants.MaxTickets) {
      dialogBoxCreate("You cannot hold any more tickets.");
      return;
    }
   

    let numarray: number[] = [];
    numarray.push(num1);
    numarray.push(num2);
    numarray.push(num3);
    numarray.push(num4);
    numarray.push(num5);
    numarray.push(num6);
    let option = GameOptions.None;

   
    let betrecord = new TicketRecord(
      GameType.L649,
      numarray,
      wager,
      option,
    )
    Player.loseMoney(wager, "lottery");
    Player.lotteryTickets.push(betrecord)

    const PurchaseToast = (
      <>
        Purchased a ticket! Type:{betrecord.Type}  Bet:{betrecord.Wager}  Numbers:{numarray[0]},{numarray[1]},{numarray[2]},{numarray[3]},{numarray[4]},{numarray[5]},{numarray[6]}  Options:{betrecord.Option}
      </>
    );
    SnackbarEvents.emit(PurchaseToast, ToastVariant.INFO, 2000);
    resetBet();
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
    

    let numarray: number[] = [];
    let z = -1;
    num1 = getRandomInt(1, 49);
    z = num1;
    numarray.push(num1);
    while (numarray.includes(z)) {
      z = getRandomInt(1, 49);
    }
    num2 = z;
    numarray.push(num2);
    while (numarray.includes(z)) {
      z = getRandomInt(1, 49);
    }
    num3 = z;
    numarray.push(num3);
    while (numarray.includes(z)) {
      z = getRandomInt(1, 49);
    }
    num4 = z;
    numarray.push(num4);
    while (numarray.includes(z)) {
      z = getRandomInt(1, 49);
    }
    num5 = z;
    numarray.push(num5);
    while (numarray.includes(z)) {
      z = getRandomInt(1, 49);
    }
    num6 = z;
    numarray.push(num6);

    let option = GameOptions.None;

    let betrecord = new TicketRecord(
      GameType.L649,
      numarray,
      wager,
      option,
    )
    Player.loseMoney(wager, "lottery");
    Player.lotteryTickets.push(betrecord)

    const PurchaseToast = (
      <>
        Purchased a ticket! Type:{betrecord.Type}  Bet:{betrecord.Wager}  Numbers:{numarray[0]},{numarray[1]},{numarray[2]},{numarray[3]},{numarray[4]},{numarray[5]},{numarray[6]}  Options:{betrecord.Option}
      </>
    );
    SnackbarEvents.emit(PurchaseToast, ToastVariant.INFO, 2000);
    resetBet();
  }
  
 
  return (
    <>
      <Typography>Lotto 6/49</Typography>
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
      <Box display="flex" alignItems="center">
      <Typography>1st:</Typography>
        <TextField
          type="number"
          name="betnum"
          style={{
            width: "50px",
          }}
          onChange={updateNum1}
          placeholder={String(num1)}
        />
        <Typography>&nbsp;2nd:</Typography>
          <TextField
          type="number"
          name="betnum"
            style={{
              width: "50px",
            }}
            onChange={updateNum2}
            placeholder={String(num2)}
        />
        <Typography>&nbsp;3rd:</Typography>
          <TextField
          type="number"
          name="betnum"
            style={{
              width: "50px",
            }}
            onChange={updateNum3}
            placeholder={String(num3)}
        />
        <Typography>&nbsp;4th:</Typography>
          <TextField
          type="number"
          name="betnum"
            style={{
              width: "50px",
            }}
            onChange={updateNum4}
            placeholder={String(num4)}
        />
        <Typography>&nbsp;5th:</Typography>
          <TextField
          type="number"
          name="betnum"
            style={{
              width: "50px",
            }}
            onChange={updateNum5}
            placeholder={String(num5)}
        />
        <Typography>&nbsp;6th:</Typography>
          <TextField
          type="number"
          name="betnum"
            style={{
              width: "50px",
            }}
            onChange={updateNum6}
            placeholder={String(num6)}
          />
      </Box>
      <br />
      <br />
      <Button onClick={() => buyTicket()}>Buy ticket</Button>, <Button onClick={() => buyRandomTicket()}>Buy random ticket</Button>
    </>
  );
 
}
