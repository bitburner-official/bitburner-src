import { dialogBoxCreate } from "../ui/React/DialogBox";
import { Reviver } from "../utils/JSONReviver";
import { BaseGift } from "./BaseGift";

import { StaneksGift } from "./StaneksGift";

export let staneksGift = new StaneksGift();

export function loadStaneksGift(saveString: string): void {
  let staneksGiftData: unknown;
  try {
    staneksGiftData = JSON.parse(saveString, Reviver);
  } catch (error) {
    console.error(error);
  }
  if (!(staneksGiftData instanceof StaneksGift)) {
    console.error("Invalid StaneksGiftSave:", saveString);
    staneksGift = new StaneksGift();
    setTimeout(() => {
      dialogBoxCreate("Cannot load data of Stanek's Gift. Stanek's Gift is reset.");
    }, 1000);
    return;
  }
  staneksGift = staneksGiftData;
}

export function zeros(width: number, height: number): number[][] {
  const array: number[][] = [];

  for (let i = 0; i < width; ++i) {
    array.push(Array<number>(height).fill(0));
  }

  return array;
}

export function calculateGrid(gift: BaseGift): number[][] {
  const newgrid = zeros(gift.width(), gift.height()) as unknown as number[][];
  for (let i = 0; i < gift.width(); i++) {
    for (let j = 0; j < gift.height(); j++) {
      const fragment = gift.fragmentAt(i, j);
      if (!fragment) continue;
      newgrid[i][j] = 1;
    }
  }

  return newgrid;
}
