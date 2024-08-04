import React, { useEffect, useState } from "react";

import { Box, Paper, Typography } from "@mui/material";
import { AugmentationName } from "@enums";
import { Player } from "@player";
import { Settings } from "../../Settings/Settings";
import { random } from "../utils";
import { interpolate } from "./Difficulty";
import { GameTimer } from "./GameTimer";
import { IMinigameProps } from "./IMinigameProps";
import { KeyHandler } from "./KeyHandler";
import { isPositiveInteger } from "../../types";

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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [timer, setTimer] = useState(0);
  const [cutWires, setCutWires] = useState<boolean[]>([]);
  const [wiresToCut, setWiresToCut] = useState(new Set<number>());
  const [hasAugment, setHasAugment] = useState(false);

  useEffect(() => {
    // Determine game difficulty
    const gameDifficulty: Difficulty = {
      timer: 0,
      wiresmin: 0,
      wiresmax: 0,
      rules: 0,
    };
    interpolate(difficulties, difficulty, gameDifficulty);

    // Calculate initial game data
    const gameWires = generateWires(gameDifficulty);
    const gameQuestions = generateQuestion(gameWires, gameDifficulty);
    const gameWiresToCut = new Set<number>();
    gameWires.forEach((wire, index) => {
      for (const question of gameQuestions) {
        if (question.shouldCut(wire, index)) {
          gameWiresToCut.add(index);
          return; // go to next wire
        }
      }
    });

    // Initialize the game state
    setTimer(gameDifficulty.timer);
    setWires(gameWires);
    setCutWires(gameWires.map((__) => false));
    setQuestions(gameQuestions);
    setWiresToCut(gameWiresToCut);
    setHasAugment(Player.hasAugmentation(AugmentationName.KnowledgeOfApollo, true));
  }, [difficulty]);

  function press(this: Document, event: KeyboardEvent): void {
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
      return `Cut wires number ${index + 1}.`;
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
  const numWires = random(difficulty.wiresmin, difficulty.wiresmax);
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
