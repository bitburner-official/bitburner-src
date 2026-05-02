import type { InfiltrationStage, KeyboardLikeEvent } from "../InfiltrationStage";
import type { Infiltration } from "../Infiltration";
import { KEY } from "../../utils/KeyboardEventKey";
import { shuffle } from "lodash";
import { interpolate } from "./Difficulty";

interface Settings {
  timer: number;
  size: number;
}

const difficultySettings = {
  Trivial: { timer: 12000, size: 6 },
  Normal: { timer: 9000, size: 8 },
  Hard: { timer: 5000, size: 9 },
  Brutal: { timer: 2500, size: 12 },
};

function makeChoices(settings: Settings): string[] {
  const choices = [];
  choices.push(positive[Math.floor(Math.random() * positive.length)]);
  for (let i = 0; i < settings.size; i++) {
    const option = negative[Math.floor(Math.random() * negative.length)];
    if (choices.includes(option)) {
      i--;
      continue;
    }
    choices.push(option);
  }
  return shuffle(choices);
}

export class BribeModel implements InfiltrationStage {
  state: Infiltration;
  settings: Settings;
  choices: string[];
  correctIndex = 0;
  index = 0;

  onKey(event: KeyboardLikeEvent): void {
    event.preventDefault?.();

    const k = event.key;
    if (k === KEY.SPACE) {
      if (positive.includes(this.choices[this.index])) {
        this.state.onSuccess();
      } else {
        this.state.onFailure();
      }
      return;
    }

    if (([KEY.UP_ARROW, KEY.W, KEY.RIGHT_ARROW, KEY.D] as string[]).includes(k)) this.index++;
    if (([KEY.DOWN_ARROW, KEY.S, KEY.LEFT_ARROW, KEY.A] as string[]).includes(k)) this.index--;
    while (this.index < 0) this.index += this.choices.length;
    while (this.index >= this.choices.length) this.index -= this.choices.length;
    this.state.updateEvent.emit();
  }

  constructor(state: Infiltration) {
    this.state = state;
    this.settings = interpolate(difficultySettings, state.difficulty());
    state.setStageTime(this, this.settings.timer);
    this.choices = makeChoices(this.settings);
    this.correctIndex = this.choices.findIndex((choice) => positive.includes(choice));
  }
}

const positive = [
  "affectionate",
  "agreeable",
  "bright",
  "charming",
  "creative",
  "determined",
  "energetic",
  "friendly",
  "funny",
  "generous",
  "polite",
  "likable",
  "diplomatic",
  "helpful",
  "giving",
  "kind",
  "hardworking",
  "patient",
  "dynamic",
  "loyal",
  "straightforward",
];

const negative = [
  "aggressive",
  "aloof",
  "arrogant",
  "big-headed",
  "boastful",
  "boring",
  "bossy",
  "careless",
  "clingy",
  "couch potato",
  "cruel",
  "cynical",
  "grumpy",
  "hot air",
  "know it all",
  "obnoxious",
  "pain in the neck",
  "picky",
  "tactless",
  "thoughtless",
  "cringe",
];
