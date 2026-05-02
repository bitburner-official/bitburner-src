import type { InfiltrationStage, KeyboardLikeEvent } from "../InfiltrationStage";
import type { Infiltration } from "../Infiltration";
import { Player } from "@player";
import { AugmentationName } from "@enums";
import { KEY } from "../../utils/KeyboardEventKey";
import { interpolate } from "./Difficulty";

interface Settings {
  window: number;
}

const difficultySettings = {
  Trivial: { window: 800 },
  Normal: { window: 500 },
  Hard: { window: 350 },
  Brutal: { window: 250 },
};

export class SlashModel implements InfiltrationStage {
  state: Infiltration;
  settings: Settings;
  phase = 0;
  hasMightOfAres = false;

  distractedTime: number;
  guardingTime: number;
  alertedTime: number;
  guardingEndTime: number;

  onKey(event: KeyboardLikeEvent): void {
    event.preventDefault?.();
    if (event.key !== KEY.SPACE) return;
    if (this.phase !== 1) {
      this.state.onFailure();
    } else {
      this.state.onSuccess();
    }
  }

  constructor(state: Infiltration) {
    this.state = state;

    const hasWKSharmonizer = Player.hasAugmentation(AugmentationName.WKSharmonizer, true);
    this.hasMightOfAres = Player.hasAugmentation(AugmentationName.MightOfAres, true);

    // Determine time window of phases
    this.settings = interpolate(difficultySettings, state.difficulty());
    this.distractedTime = this.settings.window * (hasWKSharmonizer ? 1.3 : 1);
    this.alertedTime = 250;
    this.guardingTime = Math.random() * 3250 + 1500 - (this.distractedTime + this.alertedTime);

    state.setTimeSequence(this, [this.guardingTime, this.distractedTime, this.alertedTime], (i) => {
      this.phase = i + 1;
      if (i < 2) {
        state.updateEvent.emit();
      } else {
        state.onFailure();
      }
    });
    this.guardingEndTime = performance.now() + this.guardingTime;
  }
}
