import React, { useState } from "react";
import Button from "@mui/material/Button";
import { Blackjack, DECK_COUNT } from "../../Casino/Blackjack";
import { CoinFlip } from "../../Casino/CoinFlip";
import { Roulette } from "../../Casino/Roulette";
import { SlotMachine } from "../../Casino/SlotMachine";
import { Box } from "@mui/material";

enum GameType {
  None = "none",
  Coin = "coin",
  Slots = "slots",
  Roulette = "roulette",
  Blackjack = "blackjack",
}

export function CasinoLocation(): React.ReactElement {
  const [game, setGame] = useState(GameType.None);

  function updateGame(game: GameType): void {
    setGame(game);
  }

  return (
    <>
      {game === GameType.None && (
        <Box sx={{ display: "grid", width: "fit-content" }}>
          <Button onClick={() => updateGame(GameType.Coin)}>玩掷硬币</Button>
          <Button onClick={() => updateGame(GameType.Slots)}>玩老虎机</Button>
          <Button onClick={() => updateGame(GameType.Roulette)}>玩轮盘</Button>
          <Button onClick={() => updateGame(GameType.Blackjack)}>玩二十一点（{DECK_COUNT} 副牌）</Button>
        </Box>
      )}
      {game !== GameType.None && (
        <>
          <Button onClick={() => updateGame(GameType.None)}>停止游玩</Button>
          {game === GameType.Coin && <CoinFlip />}
          {game === GameType.Slots && <SlotMachine />}
          {game === GameType.Roulette && <Roulette />}
          {game === GameType.Blackjack && <Blackjack />}
        </>
      )}
    </>
  );
}
