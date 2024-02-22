# Warehouse

Warehouse starts at level 1 after being bought. The initial price is 5e9.

`BasePrice` in the following formulas is the upgrade's base price (1e9), not the initial price above.

Warehouse upgrade cost: its formula is a bit different from other upgrades (The exponent is `UpgradeCurrentLevel+1` instead of `UpgradeCurrentLevel`):

$$UpgradeCost = BasePrice*{1.07}^{UpgradeCurrentLevel + 1}$$

Upgrade cost for buying from level 1 to level n:

$$(UpgradeCost)_{From\ 1\ to\ n} = BasePrice*\left( \frac{{1.07}^{n + 1} - 1}{0.07} \right)$$

Upgrade cost for buying from level a to level b:

$$(UpgradeCost)_{From\ a\ to\ b} = BasePrice*\left( \frac{{1.07}^{b + 1} - {1.07}^{a + 1}}{0.07} \right)$$

Warehouse size:

- Upgrade multiplier: multiplier from Smart Storage.
- Research multiplier: multiplier from researches.

$$WarehouseSize = WarehouseLevel*100*UpgradeMultiplier*ResearchMultiplier$$
