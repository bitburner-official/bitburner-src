# Wilson Analytics - Advert

## Awareness and popularity

Wilson and Advert increase 2 important stats: awareness and popularity. These 2 stats affect initial demand and maximum sellable number of product units. I'll show formulas for them in later sections.

Awareness and popularity are capped at `Number.MAX_VALUE` (~1.7976931348623157E+308).

Raw values of those stats are crucial, but their ratio is also important. We want to have high ratio of popularity/awareness, check this [section](./optimal-selling-price-market-ta2.md) for formulas.

DreamSense only increases popularity by 0.001/cycle/level and awareness by 0.004/cycle/level. Those benefits are minuscule. However, that's not its biggest problem, the biggest one is the ratio of popularity/awareness. We want that ratio to be as high as possible, but DreamSense constantly lowers it.

Popularity decreases by 0.0001 per cycle.

## Wilson Analytics

Wilson is a multiplier that is applied on Advert's benefits when we buy Advert, so it's not retroactive. Therefore, we need to buy it as soon as possible. However, there are cases that Wilson is too expensive and it does not bring much benefits. Round 1 and 2 are those cases.

Wilson has `priceMult` of 2, so its price is doubled every time we buy it. The exponentiation of Advert's cost function uses base of 1.06, so its price increases much slower.

## Advert

Advert is a special upgrade. It affects only the division that buys it.

Cost: use the formulas in this [section](./unlocks-upgrade-research.md) with `BasePrice` = 1e9 and `PriceMult` = 1.06.

Benefit:

$$AdvertMultiplier = WilsonUpgradeBenefit\ast ResearchAdvertisingMultiplier$$

$$Awareness = (Awareness + 3\ast AdvertMultiplier)\ast(1.005*AdvertMultiplier)$$

$$Popularity = (Popularity + AdvertMultiplier)\ast(1 + \frac{Random(1,3)}{200})\ast AdvertMultiplier$$

## Advice

Buying Advert without Wilson is a valid strategy in extremely low-budget situations like round 1 and 2.

Wilson becomes extremely important in big-budget situations. Wilson is usually good investment in late phases.

In round 3+, we usually improve the divisions continuously with relatively small budget (profit of a few cycles). In this case, we should buy Wilson as soon as we can afford it.
