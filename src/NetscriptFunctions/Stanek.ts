import { Player } from "@player";
import { AugmentationName, FactionName } from "@enums";

import { canAcceptStaneksGift, staneksGift } from "../CotMG/Helper";
import { Fragments, FragmentById } from "../CotMG/Fragment";
import { FragmentTypeEnum } from "../CotMG/FragmentType";

import type { Stanek as IStanek } from "@nsdefs";
import type { NetscriptContext, InternalAPI } from "../Netscript/APIWrapper";
import { applyAugmentation } from "../Augmentation/AugmentationHelpers";
import { joinFaction } from "../Faction/FactionHelpers";
import { Factions } from "../Faction/Factions";
import { helpers } from "../Netscript/NetscriptHelpers";
import { getCoreBonus } from "../Server/ServerHelpers";

export function NetscriptStanek(): InternalAPI<IStanek> {
  function checkStanekAPIAccess(ctx: NetscriptContext): void {
    if (!Player.hasAugmentation(AugmentationName.StaneksGift1, true)) {
      throw helpers.errorMessage(ctx, "Stanek 的礼物尚未安装");
    }
  }

  return {
    giftWidth: (ctx) => {
      checkStanekAPIAccess(ctx);
      return staneksGift.width();
    },
    giftHeight: (ctx) => {
      checkStanekAPIAccess(ctx);
      return staneksGift.height();
    },
    chargeFragment: (ctx, _rootX, _rootY) => {
      //Get the fragment object using the given coordinates
      const rootX = helpers.number(ctx, "rootX", _rootX);
      const rootY = helpers.number(ctx, "rootY", _rootY);
      checkStanekAPIAccess(ctx);
      const fragment = staneksGift.findFragment(rootX, rootY);
      //Check whether the selected fragment can ge charged
      if (!fragment) throw helpers.errorMessage(ctx, `根坐标 (${rootX}, ${rootY}) 处没有片段。`);
      if (fragment.fragment().type == FragmentTypeEnum.Booster) {
        throw helpers.errorMessage(
          ctx,
          `根坐标 (${rootX}, ${rootY}) 处的片段是增幅片段，无法充能。`,
        );
      }
      //Charge the fragment
      const cores = ctx.workerScript.getServer().cpuCores;
      const coreBonus = getCoreBonus(cores);
      const inBonus = staneksGift.inBonus();
      const time = inBonus ? 200 : 1000;
      if (inBonus) staneksGift.isBonusCharging = true;
      return helpers.netscriptDelay(ctx, time).then(function () {
        staneksGift.charge(fragment, ctx.workerScript.scriptRef.threads * coreBonus);
        helpers.log(ctx, () => `已用 ${ctx.workerScript.scriptRef.threads} 个线程为片段充能。`);
        return Promise.resolve();
      });
    },
    fragmentDefinitions: (ctx) => {
      checkStanekAPIAccess(ctx);
      helpers.log(ctx, () => `返回了 ${Fragments.length} 个片段`);
      return Fragments.map((f) => f.copy());
    },
    activeFragments: (ctx) => {
      checkStanekAPIAccess(ctx);
      helpers.log(ctx, () => `返回了 ${staneksGift.fragments.length} 个片段`);
      return staneksGift.fragments.map((activeFragment) => {
        return {
          ...activeFragment.copy(),
          ...activeFragment.fragment().copy(),
          chargedEffect: staneksGift.effect(activeFragment),
        };
      }) satisfies ReturnType<IStanek["activeFragments"]>;
    },
    clearGift: (ctx) => {
      checkStanekAPIAccess(ctx);
      helpers.log(ctx, () => `已清空 Stanek 的礼物。`);
      staneksGift.clear();
    },
    canPlaceFragment: (ctx, _rootX, _rootY, _rotation, _fragmentId) => {
      const rootX = helpers.number(ctx, "rootX", _rootX);
      const rootY = helpers.number(ctx, "rootY", _rootY);
      const rotation = helpers.number(ctx, "rotation", _rotation);
      const fragmentId = helpers.number(ctx, "fragmentId", _fragmentId);
      checkStanekAPIAccess(ctx);
      const fragment = FragmentById(fragmentId);
      if (!fragment) throw helpers.errorMessage(ctx, `无效的片段 id：${fragmentId}`);
      const can = staneksGift.canPlace(rootX, rootY, rotation, fragment);
      return can;
    },
    placeFragment: (ctx, _rootX, _rootY, _rotation, _fragmentId) => {
      const rootX = helpers.number(ctx, "rootX", _rootX);
      const rootY = helpers.number(ctx, "rootY", _rootY);
      const rotation = helpers.number(ctx, "rotation", _rotation);
      const fragmentId = helpers.number(ctx, "fragmentId", _fragmentId);
      checkStanekAPIAccess(ctx);
      const fragment = FragmentById(fragmentId);
      if (!fragment) throw helpers.errorMessage(ctx, `无效的片段 id：${fragmentId}`);
      return staneksGift.place(rootX, rootY, rotation, fragment);
    },
    getFragment: (ctx, _rootX, _rootY) => {
      const rootX = helpers.number(ctx, "rootX", _rootX);
      const rootY = helpers.number(ctx, "rootY", _rootY);
      checkStanekAPIAccess(ctx);
      const activeFragment = staneksGift.findFragment(rootX, rootY);
      if (activeFragment !== undefined) {
        return {
          ...activeFragment.copy(),
          ...activeFragment.fragment().copy(),
          chargedEffect: staneksGift.effect(activeFragment),
        } satisfies ReturnType<IStanek["getFragment"]>;
      }
      return undefined;
    },
    removeFragment: (ctx, _rootX, _rootY) => {
      const rootX = helpers.number(ctx, "rootX", _rootX);
      const rootY = helpers.number(ctx, "rootY", _rootY);
      checkStanekAPIAccess(ctx);
      return staneksGift.delete(rootX, rootY);
    },
    acceptGift: (ctx) => {
      const cotmgFaction = Factions[FactionName.ChurchOfTheMachineGod];
      // Return early if the player is already a member
      if (cotmgFaction.isMember && Player.hasAugmentation(AugmentationName.StaneksGift1, true)) {
        helpers.log(ctx, () => `你已经是 ${FactionName.ChurchOfTheMachineGod} 的成员了。`);
        return true;
      }
      // Check if the player is eligible to join the church
      const checkResult = canAcceptStaneksGift();
      if (checkResult.success) {
        // Join the CotMG faction
        joinFaction(cotmgFaction);
        // Install the first Stanek aug
        applyAugmentation({ name: AugmentationName.StaneksGift1, level: 1 });
        helpers.log(
          ctx,
          () =>
            `你加入了 '${FactionName.ChurchOfTheMachineGod}'，并安装了 '${AugmentationName.StaneksGift1}'。`,
        );
      } else {
        helpers.log(ctx, () => checkResult.message);
      }
      // Return true if the player is in CotMG and has the first Stanek aug installed
      return cotmgFaction.isMember && Player.hasAugmentation(AugmentationName.StaneksGift1, true);
    },
  };
}
