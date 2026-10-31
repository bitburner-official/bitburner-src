import type { GangMemberUpgradeName } from "@nsdefs";
import { gangMemberUpgradesMetadata } from "./data/upgrades";
import { GangMemberUpgrade } from "./GangMemberUpgrade";

export const GangMemberUpgrades = {} as Record<GangMemberUpgradeName, GangMemberUpgrade>;

(function () {
  gangMemberUpgradesMetadata.forEach((e) => {
    GangMemberUpgrades[e.name] = new GangMemberUpgrade(e.name, e.cost, e.upgType, e.mults);
  });
})();
