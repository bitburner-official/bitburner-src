import type { GangMemberUpgradeName } from "@nsdefs";
import { gangMemberUpgradesMetadata } from "./data/upgrades";
import { GangMemberUpgrade } from "./GangMemberUpgrade";

// This assertion is safe because this map is populated with data from gangMemberUpgradesMetadata, which contains all
// GangMemberUpgradeName entries.
export const GangMemberUpgrades = {} as Record<GangMemberUpgradeName, GangMemberUpgrade>;

(function () {
  gangMemberUpgradesMetadata.forEach((e) => {
    GangMemberUpgrades[e.name] = new GangMemberUpgrade(e.name, e.cost, e.upgType, e.mults);
  });
})();
