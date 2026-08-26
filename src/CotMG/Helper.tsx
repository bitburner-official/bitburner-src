import { Player } from "@player";
import { AugmentationName } from "@enums";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import { Reviver } from "../utils/GenericReviver";
import { BaseGift } from "./BaseGift";

import { StaneksGift } from "./StaneksGift";
import type { Result } from "@nsdefs";
import { isStanekGiftImplemented } from "../utils/ErrorHelper";

export let staneksGift = new StaneksGift();

export function loadStaneksGift(saveString: string, versionSave?: string): void {
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
    if (isStanekGiftImplemented(versionSave)) {
      setTimeout(() => {
        dialogBoxCreate(`无法加载 Stanek 的礼物的数据。Stanek 的礼物已被重置。错误：${error}。`);
      }, 1000);
    }
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
    return { success: false, message: "你没有源文件 13。" };
  }
  if (
    [...Player.augmentations, ...Player.queuedAugmentations].filter(
      (a) => a.name !== AugmentationName.NeuroFluxGovernor,
    ).length !== 0
  ) {
    return {
      success: false,
      message: `你已经购买或安装了 ${AugmentationName.NeuroFluxGovernor} 以外的强化。`,
    };
  }
  return { success: true };
}
