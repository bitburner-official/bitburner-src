import type { InfiltrationStage, KeyboardLikeEvent } from "../InfiltrationStage";
import type { Infiltration } from "../Infiltration";

export class CountdownModel implements InfiltrationStage {
  count = 3;

  onKey(__: KeyboardLikeEvent) {}

  constructor(state: Infiltration) {
    state.setTimeSequence(this, [300, 300, 300], (i) => {
      this.count = 2 - i;
      if (this.count) {
        state.updateEvent.emit();
      } else {
        state.newGame();
      }
    });
  }
}
