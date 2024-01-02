import { Player } from "@player";
import { AugmentationName, FactionName } from "@enums";

import { staneksGift } from "../CotMG/Helper";
import { Fragments, FragmentById } from "../CotMG/Fragment";
import { FragmentType } from "../CotMG/FragmentType";

import { Stanek as IStanek } from "@nsdefs";
import { NetscriptContext, InternalAPI } from "../Netscript/APIWrapper";
import { applyAugmentation } from "../Augmentation/AugmentationHelpers";
import { joinFaction } from "../Faction/FactionHelpers";
import { Factions } from "../Faction/Factions";
import { helpers } from "../Netscript/NetscriptHelpers";
import { getCoreBonus } from "../Server/ServerHelpers";

export function NetscriptStanek(): InternalAPI<IStanek> {
  function checkStanekAPIAccess(ctx: NetscriptContext): void {
    if (!Player.hasAugmentation(AugmentationName.StaneksGift1, true)) {
      throw helpers.makeRuntimeErrorMsg(ctx, "Stanek's Gift is not installed");
    }
  }

  return {
    giftWidth: (ctx) => () => {
      checkStanekAPIAccess(ctx);
      return staneksGift.width();
    },
    giftHeight: (ctx) => () => {
      checkStanekAPIAccess(ctx);
      return staneksGift.height();
    },
    chargeFragment: (ctx) => (_rootX, _rootY) => {
      //Get the fragment object using the given coordinates
      const rootX = helpers.number(ctx, "rootX", _rootX);
      const rootY = helpers.number(ctx, "rootY", _rootY);
      checkStanekAPIAccess(ctx);
      const fragment = staneksGift.findFragment(rootX, rootY);
      //Check whether the selected fragment can ge charged
      if (!fragment) throw helpers.makeRuntimeErrorMsg(ctx, `No fragment with root (${rootX}, ${rootY}).`);
      if (fragment.fragment().type == FragmentType.Booster) {
        throw helpers.makeRuntimeErrorMsg(
          ctx,
          `The fragment with root (${rootX}, ${rootY}) is a Booster Fragment and thus cannot be charged.`,
        );
      }
      //Charge the fragment
      const cores = helpers.getServer(ctx, ctx.workerScript.hostname).cpuCores;
      const coreBonus = getCoreBonus(cores);
      const inBonus = staneksGift.inBonus();
      const time = inBonus ? 200 : 1000;
      if (inBonus) staneksGift.isBonusCharging = true;
      return helpers.netscriptDelay(ctx, time).then(function () {
        staneksGift.charge(fragment, ctx.workerScript.scriptRef.threads * coreBonus);
        helpers.log(ctx, () => `Charged fragment with ${ctx.workerScript.scriptRef.threads} threads.`);
        return Promise.resolve();
      });
    },
    fragmentDefinitions: (ctx) => () => {
      checkStanekAPIAccess(ctx);
      helpers.log(ctx, () => `Returned ${Fragments.length} fragments`);
      return Fragments.map((f) => f.copy());
    },
    activeFragments: (ctx) => () => {
      checkStanekAPIAccess(ctx);
      helpers.log(ctx, () => `Returned ${staneksGift.fragments.length} fragments`);
      return staneksGift.fragments.map((af) => {
        return { ...af.copy(), ...af.fragment().copy() };
      });
    },
    clearGift: (ctx) => () => {
      checkStanekAPIAccess(ctx);
      helpers.log(ctx, () => `Cleared Stanek's Gift.`);
      staneksGift.clear();
    },
    canPlaceFragment: (ctx) => (_rootX, _rootY, _rotation, _fragmentId) => {
      const rootX = helpers.number(ctx, "rootX", _rootX);
      const rootY = helpers.number(ctx, "rootY", _rootY);
      const rotation = helpers.number(ctx, "rotation", _rotation);
      const fragmentId = helpers.number(ctx, "fragmentId", _fragmentId);
      checkStanekAPIAccess(ctx);
      const fragment = FragmentById(fragmentId);
      if (!fragment) throw helpers.makeRuntimeErrorMsg(ctx, `Invalid fragment id: ${fragmentId}`);
      const can = staneksGift.canPlace(rootX, rootY, rotation, fragment);
      return can;
    },
    placeFragment: (ctx) => (_rootX, _rootY, _rotation, _fragmentId) => {
      const rootX = helpers.number(ctx, "rootX", _rootX);
      const rootY = helpers.number(ctx, "rootY", _rootY);
      const rotation = helpers.number(ctx, "rotation", _rotation);
      const fragmentId = helpers.number(ctx, "fragmentId", _fragmentId);
      checkStanekAPIAccess(ctx);
      const fragment = FragmentById(fragmentId);
      if (!fragment) throw helpers.makeRuntimeErrorMsg(ctx, `Invalid fragment id: ${fragmentId}`);
      return staneksGift.place(rootX, rootY, rotation, fragment);
    },
    getFragment: (ctx) => (_rootX, _rootY) => {
      const rootX = helpers.number(ctx, "rootX", _rootX);
      const rootY = helpers.number(ctx, "rootY", _rootY);
      checkStanekAPIAccess(ctx);
      const fragment = staneksGift.findFragment(rootX, rootY);
      if (fragment !== undefined) return fragment.copy();
      return undefined;
    },
    removeFragment: (ctx) => (_rootX, _rootY) => {
      const rootX = helpers.number(ctx, "rootX", _rootX);
      const rootY = helpers.number(ctx, "rootY", _rootY);
      checkStanekAPIAccess(ctx);
      return staneksGift.delete(rootX, rootY);
    },
    acceptGift: (ctx) => () => {
      const cotmgFaction = Factions[FactionName.ChurchOfTheMachineGod];
      // Check if the player is eligible to join the church
      if (Player.canAccessCotMG()) {
        const augs = [...Player.augmentations, ...Player.queuedAugmentations].filter(
          (a) => a.name !== AugmentationName.NeuroFluxGovernor,
        );
        if (augs.length == 0) {
          // Join the CotMG factionn
          joinFaction(cotmgFaction);
          // Install the first Stanek aug
          applyAugmentation({ name: AugmentationName.StaneksGift1, level: 1 });
          helpers.log(
            ctx,
            () => `'${FactionName.ChurchOfTheMachineGod}' joined and '${AugmentationName.StaneksGift1}' installed.`,
          );
        }
      }
      // Return true iff the player is in CotMG and has the first Stanek aug installed
      return cotmgFaction.isMember && Player.hasAugmentation(AugmentationName.StaneksGift1, true);
    },
  };
}
