import type { InfiltrationStage, KeyboardLikeEvent } from "../InfiltrationStage";
import type { Infiltration } from "../Infiltration";
import { KEY } from "../../utils/KeyboardEventKey";
import { interpolate } from "./Difficulty";
import { downArrowSymbol, getArrow, leftArrowSymbol, rightArrowSymbol, upArrowSymbol } from "../utils";
import { Player } from "@player";
import { AugmentationName } from "@enums";

interface Settings {
  timer: number;
  width: number;
  height: number;
  mines: number;
}

const difficultySettings = {
  Trivial: { timer: 15000, width: 3, height: 3, mines: 4 },
  Normal: { timer: 15000, width: 4, height: 4, mines: 7 },
  Hard: { timer: 15000, width: 5, height: 5, mines: 11 },
  Brutal: { timer: 15000, width: 6, height: 6, mines: 15 },
};

function fieldEquals(a: boolean[][], b: boolean[][]): boolean {
  function count(field: boolean[][]): number {
    return field.flat().reduce((a, b) => a + (b ? 1 : 0), 0);
  }
  return count(a) === count(b);
}

function generateEmptyField(settings: Settings): boolean[][] {
  const field: boolean[][] = [];
  for (let i = 0; i < settings.height; i++) {
    field.push(new Array<boolean>(settings.width).fill(false));
  }
  return field;
}

function generateMinefield(settings: Settings): boolean[][] {
  const field = generateEmptyField(settings);
  for (let i = 0; i < settings.mines; i++) {
    const x = Math.floor(Math.random() * field.length);
    const y = Math.floor(Math.random() * field[0].length);
    if (field[x][y]) {
      i--;
      continue;
    }
    field[x][y] = true;
  }
  return field;
}

export class MinesweeperModel implements InfiltrationStage {
  state: Infiltration;
  settings: Settings;
  x = 0;
  y = 0;
  minefield: boolean[][];
  answer: boolean[][];
  memoryPhase = true;

  onKey(event: KeyboardLikeEvent): void {
    event.preventDefault?.();

    if (this.memoryPhase) return;
    let m_x = 0;
    let m_y = 0;
    const arrow = getArrow(event);
    switch (arrow) {
      case upArrowSymbol:
        m_y = -1;
        break;
      case leftArrowSymbol:
        m_x = -1;
        break;
      case downArrowSymbol:
        m_y = 1;
        break;
      case rightArrowSymbol:
        m_x = 1;
        break;
    }
    this.x = (this.x + m_x + this.minefield[0].length) % this.minefield[0].length;
    this.y = (this.y + m_y + this.minefield.length) % this.minefield.length;

    if (event.key == KEY.SPACE) {
      if (!this.minefield[this.y][this.x]) {
        return this.state.onFailure();
      }
      this.answer[this.y][this.x] = true;
      if (fieldEquals(this.minefield, this.answer)) {
        return this.state.onSuccess();
      }
    }
    this.state.updateEvent.emit();
  }

  constructor(state: Infiltration) {
    this.state = state;
    this.settings = interpolate(difficultySettings, state.difficulty());

    const hasWKSharmonizer = Player.hasAugmentation(AugmentationName.WKSharmonizer, true);
    state.setTimeSequence(this, [2000, this.settings.timer * (hasWKSharmonizer ? 1.3 : 1) - 2000], (i) => {
      this.memoryPhase = false;
      if (i < 1) {
        state.updateEvent.emit();
      } else {
        state.onFailure();
      }
    });

    this.settings.width = Math.round(this.settings.width);
    this.settings.height = Math.round(this.settings.height);
    this.settings.mines = Math.round(this.settings.mines);
    this.minefield = generateMinefield(this.settings);
    this.answer = generateEmptyField(this.settings);
  }
}
