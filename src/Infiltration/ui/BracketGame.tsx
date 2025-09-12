import { Paper, Typography } from "@mui/material";
import React, { useState, useMemo } from "react";
import { AugmentationName } from "@enums";
import { Player } from "@player";
import { KEY } from "../../utils/KeyboardEventKey";
import { BlinkingCursor } from "./BlinkingCursor";
import { interpolate } from "./Difficulty";
import { GameTimer } from "./GameTimer";
import { IMinigameProps } from "./IMinigameProps";
import { KeyHandler } from "./KeyHandler";
import { randomInRange } from "../../utils/helpers/randomInRange";
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
  Trivial: { timer: 8000, min: 2, max: 3 },
  Normal: { timer: 6000, min: 4, max: 5 },
  Hard: { timer: 4000, min: 4, max: 6 },
  Brutal: { timer: 2500, min: 7, max: 7 },
};

function generateLeftSide(difficulty: Difficulty): string {
  let str = "";
  const options = [KEY.OPEN_BRACKET, KEY.LESS_THAN, KEY.OPEN_PARENTHESIS, KEY.OPEN_BRACE];
  if (Player.hasAugmentation(AugmentationName.WisdomOfAthena, true)) {
    options.splice(0, 1);
  }
  const length = randomInRange(difficulty.min, difficulty.max);
  for (let i = 0; i < length; i++) {
    str += options[Math.floor(Math.random() * options.length)];
  }

  return str;
}

// Make closing brackets more challenging by adding actual nested pairs of (),
// [], {} and <> to the string. We will ensure that the nesting remains valid
// (no instances of {[}],) as well as the proper closing sequence still
// matching the original string.
function generateApiBrackets(left: string, difficulty: number): string {
  if (Player.hasAugmentation(AugmentationName.WisdomOfAthena, true)) {
    difficulty = 0;
  }
  // There are many ways of randomly creating nesting brackets. This way gives
  // greater liklihood to areas that already have brackets, similar to how a
  // crystal grows.
  const newPairs = difficulty < 1 ? 0 : (difficulty * 15) | 0;
  for (let i = 0; i < newPairs; ++i) {
    const pos = Math.floor(Math.random() * (left.length + 1));
    left = left.slice(0, pos) + ["<>", "{}", "[]", "()"][Math.floor(Math.random() * 4)] + left.slice(pos);
  }
  return left;
}

function getChar(event: KeyboardEvent): string {
  if (event.key === KEY.CLOSE_PARENTHESIS) return KEY.CLOSE_PARENTHESIS;
  if (event.key === KEY.CLOSE_BRACKET) return KEY.CLOSE_BRACKET;
  if (event.key === KEY.CLOSE_BRACE) return KEY.CLOSE_BRACE;
  if (event.key === KEY.GREATER_THAN) return KEY.GREATER_THAN;
  return "";
}

function match(left: string, right: string): boolean {
  return (
    (left === KEY.OPEN_BRACKET && right === KEY.CLOSE_BRACKET) ||
    (left === KEY.LESS_THAN && right === KEY.GREATER_THAN) ||
    (left === KEY.OPEN_PARENTHESIS && right === KEY.CLOSE_PARENTHESIS) ||
    (left === KEY.OPEN_BRACE && right === KEY.CLOSE_BRACE)
  );
}

export function BracketGame(props: IMinigameProps): React.ReactElement {
  const [right, setRight] = useState("");

  const data = useMemo(() => {
    const difficulty: Difficulty = { timer: 0, min: 0, max: 0 };
    interpolate(difficulties, props.difficulty, difficulty);
    const left = generateLeftSide(difficulty);
    const apiBrackets = generateApiBrackets(left, props.difficulty);
    return {
      left,
      apiBrackets,
      timer: difficulty.timer,
    };
  }, [props]);

  stageState.value = () => ({
    stage: "brackets",
    brackets: data.apiBrackets,
    typed: right,
  });

  function press(event: KeyboardEvent): void {
    event.preventDefault();
    const char = getChar(event);
    if (!char) return;
    if (!match(data.left[data.left.length - right.length - 1], char)) {
      props.onFailure();
      return;
    }
    if (data.left.length === right.length + 1) {
      props.onSuccess();
      return;
    }
    setRight(right + char);
  }

  return (
    <>
      <GameTimer millis={data.timer} onExpire={props.onFailure} />
      <Paper sx={{ display: "grid", justifyItems: "center" }}>
        <Typography variant="h4">Close the brackets</Typography>
        <Typography style={{ fontSize: "5em" }}>
          {`${data.left}${right}`}
          <BlinkingCursor />
        </Typography>
        <KeyHandler onKeyDown={press} onFailure={props.onFailure} />
      </Paper>
    </>
  );
}
