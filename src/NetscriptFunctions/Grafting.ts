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
        "You do not currently have access to the Grafting API. This is either because you are not in BitNode 10 or because you do not have Source-File 10",
      );
    }
  };

  const isValidGraftingAugName = (augName: AugmentationName) => getGraftingAvailableAugs().includes(augName);

  return {
    getAugmentationGraftPrice: (ctx) => (_augName) => {
      const augName = getEnumHelper("AugmentationName").nsGetMember(ctx, _augName);
      checkGraftingAPIAccess(ctx);
      if (!isValidGraftingAugName(augName)) {
        throw helpers.errorMessage(ctx, `Invalid aug: ${augName}`);
      }
      const graftableAug = new GraftableAugmentation(Augmentations[augName]);
      return graftableAug.cost;
    },

    getAugmentationGraftTime: (ctx) => (_augName) => {
      const augName = getEnumHelper("AugmentationName").nsGetMember(ctx, _augName);
      checkGraftingAPIAccess(ctx);
      if (!isValidGraftingAugName(augName)) {
        throw helpers.errorMessage(ctx, `Invalid aug: ${augName}`);
      }
      const graftableAug = new GraftableAugmentation(Augmentations[augName]);
      return calculateGraftingTimeWithBonus(graftableAug);
    },

    getGraftableAugmentations: (ctx) => () => {
      checkGraftingAPIAccess(ctx);
      return getGraftingAvailableAugs();
    },

    graftAugmentation:
      (ctx) =>
      (_augName, _focus = true) => {
        const augName = getEnumHelper("AugmentationName").nsGetMember(ctx, _augName);
        const focus = !!_focus;
        checkGraftingAPIAccess(ctx);
        if (Player.city !== CityName.NewTokyo) {
          throw helpers.errorMessage(ctx, "You must be in New Tokyo to begin grafting an Augmentation.");
        }
        if (!isValidGraftingAugName(augName)) {
          helpers.log(ctx, () => `Invalid aug: ${augName}`);
          return false;
        }

        const wasFocusing = Player.focus;

        const craftableAug = new GraftableAugmentation(Augmentations[augName]);
        if (Player.money < craftableAug.cost) {
          helpers.log(ctx, () => `You don't have enough money to craft ${augName}`);
          return false;
        }

        if (!hasAugmentationPrereqs(craftableAug.augmentation)) {
          helpers.log(ctx, () => `You don't have the pre-requisites for ${augName}`);
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
          Player.stopFocusing();
          Router.toPage(Page.Terminal);
        }

        helpers.log(ctx, () => `Began grafting Augmentation ${augName}.`);
        return true;
      },

    waitForOngoingGrafting: (ctx) => () => {
      checkGraftingAPIAccess(ctx);
      if (!Player.currentWork) {
        return Promise.resolve();
      }
      if (!(Player.currentWork instanceof GraftingWork)) {
        return Promise.reject(
          `The current work is not a grafting work. Type of current work: ${Player.currentWork.type}.`,
        );
      }
      return Player.currentWork.completion;
    },
  };
}
