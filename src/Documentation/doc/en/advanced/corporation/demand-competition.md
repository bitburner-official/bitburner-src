# Demand and Competition

Demand and competition factor into the max sale volume of materials and products. Two upgrades, `Market Research - Demand` and `Market Data - Competition` grant access to the respective stats.

## Material

A Material's demand and competition fluctuate according to material constant stats `maxVolatility`, `demandBase`, `demandRange` `competitionBase`, and `competitionRange`:

```javascript
const compVolatility = (Math.random() * this.maxVolatility) / 100;
const compChange = 1 + compVolatility;
const dmdVolatility = (Math.random() * this.maxVolatility) / 100;
const dmdChange = 1 + dmdVolatility;
const priceVolatility = (Math.random() * this.maxVolatility) / 300;
const priceChange = 1 + priceVolatility;
```

Competition and demand is adjusted during the START state according to these amounts, each adjusted positively or negatively at random, along with corresponding decrease or increase of prices (competition increase or demand decrease -> market price decrease, and vice versa).

## Product

Each `START` cycle, a product's demand is decreased and its competition is increased by small amounts, down to a minimum value of 0.001 for demand and up to 99.99 for competition. Initial values are set when the product is finished according to the formulas in [Product](./product.md).

```javascript
const amountOfChange = random(0, 3) * 0.0004;
```

This amount is tripled in the Pharmaceutical, Software or Robotics industries.
