import { Box, Paper, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AugmentationName } from "@enums";
import { Player } from "@player";
import { KEY } from "../../utils/KeyboardEventKey";
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
  Brutal: Difficulty;
} = {
  Trivial: { window: 800 },
  Normal: { window: 500 },
  Hard: { window: 350 },
  Brutal: { window: 250 },
};

export function SlashGame({ difficulty, onSuccess, onFailure }: IMinigameProps): React.ReactElement {
  const [phase, setPhase] = useState(0);
  const timeOutId = useRef<number | ReturnType<typeof setTimeout>>(-1);
  const hasWKSharmonizer = Player.hasAugmentation(AugmentationName.WKSharmonizer, true);
  const hasMightOfAres = Player.hasAugmentation(AugmentationName.MightOfAres, true);

  const data = useMemo(() => {
    // Determine time window of phases
    const newDifficulty: Difficulty = { window: 0 };
    interpolate(difficulties, difficulty, newDifficulty);
    const distractedTime = newDifficulty.window * (hasWKSharmonizer ? 1.3 : 1);
    const alertedTime = 250;
    const guardingTime = Math.random() * 3250 + 1500 - (distractedTime + alertedTime);

    return {
      hasAugment: hasMightOfAres,
      guardingTime,
      distractedTime,
      alertedTime,
    };
  }, [difficulty, hasWKSharmonizer, hasMightOfAres]);

  useEffect(() => {
    return () => {
      if (timeOutId.current !== -1) {
        clearTimeout(timeOutId.current);
      }
    };
  }, []);

  const startPhase1 = useCallback(
    (alertedTime: number, distractedTime: number) => {
      setPhase(1);
      timeOutId.current = setTimeout(() => {
        setPhase(2);
        timeOutId.current = setTimeout(() => onFailure(), alertedTime);
      }, distractedTime);
    },
    [onFailure],
  );

  useEffect(() => {
    // Start the timer if the player does not have MightOfAres augmentation.
    if (phase === 0 && !data.hasAugment) {
      timeOutId.current = setTimeout(() => {
        startPhase1(data.alertedTime, data.distractedTime);
      }, data.guardingTime);
    }
  }, [phase, data, startPhase1]);

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
        {phase === 0 && data.hasAugment && (
          <Box sx={{ my: 1 }}>
            <Typography variant="h5">The sentinel will drop his guard and be distracted in ...</Typography>
            <GameTimer
              millis={data.guardingTime}
              onExpire={() => {
                startPhase1(data.alertedTime, data.distractedTime);
              }}
              ignoreAugment_WKSharmonizer
              noPaper
              tick={20}
            />
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
