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

export function Pick4(): React.ReactElement {
  const [wager, setWager] = useState(-1);
  const [numbers, setBetNumberResult] = useState(-1);
  const [option, setOption] = useState(GameOptions.None);
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
    setWager(bet);
    e.currentTarget.value = bet > 0 ? bet.toString() : "";
  }
  function updateNumbersPick4(e: React.ChangeEvent<HTMLInputElement>): void {
    const chosen: number = parseInt(e.currentTarget.value);
    if (isNaN(chosen)) {
      e.currentTarget.value = "";
      setBetNumberResult(-1);
    } else if (e.currentTarget.value.length > 4) {
      e.currentTarget.value = "";
      setBetNumberResult(-1);
    } else {
      setBetNumberResult(chosen);
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
    if (option === GameOptions.None || (option !== GameOptions.Straight && option !== GameOptions.Box)) {
      dialogBoxCreate("No Game Option selected");
      return;
    }
    if (option === GameOptions.Box && !canBuyBox(numbers)) {
      dialogBoxCreate("Invalid numbers selected for a Box bet");
      return;
    }
    const numstring = String(numbers);
    const numarray: number[] = [];
    if (numstring.length === 0) {
      numarray.push(0);
      numarray.push(0);
      numarray.push(0);
      numarray.push(0);
    } else if (numstring.length === 1) {
      numarray.push(0);
      numarray.push(0);
      numarray.push(0);
    } else if (numstring.length === 2) {
      numarray.push(0);
      numarray.push(0);
    } else if (numstring.length === 3) {
      numarray.push(0);
    }
    for (let i = 0; i < numstring.length; i++) {
      numarray.push(parseInt(numstring[i]));
    }
    const betrecord = new TicketRecord(GameType.Pick4, numarray, wager, option);
    Player.loseMoney(wager, "lottery");
    Player.lotteryTickets.push(betrecord);

    const PurchaseToast = (
      <>
        Purchased a ticket! Type:{betrecord.Type} Bet:{betrecord.Wager} Numbers:{numarray[0]},{numarray[1]},
        {numarray[2]},{numarray[3]} Options:{betrecord.Option}
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
    let nums = getRandomInt(0, 9999);

    if (option === GameOptions.Box || option === GameOptions.StraightBox) {
      while (!canBuyBox(nums)) {
        nums = getRandomInt(0, 9999);
      }
    } else {
      nums = getRandomInt(0, 9999);
    }

    const numstring = String(nums);
    const numarray = [];
    if (numstring.length === 0) {
      numarray.push(0);
      numarray.push(0);
      numarray.push(0);
      numarray.push(0);
    } else if (numstring.length === 1) {
      numarray.push(0);
      numarray.push(0);
      numarray.push(0);
    } else if (numstring.length === 2) {
      numarray.push(0);
      numarray.push(0);
    } else if (numstring.length === 3) {
      numarray.push(0);
    }
    for (let i = 0; i < numstring.length; i++) {
      numarray.push(parseInt(numstring[i]));
    }
    const betrecord = new TicketRecord(GameType.Pick4, numarray, wager, option);
    Player.loseMoney(wager, "lottery");
    Player.lotteryTickets.push(betrecord);

    const PurchaseToast = (
      <>
        Purchased a ticket! Type:{betrecord.Type} Bet:{betrecord.Wager} Numbers:{numarray[0]},{numarray[1]},
        {numarray[2]},{numarray[3]} Options:{betrecord.Option}
      </>
    );
    SnackbarEvents.emit(PurchaseToast, ToastVariant.INFO, 2000);
    setBetNumberResult(nums);
  }

  function canBuyBox(nums: number): boolean {
    const numstring = String(nums);
    const numarray: number[] = [];

    if (numstring.length === 0) {
      numarray.push(0);
      numarray.push(0);
      numarray.push(0);
      numarray.push(0);
    } else if (numstring.length === 1) {
      numarray.push(0);
      numarray.push(0);
      numarray.push(0);
    } else if (numstring.length === 2) {
      numarray.push(0);
      numarray.push(0);
    } else if (numstring.length === 3) {
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

    if (highest === 4) {
      return false;
    } else {
      return true;
    }
  }
  function updateOptionBox(e: React.ChangeEvent<HTMLInputElement>): void {
    if (e.currentTarget.checked) {
      setOption(GameOptions.Box);
    }
  }
  function updateOptionStraight(e: React.ChangeEvent<HTMLInputElement>): void {
    if (e.currentTarget.checked) {
      setOption(GameOptions.Straight);
    }
  }

  function showOdds(): void {
    dialogBoxCreate(
      "Pick 4 Winnings.\n" +
        "Based on a $1 bet\n" +
        "Straight : $5,000    12-way Box: $400\n" +
        "4-way Box: $1,250    24-way Box: $200\n" +
        "6-way Box: $800\n",
    );
  }

  return (
    <>
      <Typography>Pick 4</Typography>
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
          onChange={updateNumbersPick4}
          placeholder={String(numbers)}
        />
        <Typography>
          Numbers Chosen - 1, 2, 3 or 4 numbers. 1 will cause a leading 0. EX: 45 = 0045, 4 = 0004, Nothing is 0000
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
        <Typography>Pick 4 numbers, between 0 - 9.</Typography>
        <Typography>These will be paddded with leading 0's Ex: 1234, 456(0456) or even 0(0000)</Typography>
        <br />
        <Typography>Play Types:</Typography>
        <Typography>-----------</Typography>
        <Typography>-Straight: Requires that the numbers be in the correct order.</Typography>
        <Typography>-Box : Numbers can be in any order. Must have 2 unique numbers</Typography>
        <Button onClick={() => showOdds()}>Show Winnings Chart</Button>
      </Box>
    </>
  );
}
