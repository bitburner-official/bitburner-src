# Optimal selling price - Market-TA2

## Market price and markup limit

Market price:

- Material: `material.marketPrice`.
- Product: `product.productionCost`. This value is based on `ProductMarketPriceMult`, input materials' `MarketPrice` and `Coefficient`.
  - $n = {Number\ of\ input\ materials}$
  - $ProductMarketPriceMult = 5$

$$ProductMarketPrice = ProductMarketPriceMult\ast\sum_{i = 1}^{n}{MaterialMarketPrice_i\ast MaterialCoefficient_i}$$

Markup limit: This is how high you can raise the price above the market price before the sales volume is affected negatively.
For example: Let's say a product has MarketPrice = 5000 and MarkupLimit = 700. If you set the price smaller than or equal to 5700, the sales volume of this product will not be penalized.

- Material:

$$MaterialMarkupLimit = \frac{MaterialQuality}{MaterialMarkup}$$

- Product:

$$ProductMarkupLimit = \frac{Max(ProductEffectiveRating,0.001)}{ProductMarkup}$$

## Sales volume

`MaxSalesVolume` is the maximum number of items that you can sell in the SALE state.

`PotentialSalesVolume` is the sales volume in theory.

`MarkupMultiplier` is defined by a piecewise function depending on selling price, market price, and markup limit.

$$MaxSalesVolume = PotentialSalesVolume\ast MarkupMultiplier$$

### Potential sales volume

`PotentialSalesVolume` depends on:

- The quality of materials and the effective rating of products.
- Number of Business employees.
- Advert.
- Demand and Competition.
- ABC SalesBots.

It is the product of 6 multipliers:

$$PotentialSalesVolume = \ ItemMultiplier\ast BusinessFactor\ast AdvertFactor\ast MarketFactor\ast SaleBotsBonus\ast ResearchBonus$$

- Quality/EffectiveRating multiplier:
  - Material:
    $$ItemMultiplier = MaterialQuality + 0.001$$
  - Product:
    $$ItemMultiplier = 0.5\ast(ProductEffectiveRating)^{0.65}$$
- Business factor:
  - `BusinessProduction = 1 + office.employeeProductionByJob["Business"]`

$${BusinessFactor = (BusinessProduction)}^{0.26} + \left({BusinessProduction}\ast{0.0001}\right)$$

- Advert factor:

$$AwarenessFactor = (Awareness + 1)^{IndustryAdvertisingFactor}$$

$$PopularityFactor = (Popularity + 1)^{IndustryAdvertisingFactor}$$

$$RatioFactor = \begin{cases}Max(0.01,\frac{Popularity + 0.001}{Awareness}), & Awareness \neq 0 \newline 0.01, & Awareness = 0 \end{cases}$$

$$AdvertFactor = (AwarenessFactor\ast PopularityFactor\ast RatioFactor)^{0.85}$$

- Market factor:

$$MarketFactor = Max\left(0.1,{Demand\ast(100 - Competition)}\ast{0.01}\right)$$

- Corporation's upgrade bonus: `SalesBots` bonus.
- Division's research bonus: this is always 1. Currently there is not any research that increases the sales bonus.

### Markup multiplier

$$MarkupMultiplier = \begin{cases}10^{12} & SellingPrice \in (-\infty, 0] \newline \frac{MarketPrice}{SellingPrice} & SellingPrice \in (0, MarketPrice] \newline 1 & SellingPrice \in (MarketPrice, MarketPrice + MarkupLimit] \newline \left(\frac{MarkupLimit}{SellingPrice - MarketPrice}\right)^{2} & SellingPrice \in (MarketPrice + MarkupLimit, \infty) \end{cases}$$

Analysis for 4 ranges, in the same order of the above formula:

- Range 1: We can set `SellingPrice` to 0 and get an extremely high `MarkupMultiplier`. With this high value, we can sell all units, regardless of other factors. This is the fastest way to discard stored units.
- Range 2: `MarkupMultiplier` is a "bonus multiplier". It boosts `PotentialSalesVolume`. This means you can boost the sales volume by setting `SellingPrice` below `MarketPrice`.
- Range 3: `MaxSalesVolume` = `PotentialSalesVolume` (No bonus, no penalty). Market TA1 always set `SellingPrice` to `MarketPrice + MarkupLimit`. This means you can sell things at a price higher than the market price while ensuring the sales volume is not affected negatively.
- Range 4: `MarkupMultiplier` is a penalty modifier. More about this case later.

### Maximize sales volume

In order to increase `MaxSalesVolume`, you can:

- Improve the quality of materials and the effective rating of products.
- Use more Business employees.
- Increase the level of Advert.
- Increase the level of ABC SalesBots.
- Set the price lower than the market price. Note that you should NOT do this in most cases. If you need to do this, it's very likely that your strategy is flawed, and you need to fix it.

## Optimal selling price

Let's say that we want to sell all stored units. Define:

$$ExpectedSalesVolume = \frac{StoredUnits}{10}$$

Assume that we can sell all stored units.

$$MaxSalesVolume = ExpectedSalesVolume$$

≡

$$PotentialSalesVolume\ast MarkupMultiplier = ExpectedSalesVolume$$

≡

$$PotentialSalesVolume\ast\left(\frac{MarkupLimit}{SellingPrice - MarketPrice}\right)^{2} = ExpectedSalesVolume$$

≡

$$\frac{MarkupLimit}{SellingPrice - MarketPrice} = \sqrt{\frac{ExpectedSalesVolume}{PotentialSalesVolume}}$$

≡

$$SellingPrice = \frac{MarkupLimit\ast\sqrt{PotentialSalesVolume}}{\sqrt{ExpectedSalesVolume}} + MarketPrice$$

There are 2 cases:

- When `PotentialSalesVolume` > `ExpectedSalesVolume`, we can accept a penalty modifier (`MarkupMultiplier` < 1) and raise the price above `MarketPrice + MarkupLimit`.
- When `PotentialSalesVolume` <= `ExpectedSalesVolume`: `MarketPrice` <= `SellingPrice` <= `MarketPrice + MarkupLimit`.
  - The selling price is still higher than the market price.
  - There is no penalty modifier. In this case, we already cannot sell all items, so having no penalty modifier means that the situation is at least not worse.

This is what Market-TA2 does. It assumes that we can sell all stored units without any problems (`PotentialSalesVolume` > `ExpectedSalesVolume`) and can accept a penalty modifier. If that's the case, it assumes `MaxSalesVolume = ExpectedSalesVolume`, "exploits" the range 4 in the previous part, and finds the highest possible price. Otherwise, the price is in range 3, and `MaxSalesVolume` is not affected negatively.

This is also the reason why we should not bother with Market-TA1. It simply sets `SellingPrice = MarketPrice + MarkupLimit`. This means Market-TA1 only sets a "safe" `SellingPrice` for us and guarantees that we are not penalized due to setting the price too high. However, in most cases (high-quality materials, good products, high Advert, etc.), `PotentialSalesVolume` is much higher than `ExpectedSalesVolume`. In this case, the "safe" `SellingPrice` from Market-TA1 is too low, and we can find a much higher `SellingPrice` with Market-TA2.

In order to use the formula of Market-TA2, we need `MarkupLimit`. With products, we need `ProductMarkup` to calculate `MarkupLimit`, but `ProductMarkup` is inaccessible via NS API. We have two solutions:

- Calculate the approximation value. Check the previous section to see how to do this.
- Calculate `MarkupLimit` directly:
  - Set `SellingPrice` to a very high value. It must be so high that we cannot sell all produced units (`MaxSalesVolume < ExpectedSalesVolume`). This forces the game to apply the penalty modifier that contains `MarkupLimit`.
  - Wait for 1 cycle to get `ActualSalesVolume`. It's `product.actualSellAmount` and `material.actualSellAmount`.
  - Use `ActualSalesVolume` in place of `ExpectedSalesVolume` in the previous formula: $MarkupLimit = (SellingPrice - MarketPrice)\ast\sqrt{\frac{ActualSalesVolume}{M}}$
  - Calculate `ProductMarkup` from `MarkupLimit`, save `ProductMarkup` to reuse later. `ProductMarkup` never changes.
