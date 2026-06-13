import type { KeyboardLikeEvent } from "./InfiltrationStage";
import { KEY } from "../utils/KeyboardEventKey";
import { Player } from "@player";
import { AugmentationName } from "@enums";

export const upArrowSymbol = "↑";
export const downArrowSymbol = "↓";
export const leftArrowSymbol = "←";
export const rightArrowSymbol = "→";

export type Arrow = typeof leftArrowSymbol | typeof rightArrowSymbol | typeof upArrowSymbol | typeof downArrowSymbol;

export function getArrow(event: KeyboardLikeEvent): Arrow | undefined {
  switch (event.key) {
    case KEY.UP_ARROW:
    case KEY.W:
    case KEY.K:
      return upArrowSymbol;
    case KEY.LEFT_ARROW:
    case KEY.A:
    case KEY.H:
      return leftArrowSymbol;
    case KEY.DOWN_ARROW:
    case KEY.S:
    case KEY.J:
      return downArrowSymbol;
    case KEY.RIGHT_ARROW:
    case KEY.D:
    case KEY.L:
      return rightArrowSymbol;
  }
}

export function calculateDamageAfterFailingInfiltration(startingDifficulty: number): number {
  return startingDifficulty * 3 * (Player.hasAugmentation(AugmentationName.WKSharmonizer, true) ? 0.5 : 1);
}
