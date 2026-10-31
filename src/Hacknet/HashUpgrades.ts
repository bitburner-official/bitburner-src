/**
 * Map of all Hash Upgrades
 * Key = Hash name, Value = HashUpgrade object
 */
import type { HacknetServerHashUpgrade } from "@nsdefs";
import { HashUpgrade } from "./HashUpgrade";
import { HashUpgradesMetadata } from "./data/HashUpgradesMetadata";

export const HashUpgrades = {} as Record<HacknetServerHashUpgrade, HashUpgrade>;

for (const metadata of HashUpgradesMetadata) {
  HashUpgrades[metadata.name] = new HashUpgrade(metadata);
}
