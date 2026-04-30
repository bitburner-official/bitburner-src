# Product

In some industries, you can develop new products. This takes some time. After development, the product can be produced and sold. Products are produced using the industry's input materials.

Each product has rating and quality stats, which are based on the stats of the office over time as the office develops the product. The rating and quality stats factor into the max sale volume and markup for the product when you try to sell it.

Multiple products can be in the development queue, but only one product can be developed at a time.

A product is developed by a specific office, but once it is developed it belongs to the entire division. By default, a division can have a maximum of 3 products. There are 2 research upgrades that increase that limit. At the limit, a product is discontinued before starting a new product.

## Product stats mechanics

`CreationJobFactors[JobName]` are values accumulated over the time that product was developed. `DevelopmentProgress` starts at 0. In each cycle:

```javascript
const totalEmployeeProd = operationsProd + engineerProd + managementProd;
const managementFactor = 1 + managementProd / (1.2 * totalEmployeeProd);
const productDevelopmentMultiplier = (Math.pow(engineerProd, 0.34) + Math.pow(operationsProd, 0.2)) * managementFactor;
const progress = 0.01 * productDevelopmentMultiplier;

developmentProgress += progress;
creationJobFactors[jobName] += employeeJobProd * progress * 0.01;
```

Various factors are involved to determine 6 product stats quality, performance, durability, reliability, aesthetics, and features.

```javascript
const A = creationJobFactors.Engineer;
const B = creationJobFactors.Management;
const C = creationJobFactors.RnD;
const D = creationJobFactors.Operations;
const E = creationJobFactors.Business;

const totalCreationJobFactors = A + B + C + D + E;

const engineerRatio = A / totalCreationJobFactors;
const managementRatio = B / totalCreationJobFactors;
const rndRatio = C / totalCreationJobFactors;
const operationsRatio = D / totalCreationJobFactors;
const businessRatio = E / totalCreationJobFactors;

const designInvestMult = 1 + Math.pow(designInvestment, 0.1) * 0.01;
const scienceMult = 1 + Math.pow(rp, researchFactor) * 0.00125;
const balanceMult =
  1.2 * engineerRatio + 0.9 * managementRatio + 1.3 * rndRatio + 1.5 * operationsRatio + businessRatio;
const totalMult = balanceMult * designInvestMult * scienceMult;

const productQuality = totalMult * (0.1 * A + 0.05 * B + 0.05 * C + 0.02 * D + 0.02 * E);
const productPerformance = totalMult * (0.15 * A + 0.02 * B + 0.02 * C + 0.02 * D + 0.02 * E);
const productDurability = totalMult * (0.05 * A + 0.02 * B + 0.08 * C + 0.05 * D + 0.05 * E);
const productReliability = totalMult * (0.02 * A + 0.08 * B + 0.02 * C + 0.05 * D + 0.08 * E);
const productAesthetics = totalMult * (0.08 * B + 0.05 * C + 0.02 * D + 0.1 * E);
const productFeatures = totalMult * (0.08 * A + 0.05 * B + 0.02 * C + 0.05 * D + 0.05 * E);
```

The product rating is a weighted sum of these stats with the industry's rating weights (`industryData.product.ratingWeights`).

```javascript
const productRating =
  productQuality * ratingWeights.quality +
  productPerformance * ratingWeights.performance +
  productDurability * ratingWeights.durability +
  productReliability * ratingWeights.reliability +
  productAesthetics * ratingWeights.aesthetics +
  productFeatures * ratingWeights.features;
```

Effective rating and product markup are used to determine how far above market price you can sell a product before sales volume gets penalized.

```javascript
const effectiveRating = Math.min(productRating, avgInputQuality * Math.sqrt(productRating));
```

```javascript
const advertInvestMult = 1 + Math.pow(advertisingInvestment, 0.1) * 0.01;
const businessManagementRatio = Math.max(businessRatio + managementRatio, 1 / totalCreationJobFactors);
const productMarkup = 100 / (advertInvestMult * Math.pow(productQuality + 0.001, 0.65) * businessManagementRatio);
```

```javascript
const demand = awareness !== 0 ? Math.min(100, advertInvestMult * (100 * (popularity / awareness))) : 20;
const competition = random(0, 70);
const productSize = inputMaterials.reduce(
  (sum, inputMaterial) => sum + inputMaterial.size * inputMaterial.coefficient,
  0,
);
```
