# Warehouse

Warehouse starts at level 1 after being bought. The initial price is 5e9.

`BasePrice` in the following formulas is the upgrade's base price (1e9), not the initial price above.

Warehouse upgrade cost: its formula is a bit different from other upgrades (the exponent is `CurrentLevel+1` instead of `CurrentLevel`):

$$UpgradeCost = BasePrice\ast{1.07}^{CurrentLevel + 1}$$

Upgrade cost for buying from level 1 to level n:

$$UpgradeCost_{From\ 1\ to\ n} = \sum_{k = 2}^{n}{BasePrice\ast {1.07}^k}$$

≡

$$UpgradeCost_{From\ 1\ to\ n} = BasePrice\ast\left( \frac{{1.07}^{n + 1} - {1.07}^{2}}{0.07} \right)$$

Upgrade cost for buying from level a to level b:

$$UpgradeCost_{From\ a\ to\ b} = BasePrice\ast\left( \frac{{1.07}^{b + 1} - {1.07}^{a + 1}}{0.07} \right)$$

Maximum level with a given `MaxCost`:

$$MaxLevel = (log_{1.07}\left(MaxCost\ast\frac{0.07}{BasePrice} + {1.07}^{CurrentLevel+1} \right)) - 1$$

Warehouse size:

- Upgrade multiplier: multiplier from Smart Storage.
- Research multiplier: multiplier from researches.

$$WarehouseSize = WarehouseLevel\ast 100\ast UpgradeMultiplier\ast ResearchMultiplier$$
