import React, { useState, useMemo } from "react";

import { Box, Paper, Typography } from "@mui/material";
import { AugmentationName } from "@enums";
import { Player } from "@player";
import { Settings } from "../../Settings/Settings";
import { interpolate } from "./Difficulty";
import { GameTimer } from "./GameTimer";
import { IMinigameProps } from "./IMinigameProps";
import { KeyHandler } from "./KeyHandler";
import { isPositiveInteger } from "../../types";
import { randomInRange } from "../../utils/helpers/randomInRange";
import { stageState } from "../State";

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
  Brutal: Difficulty;
} = {
  Trivial: { timer: 9000, wiresmin: 4, wiresmax: 4, rules: 2 },
  Normal: { timer: 7000, wiresmin: 6, wiresmax: 6, rules: 2 },
  Hard: { timer: 5000, wiresmin: 8, wiresmax: 8, rules: 3 },
  Brutal: { timer: 4000, wiresmin: 9, wiresmax: 9, rules: 4 },
};

const colors = ["red", "#FFC107", "blue", "white"];

const colorNames: Record<string, string> = {
  red: "RED",
  "#FFC107": "YELLOW",
  blue: "BLUE",
  white: "WHITE",
};

interface Wire {
  wireType: string[];
  colors: string[];
}

interface Question {
  toString: () => string;
  shouldCut: (wire: Wire, index: number) => boolean;
}

export function WireCuttingGame({ onSuccess, onFailure, difficulty }: IMinigameProps): React.ReactElement {
  const { timer, wires, questions, hasAugment } = useMemo(() => {
    // Determine game difficulty
    const gameDifficulty: Difficulty = {
      timer: 0,
      wiresmin: 0,
      wiresmax: 0,
      rules: 0,
    };
    interpolate(difficulties, difficulty, gameDifficulty);

    // Calculate initial game data
    const wires = generateWires(gameDifficulty);
    const questions = generateQuestion(wires, gameDifficulty);

    return {
      timer: gameDifficulty.timer,
      wires,
      questions,
      hasAugment: Player.hasAugmentation(AugmentationName.KnowledgeOfApollo, true),
    };
  }, [difficulty]);

  const [cutWires, setCutWires] = useState(wires.map((__) => false));
  const [wiresToCut, setWiresToCut] = useState(() => {
    const toCut = new Set<number>();
    for (const [index, wire] of wires.entries()) {
      for (const question of questions) {
        if (question.shouldCut(wire, index)) {
          toCut.add(index);
          break; // go to next wire
        }
      }
    }
    return toCut;
  });

  stageState.value = () => {
    const result: { [x: string]: unknown } = {
      stage: "wireCutter",
      goals: questions.map((x) => x.toString()),
      wires: wires.map((x) => [...x.colors]),
      cutWires: [...cutWires],
    };
    if (hasAugment) {
      const has = [];
      for (let i = 0; i < cutWires.length; ++i) {
        has[i] = wiresToCut.has(i);
      }
      result.correctWires = has;
    }
    return result;
  };

  function press(event: KeyboardEvent): void {
    event.preventDefault();
    const wireNum = parseInt(event.key);
    if (!isPositiveInteger(wireNum) || wireNum > wires.length) return;

    const wireIndex = wireNum - 1;
    if (cutWires[wireIndex]) return;

    // Check if game has been lost
    if (!wiresToCut.has(wireIndex)) return onFailure();

    // Check if game has been won
    const newWiresToCut = new Set(wiresToCut);
    newWiresToCut.delete(wireIndex);
    if (newWiresToCut.size === 0) return onSuccess();

    // Rerender with new state if game has not been won or lost yet
    const newCutWires = cutWires.map((old, i) => (i === wireIndex ? true : old));
    setWiresToCut(newWiresToCut);
    setCutWires(newCutWires);
  }

  return (
    <>
      <GameTimer millis={timer} onExpire={onFailure} />
      <Paper sx={{ display: "grid", justifyItems: "center", pb: 1 }}>
        <Typography variant="h4" sx={{ width: "75%", textAlign: "center" }}>
          Cut the wires with the following properties! (keyboard 1 to 9)
        </Typography>
        {questions.map((question, i) => (
          <Typography key={i}>{question.toString()}</Typography>
        ))}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${wires.length}, 1fr)`,
            columnGap: 3,
            justifyItems: "center",
          }}
        >
          {Array.from({ length: wires.length }).map((_, i) => {
            const isCorrectWire = cutWires[i] || wiresToCut.has(i);
            const color = hasAugment && !isCorrectWire ? Settings.theme.disabled : Settings.theme.primary;
            return (
              <Typography key={i} style={{ color: color }}>
                {i + 1}
              </Typography>
            );
          })}
          {new Array(11).fill(0).map((_, i) => (
            <React.Fragment key={i}>
              {wires.map((wire, j) => {
                if ((i === 3 || i === 4) && cutWires[j]) {
                  return <Typography key={j}></Typography>;
                }
                const isCorrectWire = cutWires[j] || wiresToCut.has(j);
                const wireColor =
                  hasAugment && !isCorrectWire ? Settings.theme.disabled : wire.colors[i % wire.colors.length];
                return (
                  <Typography key={j} style={{ color: wireColor }}>
                    |{wire.wireType[i % wire.wireType.length]}|
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
      return `Cut wire number ${index + 1}.`;
    },
    shouldCut: (_wire: Wire, i: number): boolean => {
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
  const numWires = randomInRange(difficulty.wiresmin, difficulty.wiresmax);
  for (let i = 0; i < numWires; i++) {
    const wireColors = [colors[Math.floor(Math.random() * colors.length)]];
    if (Math.random() < 0.15) {
      wireColors.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    const wireType = [...wireColors.map((color) => colorNames[color]).join("")];
    wires.push({
      wireType,
      colors: wireColors,
    });
  }
  return wires;
}
