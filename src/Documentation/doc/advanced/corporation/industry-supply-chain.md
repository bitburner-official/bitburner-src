# Industry - Supply chain

## Basic term

Industry consumes input materials and produces output materials/products. Most industry produces either materials or products, some industries produce both of them.

- Material industries are simple to bootstrap. We use them as starting/support industries.
- Product industries are hard to bootstrap, but they generate massive profit.

Each industry has different values of "factor":

- `AICoreFactor`, `HardwareFactor`, `RealEstateFactor`, `RobotFactor`: boost material's coefficient. They are used for calculating [division production multiplier](./boost-material.md).
- `ScienceFactor`:
  - With material industry: affect the output material's [quality](./quality.md).
  - With product industry: affect the output product's [markup and rating](./product.md).
- `AdvertisingFactor`: affect the number of units that we can sell ([AdvertFactor](./optimal-selling-price-market-ta2.md)).

"Endgame" is the very late phase after the division passes the exponential growth. In this phase, new product is only marginally better than old products, and the profit increases slowly. For example, endgame of Tobacco is when profit reaches ~1e98/s.

## Criterion

In order to choose good industries for our supply chain, we must consider many criteria:

- Good synergy between industries. Industries must be able to support each other with "Export" feature. After rework in 2.3, quality of input material becomes crucial, importing high-quality materials from other industries is mandatory.
- Must have an easy to start material industry for early rounds. This industry must have good combinations of boost materials' coefficients and boost materials' sizes. This ensures high division product multiplier that is the most crucial factor in early rounds. In 4 boost materials, Real Estate (material, not industry) should be noticed because of its tiny size.
- Support industry is the industry that provide high-quality input material for other industries. High `ScienceFactor` is a bonus for support industry because its output material's quality can be boosted without much investment in early rounds.
- Must have a highly profitable product industry for late phases.
  - It's preferred to require material from starting industry rather than to expand into another support industry.
  - High `ScienceFactor`. This is necessary for high product's rating.
  - High `AdvertisingFactor`. This means our product's selling price can be boosted greatly by Wilson and Advert. This is the most important factor for endgame. `AdvertisingFactor` scales tremendously good when you reach high advert bonuses (Awareness and Popularity). These bonuses are capped at ~1.7977e308.
- Any worthy industry must have at least 1 input material. Spring Water is the only industry that does not need any input material. It may look convenient at first glance, but it's trap for newbie. Having no input material means the quality/rating of output material/product will always be capped at square root of its maximum value.

## Agriculture + Chemical + Tobacco

Agriculture is inarguably the best starting industry. Its `realEstateFactor` is highest among all industries (0.72), and real estate's size is tiny (0.005). It means we can stock up on huge number of real estates and increase division product multiplier to extremely high value in early rounds.

Chemical is the best support industry if we choose Agriculture as starting industry. It has highest `ScienceFactor` among all material industries (0.75). As you can see in my round 2's strategy, I invest minimal budget to Chemical division and it can still adequately boost Agriculture (after waiting for some RP).

Agriculture and Chemical have great synergy. Agriculture needs Chemicals, produces Plants. Chemical needs Plants, produces Chemicals.

Tobacco is an excellent product industry:

- It requires only Plants, and Plants come from Agriculture. Therefore, quality of input material is not a problem with this industry if we choose Agriculture as starting industry.
- High `ScienceFactor` (0.75), only below Pharmaceutical.
- High `AdvertisingFactor` (0.2), only below Restaurant and Real Estate.

## Other product industries

All other product industries always have some kind of flaws in them and not be as versatile as Tobacco. For example:

- Pharmaceutical has highest `ScienceFactor` (0.8) but low `AdvertisingFactor` (0.16).
  - Its products are potentially better than Tobacco's ones. This sounds good in theory, but not in practice. Pharmaceutical requires Chemicals. Chemicals can only be produced by Chemical industry, and that industry has bad production capability. The early products' effective rating will be low because the Chemical division cannot produce enough high-quality material units. In the end, the offers of round 3 and 4 are much lower than Tobacco's ones.
  - It is worse than Tobacco in endgame.
- Healthcare has same `ScienceFactor` as Tobacco's one (0.75) but lowest `AdvertisingFactor` (0.11).
  - It requires 4 input materials instead of 1 or 2. Those materials include Robots with coefficient of 10 (highest value of all industries), and size of Robots is biggest among boost materials. This means the required materials take up huge space in warehouse.
  - This industry is the worst one in endgame because of its extremely low `AdvertisingFactor`.
- Restaurant has highest `AdvertisingFactor` (0.25) but very low `ScienceFactor` (0.12).
  - Its products are significantly worse than Tobacco's ones. It takes too long to hit the exponential growth (due to worse products) and surpass Tobacco in profit.
  - It's fine to expand into this industry after Tobacco to have better endgame.
- Real Estate has same `AdvertisingFactor` as Restaurant's one but lowest `ScienceFactor` (0.05). It requires 4 input materials instead of 1 or 2. This industry has same potential and problem like Restaurant with its high `AdvertisingFactor` and low `ScienceFactor`. The only difference is that its `ScienceFactor` is even lower than Restaurant's one.

## Conclusion

Agriculture + Chemical + Tobacco is the most balanced supply chain. It's very easy to bootstrap in early rounds and reaches high profit in late phases for practical purposes.
