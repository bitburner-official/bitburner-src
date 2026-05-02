import type { InfiltrationStage, KeyboardLikeEvent } from "../InfiltrationStage";
import type { Infiltration } from "../Infiltration";
import { KEY } from "../../utils/KeyboardEventKey";
import { interpolate } from "./Difficulty";
import { getArrow, downArrowSymbol, leftArrowSymbol, rightArrowSymbol, upArrowSymbol } from "../utils";

interface Settings {
  timer: number;
  width: number;
  height: number;
  symbols: number;
}

const difficultySettings = {
  Trivial: { timer: 12500, width: 3, height: 3, symbols: 6 },
  Normal: { timer: 15000, width: 4, height: 4, symbols: 7 },
  Hard: { timer: 12500, width: 5, height: 5, symbols: 8 },
  Brutal: { timer: 10000, width: 6, height: 6, symbols: 9 },
};

function generateAnswers(grid: string[][], settings: Settings): string[] {
  const answers = [];
  for (let i = 0; i < settings.symbols; i++) {
    answers.push(grid[Math.floor(Math.random() * grid.length)][Math.floor(Math.random() * grid[0].length)]);
  }
  return answers;
}

function randChar(): string {
  return "ABCDEF0123456789"[Math.floor(Math.random() * 16)];
}

function generatePuzzle(settings: Settings): string[][] {
  const puzzle = [];
  for (let i = 0; i < settings.height; i++) {
    const line = [];
    for (let j = 0; j < settings.width; j++) {
      line.push(randChar() + randChar());
    }
    puzzle.push(line);
  }
  return puzzle;
}

export class Cyberpunk2077Model implements InfiltrationStage {
  state: Infiltration;
  settings: Settings;
  grid: string[][];
  answers: string[];
  currentAnswerIndex = 0;
  x = 0;
  y = 0;

  onKey(event: KeyboardLikeEvent): void {
    event.preventDefault?.();

    const move = [0, 0];
    const arrow = getArrow(event);
    switch (arrow) {
      case upArrowSymbol:
        move[1]--;
        break;
      case leftArrowSymbol:
        move[0]--;
        break;
      case downArrowSymbol:
        move[1]++;
        break;
      case rightArrowSymbol:
        move[0]++;
        break;
    }
    this.x = (this.x + move[0] + this.grid[0].length) % this.grid[0].length;
    this.y = (this.y + move[1] + this.grid.length) % this.grid.length;

    if (event.key === KEY.SPACE) {
      const selected = this.grid[this.y][this.x];
      const expected = this.answers[this.currentAnswerIndex];
      if (selected !== expected) {
        return this.state.onFailure();
      }
      this.currentAnswerIndex += 1;
      if (this.currentAnswerIndex >= this.answers.length) {
        return this.state.onSuccess();
      }
    }
    this.state.updateEvent.emit();
  }

  constructor(state: Infiltration) {
    this.state = state;
    this.settings = interpolate(difficultySettings, state.difficulty());
    state.setStageTime(this, this.settings.timer);
    this.settings.width = Math.round(this.settings.width);
    this.settings.height = Math.round(this.settings.height);
    this.settings.symbols = Math.round(this.settings.symbols);
    this.grid = generatePuzzle(this.settings);
    this.answers = generateAnswers(this.grid, this.settings);
  }
}
