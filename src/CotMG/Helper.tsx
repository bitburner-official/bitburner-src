import { Player } from "@player";
import { AugmentationName } from "@enums";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import { Reviver } from "../utils/GenericReviver";
import { BaseGift } from "./BaseGift";

import { StaneksGift } from "./StaneksGift";
import { Result } from "../types";

export let staneksGift = new StaneksGift();

export function loadStaneksGift(saveString: string): void {
  let staneksGiftData: unknown;
  try {
    staneksGiftData = JSON.parse(saveString, Reviver);
    if (!(staneksGiftData instanceof StaneksGift)) {
      throw new Error(`Data of Stanek's Gift is not an instance of "StaneksGift"`);
    }
  } catch (error) {
    console.error(error);
    console.error("Invalid StaneksGiftSave:", saveString);
    staneksGift = new StaneksGift();
    setTimeout(() => {
      dialogBoxCreate(`Cannot load data of Stanek's Gift. Stanek's Gift is reset. Error: ${error}.`);
    }, 1000);
    return;
  }
  staneksGift = staneksGiftData;
}

export function zeros(width: number, height: number): number[][] {
  const array = [];

  for (let i = 0; i < width; ++i) {
    array.push(Array<number>(height).fill(0));
  }

  return array;
}

export function calculateGrid(gift: BaseGift): number[][] {
  const newGrid = zeros(gift.width(), gift.height());
  for (let i = 0; i < gift.width(); i++) {
    for (let j = 0; j < gift.height(); j++) {
      const fragment = gift.fragmentAt(i, j);
      if (!fragment) {
        continue;
      }
      newGrid[i][j] = 1;
    }
  }

  return newGrid;
}

export function canAcceptStaneksGift(): Result {
  if (!Player.canAccessCotMG()) {
    return { success: false, message: "You do not have Source-File 13." };
  }
  if (
    [...Player.augmentations, ...Player.queuedAugmentations].filter(
      (a) => a.name !== AugmentationName.NeuroFluxGovernor,
    ).length !== 0
  ) {
    return {
      success: false,
      message: `You already purchased or installed augmentations that are not ${AugmentationName.NeuroFluxGovernor}.`,
    };
  }
  return { success: true };
}
