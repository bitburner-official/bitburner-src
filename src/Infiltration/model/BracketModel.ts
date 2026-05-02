import type { InfiltrationStage, KeyboardLikeEvent } from "../InfiltrationStage";
import type { Infiltration } from "../Infiltration";
import { AugmentationName } from "@enums";
import { Player } from "@player";
import { KEY } from "../../utils/KeyboardEventKey";
import { interpolate } from "./Difficulty";
import { randomInRange } from "../../utils/helpers/randomInRange";

interface Settings {
  timer: number;
  min: number;
  max: number;
}

const difficultySettings = {
  Trivial: { timer: 8000, min: 2, max: 3 },
  Normal: { timer: 6000, min: 4, max: 5 },
  Hard: { timer: 4000, min: 4, max: 6 },
  Brutal: { timer: 2500, min: 7, max: 7 },
};

function generateLeftSide(settings: Settings): string {
  let str = "";
  const options = [KEY.OPEN_BRACKET, KEY.LESS_THAN, KEY.OPEN_PARENTHESIS, KEY.OPEN_BRACE];
  if (Player.hasAugmentation(AugmentationName.WisdomOfAthena, true)) {
    options.splice(0, 1);
  }
  const length = randomInRange(settings.min, settings.max);
  for (let i = 0; i < length; i++) {
    str += options[Math.floor(Math.random() * options.length)];
  }

  return str;
}

function getChar(event: KeyboardLikeEvent): string {
  if (([KEY.CLOSE_PARENTHESIS, KEY.CLOSE_BRACKET, KEY.CLOSE_BRACE, KEY.GREATER_THAN] as string[]).includes(event.key)) {
    return event.key;
  }
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

export class BracketModel implements InfiltrationStage {
  state: Infiltration;
  settings: Settings;
  left: string;
  right = "";

  onKey(event: KeyboardLikeEvent): void {
    event.preventDefault?.();
    const char = getChar(event);
    if (!char) return;
    this.right += char;
    if (!match(this.left[this.left.length - this.right.length], char)) {
      return this.state.onFailure();
    }
    if (this.left.length === this.right.length) {
      return this.state.onSuccess();
    }
    this.state.updateEvent.emit();
  }

  constructor(state: Infiltration) {
    this.state = state;
    this.settings = interpolate(difficultySettings, state.difficulty());
    state.setStageTime(this, this.settings.timer);
    this.left = generateLeftSide(this.settings);
  }
}
