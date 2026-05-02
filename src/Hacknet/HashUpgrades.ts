/**
 * Map of all Hash Upgrades
 * Key = Hash name, Value = HashUpgrade object
 */
import { HashUpgradeEnum } from "./Enums";
import { HashUpgrade } from "./HashUpgrade";
import { HashUpgradesMetadata } from "./data/HashUpgradesMetadata";

export const HashUpgrades = {} as Record<HashUpgradeEnum, HashUpgrade>;

for (const metadata of HashUpgradesMetadata) {
  HashUpgrades[metadata.name] = new HashUpgrade(metadata);
}
