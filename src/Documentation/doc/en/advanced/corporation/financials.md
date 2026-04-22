# Financials

This document describes financial mechanics such as how your corporation's valuation is determined, how dividends work to pay money to the player from corporation funds, and how to manage shares with public investors.

## Valuation

Valuation is the average of the previous 10 cycle's valuations, computed at START phase.
The cycle valuation formula is different Pre- and Post-IPO.

```javascript
// Pre-IPO
const officesWarehousesMultiplier = Math.pow(Math.pow(1.1, 1 / 12), numberOfOfficesAndWarehouses);
const valuation = (1e10 + funds / 3 + Math.max(0, assetDelta) * 315000) * officesWarehousesMultiplier;
```

```javascript
// Post-IPO
let assetDelta = (totalAssets - previousTotalAssets) / 10;
assetDelta *= 1 - dividendRate;
const valuation = (funds + assetDelta * 85000) * officesWarehousesMultiplier;
```

The valuation is further affected by the `CorporationValuation` BitNode multiplier. In BN3 it's 1, but many BitNodes cripple Corporation via this multiplier.

### Total assets, asset delta

Total assets is recomputed at each START phase, and it is adjusted in other phases during the cycle for certain actions.

```javascript
let totalAssets = funds;

for (const division of divisions) {
  totalAssets += division.recoupableValue;

  for (const warehouse of division.warehouses) {
    for (const material of warehouse.materials) {
      totalAssets += material.stored * material.averagePrice;
    }

    for (const product of division.products) {
      totalAssets += product.cityData[warehouse.city].stored * product.cityData[warehouse.city].productionCost;
    }
  }
}
```

`division.recoupableValue` is half of the sum of:

- Industry's starting cost.
- With each city that division has expanded to (exclude Sector-12):
  - Office's initial cost.
  - Warehouse's initial cost.

These actions are considered "Long Term Funding Sources" and increase totalAssets mid-cycle:

- Product development
- Office upgrades
- Warehouse upgrades
- Corporation upgrades (eg Smart Supply)
- Faction bribes
- Going public (total shares sold)
- Issuing shares (total profit)
- Receiving investment rounds
- Receiving funds via HackNet Server

For valuation calculations, the asset delta is used:

```javascript
let assetDelta = (totalAssets - previousTotalAssets) / 10;
```

The `previousTotalAssets` value is captured in the START phase before `totalAssets` is recalculated.

## Investment offer

There are 4 investment rounds.

Each round has its own `FundingRoundShares` and `FundingRoundMultiplier`.

- `fundingRoundShares = [0.1, 0.35, 0.25, 0.2]`
- `fundingRoundMultiplier = [3, 2, 2, 1.5]`

```javascript
const offer = corporationValuation * fundingRoundShares * fundingRoundMultiplier;
```

## Dividend and Tribute modifier

Dividends can be enabled after going IPO by setting the dividend rate to above 0. Dividends send a percentage of the corporations profits to the player's money.

```javascript
const totalDividends = dividendRate * (revenue - expenses) * 10;
const dividend = Math.pow((ownedShares * totalDividends) / totalShares, 1 - tributeModifier);
```

Your dividend is negatively affected by a tribute modifier. Corporation softcap is a BitNode parameter which equals 1 in BN3.

```javascript
const tributeModifier = 1.15 - corporationSoftcap;
```

`ShadyAccounting` reduces tribute modifier by 0.05, and `GovernmentPartnership` reduces it by 0.1.

## Shares

Self-fund:

- Cost 150b.
- Total shares: 1b.
- Initial owned shares: 1b.

Use seed money (BN3 only):

- Does not cost money.
- Total shares: 1.5b.
- Initial owned shares: 1b.

In each investment round, investors take a percentage of initial owned shares.

If your corporation is self-funded and you sell CEO position, you only need 50b to create next corporation.

### Going public

When corporation goes public, shares are priced according to `targetSharePrice`.

```javascript
const ownershipPercentage = ownedShares / totalShares;
const targetSharePrice = (corporationValuation * (0.5 + Math.sqrt(ownershipPercentage))) / totalShares;
```

The `targetSharePrice` changes over time, and the share price is updated in the START state to move towards the target share price.

```javascript
if (sharePrice <= targetSharePrice) {
  sharePrice *= 1 + Math.random() * 0.01;
} else {
  sharePrice *= 1 - Math.random() * 0.01;
}
```

Minimum share price is 0.01.

### Issuing new shares

New shares can be issued in a multiple of 10 million. You may issue up to 20% of total shares at a time.

```javascript
const newOwnershipPercentage = ownedShares / (totalShares + newShares);
const newSharePrice = (corporationValuation * (0.5 + Math.sqrt(newOwnershipPercentage))) / totalShares;
```

```javascript
const profit = newShares * (sharePrice + newSharePrice) * 0.5;
```

After issuing new shares, you must wait before issuing again. The default cooldown is 4 hours and it scales based on total shares.

```javascript
const cooldown = defaultCooldown * (totalShares / 1e9);
```

A portion of shares go onto the public market, and some go to your private investors.

```javascript
const privateOwnedRatio = investorShares / totalShares;
const maxPrivateShares = (newShares * 0.5 * investorShares) / totalShares;
const privateShares = Math.round(random(0, maxPrivateShares) / 10e6) * 10e6;

issuedShares += newShares - privateShares;
investorShares += privateShares;
totalShares += newShares;
```

### Buying and selling shares

You can buy and sell your shares on the public market.

This works with player money, not corporation funds. Selling shares decreases your owned shares and adds to player money, while buying shares requires spending player money and increases owned shares.

Shares given to investors or the government cannot be bought back.

You can buy or sell up to `1e14` shares at a time. Selling shares has a 1 hour cooldown.

Shares are bought back at a 10% premium over the market price.

The share price is adjusted while buying or selling shares, at interval of every million shares:

```javascript
const ownershipPercentage = (ownedShares - processedShares) / totalShares;
const targetSharePrice = (corporationValuation * (0.5 + Math.sqrt(ownershipPercentage))) / totalShares;

if (sharePrice <= targetSharePrice) {
  sharePrice *= 1.005;
} else {
  sharePrice *= 0.995;
}
```
