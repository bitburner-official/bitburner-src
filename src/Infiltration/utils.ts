import { KEY } from "../utils/helpers/keyCodes";
import { Player } from "@player";
import { AugmentationName } from "@enums";

export function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export const upArrowSymbol = "↑";
export const downArrowSymbol = "↓";
export const leftArrowSymbol = "←";
export const rightArrowSymbol = "→";

export type Arrow = typeof leftArrowSymbol | typeof rightArrowSymbol | typeof upArrowSymbol | typeof downArrowSymbol;

export function getArrow(event: KeyboardEvent): Arrow | undefined {
  switch (event.key) {
    case KEY.UP_ARROW:
    case KEY.W:
      return upArrowSymbol;
    case KEY.LEFT_ARROW:
    case KEY.A:
      return leftArrowSymbol;
    case KEY.DOWN_ARROW:
    case KEY.S:
      return downArrowSymbol;
    case KEY.RIGHT_ARROW:
    case KEY.D:
      return rightArrowSymbol;
  }
}

export function calculateDamageAfterFailingInfiltration(startingDifficulty: number): number {
  return startingDifficulty * 3 * (Player.hasAugmentation(AugmentationName.WKSharmonizer, true) ? 0.5 : 1);
}
