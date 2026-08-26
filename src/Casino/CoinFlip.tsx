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
  Head = "正面",
  Tail = "反面",
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
        <Typography component="span">结果：</Typography>
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
    setStatus(correct ? " 赢了！" : "输了！");
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
            正面！
          </Button>
          <Button onClick={trusted(() => play(CoinFlipResult.Tail))} disabled={playLock}>
            反面！
          </Button>
        </Box>
      </Box>
      {result}
      <Typography variant="h4">{status}</Typography>
    </>
  );
}
