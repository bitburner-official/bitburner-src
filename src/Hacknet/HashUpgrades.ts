/**
 * Map of all Hash Upgrades
 * Key = Hash name, Value = HashUpgrade object
 */
import { HashUpgrade, HashUpgradeParams } from "./HashUpgrade";
import { HashUpgradesMetadata } from "./data/HashUpgradesMetadata";

export const HashUpgrades: Record<string, HashUpgrade> = {};

function createHashUpgrade(p: HashUpgradeParams): void {
  HashUpgrades[p.name] = new HashUpgrade(p);
}

for (const metadata of HashUpgradesMetadata) {
  createHashUpgrade(metadata);
}
