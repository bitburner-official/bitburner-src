/**
 * Map of all Hash Upgrades
 * Key = Hash name, Value = HashUpgrade object
 */
import { HashUpgradeName } from "@nsdefs";
import { HashUpgrade } from "./HashUpgrade";
import { HashUpgradesMetadata } from "./data/HashUpgradesMetadata";

export const HashUpgrades = {} as Record<HashUpgradeName, HashUpgrade>;

for (const metadata of HashUpgradesMetadata) {
  HashUpgrades[metadata.name] = new HashUpgrade(metadata);
}
