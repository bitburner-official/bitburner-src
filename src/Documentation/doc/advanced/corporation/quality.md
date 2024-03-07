# Quality

## Basic term

Let's define some terms:

- `AvgInputQuality`: average quality of input materials.
- `MaxOutputQuality`: maximum value of output material's quality.
- `OutputQuality`: final value of output material's quality. This value is always less than or equal to `MaxOutputQuality`.
- `MaxOutputRating`: maximum value of output product's rating.
- `OutputRating`: final value of output product's rating. This value is always less than or equal to `MaxOutputRating`.

Each industry has a set of input materials and their coefficients, for example, Agriculture needs Water and Chemicals, their coefficients are [0.5, 0.2] respectively. These coefficients do not affect `AvgInputQuality`. `AvgInputQuality` is the mean value of qualities of input materials in warehouse. For example, if Agriculture division's warehouse has Water (quality 1) and Chemicals (quality 11), `AvgInputQuality` is (1+11)/2.

Purchased material is low-quality. Its quality is always 1.

When you import/export your materials between different divisions, you can see quality of some input materials constantly change. Quality is high after EXPORT state, but it reduces after PURCHASE state. Qualities of the materials in warehouse are recalculated in these 2 states.

In PURCHASE state, material's quality is "diluted" by low-quality purchased material (quality 1).

$$Quality = \frac{Quality\ast CurrentQuantity + BuyAmount}{CurrentQuantity + BuyAmount}$$

In PRODUCTION state, the "diluted" quality value is used for calculating `AvgInputQuality`.

In EXPORT state:

$$Quality = \frac{Quality\ast CurrentQuantity + ImportQuality\ast ImportAmount}{CurrentQuantity + ImportAmount}$$

The production capability of support division should be balanced. The `ImportAmount` (the number of material units that the support division exports) does not need to equal the required number of input material units, but it should also not be too small.

## Material

`MaxOutputQuality` is sum of 3 values:

- Engineer summand:
  - `EngineerProduction = office.employeeProductionByJob["Engineer"]`

$$EngineerSummand = \frac{EngineerProduction}{90}$$

- Research point summand:

$$ResearchPointSummand = (RP)^{IndustryScienceFactor}$$

- AI Cores summand (if there is AI Cores in the warehouse):

$$AICoresSummand = AICoresQuantity^{IndustryAICoreFactor}\ast{0.001}$$

Output quality:

$$OutputQuality = \sqrt{MaxOutputQuality}\ast AvgInputQuality$$

With formulas above, we have these conclusions:

- In early rounds, increasing RP is the best way to improve `MaxOutputQuality`. This is especially true for industry with high science factor like Chemical.
- In late rounds (round 3+), we have large funds to upgrade offices. In this case, the most important factor of `MaxOutputQuality` is `EngineerProduction`. "Engineer" is more significant than "Research & Development".
- `OutputQuality` starts at square root of `MaxOutputQuality`. `AvgInputQuality` increases it until it reaches `MaxOutputQuality`.
- This is a simple strategy for checking if we need to increase `AvgInputQuality`:
  - If square of `AvgInputQuality` is greater than or equal to current output quality, it's fine.
  - If not, you need to increase input material's quality. It usually means you need to improve the support division.

## Product

`MaxOutputRating` is product.rating.

Game UI shows `OutputRating` as "Effective rating"

Output rating:

$$OutputRating = \sqrt{MaxOutputRating}\ast AvgInputQuality$$

Use same strategy as material for checking `AvgInputQuality`.
