import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Router } from "../ui/GameRoot";
import { Page } from "../ui/Router";
import { LottoBadRNG } from "./RNG";
import { Player } from "@player";
import { Pick2 } from "./Pick2";
import { Pick3 } from "./Pick3";
import { Pick4 } from "./Pick4";
import { L649 } from "./L649";
import { Keno } from "./Keno";
import { CashIn } from "./CashIn";
import { LotteryConstants } from "./data/LotteryConstants"
import { Box } from "@mui/material";
import { dialogBoxCreate } from "../ui/React/DialogBox";

let hasicecream = false;

export enum GameType {
  None = "none",
  L649 = "lotto 6/49",
  Pick2 = "pick 2",
  Pick3 = "pick 3",
  Pick4 = "pick 4",
  Keno = "keno",
  CashIn = "cash in"
}

export enum GameOptions {
  None = "none",
  Straight = "straight",
  Box = "box",
  StraightBox = "straightbox",
}

export class TicketRecord {
  Type: string = "unknown";
  Numbers: number[] = [];
  Wager: number = 0;
  Option: GameOptions;

  constructor(Type: string, Numbers: number[], Wager: number, Option: GameOptions) {
    //super(props);
    this.Type = Type;
    this.Numbers = Numbers;
    this.Wager = Wager;
    this.Option = Option;
  }
}

export function lottoTicketLimitReached(total: number): boolean {
  return total >= LotteryConstants.MaxTickets ? true : false;
}

export function IceCream(): boolean {
  return hasicecream;
}

export function LotteryStoreLocationInside(): React.ReactElement {
  const [game, setGame] = useState(GameType.None);
  function updateGame(game: GameType): void {
    setGame(game);
  }
  function buyIceCream(): void {
    hasicecream = true;
    let type = Math.floor((LottoBadRNG.random() * 5));
    switch(type) {
      case 0: dialogBoxCreate("Here you go, a scoop of Vanilla!");
        break;
      case 1: dialogBoxCreate("Here you go, a scoop of Chocolate!");
        break;
      case 2: dialogBoxCreate("Here you go, a scoop of Tiger Tiger!");
        break;
      case 3: dialogBoxCreate("Here you go, a scoop of Chocolate Mint!");
        break;
      case 4: dialogBoxCreate("Here you go, a scoop of Cherry Swirl!");
        break;
    }
  }

  if (Player.getLotteryWinnings() >= LotteryConstants.GainLimits) {
    return (
      <>
        <Box sx={{ display: "grid", width: "fit-content" }}>
          <Button onClick={() => Router.toPage(Page.City)}>Return to City</Button>
          <br />
          <Typography>The store clerk in on the phone with the lottery commission.</Typography>
          <br />
          <br />
          <Typography>"What do you mean the lottery is canceled until further notice??"</Typography>
          <br />
          <Typography>"I'm sorry ma'am, but there's been a glitch in our systems.  We have to close down for now."</Typography>
          <br />
          <Typography>"What will I do for my lottery customers then?"</Typography>
          <br />
          <Typography>"Don't you sell other things?"</Typography>
          <br />
          <br />
          <Typography>"Puts down the phone, smiles at you and asks "Would you like some Ice Cream dear?  It's on the house!"</Typography>
          <Button onClick={() => buyIceCream()}>Buy Ice cream</Button>
        </Box>
      </>
    );
  }
  else {
    return (
      <>
        {game === GameType.None && (
          <Box sx={{ display: "grid", width: "fit-content" }}>
            <Button onClick={() => Router.toPage(Page.City)}>Back To City</Button>
            <br />
            <Typography>Choose your game</Typography>
            <Button onClick={() => updateGame(GameType.L649)}>Play lotto 6/49</Button>
            <Button onClick={() => updateGame(GameType.Keno)}>Play lotto keno</Button>
            <Button onClick={() => updateGame(GameType.Pick2)}>Play pick 2</Button>
            <Button onClick={() => updateGame(GameType.Pick3)}>Play pick 3</Button>
            <Button onClick={() => updateGame(GameType.Pick4)}>Play pick 4</Button>
            <br />
            <br />
            <Button disabled={Player.lotteryTickets.length === 0} onClick={() => updateGame(GameType.CashIn)}>Cash In Tickets</Button>
            <br /><br />
            <Typography>Tickets#  6/46:{Player.lotteryTickets.filter(x => x.Type === GameType.L649).length},
              Keno:{Player.lotteryTickets.filter(x => x.Type === GameType.Keno).length},
              Pick2:{Player.lotteryTickets.filter(x => x.Type === GameType.Pick2).length},
              Pick3:{Player.lotteryTickets.filter(x => x.Type === GameType.Pick3).length},
              Pick4:{Player.lotteryTickets.filter(x => x.Type === GameType.Pick4).length}</Typography>
          </Box>
        )}
        {game !== GameType.None && (
          <>
            <Button onClick={() => updateGame(GameType.None)}>Stop playing</Button>
            {game === GameType.L649 && <L649 />}
            {game === GameType.Keno && <Keno />}
            {game === GameType.Pick2 && <Pick2 />}
            {game === GameType.Pick3 && <Pick3 />}
            {game === GameType.Pick4 && <Pick4 />}
            {game === GameType.CashIn && <CashIn />}
          </>
        )}
      </>
    );
  }
}
