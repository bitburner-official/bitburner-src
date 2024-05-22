# Optimal selling price - Market-TA2

## Market price and markup limit

Market price:

- Material: `material.marketPrice`.
- Product: `product.productionCost`. This value is based on `ProductMarketPriceMult`, input materials' `MarketPrice` and `Coefficient`.
  - $n = {Number\ of\ input\ materials}$
  - $ProductMarketPriceMult = 5$

$$ProductMarketPrice = ProductMarketPriceMult\ast\sum_{i = 1}^{n}{MaterialMarketPrice_i\ast MaterialCoefficient_i}$$

Markup limit:

- Material:

$$MaterialMarkupLimit = \frac{MaterialQuality}{MaterialMarkup}$$

- Product:

$$ProductMarkupLimit = \frac{Max(ProductEffectiveRating,0.001)}{ProductMarkup}$$

## Maximize sales volume

Define:

$$ExpectedSalesVolume = \frac{ProducedUnits}{10}$$

- This means we want to sell all produced units.

In cycle's SALE state, game calculates `MaxSalesVolume` of material/product. If we set price too high, `MaxSalesVolume` is penalized. In order to maximize profit, we have to set the highest possible price while `MaxSalesVolume` is still equal to `ExpectedSalesVolume`. This is what Market-TA2 does.

Calculation of material and product is pretty similar, so I'll call them "item" and use 1 formula.

`MaxSalesVolume` is the product of 7 multipliers:

- Item multiplier:
  - Material:
    $$ItemMultiplier = MaterialQuality + 0.001$$
  - Product:
    $$ItemMultiplier = 0.5\ast(ProductEffectiveRating)^{0.65}$$
- Business factor:
  - `BusinessProduction = 1 + office.employeeProductionByJob["Business"]`

$${BusinessFactor = (BusinessProduction)}^{0.26} + \left({BusinessProduction}\ast{0.001}\right)$$

- Advert factor:

$$AwarenessFactor = (Awareness + 1)^{IndustryAdvertisingFactor}$$

$$PopularityFactor = (Popularity + 1)^{IndustryAdvertisingFactor}$$

$$RatioFactor = \begin{cases}Max(0.01,\frac{Popularity + 0.001}{Awareness}), & Awareness \neq 0 \newline 0.01, & Awareness = 0 \end{cases}$$

$$AdvertFactor = (AwarenessFactor\ast PopularityFactor\ast RatioFactor)^{0.85}$$

- Market factor:

$$MarketFactor = Max\left(0.1,{Demand\ast(100 - Competition)}\ast{0.01}\right)$$

- Corporation's upgrade bonus: `SalesBots` bonus.
- Division's research bonus: this is always 1. Currently there is not any research that increases the sales bonus.
- `MarkupMultiplier`: initialize with 1.
  - `SellingPrice` is the selling price that you set.
  - With materials, if we set `SellingPrice` to 0, `MarkupMultiplier` is $10^{12}$ (check the formula below). Extremely high `MarkupMultiplier` means that we can sell all units, regardless of other factors. This is the fastest way to discard materials.
  - If `(SellingPrice > MarketPrice + MarkupLimit)`:
    $$MarkupMultiplier = \left(\frac{MarkupLimit}{SellingPrice - MarketPrice}\right)^{2}$$
  - If item is material and `SellingPrice` is less than `MarketPrice`:

$$MarkupMultiplier = \begin{cases}\frac{MarketPrice}{SellingPrice}, & SellingPrice > 0 \land SellingPrice < MarketPrice \newline 10^{12}, & SellingPrice \leq 0 \end{cases}$$

## Optimal selling price

As we can see with previous part, `MarkupMultiplier` is basically a penalty modifier if we set `SellingPrice` greater than `(MarketPrice + MarkupLimit)`, and we'll always do this. This means we need to find out highest possible `SellingPrice` while `MaxSalesVolume` is still equal to `ExpectedSalesVolume`.

This is the reason why we should not bother with Market-TA1. It simply sets `SellingPrice = MarketPrice + MarkupLimit`. This means Market-TA1 sets a "safe" `SellingPrice` for us, it guarantees that we won't be penalized due to too high price. However, this "safe" `SellingPrice` is too low, and we can find a much higher `SellingPrice`.

Formula:

- Define:

$$M = \ ItemMultiplier\ast BusinessFactor\ast AdvertFactor\ast MarketFactor\ast SaleBotsBonus\ast ResearchBonus$$

- We want `MaxSalesVolume` to equal `ExpectedSalesVolume`:

$$MaxSalesVolume = ExpectedSalesVolume$$

≡

$$M\ast\left(\frac{MarkupLimit}{SellingPrice - MarketPrice}\right)^{2} = ExpectedSalesVolume$$

≡

$$\frac{MarkupLimit}{SellingPrice - MarketPrice} = \sqrt{\frac{ExpectedSalesVolume}{M}}$$

≡

$$SellingPrice = \frac{MarkupLimit\ast\sqrt{M}}{\sqrt{ExpectedSalesVolume}} + MarketPrice$$

In order to use this formula, we need `MarkupLimit`. With product, we need `ProductMarkup` to calculate `MarkupLimit`, but `ProductMarkup` is inaccessible via NS API. We have two solutions:

- Calculate approximation value. Check previous section to see how to do this.
- Calculate `MarkupLimit` directly:
  - Set `SellingPrice` to a very high value, it must be so high that we cannot sell all produced units (`MaxSalesVolume < ExpectedSalesVolume`). This forces the game applies the penalty modifier that contains `MarkupLimit`.
  - Wait for 1 cycle to get `ActualSalesVolume`. It's `product.actualSellAmount` and `material.actualSellAmount`.
  - Use `ActualSalesVolume` in place of `ExpectedSalesVolume` in previous formula: $MarkupLimit = (SellingPrice - MarketPrice)\ast\sqrt{\frac{ActualSalesVolume}{M}}$
  - Calculate `ProductMarkup` from `MarkupLimit`, save `ProductMarkup` to reuse later. `ProductMarkup` never changes.
