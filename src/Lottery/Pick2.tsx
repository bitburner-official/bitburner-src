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

export function Pick2(): React.ReactElement {
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
  function updateNumbersPick2(e: React.ChangeEvent<HTMLInputElement>): void {
    const chosen: number = parseInt(e.currentTarget.value);
    if (isNaN(chosen)) {
      e.currentTarget.value = "";
      numbers = -1;
    } else if (e.currentTarget.value.length > 2) {
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
    if (Player.lotteryTickets.length >= LotteryConstants.MaxTickets) {
      dialogBoxCreate("You cannot hold any more tickets.");
      return;
    }
    const numstring = String(numbers);
    const numarray: number[] = [];
    if (numstring.length < 2) {
      numarray.push(0);
    }
    for (let i = 0; i < numstring.length; i++) {
      numarray.push(parseInt(numstring[i]));
    }
    const betrecord = new TicketRecord(GameType.Pick2, numarray, wager, GameOptions.Straight);
    Player.loseMoney(wager, "lottery");
    Player.lotteryTickets.push(betrecord);

    const PurchaseToast = (
      <>
        Purchased a ticket! Type:{betrecord.Type} Bet:{betrecord.Wager} Numbers:{numarray[0]},{numarray[1]} Options:
        {betrecord.Option}
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
    const numstring = String(getRandomInt(0, 99));
    const numarray = [];
    if (numstring.length < 2) {
      numarray.push(0);
    }
    for (let i = 0; i < numstring.length; i++) {
      numarray.push(parseInt(numstring[i]));
    }
    const betrecord = new TicketRecord(GameType.Pick2, numarray, wager, GameOptions.Straight);
    Player.loseMoney(wager, "lottery");
    Player.lotteryTickets.push(betrecord);

    const PurchaseToast = (
      <>
        Purchased a ticket! Type:{betrecord.Type} Bet:{betrecord.Wager} Numbers:{numarray[0]},{numarray[1]} Options:
        {betrecord.Option}
      </>
    );
    SnackbarEvents.emit(PurchaseToast, ToastVariant.INFO, 2000);
  }
  function showOdds(): void {
    dialogBoxCreate("Pick 2 Winnings.\n" + "Based on a $1 bet\n" + "Both Digits : $99\n" + "First Digit : $2");
  }

  return (
    <>
      <Typography>Pick 2</Typography>
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
          onChange={updateNumbersPick2}
          placeholder={String(numbers)}
        />
        <Typography>Numbers Chosen - 1 or 2 numbers. 1 will cause a leading 0. EX: 45 = 45, 4 = 04</Typography>
      </Box>
      <br />
      <Button disabled={wager <= 0} onClick={() => buyTicket()}>
        Buy ticket
      </Button>
      ,{" "}
      <Button disabled={wager <= 0} onClick={() => buyRandomTicket()}>
        Buy random ticket
      </Button>
      <Box display="-ms-grid" alignItems="left" whiteSpace="pre">
        <Typography>----------------------------</Typography>
        <br />
        <Typography>Rules:</Typography>
        <br />
        <Typography>Pick 2 numbers, between 0 - 9.</Typography>
        <Typography>This will be paddded with a leading 0 if single digit. Ex: 34, 0(00)</Typography>
        <br />
        <Typography>Play Types:</Typography>
        <Typography>-----------</Typography>
        <Typography>-Straight : Requires that the numbers be in the correct order.</Typography>
        <Button onClick={() => showOdds()}>Show Winnings Chart</Button>
      </Box>
    </>
  );
}
