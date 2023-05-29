import { Grafting as IGrafting } from "@nsdefs";

import { augmentationExists } from "../Augmentation/AugmentationHelpers";
import { StaticAugmentations } from "../Augmentation/StaticAugmentations";
import { CityName } from "../Enums";
import { hasAugmentationPrereqs } from "../Faction/FactionHelpers";
import { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { GraftableAugmentation } from "../PersonObjects/Grafting/GraftableAugmentation";
import { calculateGraftingTimeWithBonus, getGraftingAvailableAugs } from "../PersonObjects/Grafting/GraftingHelpers";
import { Player as player } from "../Player";
import { GraftingWork } from "../Work/GraftingWork";
import { Router } from "../ui/GameRoot";
import { Page } from "../ui/Router";

export function NetscriptGrafting(): InternalAPI<IGrafting> {
  const checkGraftingAPIAccess = (ctx: NetscriptContext): void => {
    if (!player.canAccessGrafting()) {
      throw helpers.makeRuntimeErrorMsg(
        ctx,
        "You do not currently have access to the Grafting API. This is either because you are not in BitNode 10 or because you do not have Source-File 10",
      );
    }
  };

  const isValidGraftingAugName = (augName: string) =>
    getGraftingAvailableAugs().includes(augName) && augmentationExists(augName);

  return {
    getAugmentationGraftPrice: (ctx) => (_augName) => {
      const augName = helpers.string(ctx, "augName", _augName);
      checkGraftingAPIAccess(ctx);
      if (!isValidGraftingAugName(augName)) {
        throw helpers.makeRuntimeErrorMsg(ctx, `Invalid aug: ${augName}`);
      }
      const graftableAug = new GraftableAugmentation(StaticAugmentations[augName]);
      return graftableAug.cost;
    },

    getAugmentationGraftTime: (ctx) => (_augName) => {
      const augName = helpers.string(ctx, "augName", _augName);
      checkGraftingAPIAccess(ctx);
      if (!isValidGraftingAugName(augName)) {
        throw helpers.makeRuntimeErrorMsg(ctx, `Invalid aug: ${augName}`);
      }
      const graftableAug = new GraftableAugmentation(StaticAugmentations[augName]);
      return calculateGraftingTimeWithBonus(graftableAug);
    },

    getGraftableAugmentations: (ctx) => () => {
      checkGraftingAPIAccess(ctx);
      const graftableAugs = getGraftingAvailableAugs();
      return graftableAugs;
    },

    graftAugmentation:
      (ctx) =>
      (_augName, _focus = true) => {
        const augName = helpers.string(ctx, "augName", _augName);
        const focus = !!_focus;
        checkGraftingAPIAccess(ctx);
        if (player.city !== CityName.NewTokyo) {
          throw helpers.makeRuntimeErrorMsg(ctx, "You must be in New Tokyo to begin grafting an Augmentation.");
        }
        if (!isValidGraftingAugName(augName)) {
          helpers.log(ctx, () => `Invalid aug: ${augName}`);
          return false;
        }

        const wasFocusing = player.focus;

        const craftableAug = new GraftableAugmentation(StaticAugmentations[augName]);
        if (player.money < craftableAug.cost) {
          helpers.log(ctx, () => `You don't have enough money to craft ${augName}`);
          return false;
        }

        if (!hasAugmentationPrereqs(craftableAug.augmentation)) {
          helpers.log(ctx, () => `You don't have the pre-requisites for ${augName}`);
          return false;
        }

        player.startWork(
          new GraftingWork({
            singularity: true,
            augmentation: augName,
          }),
        );

        if (focus) {
          player.startFocusing();
          Router.toPage(Page.Work);
        } else if (wasFocusing) {
          player.stopFocusing();
          Router.toPage(Page.Terminal);
        }

        helpers.log(ctx, () => `Began grafting Augmentation ${augName}.`);
        return true;
      },
  };
}
