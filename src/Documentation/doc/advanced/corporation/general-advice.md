# General advice

## Round 1

Create Agriculture division, expand to 6 cities and buy 6 warehouses.

Use API (`upgradeOfficeSize`) to upgrade office size from 3 to 4. Set 4 employees to R&D and wait until RP is at least 55. Switch to Operations (1) + Engineer (1) + Business (1) + Management (1) before buying boost materials.

Make sure that your employees' energy and morale are at maximum value. This is always mandatory, not just in round 1.

Write a custom "Smart Supply" script. If you skip this step, buy "Smart Supply" feature. "Smart Supply" costs 25b, and 25b is huge in round 1.

There are not many things else to do in this round. The budget is too low, so you can skip all these things:

- Expand into other industries.
- Buy corporation's upgrades (except Smart Storage).

Use remaining funds to buy these upgrades:

- Only focus on Smart Storage and warehouse upgrade.
- Buy 2 Advert levels.

After that, find the optimal quantities of boost materials and buy them. Do not use "Bulk Purchase", it requires paying upfront. Buying boost materials per second does not need funds because you can go into debt.

## Round 2

Buy "Export".

Upgrade Agriculture division:

- Find a good number for office size. 8 is the optimal size.
- Buy a couple of Advert levels. Advert level 8 is enough for most cases.

Create Chemical division:

- Expanding into Chemical industry is mandatory. Without high-quality Chemicals (material) from Chemical division, output materials in Agriculture will be low-quality, and low-quality materials cannot be sold well.
- Chemical division is a support division, so don't invest much funds on it. Don't waste funds on its Office/Advert upgrades.
- Chemical industry has low boost materials' coefficients, so you should only buy very small number of warehouse upgrade for it. On the other hand, you should not skip Chemical's warehouse upgrade entirely. You still need Chemical division produces an acceptable amount of high-quality Chemical; otherwise, the quality of Chemical used in PRODUCTION state of Agriculture division is reduced too much due to "dilution" in PURCHASE state. For this purpose, 1 warehouse upgrade is enough.

Focus on Smart Storage, Smart Factories, warehouse upgrade (Agriculture).

Waiting for RP is mandatory in this round. It serves 2 purposes:

- Raising RP in Chemical. High RP means high-quality Chemicals (material).
- Raising RP in Agriculture. High RP means high-quality Plants.
  - High-quality Plants can be exported to Chemical to create a loop of quality-enhancing process.
  - High-quality Plants can be sold easier (higher [MaxSalesVolume](./optimal-selling-price-market-ta2.md)). With your limited budget, you can only increase `MaxSalesVolume` by buying Advert and improving quality of output material. Buying Advert costs money, but waiting for RP is free (except your time).

Waiting for 700RP/390RP in Agriculture/Chemical division respectively is enough. You can wait for more if you want.

## Round 3+

Create Tobacco division in round 3 and set up export route for Plants from Agriculture to Tobacco. This is the optimal product division in this phase.

The basic game loop that you need to do in round 3+ is simple:

- Buy research.
- Buy Wilson and Advert.
- Continuously develop new product.
- Upgrade product division and buy corporation's upgrades.
- Upgrade support divisions.

These are the most important things that you need to focus on:

- Buy Wilson and Advert.
- Continuously develop new product.
- Get high-quality input materials from support division(s).
- Stock up on RP.
- Get Market-TA2 as soon as possible.

Wilson and Advert are extremely important, they are the main factors that make product extremely profitable.

- Check this [section](./wilson-analytics-advert.md) for details about the mechanism of Wilson and Advert.
- When you continuously improve the product division and buy the upgrades with small budget (profit of a few cycles):
  - Buy Wilson if you can afford it.
  - After that, use at least 20% of current funds to buy Advert.
- Stop buying Wilson and Advert when product division's awareness/popularity reaches max value.

[Product](./product.md) is the center of round 3+.

Product's rating is limited to product's effective rating by quality of input materials. You must make sure that support divisions produce enough high-quality materials for product division. For material divisions, increasing RP is the best way to improve the quality in early rounds. However, in round 3+, the most important factor is `EngineerProduction`, so you must prioritize the "Engineer" job over other jobs. It's especially true for Agriculture due to its mediocre `ScienceFactor`. Check this [section](./quality.md) for details. On the other hand, it's fine to invest minimally in support divisions, as long as they produce enough high-quality materials.

RP is important for product's rating. Do not deplete RP pool, especially right before completing new product.

Check this [section](./unlocks-upgrade-research.md) for more advices about researches.

Office setup is important to efficiently develop new product. There are multiple setups for different purposes:

- Raw production: This setup prioritizes production capability. For support divisions, you should "combine" the prioritization of "Engineer" job with this setup.
- Progress: This setup prioritizes development speed of new product. It's best for product division in round 3 and round 4. The product's development speed is very low in these 2 rounds (especially in round 3). By focusing on development speed and get better product sooner, you can reach the point that you can get an adequate offer faster.
- Profit. This setup prioritizes profit. It's best at the end of a round, before accepting offer.
- Profit-Progress. This setup provides good balance between current profit and development speed of new product. It's best after accepting last offer.

All the setups above can be calculated by an optimizer. However, that optimizer is hard to implement correctly and efficiently. If you are a newbie, you can skip this optimization and spread employees equally across non-R&D jobs. It's not optimal, but you can still reach the endgame after couple hours if you follow other important advices.

There are 2 types of office: main office and support office. Main office is where you develop new product. Support office is where you assign a large number of employees to R&D job to increase RP. The most common setup is 1 main office and 5 support offices. The most important office is the main office, its budget must be much higher than support offices' budget.

The purpose of investment offer is to get large funds and quickly grow the corporation. Better product brings more profit, and higher profit means higher offer. However, it takes a long time to develop early product(s). Sometimes, spending more time to develop better product before accepting offer can harm your overall growth. You must find a good number of products to develop before accepting offer.

Miscellaneous advices:

- Buy tea / throw party every cycle.
- `DesignInvestment` and `AdvertisingInvestment` scale very badly (the exponent is 0.1). It's fine to spend 1% of your current funds for them.
- Create [dummy divisions](./miscellany.md) to get higher offer.
- Prioritize Tobacco division over Chemical division when setting up export routes for Plants. [Export](./miscellany.md) route is FIFO.

You can visit the [official Discord server](https://discord.gg/TFc3hKD) to get access to more information.
