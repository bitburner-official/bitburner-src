import type { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";

import { Player } from "@player";
import { Grafting as IGrafting } from "@nsdefs";
import { AugmentationName, CityName } from "@enums";
import { Augmentations } from "../Augmentation/Augmentations";
import { hasAugmentationPrereqs } from "../Faction/FactionHelpers";
import { GraftableAugmentation } from "../PersonObjects/Grafting/GraftableAugmentation";
import { getGraftingAvailableAugs, calculateGraftingTimeWithBonus } from "../PersonObjects/Grafting/GraftingHelpers";
import { Router } from "../ui/GameRoot";
import { Page } from "../ui/Router";
import { GraftingWork } from "../Work/GraftingWork";
import { helpers } from "../Netscript/NetscriptHelpers";
import { getEnumHelper } from "../utils/EnumHelper";

export function NetscriptGrafting(): InternalAPI<IGrafting> {
  const checkGraftingAPIAccess = (ctx: NetscriptContext): void => {
    if (!Player.canAccessGrafting()) {
      throw helpers.errorMessage(
        ctx,
        "你目前无法访问嫁接 API。这可能是因为你不在 BitNode 10，或者你没有源文件 10",
      );
    }
  };

  const isValidGraftingAugName = (augName: AugmentationName) => getGraftingAvailableAugs().includes(augName);

  return {
    getAugmentationGraftPrice: (ctx, _augName) => {
      const augName = getEnumHelper("AugmentationName").nsGetMember(ctx, _augName);
      checkGraftingAPIAccess(ctx);
      if (!isValidGraftingAugName(augName)) {
        throw helpers.errorMessage(ctx, `无效的强化：${augName}`);
      }
      const graftableAug = new GraftableAugmentation(Augmentations[augName]);
      return graftableAug.cost;
    },

    getAugmentationGraftTime: (ctx, _augName) => {
      const augName = getEnumHelper("AugmentationName").nsGetMember(ctx, _augName);
      checkGraftingAPIAccess(ctx);
      if (!isValidGraftingAugName(augName)) {
        throw helpers.errorMessage(ctx, `无效的强化：${augName}`);
      }
      const graftableAug = new GraftableAugmentation(Augmentations[augName]);
      return calculateGraftingTimeWithBonus(graftableAug);
    },

    getGraftableAugmentations: (ctx) => {
      checkGraftingAPIAccess(ctx);
      return getGraftingAvailableAugs();
    },

    graftAugmentation: (ctx, _augName, _focus = true) => {
      const augName = getEnumHelper("AugmentationName").nsGetMember(ctx, _augName);
      const focus = !!_focus;
      checkGraftingAPIAccess(ctx);
      if (Player.city !== CityName.NewTokyo) {
        throw helpers.errorMessage(ctx, "你必须在新东京才能开始嫁接强化。");
      }
      if (!isValidGraftingAugName(augName)) {
        helpers.log(ctx, () => `无效的强化：${augName}`);
        return false;
      }

      const wasFocusing = Player.focus;

      const craftableAug = new GraftableAugmentation(Augmentations[augName]);
      if (Player.money < craftableAug.cost) {
        helpers.log(ctx, () => `你没有足够的资金来嫁接 ${augName}`);
        return false;
      }

      if (!hasAugmentationPrereqs(craftableAug.augmentation)) {
        helpers.log(ctx, () => `你不满足 ${augName} 的前置条件`);
        return false;
      }

      Player.startWork(
        new GraftingWork({
          singularity: true,
          augmentation: augName,
        }),
      );

      if (focus) {
        Player.startFocusing();
        Router.toPage(Page.Work);
      } else if (wasFocusing) {
        Router.toPage(Page.Terminal);
      }

      helpers.log(ctx, () => `开始嫁接强化 ${augName}。`);
      return true;
    },

    waitForOngoingGrafting: (ctx) => {
      checkGraftingAPIAccess(ctx);
      if (!Player.currentWork) {
        return Promise.resolve();
      }
      if (!(Player.currentWork instanceof GraftingWork)) {
        return Promise.reject(
          `当前的工作不是嫁接工作。当前工作类型：${Player.currentWork.type}。`,
        );
      }
      return Player.currentWork.nextCompletion;
    },
  };
}
