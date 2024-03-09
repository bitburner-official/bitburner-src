# Demand - Competition

## Usage

They are used for calculating `MaxSalesVolume` of materials and products.

`Market Research - Demand` grants access to `Demand` data.

`Market Data - Competition` grants access to `Competition` data.

## Material

Each material has its own `demandBase`, `demandRange`, `competitionBase`, `competitionRange`, and `maxVolatility`. Both `demand` and `competition` start at their bases and are always in their respective ranges.

This is non-intuitive: `demand` and `competition` are _not_ used for calculating `marketPrice`.

During the START state, the game calculates 6 variables:

```typescript
const priceVolatility: number = (Math.random() * this.maxVolatility) / 300;
const priceChange: number = 1 + priceVolatility;
const compVolatility: number = (Math.random() * this.maxVolatility) / 100;
const compChange: number = 1 + compVolatility;
const dmdVolatility: number = (Math.random() * this.maxVolatility) / 100;
const dmdChange: number = 1 + dmdVolatility;
```

`priceChange`, `compChange` and `dmdChange` are the amount of `marketPrice`, `competition` and `demand` changed in the next steps.

After that, it randomizes twice:

- First: `Math.random()` < 0.5. If yes, increase `competition` and `marketPrice`. If not, decrease them.
- Second: `Math.random()` < 0.5. If yes, increase `demand` and `marketPrice`. If not, decrease them.

## Product

Initial values are set when the product is finished. Check the next [section](./product.md) for the formulas.

During the START state, the game decreases `demand` and increases `competition` of the product.

- Amount of change:

$$AmountOfChange = Random(0,3)*0.0004$$

- This amount is multiplied by 3 if the industry is Pharmaceutical, Software or Robotics.

`Demand`'s minimum value is 0.001. `Competition`'s maximum value is 99.99.
