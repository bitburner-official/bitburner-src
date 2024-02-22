# Basic gameplay – Term

## Basic gameplay

There is `corporation-management-handbook.lit` in your home server. Read it.

Go to City Hall in Sector-12 and create Corporation through UI if you want. However, you should do everything by scripting.

You can use seed money when creating corporation in BN3.

There are multiple industries that you can expand into. In order to do that, you need to choose an industry and create a division. Agriculture is the best starting industry. Check this [section](./industry-supply-chain.md) for details.

Each division can expand to 6 cities.

Each industry has different input materials and output materials/products. For example: Agriculture needs Water and Chemicals to produce Plants and Food. The number next to material is its "coefficient" (You can call it "weight" or "factor" if you want).

$$0.5\;\textit{Water}+0.2\;\textit{Chemicals}\Rightarrow 1\;\textit{Plants}+1\;\textit{Food}$$

There is no "offline progress" in corporation. When you go offline, corporation accumulates bonus time.

Corporation continuously transitions between 5 states: START → PURCHASE → PRODUCTION → EXPORT → SALE → START. 1 cycle of these transitions takes 10 seconds. If you have enough bonus time, it takes 1 second. Check this [section](./miscellany.md) for details.

Each division has its "division product multiplier". This multiplier can be increased by buying [boost materials](./boost-material.md): AI Cores, Hardware, Real Estate, Robots.

You should look around to get familiar with UI. One confused thing for newbie is how to setup "buy value" to buy materials. We have "Purchase" and "Bulk purchase":
- Purchase: This is "buy per second" value. For example: In cycle 1, you enter "100", then in cycle 2, at PURCHASE state, you'll have 100*10 units in your inventory. You can buy more than what your funds allows (and go into debt) with this option. Important note: when you have enough units that you want, you must press "Clear purchase", otherwise it'll buy forever until you run out of storage space.
- Bulk purchase: You buy exactly what you want. Must pay upfront.

If you want to buy something, write script to do that. It's too error-prone to do it manually.

When you hover your mouse over warehouse, you'll see the spaces that those materials take up in the warehouse. They are not the numbers of units.

## Term

Smart Supply: Automatically buy optimal quantities of input material units.

Export: Allow export/import materials between divisions.

Wilson: Wilson Analytics upgrade.

Market-TA2: Automatically set optimal price for your output material/product.

RP: Research point.