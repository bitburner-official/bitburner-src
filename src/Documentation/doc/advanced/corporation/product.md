# Product

## Overview

The product industry is much better than the material industry in the late phases because we can sell products at ridiculously high prices.

Market-TA2 automatically sets the optimal prices for products. Check this [section](./optimal-selling-price-market-ta2.md) to see how to implement a custom Market-TA2 script. Implementing a custom Market-TA2 script is the best optimization in round 3+.

Products need to be developed before being produced. We can put multiple products in the development queue, but only one product can be developed at a time.

There is a limit on how many products a division can have. The default limit is 3. There are 2 researches that increase that limit. However, those researches are nearly useless because, in most cases, there is no point in increasing the maximum number of products. Check this [section](./unlocks-upgrade-research.md) for details. When we reach the limit, we need to discontinue a product before developing a new one.

We need to continuously develop new products. New products are almost always better than the old ones and generate much more profit.

The product's markup and effective rating are extremely important because they are part of [MaxSalesVolume](./optimal-selling-price-market-ta2.md)'s calculation.

The product's effective rating is based on the product's rating and the input material's quality. Check this [section](./quality.md) to see how input material's quality affects the product's rating and effective rating. This is why we need a support division that produces high-quality material for the product division.

The product's markup and rating are based on:

- `CreationJobFactors[JobName]`. More about this in the next part.
- RP. This is why we should stock up on RP.
- `ResearchFactor`. It is the industry's `scienceFactor`.
- Design investment and advertising investment. Game UI shows them as "Design investment" and "Marketing investment". These two investments are not too important because their exponents in the formulas are very low. It's fine to use only 1% of current funds for them.

Office's upgrade and employee stats' upgrades are very important for products because they increase employee production. High employee production means high `CreationJobFactors` and RP. Those upgrades and products create a powerful loop: More upgrades → Better product → Higher profit → More upgrades.

Office setup is important to efficiently develop new products. Check this [section](./general-advice.md) for advice on how to set up the office.

## Formula

`CreationJobFactors[JobName]` are values accumulated over the time that product was developed. `DevelopmentProgress` starts at 0. In each cycle:

- Total employee production:

$$TotalEmployeeProd = OperationsProd + EngineerProd + ManagementProd$$

- Management factor:

$$ManagementFactor = 1 + \frac{ManagementProd}{1.2\ast TotalEmployeeProd}$$

- Product development multiplier:

$$ProductDevelopmentMultiplier = \left( (EngineerProd)^{0.34} + (OperationsProd)^{0.2} \right)\ast ManagementFactor$$

- Progress:

$$Progress = 0.01\ast ProductDevelopmentMultiplier$$

- Development progress:

$$DevelopmentProgress = DevelopmentProgress + Progress$$

- `CreationJobFactors[JobName]`:

$$CreationJobFactors\lbrack JobName\rbrack = CreationJobFactors\lbrack JobName\rbrack + {\lbrace EmployeeJob\rbrace Prod\ast Progress}\ast{0.01}$$

&nbsp;  
When `DevelopmentProgress` reaches 100, product is finished.

- Define:

$$A = \ CreationJobFactors\lbrack Engineer\rbrack$$

$$B = \ CreationJobFactors\lbrack Management\rbrack$$

$$C = \ CreationJobFactors\lbrack RnD\rbrack$$

$$D = \ CreationJobFactors\lbrack Operations\rbrack$$

$$E = \ CreationJobFactors\lbrack Business\rbrack$$

$$TotalCreationJobFactors = A + B + C + D + E$$

- {JobName}Ratio:

$$EngineerRatio = \frac{A}{TotalCreationJobFactors}$$

$$ManagementRatio = \frac{B}{TotalCreationJobFactors}$$

$$RnDRatio = \frac{C}{TotalCreationJobFactors}$$

$$OperationsRatio = \frac{D}{TotalCreationJobFactors}$$

$$BusinessRatio = \frac{E}{TotalCreationJobFactors}$$

- Design investment multiplier:

$$DesignInvestMult = 1 + {(DesignInvestment)^{0.1}}\ast{0.01}$$

- Science multiplier:

$$ScienceMult = 1 + {(RP)^{ResearchFactor}}\ast{0.00125}$$

- Balance multiplier:

$$BalanceMult = 1.2\ast EngineerRatio + 0.9\ast ManagementRatio + 1.3\ast RnDRatio + 1.5\ast OperationsRatio + BusinessRatio$$

- Total multiplier:

$$TotalMult = BalanceMult\ast DesignInvestMult\ast ScienceMult$$

- Product's quality:

$$TotalMult\ast (0.1\ast A + 0.05\ast B + 0.05\ast C + 0.02\ast D + 0.02\ast E)$$

- Product's performance:

$$TotalMult\ast (0.15\ast A + 0.02\ast B + 0.02\ast C + 0.02\ast D + 0.02\ast E)$$

- Product's durability:

$$TotalMult\ast (0.05\ast A + 0.02\ast B + 0.08\ast C + 0.05\ast D + 0.05\ast E)$$

- Product's reliability:

$$TotalMult\ast (0.02\ast A + 0.08\ast B + 0.02\ast C + 0.05\ast D + 0.08\ast E)$$

- Product's aesthetics:

$$TotalMult\ast (0.08\ast B + 0.05\ast C + 0.02\ast D + 0.1\ast E)$$

- Product's features:

$$TotalMult\ast (0.08\ast A + 0.05\ast B + 0.02\ast C + 0.05\ast D + 0.05\ast E)$$

- Product's rating:
  - If an industry produces product, it has its own `RatingWeights` for its product. `RatingWeights` contains coefficients of 6 stats: quality, performance, durability, reliability, aesthetics, features. For example: Tobacco's `RatingWeights`:
    - Quality's coefficient: 0.7.
    - Durability's coefficient: 0.1.
    - Aesthetics' coefficient: 0.2.
  - `RatingWeights` is `industryData.product.ratingWeights`.
  - Formula:

$$ProductRating = \sum_{i = 1}^{6}{{ProductStat}_i\ast{StatCoefficient}_i}$$

- Advertising investment multiplier:

$$AdvertInvestMult = 1 + {(AdvertisingInvestment)^{0.1}}\ast{0.01}$$

- Business-Management ratio:

$$BusinessManagementRatio = Max\left( BusinessRatio + ManagementRatio,\ \left( \frac{1}{TotalCreationJobFactors} \right) \right)$$

- Product's markup:

$$ProductMarkup = \frac{100}{AdvertInvestMult\ast(ProductQuality + 0.001)^{0.65}\ast BusinessManagementRatio}$$

- Product's demand:

$$Demand = \begin{cases}Min(100,AdvertInvestMult\ast(100\ast(Popularity/Awareness))), & Awareness \neq 0 \newline 20, & Awareness = 0 \end{cases}$$

- Product's competition:

$$Competition = Random(0,70)$$

- Product's size:
  - It's `product.size`.
  - Formula:

$$ProductSize = \sum_{i = 1}^{NumberOfInputMaterials}{{InputMaterialSize}_i\ast{InputMaterialCoefficient}_i}$$

## Approximation value of product markup

In order to calculate product markup, we need:

- `CreationJobFactors[JobName]`
- `RP`
- `ResearchFactor`
- `DesignInvestment`
- `AdvertisingInvestment`

Product markup is calculated when product is finished. At that time, there is one thing that we cannot get: `CreationJobFactors[JobName]`, because there is not any NS API to query it. There are 2 approaches for this problem:

- Manually record them. This means that we simulate `product.creationJobFactors`. This approach is simple, but it has a big problem: if we miss any cycle, the data is invalid.
- Calculate them directly. Product's stats are public data, so with above formulas, we have a system of 6 functions with only 5 variables. We can use [Ceres Solver](./miscellany.md) to find its solution.
