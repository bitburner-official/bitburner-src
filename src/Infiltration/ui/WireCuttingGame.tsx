import React, { useEffect, useState, useRef } from "react";

import { Box, Paper, Typography } from "@mui/material";
import { AugmentationName } from "@enums";
import { Player } from "@player";
import { Settings } from "../../Settings/Settings";
import { KEY } from "../../utils/helpers/keyCodes";
import { random } from "../utils";
import { interpolate } from "./Difficulty";
import { GameTimer } from "./GameTimer";
import { IMinigameProps } from "./IMinigameProps";
import { KeyHandler } from "./KeyHandler";

interface Difficulty {
  [key: string]: number;
  timer: number;
  wiresmin: number;
  wiresmax: number;
  rules: number;
}

const difficulties: {
  Trivial: Difficulty;
  Normal: Difficulty;
  Hard: Difficulty;
  Impossible: Difficulty;
} = {
  Trivial: { timer: 9000, wiresmin: 4, wiresmax: 4, rules: 2 },
  Normal: { timer: 7000, wiresmin: 6, wiresmax: 6, rules: 2 },
  Hard: { timer: 5000, wiresmin: 8, wiresmax: 8, rules: 3 },
  Impossible: { timer: 4000, wiresmin: 9, wiresmax: 9, rules: 4 },
};

const types = [KEY.PIPE, KEY.DOT, KEY.FORWARD_SLASH, KEY.HYPHEN, "█", KEY.HASH];

const colors = ["red", "#FFC107", "blue", "white"];

const colorNames: Record<string, string> = {
  red: "red",
  "#FFC107": "yellow",
  blue: "blue",
  white: "white",
};

interface Wire {
  tpe: string;
  colors: string[];
}

interface Question {
  toString: () => string;
  shouldCut: (wire: Wire, index: number) => boolean;
}

export function WireCuttingGame({ onSuccess, onFailure, ...otherProps }: IMinigameProps): React.ReactElement {
  const difficulty: Difficulty = {
    timer: 0,
    wiresmin: 0,
    wiresmax: 0,
    rules: 0,
  };
  interpolate(difficulties, otherProps.difficulty, difficulty);
  const timer = difficulty.timer;
  const wiresRef = useRef(generateWires(difficulty));
  const questionsRef = useRef(generateQuestion(wiresRef.current, difficulty));

  const [cutWires, setCutWires] = useState(new Array(wiresRef.current.length).fill(false));
  const hasAugment = Player.hasAugmentation(AugmentationName.KnowledgeOfApollo, true);

  // TODO: refactor, move the code from this effect to a `press` function
  useEffect(() => {
    // check if we won
    const wiresToBeCut = [];
    for (let j = 0; j < wiresRef.current.length; j++) {
      let shouldBeCut = false;
      for (let i = 0; i < questionsRef.current.length; i++) {
        shouldBeCut = shouldBeCut || questionsRef.current[i].shouldCut(wiresRef.current[j], j);
      }
      wiresToBeCut.push(shouldBeCut);
    }
    if (wiresToBeCut.every((b, i) => b === cutWires[i])) {
      onSuccess();
    }
  }, [cutWires, onSuccess]);

  function checkWire(wireNum: number): boolean {
    return questionsRef.current.some((q) => q.shouldCut(wiresRef.current[wireNum - 1], wireNum - 1));
  }

  function press(this: Document, event: KeyboardEvent): void {
    event.preventDefault();
    const wireNum = parseInt(event.key);

    if (wireNum < 1 || wireNum > wiresRef.current.length || isNaN(wireNum)) return;
    setCutWires((old) => {
      const next = [...old];
      next[wireNum - 1] = true;
      if (!checkWire(wireNum)) {
        onFailure();
      }

      return next;
    });
  }

  return (
    <>
      <GameTimer millis={timer} onExpire={onFailure} />
      <Paper sx={{ display: "grid", justifyItems: "center", pb: 1 }}>
        <Typography variant="h4" sx={{ width: "75%", textAlign: "center" }}>
          Cut the wires with the following properties! (keyboard 1 to 9)
        </Typography>
        {questionsRef.current.map((question, i) => (
          <Typography key={i}>{question.toString()}</Typography>
        ))}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${wiresRef.current.length}, 1fr)`,
            columnGap: 3,
            justifyItems: "center",
          }}
        >
          {Array.from({ length: wiresRef.current.length }).map((_, i) => {
            const isCorrectWire = checkWire(i + 1);
            const color = hasAugment && !isCorrectWire ? Settings.theme.disabled : Settings.theme.primary;
            return (
              <Typography key={i} style={{ color: color }}>
                {i + 1}
              </Typography>
            );
          })}
          {new Array(8).fill(0).map((_, i) => (
            <React.Fragment key={i}>
              {wiresRef.current.map((wire, j) => {
                if ((i === 3 || i === 4) && cutWires[j]) {
                  return <Typography key={j}></Typography>;
                }
                const isCorrectWire = checkWire(j + 1);
                const wireColor =
                  hasAugment && !isCorrectWire ? Settings.theme.disabled : wire.colors[i % wire.colors.length];
                return (
                  <Typography key={j} style={{ color: wireColor }}>
                    |{wire.tpe}|
                  </Typography>
                );
              })}
            </React.Fragment>
          ))}
        </Box>
        <KeyHandler onKeyDown={press} onFailure={onFailure} />
      </Paper>
    </>
  );
}

function randomPositionQuestion(wires: Wire[]): Question {
  const index = Math.floor(Math.random() * wires.length);
  return {
    toString: (): string => {
      return `Cut wires number ${index + 1}.`;
    },
    shouldCut: (wire: Wire, i: number): boolean => {
      return index === i;
    },
  };
}

function randomColorQuestion(wires: Wire[]): Question {
  const index = Math.floor(Math.random() * wires.length);
  const cutColor = wires[index].colors[0];
  return {
    toString: (): string => {
      return `Cut all wires colored ${colorNames[cutColor]}.`;
    },
    shouldCut: (wire: Wire): boolean => {
      return wire.colors.includes(cutColor);
    },
  };
}

function generateQuestion(wires: Wire[], difficulty: Difficulty): Question[] {
  const numQuestions = difficulty.rules;
  const questionGenerators = [randomPositionQuestion, randomColorQuestion];
  const questions = [];
  for (let i = 0; i < numQuestions; i++) {
    questions.push(questionGenerators[i % 2](wires));
  }
  return questions;
}

function generateWires(difficulty: Difficulty): Wire[] {
  const wires = [];
  const numWires = random(difficulty.wiresmin, difficulty.wiresmax);
  for (let i = 0; i < numWires; i++) {
    const wireColors = [colors[Math.floor(Math.random() * colors.length)]];
    if (Math.random() < 0.15) {
      wireColors.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    wires.push({
      tpe: types[Math.floor(Math.random() * types.length)],
      colors: wireColors,
    });
  }
  return wires;
}
