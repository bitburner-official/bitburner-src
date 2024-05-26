import { Box, Paper, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { AugmentationName } from "@enums";
import { Player } from "@player";
import { KEY } from "../../utils/helpers/keyCodes";
import { interpolate } from "./Difficulty";
import { GameTimer } from "./GameTimer";
import { IMinigameProps } from "./IMinigameProps";
import { KeyHandler } from "./KeyHandler";

interface Difficulty {
  [key: string]: number;
  window: number;
}

const difficulties: {
  Trivial: Difficulty;
  Normal: Difficulty;
  Hard: Difficulty;
  Impossible: Difficulty;
} = {
  Trivial: { window: 800 },
  Normal: { window: 500 },
  Hard: { window: 350 },
  Impossible: { window: 250 },
};

export function SlashGame({ difficulty, onSuccess, onFailure }: IMinigameProps): React.ReactElement {
  const [phase, setPhase] = useState(0);
  const [hasAugment, setHasAugment] = useState(false);
  const [guardingTime, setGuardingTime] = useState(0);

  useEffect(() => {
    // Determine timeframes for game phase changes
    const newDifficulty: Difficulty = { window: 0 };
    interpolate(difficulties, difficulty, newDifficulty);
    const distractedTime =
      newDifficulty.window * (Player.hasAugmentation(AugmentationName.WKSharmonizer, true) ? 1.3 : 1);
    const alertedTime = 250;
    const guardingTime = Math.random() * 3250 + 1500 - (distractedTime + alertedTime);

    // Set initial game state
    setPhase(0);
    setGuardingTime(guardingTime);
    setHasAugment(Player.hasAugmentation(AugmentationName.MightOfAres, true));

    // Setup timer for game phases
    let id = setTimeout(() => {
      setPhase(1);
      id = setTimeout(() => {
        setPhase(2);
        id = setTimeout(() => onFailure(), alertedTime);
      }, distractedTime);
    }, guardingTime);

    return () => clearTimeout(id);
  }, [difficulty, onSuccess, onFailure]);

  function press(this: Document, event: KeyboardEvent): void {
    event.preventDefault();
    if (event.key !== KEY.SPACE) return;
    if (phase !== 1) {
      onFailure();
    } else {
      onSuccess();
    }
  }

  return (
    <>
      <GameTimer millis={5000} onExpire={onFailure} ignoreAugment_WKSharmonizer />
      <Paper sx={{ display: "grid", justifyItems: "center" }}>
        <Typography variant="h5" textAlign="center">
          Attack after the sentinel drops his guard and is distracted.
          <br />
          Do not alert him!
        </Typography>
        <br />
        {hasAugment && (
          <Box sx={{ my: 1 }}>
            <Typography variant="h5">The sentinel will drop his guard and be distracted in ...</Typography>
            <GameTimer millis={guardingTime} onExpire={() => null} ignoreAugment_WKSharmonizer noPaper tick={20} />
            <br />
          </Box>
        )}

        {phase === 0 && <Typography variant="h4">Guarding ...</Typography>}
        {phase === 1 && <Typography variant="h4">Distracted!</Typography>}
        {phase === 2 && <Typography variant="h4">Alerted!</Typography>}
        <KeyHandler onKeyDown={press} onFailure={onFailure} />
      </Paper>
    </>
  );
}
