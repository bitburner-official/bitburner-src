import { Paper, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { AugmentationName } from "@enums";
import { Player } from "@player";
import { Settings } from "../../Settings/Settings";
import { KEY } from "../../utils/KeyboardEventKey";
import { downArrowSymbol, upArrowSymbol } from "../utils";
import { interpolate } from "./Difficulty";
import { GameTimer } from "./GameTimer";
import { IMinigameProps } from "./IMinigameProps";
import { KeyHandler } from "./KeyHandler";
import { stageState } from "../State";
import { positiveAdjectives, negativeAdjectives } from "../data";
import { shuffleArray } from "../../utils/helpers/shuffleArray";

interface Difficulty {
  [key: string]: number;

  timer: number;
  size: number;
}

const difficulties: {
  Trivial: Difficulty;
  Normal: Difficulty;
  Hard: Difficulty;
  Brutal: Difficulty;
} = {
  Trivial: { timer: 12000, size: 6 },
  Normal: { timer: 9000, size: 8 },
  Hard: { timer: 5000, size: 9 },
  Brutal: { timer: 2500, size: 12 },
};

export function BribeGame(props: IMinigameProps): React.ReactElement {
  const difficulty: Difficulty = { timer: 0, size: 0 };
  interpolate(difficulties, props.difficulty, difficulty);
  const timer = difficulty.timer;
  const [choices] = useState(makeChoices(difficulty));
  const [correctIndex, setCorrectIndex] = useState(0);
  const [index, setIndex] = useState(0);
  const currentChoice = choices[index];

  useEffect(() => {
    setCorrectIndex(choices.findIndex((choice) => positiveAdjectives.includes(choice)));
  }, [choices]);

  useEffect(
    () =>
      stageState.set(() => ({
        stage: "bribe",
        adjective: choices[index],
      })),
    [choices, index],
  );

  const defaultColor = Settings.theme.primary;
  const disabledColor = Settings.theme.disabled;
  let upColor = defaultColor;
  let downColor = defaultColor;
  let choiceColor = defaultColor;
  const hasAugment = Player.hasAugmentation(AugmentationName.BeautyOfAphrodite, true);

  if (hasAugment) {
    const upIndex = index + 1 >= choices.length ? 0 : index + 1;
    let upDistance = correctIndex - upIndex;
    if (upIndex > correctIndex) {
      upDistance = choices.length - 1 - upIndex + correctIndex;
    }

    const downIndex = index - 1 < 0 ? choices.length - 1 : index - 1;
    let downDistance = downIndex - correctIndex;
    if (downIndex < correctIndex) {
      downDistance = downIndex + choices.length - 1 - correctIndex;
    }

    const onCorrectIndex = correctIndex == index;

    upColor = upDistance <= downDistance && !onCorrectIndex ? upColor : disabledColor;
    downColor = upDistance >= downDistance && !onCorrectIndex ? downColor : disabledColor;
    choiceColor = onCorrectIndex ? defaultColor : disabledColor;
  }

  function press(this: Document, event: KeyboardEvent): void {
    event.preventDefault();

    const k = event.key;
    if (k === KEY.SPACE) {
      if (positiveAdjectives.includes(currentChoice)) props.onSuccess();
      else props.onFailure();
      return;
    }

    let newIndex = index;
    if ([KEY.UP_ARROW, KEY.W, KEY.RIGHT_ARROW, KEY.D].map((k) => k as string).includes(k)) newIndex++;
    if ([KEY.DOWN_ARROW, KEY.S, KEY.LEFT_ARROW, KEY.A].map((k) => k as string).includes(k)) newIndex--;
    while (newIndex < 0) newIndex += choices.length;
    while (newIndex > choices.length - 1) newIndex -= choices.length;
    setIndex(newIndex);
  }

  return (
    <>
      <GameTimer millis={timer} onExpire={props.onFailure} />
      <Paper sx={{ display: "grid", justifyItems: "center" }}>
        <Typography variant="h4">Say something nice about the guard</Typography>
        <KeyHandler onKeyDown={press} onFailure={props.onFailure} />
        <Typography variant="h5" color={upColor}>
          {upArrowSymbol}
        </Typography>
        <Typography variant="h5" color={choiceColor}>
          {currentChoice}
        </Typography>
        <Typography variant="h5" color={downColor}>
          {downArrowSymbol}
        </Typography>
      </Paper>
    </>
  );
}

function makeChoices(difficulty: Difficulty): string[] {
  const choices = [];
  choices.push(positiveAdjectives[Math.floor(Math.random() * positiveAdjectives.length)]);
  for (let i = 0; i < difficulty.size; i++) {
    const option = negativeAdjectives[Math.floor(Math.random() * negativeAdjectives.length)];
    if (choices.includes(option)) {
      i--;
      continue;
    }
    choices.push(option);
  }
  shuffleArray(choices);
  return choices;
}
