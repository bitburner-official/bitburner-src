import React, { useState } from "react";

import { hasEnoughMoney, reachedLimit, win } from "./Game";
import { BadRNG } from "./RNG";
import { trusted } from "./utils";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { BetInput } from "./BetInput";

const initialBet = 1000;
const maxBet = 10e3;

enum CoinFlipResult {
  Head = "Head",
  Tail = "Tail",
}

export function CoinFlip(): React.ReactElement {
  const [investment, setInvestment] = useState(initialBet);
  const [result, setResult] = useState(<span></span>);
  const [status, setStatus] = useState("");
  const [playLock, setPlayLock] = useState(false);

  function play(guess: CoinFlipResult): void {
    if (reachedLimit() || !hasEnoughMoney(investment)) {
      return;
    }
    const v = BadRNG.random();
    let letter: CoinFlipResult;
    if (v < 0.5) {
      letter = CoinFlipResult.Head;
    } else {
      letter = CoinFlipResult.Tail;
    }
    const correct = guess === letter;

    setResult(
      <div>
        <Typography component="span">Result:</Typography>
        <Typography
          component="span"
          sx={{ lineHeight: "1em", whiteSpace: "pre" }}
          color={correct ? "primary" : "error"}
        >
          {letter}
        </Typography>
        ,
      </div>,
    );
    setStatus(correct ? " win!" : "lose!");
    setPlayLock(true);

    setTimeout(() => setPlayLock(false), 250);
    if (correct) {
      win(investment);
    } else {
      win(-investment);
    }
  }

  return (
    <>
      <Box>
        <BetInput
          initialBet={initialBet}
          maxBet={maxBet}
          gameInProgress={playLock}
          setBet={(bet) => {
            setInvestment(bet);
          }}
        />
        <Box>
          <Button onClick={trusted(() => play(CoinFlipResult.Head))} disabled={playLock}>
            Head!
          </Button>
          <Button onClick={trusted(() => play(CoinFlipResult.Tail))} disabled={playLock}>
            Tail!
          </Button>
        </Box>
      </Box>
      {result}
      <Typography variant="h4">{status}</Typography>
    </>
  );
}
