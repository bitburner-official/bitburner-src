import type { InfiltrationStage, KeyboardLikeEvent } from "../InfiltrationStage";
import type { Infiltration } from "../Infiltration";
import { interpolate } from "./Difficulty";
import { type Arrow, downArrowSymbol, getArrow, leftArrowSymbol, rightArrowSymbol, upArrowSymbol } from "../utils";
import { randomInRange } from "../../utils/helpers/randomInRange";

interface Settings {
  timer: number;
  min: number;
  max: number;
}

const difficultySettings = {
  Trivial: { timer: 13000, min: 6, max: 8 },
  Normal: { timer: 7000, min: 7, max: 8 },
  Hard: { timer: 5000, min: 8, max: 9 },
  Brutal: { timer: 3000, min: 9, max: 10 },
};

function generateCode(settings: Settings): Arrow[] {
  const arrows: Arrow[] = [leftArrowSymbol, rightArrowSymbol, upArrowSymbol, downArrowSymbol];
  const code: Arrow[] = [];
  for (let i = 0; i < randomInRange(settings.min, settings.max); i++) {
    let arrow = arrows[Math.floor(4 * Math.random())];
    while (arrow === code[code.length - 1]) {
      arrow = arrows[Math.floor(4 * Math.random())];
    }
    code.push(arrow);
  }
  return code;
}

export class CheatCodeModel implements InfiltrationStage {
  state: Infiltration;
  settings: Settings;
  index = 0;
  code: Arrow[];

  onKey(event: KeyboardLikeEvent): void {
    event.preventDefault?.();
    if (this.code[this.index] !== getArrow(event)) {
      return this.state.onFailure();
    }
    this.index += 1;
    if (this.index >= this.code.length) {
      return this.state.onSuccess();
    }
    this.state.updateEvent.emit();
  }

  constructor(state: Infiltration) {
    this.state = state;
    this.settings = interpolate(difficultySettings, state.difficulty());
    state.setStageTime(this, this.settings.timer);
    this.code = generateCode(this.settings);
  }
}
