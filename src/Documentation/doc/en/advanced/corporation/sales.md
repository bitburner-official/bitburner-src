# Sales

A product or materials sell price can be set manually via UI or NS api, or automatically via Market-TA.I or Market-TA.II. A sell amount limit can also be set.

In the `SALE` state, a certain amount of products will get sold at the set price. The sale amount is based on several factors:

- Item multiplier: Higher quality products sell more.
- Market factor: Demand and competition affect sale volume.
- Markup multiplier: Prices too high above market price lowers sales.
- Business factor: Business employees boost sales.
- Advertising multiplier: Awareness and popularity boost sales.
- Corporation sales: Corporation-level ABCSalesBot upgrades.

```javascript
const maxSellPerSecond =
  itemMultiplier *
  marketFactor *
  markupMultiplier *
  businessFactor *
  corporationSalesMultiplier *
  advertisingMultiplier;
```

This max sale volume is per-warehouse. It is capped by requested sell amount and your warehouse stored quantites. Revenue is `price * quantity`.

## Item multiplier

```javascript
// Materials
const itemMultiplier = materialQuality + 0.001;
```

See [material-quality.md](./material-quality.md).

```javascript
// Products
const itemMultiplier = 0.5 * Math.pow(productEffectiveRating, 0.65);
```

## Market factor

`MarketFactor` depends on demand and competition:

```javascript
const marketFactor = Math.max(0.1, (demand * (100 - competition)) / 100);
```

Demand and competition are described in [demand-competition.md](./demand-competition.md).

## Markup multiplier

`MarkupMultiplier` depends on `sellingPrice`, `marketPrice`, and `markupLimit`.

```javascript
let markupMultiplier = 1;

if (sellingPrice > marketPrice) {
  if (sellingPrice > marketPrice + markupLimit) {
    markupMultiplier = Math.pow(markupLimit / (sellingPrice - marketPrice), 2);
  }
} else {
  if (sellingPrice <= 0) {
    markupMultiplier = 1e12;
  } else {
    markupMultiplier = marketPrice / sellingPrice;
  }
}
```

### Market price

```javascript
// Materials
const marketPrice = material.marketPrice;
```

```javascript
// Products
let marketPrice = 0;
for (const inputMaterial of requiredMaterials) {
  marketPrice += inputMaterial.coefficient * inputMaterial.marketPrice;
}
marketPrice *= 5;
```

For products, this value is stored as `product.productionCost` for the current city.

### Markup limit

Material's markup is a constant stat per material. In NS API, it is available as `getMaterialData(..).baseMarkup`. (Although it's called `baseMarkup`, it is always used as-is for determining markup limit.)

```javascript
const markupLimit = materialQuality / materialMarkup;
```

Product markup calculation is described in [product.md](./product.md).

```javascript
const markupLimit = Math.max(productEffectiveRating, 0.001) / productMarkup;
```

## Business factor

`BusinessFactor` depends on the `Business` employee production in the office for that city:

```javascript
const businessProduction = 1 + office.employeeProductionByJob["Business"];
const businessFactor = Math.pow(businessProduction, 0.26) + businessProduction * 0.0001;
```

Employee production by job is described in [office.md](./office.md).

## Corporation sales multiplier

`CorporationSalesMultiplier` is the corporation-wide sales multiplier from `ABCSalesBots`.

```javascript
const corporationSalesMultiplier = corporation.getSalesMult();
```

## Advertising multiplier

`AdvertisingMultiplier` depends on the division's awareness, popularity, and advertising factor:

```javascript
const awarenessFactor = Math.pow(awareness + 1, industryAdvertisingFactor);
const popularityFactor = Math.pow(popularity + 1, industryAdvertisingFactor);
const ratioFactor = awareness === 0 ? 0.01 : Math.max((popularity + 0.001) / awareness, 0.01);
const advertisingMultiplier = Math.pow(awarenessFactor * popularityFactor * ratioFactor, 0.85);
```

Awareness and popularity are described in [advert.md](./advert.md).
