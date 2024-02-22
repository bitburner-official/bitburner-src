# Demand - Competition

## Usage

They are used for calculating `MaxSalesVolume` of material and product.

`Market Research - Demand` grants access to `Demand` data.

`Market Data - Competition` grants access to `Competition` data.

## Material

Each material has its own `demandBase`, `demandRange`, `competitionBase`, `competitionRange`, `maxVolatility`. `Demand` and `competition` start at their bases and always be in their ranges respectively.

This is non-intuitive: `demand` and `competition` are not used for calculating `marketPrice`.

In cycle's START state, game calculates 6 variables:

```typescript
const priceVolatility: number = (Math.random() * this.maxVolatility) / 300;
const priceChange: number = 1 + priceVolatility;
const compVolatility: number = (Math.random() * this.maxVolatility) / 100;
const compChange: number = 1 + compVolatility;
const dmdVolatility: number = (Math.random() * this.maxVolatility) / 100;
const dmdChange: number = 1 + dmdVolatility;
```

`priceChange`, `compChange` and `dmdChange` are the amount of `marketPrice`, `competition` and `demand` changed in next steps.

After that, it randomizes twice:
- First: `Math.random()` < 0.5. If yes, increase `competition` and `marketPrice`. If not, decrease them.
- Second: `Math.random()` < 0.5. If yes, increase `demand` and `marketPrice`. If not, decrease them.

## Product

Their initial values are set when product is finished. Check the next [section](./product.md) for the formulas.

In cycle's START state, game decreases `demand` and increases `competition` of product
- Amount of change:

$$AmountOfChange = Random(0,3)*0.0004$$

- This amount is multiplied by 3 if the industry is Pharmaceutical, Software or Robotics.

`Demand`'s minimum value is 0.001. `Competition`'s maximum value is 99.99.
