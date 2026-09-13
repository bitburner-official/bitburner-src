import React from "react";
import type { InfiltrationStage, KeyboardLikeEvent } from "../InfiltrationStage";
import type { Infiltration } from "../Infiltration";
import { interpolate } from "./Difficulty";
import { isPositiveInteger } from "../../types";
import { randomInRange } from "../../utils/helpers/randomInRange";

interface Settings {
  timer: number;
  wiresmin: number;
  wiresmax: number;
  rules: number;
}

const difficultySettings = {
  Trivial: { timer: 9000, wiresmin: 4, wiresmax: 4, rules: 2 },
  Normal: { timer: 7000, wiresmin: 6, wiresmax: 6, rules: 2 },
  Hard: { timer: 5000, wiresmin: 8, wiresmax: 8, rules: 3 },
  Brutal: { timer: 4000, wiresmin: 9, wiresmax: 9, rules: 4 },
};

// These colors, except white, come from the Okabe-Ito palette. White is used because it provides high contrast on a
// black background.
// Reference: https://jfly.uni-koeln.de/color/
const colors = ["#D55E00", "#F0E442", "#0072B2", "#FFFFFF"] as const;

const colorNames = {
  "#D55E00": "RED", // Okabe-Ito Vermilion
  "#F0E442": "YELLOW",
  "#0072B2": "BLUE",
  "#FFFFFF": "WHITE",
} as const;

interface Wire {
  wireType: string;
  colors: (keyof typeof colorNames)[];
}

interface Question {
  render: () => React.ReactNode;
  shouldCut: (wire: Wire, index: number) => boolean;
}

function randomPositionQuestion(wires: Wire[]): Question {
  const index = Math.floor(Math.random() * wires.length);
  return {
    render: () => {
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
    render: () => {
      return (
        <>
          Cut all wires colored <span style={{ color: cutColor }}>{colorNames[cutColor]}</span>.
        </>
      );
    },
    shouldCut: (wire: Wire): boolean => {
      return wire.colors.includes(cutColor);
    },
  };
}

function generateQuestion(wires: Wire[], settings: Settings): Question[] {
  const numQuestions = settings.rules;
  const questionGenerators = [randomPositionQuestion, randomColorQuestion];
  const questions = [];
  for (let i = 0; i < numQuestions; i++) {
    questions.push(questionGenerators[i % 2](wires));
  }
  return questions;
}

function generateWires(settings: Settings): Wire[] {
  const wires = [];
  const numWires = randomInRange(settings.wiresmin, settings.wiresmax);
  for (let i = 0; i < numWires; i++) {
    const wireColors = [colors[Math.floor(Math.random() * colors.length)]];
    if (Math.random() < 0.15) {
      wireColors.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    const wireType = wireColors.map((color) => colorNames[color]).join("");
    wires.push({
      wireType,
      colors: wireColors,
    });
  }
  return wires;
}

export class WireCuttingModel implements InfiltrationStage {
  state: Infiltration;
  settings: Settings;
  wires: Wire[];
  questions: Question[];
  wiresToCut = new Set<number>();
  cutWires: boolean[];

  onKey(event: KeyboardLikeEvent): void {
    event.preventDefault?.();
    const wireNum = parseInt(event.key);
    const wireIndex = wireNum - 1;
    if (!isPositiveInteger(wireNum) || wireNum > this.wires.length || this.cutWires[wireIndex]) {
      return;
    }
    this.cutWires[wireIndex] = true;

    // Check if game has been lost
    if (!this.wiresToCut.has(wireIndex)) {
      return this.state.onFailure();
    }

    // Check if game has been won
    this.wiresToCut.delete(wireIndex);
    if (this.wiresToCut.size === 0) {
      return this.state.onSuccess();
    }
    this.state.updateEvent.emit();
  }

  constructor(state: Infiltration) {
    this.state = state;

    // Determine game difficulty
    this.settings = interpolate(difficultySettings, state.difficulty());
    state.setStageTime(this, this.settings.timer);

    // Calculate initial game data
    this.wires = generateWires(this.settings);
    this.questions = generateQuestion(this.wires, this.settings);
    this.wires.forEach((wire, index) => {
      for (const question of this.questions) {
        if (question.shouldCut(wire, index)) {
          this.wiresToCut.add(index);
          return; // go to next wire
        }
      }
    });

    // Initialize the game state
    this.cutWires = this.wires.map((__) => false);
  }
}
