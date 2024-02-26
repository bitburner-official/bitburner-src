# Product

## Overview

Product industry is much better than material industry in late phases because you can sell product at ridiculously high price.

You need to continuously develop new product. New product is almost always better than old products and generate much more profit.

Product's markup and effective rating are extremely important because they are part of [MaxSalesVolume](./optimal-selling-price-market-ta2.md)'s calculation.

Product's effective rating is based on product's rating and input material's quality. Check this [section](./quality.md) to see how input material's quality affects product's rating and effective rating. This is why you need a support division that produces high-quality material for the product division.

Product's markup and rating are based on:

- `CreationJobFactors[JobName]`. More about this in the next part.
- RP. This is why you should stock up on RP.
- `ResearchFactor`. It is industry's `scienceFactor`.
- Design investment and advertising investment. These two investments are not too important because their exponents in the formulas are very low. It's fine to use only 1% of current funds for them.

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

$$CreationJobFactors\lbrack JobName\rbrack = CreationJobFactors\lbrack JobName\rbrack + \frac{\lbrace EmployeeJob\rbrace Prod\ast Progress}{100}$$

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

$$DesignInvestMult = 1 + \frac{(DesignInvestment)^{0.1}}{100}$$

- Science multiplier:

$$ScienceMult = 1 + \frac{(RP)^{ResearchFactor}}{800}$$

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

$$ProductRating = \sum_{i = 1}^{6}{{ProductStat}_{i}\ast{StatCoefficient}_{i}}$$

- Advertising investment multiplier:

$$AdvertInvestMult = 1 + \frac{(AdvertisingInvestment)^{0.1}}{100}$$

- Business-Management ratio:

$$BusinessManagementRatio = Max\left( BusinessRatio + ManagementRatio,\ \left( \frac{1}{TotalCreationJobFactors} \right) \right)$$

- Product's markup:

$$ProductMarkup = \frac{100}{AdvertInvestMult\ast(ProductQuality + 0.001)^{0.65}\ast BusinessManagementRatio}$$

- Product's demand:

$$Demand = \begin{cases}Min(100,AdvertInvestMult\ast(100\ast(Popularity/Awareness))), & Awareness \neq 0 \newline 20, & Awareness = 0 \end{cases}$$

- Product's competition:

$$Competition = Random(0,70)$$

- Product's size:
  - It's product.size.
  - Formula:

$$ProductSize = \sum_{i = 1}^{NumberOfInputMaterials}{{InputMaterialSize}_{i}\ast{InputMaterialCoefficient}_{i}}$$

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
