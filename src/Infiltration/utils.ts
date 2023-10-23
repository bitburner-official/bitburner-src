import { KEY } from "../utils/helpers/keyCodes";

export function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export const upArrowSymbol = "↑";
export const downArrowSymbol = "↓";
export const leftArrowSymbol = "←";
export const rightArrowSymbol = "→";

export const leftDashedArrowSymbol = "\u21e0";
export const upDashedArrowSymbol = "\u21e1";
export const rightDashedArrowSymbol = "\u21e2";
export const downDashedArrowSymbol = "\u21e3";

export function getArrow(event: KeyboardEvent): string {
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
  return "";
}

export function getInverseArrow(event: KeyboardEvent): string {
  switch (event.key) {
    case KEY.DOWN_ARROW:
    case KEY.S:
      return upArrowSymbol;
    case KEY.RIGHT_ARROW:
    case KEY.D:
      return leftArrowSymbol;
    case KEY.UP_ARROW:
    case KEY.W:
      return downArrowSymbol;
    case KEY.LEFT_ARROW:
    case KEY.A:
      return rightArrowSymbol;
  }
  return "";
}

export function toDashedArrow(arrow: string): string {
  switch (arrow) {
    case downArrowSymbol:
      return downDashedArrowSymbol;
    case rightArrowSymbol:
      return rightDashedArrowSymbol;
    case upArrowSymbol:
      return upDashedArrowSymbol;
    case leftArrowSymbol:
      return leftDashedArrowSymbol;
  }
  return "";
}
