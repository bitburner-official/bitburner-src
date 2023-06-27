import { Box, Paper, Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
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
  Trivial: { window: 600 },
  Normal: { window: 325 },
  Hard: { window: 250 },
  Impossible: { window: 150 },
};

export function SlashGame({ difficulty, onSuccess, onFailure }: IMinigameProps): React.ReactElement {
  const timingWindow = useMemo(() => {
    const out: Difficulty = { window: 0 };
    interpolate(difficulties, difficulty, out);
    return out.window;
  }, [difficulty]);

  const guardingTime = useMemo(() => Math.random() * 3250 + 1500 - (250 + timingWindow), [timingWindow]);
  const hasAugment = useMemo(() => Player.hasAugmentation(AugmentationName.MightOfAres, true), []);

  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const preparingTime = timingWindow;
    const attackingTime = 250;

    let id = setTimeout(() => {
      setPhase(1);
      id = setTimeout(() => {
        setPhase(2);
        id = setTimeout(() => onFailure(), attackingTime);
      }, preparingTime);
    }, guardingTime);

    return () => {
      clearInterval(id);
    };
  }, [timingWindow, onFailure, guardingTime]);

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
      <GameTimer millis={5000} onExpire={onFailure} />
      <Paper sx={{ display: "grid", justifyItems: "center" }}>
        <Typography variant="h4">Attack when his guard is down!</Typography>

        {hasAugment ? (
          <Box sx={{ my: 1 }}>
            <Typography variant="h5">Guard will drop in...</Typography>
            <GameTimer millis={guardingTime} onExpire={() => null} ignoreAugment_WKSharmonizer noPaper />
          </Box>
        ) : (
          <></>
        )}

        {phase === 0 && <Typography variant="h4">Guarding ...</Typography>}
        {phase === 1 && <Typography variant="h4">Preparing?</Typography>}
        {phase === 2 && <Typography variant="h4">ATTACKING!</Typography>}
        <KeyHandler onKeyDown={press} onFailure={onFailure} />
      </Paper>
    </>
  );
}
