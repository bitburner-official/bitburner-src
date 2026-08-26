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
  "充满爱意的",
  "和蔼可亲的",
  "开朗的",
  "有魅力的",
  "有创造力的",
  "意志坚定的",
  "精力充沛的",
  "友好的",
  "风趣的",
  "慷慨大方的",
  "彬彬有礼的",
  "讨人喜欢的",
  "老练圆滑的",
  "乐于助人的",
  "乐于付出的",
  "善良的",
  "勤奋刻苦的",
  "有耐心的",
  "充满活力的",
  "忠心耿耿的",
  "直言不讳的",
];

const negative = [
  "好斗的",
  "冷漠疏远的",
  "傲慢自大的",
  "自以为是的",
  "爱吹牛的",
  "无趣乏味的",
  "爱发号施令的",
  "粗心大意的",
  "过分粘人的",
  "懒虫一个",
  "冷酷无情的",
  "愤世嫉俗的",
  "脾气暴躁的",
  "夸夸其谈",
  "自吹自擂",
  "令人讨厌的",
  "惹人厌烦",
  "挑剔苛刻的",
  "说话没分寸的",
  "轻率鲁莽的",
  "尴尬至极",
];
