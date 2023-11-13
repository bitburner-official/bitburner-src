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
let numstobet = 10;
let num1 = -1;
let num2 = -1;
let num3 = -1;
let num4 = -1;
let num5 = -1;
let num6 = -1;
let num7 = -1;
let num8 = -1;
let num9 = -1;
let num10 = -1;

export function Keno(): React.ReactElement {
  const [, setBet] = useState(1000);
  const [, setNumsToBet] = useState(1000);
  const [, setBetNum1Result] = useState(1000);
  const [, setBetNum2Result] = useState(1000);
  const [, setBetNum3Result] = useState(1000);
  const [, setBetNum4Result] = useState(1000);
  const [, setBetNum5Result] = useState(1000);
  const [, setBetNum6Result] = useState(1000);
  const [, setBetNum7Result] = useState(1000);
  const [, setBetNum8Result] = useState(1000);
  const [, setBetNum9Result] = useState(1000);
  const [, setBetNum10Result] = useState(1000);

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
  function updateNumsToBet(e: React.ChangeEvent<HTMLInputElement>): void {
    let numstouse: number = parseInt(e.currentTarget.value);
    if (isNaN(numstouse)) {
      numstouse = -1;
    }
    if (numstouse > 10) {
      numstouse = 10;
    }
    if (numstouse < 1) {
      numstouse = -1;
    }
    setNumsToBet(numstouse);
    numstobet = numstouse;
    e.currentTarget.value = numstouse > 0 ? numstouse.toString() : "";
  }
  function updateNum1(e: React.ChangeEvent<HTMLInputElement>): void {
    const chosen: number = parseInt(e.currentTarget.value);
    if (isNaN(chosen)) {
      e.currentTarget.value = "";
      num1 = -1;
    } else if (chosen > 49) {
      e.currentTarget.value = "";
      num1 = -1;
    } else {
      setBetNum1Result(chosen);
      num1 = chosen;
    }
  }
  function updateNum2(e: React.ChangeEvent<HTMLInputElement>): void {
    const chosen: number = parseInt(e.currentTarget.value);
    if (isNaN(chosen)) {
      e.currentTarget.value = "";
      num2 = -1;
    } else if (chosen > 49) {
      e.currentTarget.value = "";
      num2 = -1;
    } else {
      setBetNum2Result(chosen);
      num2 = chosen;
    }
  }
  function updateNum3(e: React.ChangeEvent<HTMLInputElement>): void {
    const chosen: number = parseInt(e.currentTarget.value);
    if (isNaN(chosen)) {
      e.currentTarget.value = "";
      num3 = -1;
    } else if (chosen > 49) {
      e.currentTarget.value = "";
      num3 = -1;
    } else {
      setBetNum3Result(chosen);
      num3 = chosen;
    }
  }
  function updateNum4(e: React.ChangeEvent<HTMLInputElement>): void {
    const chosen: number = parseInt(e.currentTarget.value);
    if (isNaN(chosen)) {
      e.currentTarget.value = "";
      num4 = -1;
    } else if (chosen > 49) {
      e.currentTarget.value = "";
      num4 = -1;
    } else {
      setBetNum4Result(chosen);
      num4 = chosen;
    }
  }
  function updateNum5(e: React.ChangeEvent<HTMLInputElement>): void {
    const chosen: number = parseInt(e.currentTarget.value);
    if (isNaN(chosen)) {
      e.currentTarget.value = "";
      num5 = -1;
    } else if (chosen > 49) {
      e.currentTarget.value = "";
      num5 = -1;
    } else {
      setBetNum5Result(chosen);
      num5 = chosen;
    }
  }
  function updateNum6(e: React.ChangeEvent<HTMLInputElement>): void {
    const chosen: number = parseInt(e.currentTarget.value);
    if (isNaN(chosen)) {
      e.currentTarget.value = "";
      num6 = -1;
    } else if (chosen > 49) {
      e.currentTarget.value = "";
      num6 = -1;
    } else {
      setBetNum6Result(chosen);
      num6 = chosen;
    }
  }
  function updateNum7(e: React.ChangeEvent<HTMLInputElement>): void {
    const chosen: number = parseInt(e.currentTarget.value);
    if (isNaN(chosen)) {
      e.currentTarget.value = "";
      num7 = -1;
    } else if (chosen > 49) {
      e.currentTarget.value = "";
      num7 = -1;
    } else {
      setBetNum7Result(chosen);
      num7 = chosen;
    }
  }
  function updateNum8(e: React.ChangeEvent<HTMLInputElement>): void {
    const chosen: number = parseInt(e.currentTarget.value);
    if (isNaN(chosen)) {
      e.currentTarget.value = "";
      num8 = -1;
    } else if (chosen > 49) {
      e.currentTarget.value = "";
      num8 = -1;
    } else {
      setBetNum8Result(chosen);
      num8 = chosen;
    }
  }
  function updateNum9(e: React.ChangeEvent<HTMLInputElement>): void {
    const chosen: number = parseInt(e.currentTarget.value);
    if (isNaN(chosen)) {
      e.currentTarget.value = "";
      num9 = -1;
    } else if (chosen > 49) {
      e.currentTarget.value = "";
      num9 = -1;
    } else {
      setBetNum9Result(chosen);
      num9 = chosen;
    }
  }
  function updateNum10(e: React.ChangeEvent<HTMLInputElement>): void {
    const chosen: number = parseInt(e.currentTarget.value);
    if (isNaN(chosen)) {
      e.currentTarget.value = "";
      num10 = -1;
    } else if (chosen > 49) {
      e.currentTarget.value = "";
      num10 = -1;
    } else {
      setBetNum10Result(chosen);
      num10 = chosen;
    }
  }
  function canBuy(): boolean {
    // Used for checking the buy condition
    const numcollection: number[] = [];
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
    if (num7 > 0) {
      numcollection.push(num7);
    }
    if (num8 > 0) {
      numcollection.push(num8);
    }
    if (num9 > 0) {
      numcollection.push(num9);
    }
    if (num10 > 0) {
      numcollection.push(num10);
    }
    if (numcollection.length !== numstobet) {
      return false;
    }
    for (const num of numcollection) {
      if (numcollection.filter((x) => x === num).length > 1) return false;
    }
    return true;
  }
  function numsSelected(): number {
    // Used for checking the buy condition
    const numcollection: number[] = [];
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
    if (num7 > 0) {
      numcollection.push(num7);
    }
    if (num8 > 0) {
      numcollection.push(num8);
    }
    if (num9 > 0) {
      numcollection.push(num9);
    }
    if (num10 > 0) {
      numcollection.push(num10);
    }

    return numcollection.length;
  }
  function buyTicket(): void {
    if (wager <= 0) {
      dialogBoxCreate("You must wager something");
      return;
    }
    if (numsSelected() < numstobet) {
      dialogBoxCreate("Incorrect number of numbers selected.  Set a number to 0, -1 to unselect that space.");
      return;
    }
    if (numstobet < 0) {
      dialogBoxCreate("You must bet on at least 1 number");
      return;
    }
    if (!canBuy()) {
      dialogBoxCreate("You must select your numbers correctly");
      return;
    }
    if (Player.lotteryTickets.length >= LotteryConstants.MaxTickets) {
      dialogBoxCreate("You cannot hold any more tickets.");
      return;
    }

    const numarray: number[] = [];
    if (num1 > 0) numarray.push(num1);
    if (num2 > 0) numarray.push(num2);
    if (num3 > 0) numarray.push(num3);
    if (num4 > 0) numarray.push(num4);
    if (num5 > 0) numarray.push(num5);
    if (num6 > 0) numarray.push(num6);
    if (num7 > 0) numarray.push(num7);
    if (num8 > 0) numarray.push(num8);
    if (num9 > 0) numarray.push(num9);
    if (num10 > 0) numarray.push(num10);
    const option = GameOptions.None;

    const betrecord = new TicketRecord(GameType.Keno, numarray, wager, option);
    Player.loseMoney(wager, "lottery");
    Player.lotteryTickets.push(betrecord);
    let numberstring = String(numarray[0]);
    for (let nums = 1; nums < numarray.length; nums++) {
      numberstring = numberstring + ", " + numarray[nums];
    }

    const PurchaseToast = (
      <>
        Purchased a ticket! Type:{betrecord.Type} Bet:{betrecord.Wager} Numbers:{numberstring} Options:
        {betrecord.Option}
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
    if (numstobet < 0) {
      dialogBoxCreate("You must bet on at least 1 number");
      return;
    }

    const numarray: number[] = [];
    let z = -1;
    num1 = getRandomInt(1, 49);
    z = num1;
    numarray.push(num1);
    if (numstobet > 1) {
      while (numarray.includes(z)) {
        z = getRandomInt(1, 49);
      }
      num2 = z;
      numarray.push(num2);
    }
    if (numstobet > 2) {
      while (numarray.includes(z)) {
        z = getRandomInt(1, 49);
      }
      num3 = z;
      numarray.push(num3);
    }
    if (numstobet > 3) {
      while (numarray.includes(z)) {
        z = getRandomInt(1, 49);
      }
      num4 = z;
      numarray.push(num4);
    }
    if (numstobet > 4) {
      while (numarray.includes(z)) {
        z = getRandomInt(1, 49);
      }
      num5 = z;
      numarray.push(num5);
    }
    if (numstobet > 5) {
      while (numarray.includes(z)) {
        z = getRandomInt(1, 49);
      }
      num6 = z;
      numarray.push(num6);
    }
    if (numstobet > 6) {
      while (numarray.includes(z)) {
        z = getRandomInt(1, 49);
      }
      num7 = z;
      numarray.push(num7);
    }
    if (numstobet > 7) {
      while (numarray.includes(z)) {
        z = getRandomInt(1, 49);
      }
      num8 = z;
      numarray.push(num8);
    }
    if (numstobet > 8) {
      while (numarray.includes(z)) {
        z = getRandomInt(1, 49);
      }
      num9 = z;
      numarray.push(num9);
    }
    if (numstobet > 9) {
      while (numarray.includes(z)) {
        z = getRandomInt(1, 49);
      }
      num10 = z;
      numarray.push(num10);
    }
    const option = GameOptions.None;

    const betrecord = new TicketRecord(GameType.Keno, numarray, wager, option);
    Player.loseMoney(wager, "lottery");
    Player.lotteryTickets.push(betrecord);

    let numberstring = String(numarray[0]);
    for (let nums = 1; nums < numarray.length; nums++) {
      numberstring = numberstring + ", " + numarray[nums];
    }

    const PurchaseToast = (
      <>
        Purchased a ticket! Type:{betrecord.Type} Bet:{betrecord.Wager} Numbers:{numberstring} Options:
        {betrecord.Option}
      </>
    );
    SnackbarEvents.emit(PurchaseToast, ToastVariant.INFO, 2000);
    resetBet();
  }

  function resetBet(): void {
    setBetNum1Result(-1);
    setBetNum2Result(-1);
    setBetNum3Result(-1);
    setBetNum4Result(-1);
    setBetNum5Result(-1);
    setBetNum6Result(-1);
    setBetNum7Result(-1);
    setBetNum8Result(-1);
    setBetNum9Result(-1);
    setBetNum10Result(-1);
    num1 = -1;
    num2 = -1;
    num3 = -1;
    num4 = -1;
    num5 = -1;
    num6 = -1;
    num7 = -1;
    num8 = -1;
    num9 = -1;
    num10 = -1;
    const elems = document.getElementsByTagName("input");
    for (const elem of elems) {
      if (elem.name === "betnum") {
        elem.value = "";
      }
    }
  }
  function showOdds(): void {
    dialogBoxCreate(
      "Lotto Keno Winnings.\n" +
        "Based on a $1 bet\n\n" +
        "Chart shows #'s picked / #'s matched\n" +
        "1/1:  $2  5/5:   $400  7/7: $5,000  8/8: $10,000  9/9: $25,000  10/10: $100,000\n" +
        "2/2: $10  5/4:    $15  7/6:   $100  8/7:    $400  9/8:  $2,500  10/9 :   $5,000\n" +
        "3/3: $30  5/3:     $2  7/5:    $15  8/6:     $50  9/7:    $200  10/8 :     $500\n" +
        "3/2:  $2  6/6: $1,500  7/4:     $2  8/5:     $10  9/6:     $25  10/7 :      $50\n" +
        "4/4: $50  6/5:    $50  7/3:     $1  8/4:      $2  9/5:      $4  10/6 :      $10\n" +
        "4/3:  $5  6/4:     $5                             9/4:      $1  10/5 :       $3\n" +
        "4/2:  $1  6/3:     $1                                           10/0 :       $1",
    );
  }

  return (
    <>
      <Typography>Lotto Keno</Typography>
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
      <Typography> </Typography>
      <Box display="flex" alignItems="center">
        <TextField
          type="number"
          style={{
            width: "100px",
          }}
          onChange={updateNumsToBet}
          placeholder={String(numstobet)}
        />
        <Typography>#'s to bet on - up to 10</Typography>
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
        />
        <Typography>&nbsp;2nd:</Typography>
        <TextField
          type="number"
          name="betnum"
          style={{
            width: "50px",
          }}
          onChange={updateNum2}
        />
        <Typography>&nbsp;3rd:</Typography>
        <TextField
          type="number"
          name="betnum"
          style={{
            width: "50px",
          }}
          onChange={updateNum3}
        />
        <Typography>&nbsp;4th:</Typography>
        <TextField
          type="number"
          name="betnum"
          style={{
            width: "50px",
          }}
          onChange={updateNum4}
        />
        <Typography>&nbsp;5th:</Typography>
        <TextField
          type="number"
          name="betnum"
          style={{
            width: "50px",
          }}
          onChange={updateNum5}
        />
      </Box>
      <Box display="flex" alignItems="center">
        <Typography>6th:</Typography>
        <TextField
          type="number"
          name="betnum"
          style={{
            width: "50px",
          }}
          onChange={updateNum6}
        />
        <Typography>&nbsp;7th:</Typography>
        <TextField
          type="number"
          name="betnum"
          style={{
            width: "50px",
          }}
          onChange={updateNum7}
        />
        <Typography>&nbsp;8th:</Typography>
        <TextField
          type="number"
          name="betnum"
          style={{
            width: "50px",
          }}
          onChange={updateNum8}
        />
        <Typography>&nbsp;9th:</Typography>
        <TextField
          type="number"
          name="betnum"
          style={{
            width: "50px",
          }}
          onChange={updateNum9}
        />
        <Typography>&nbsp;10th:</Typography>
        <TextField
          type="number"
          name="betnum"
          style={{
            width: "50px",
          }}
          onChange={updateNum10}
        />
      </Box>
      <br />
      <br />
      <Button onClick={() => buyTicket()}>Buy ticket</Button>,{" "}
      <Button onClick={() => buyRandomTicket()}>Buy random ticket</Button>
      <Box display="-ms-grid" alignItems="left" whiteSpace="pre">
        <Typography>----------------------------</Typography>
        <br />
        <Typography>Rules:</Typography>
        <br />
        <Typography>Pick between 1 and 10 unique numbers, between 1 and 80.</Typography>
        <Typography>Draw is for 20 numbers.</Typography>
        <Button onClick={() => showOdds()}>Show Winnings Chart</Button>
      </Box>
    </>
  );
}
