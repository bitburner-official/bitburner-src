import type { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import { StaticAugmentations } from "../Augmentation/StaticAugmentations";
import { hasAugmentationPrereqs } from "../Faction/FactionHelpers";
import { CityName } from "@enums";
import { GraftableAugmentation } from "../PersonObjects/Grafting/GraftableAugmentation";
import { getGraftingAvailableAugs, calculateGraftingTimeWithBonus } from "../PersonObjects/Grafting/GraftingHelpers";
import { Player } from "@player";
import { Grafting as IGrafting } from "@nsdefs";
import { Router } from "../ui/GameRoot";
import { Page } from "../ui/Router";
import { GraftingWork } from "../Work/GraftingWork";
import { helpers } from "../Netscript/NetscriptHelpers";
import { augmentationExists } from "../Augmentation/AugmentationHelpers";

export function NetscriptGrafting(): InternalAPI<IGrafting> {
  const checkGraftingAPIAccess = (ctx: NetscriptContext): void => {
    if (!Player.canAccessGrafting()) {
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
        if (Player.city !== CityName.NewTokyo) {
          throw helpers.makeRuntimeErrorMsg(ctx, "You must be in New Tokyo to begin grafting an Augmentation.");
        }
        if (!isValidGraftingAugName(augName)) {
          helpers.log(ctx, () => `Invalid aug: ${augName}`);
          return false;
        }

        const wasFocusing = Player.focus;

        const craftableAug = new GraftableAugmentation(StaticAugmentations[augName]);
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
  };
}
