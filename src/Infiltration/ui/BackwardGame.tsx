import { Paper, Typography } from "@mui/material";
import React, { useState } from "react";
import { AugmentationName } from "@enums";
import { Player } from "@player";
import { KEY } from "../../utils/KeyboardEventKey";
import { BlinkingCursor } from "./BlinkingCursor";
import { interpolate } from "./Difficulty";
import { GameTimer } from "./GameTimer";
import { IMinigameProps } from "./IMinigameProps";
import { KeyHandler } from "./KeyHandler";
import { randomInRange } from "../../utils/helpers/randomInRange";
import { MaxDifficultyForInfiltration } from "../formulas/game";
import { words } from "../data";
import { stageState } from "../State";

interface Difficulty {
  [key: string]: number;
  timer: number;
  min: number;
  max: number;
}

const difficulties: {
  Trivial: Difficulty;
  Normal: Difficulty;
  Hard: Difficulty;
  Brutal: Difficulty;
} = {
  Trivial: { timer: 16000, min: 3, max: 4 },
  Normal: { timer: 12500, min: 2, max: 3 },
  Hard: { timer: 15000, min: 3, max: 4 },
  Brutal: { timer: 8000, min: 4, max: 4 },
};

export function BackwardGame(props: IMinigameProps): React.ReactElement {
  const difficulty: Difficulty = { timer: 0, min: 0, max: 0 };
  interpolate(difficulties, props.difficulty, difficulty);
  const timer = difficulty.timer;
  const [answer] = useState(makeAnswer(difficulty));
  const [guess, setGuess] = useState("");
  const hasAugment = Player.hasAugmentation(AugmentationName.ChaosOfDionysus, true);

  stageState.value = () => {
    const noise = props.difficulty < 1 || hasAugment ? 0 : (26 * props.difficulty) / MaxDifficultyForInfiltration;
    const offset = 26 * 3 - 65 + Math.round((Math.random() - 0.5) * noise);
    const charCodes = new Array<number>(answer.length);
    for (let i = 0; i < answer.length; ++i) {
      let c = answer.charCodeAt(i);
      if (c >= 65 && c < 91) {
        c = ((c + offset) % 26) + 65;
      }
      charCodes[i] = c;
    }
    return {
      stage: "typing",
      string: String.fromCharCode(...charCodes),
      guess,
    };
  };

  function ignorableKeyboardEvent(event: KeyboardEvent): boolean {
    return event.key === KEY.BACKSPACE || (event.shiftKey && event.key === "Shift") || event.ctrlKey || event.altKey;
  }

  function press(event: KeyboardEvent): void {
    event.preventDefault();
    if (ignorableKeyboardEvent(event)) return;
    const nextGuess = guess + event.key.toUpperCase();
    if (!answer.startsWith(nextGuess)) props.onFailure();
    else if (answer === nextGuess) props.onSuccess();
    else setGuess(nextGuess);
  }

  return (
    <>
      <GameTimer millis={timer} onExpire={props.onFailure} />
      <Paper sx={{ display: "grid", justifyItems: "center", pb: 1 }}>
        <Typography variant="h4">Type it{!hasAugment ? " backward" : ""}</Typography>
        <KeyHandler onKeyDown={press} onFailure={props.onFailure} />
        <Typography style={{ transform: hasAugment ? "none" : "scaleX(-1)" }}>{answer}</Typography>
        <Typography>
          {guess}
          <BlinkingCursor />
        </Typography>
      </Paper>
    </>
  );
}

function makeAnswer(difficulty: Difficulty): string {
  const length = randomInRange(difficulty.min, difficulty.max);
  let answer = "";
  for (let i = 0; i < length; i++) {
    if (i > 0) answer += " ";
    answer += words[Math.floor(Math.random() * words.length)];
  }

  return answer;
}
