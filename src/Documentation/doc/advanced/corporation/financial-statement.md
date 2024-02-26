# Financial statement

## Total assets

`TotalAssets` is the sum of:

- Funds.
- With each division:
  - Division's `RecoupableValue`. It's half of the sum of:
    - Industry's starting cost.
    - With each city that division has expanded to (exclude Sector-12):
      - Office's initial cost.
      - Warehouse's initial cost.
  - Output material: `material.stored * material.averagePrice`.
  - Product: `product.stored * product.productionCost`.

This value is kept track by `TotalAssets` and `PreviousTotalAssets`.

Funds is increased/decreased by `gainFunds`/`loseFunds` for each "action" (buying tea, throwing party, buying upgrade, etc.). Each action is either "long-term" (`FundsSourceLongTerm`) or "short-term" (`FundsSourceShortTerm`). If an action is "long-term", it modifies `totalAssets`.

```typescript
if (LongTermFundsSources.has(source)) {
  this.totalAssets += amt;
}
this.funds += amt;
```

`FundsSourceLongTerm` and `FundsSourceShortTerm` are in `FundsSource.ts`.

## Valuation

Cycle's valuation:

- AssetDelta:

$$AssetDelta = \frac{TotalAssets - PreviousTotalAssets}{10}$$

- Pre-IPO:
  - If `AssetDelta` is greater than 0, it's used for calculating valuation.
  - Formula: $Valuation = \left( 10^{10} + \frac{Funds}{3} + AssetDelta\ast 315000 \right)\ast\left( \sqrt[12]{1.1} \right)^{NumberOfOfficesAndWarehouses}$
  - Valuation is rounded down to nearest million.
- Post-IPO:
  - `AssetDelta` is affected by `DividendRate`: $AssetDelta = AssetDelta\ast(1 - DividendRate)$
  - Formula:

$$Valuation = (Funds + AssetDelta\ast 85000)\ast\left(\sqrt[12]{1.1}\right)^{NumberOfOfficesAndWarehouses}$$

- Minimum value of valuation is $10^{10}$.
- Valuation is multiplied by `CorporationValuation`. Many BitNodes cripple Corporation via this multiplier.

Corporation's valuation is the mean of last 10 cycles' valuations.

Bribing faction for reputation is unlocked when corporation's valuation is greater than or equal to 100e12. Exchange rate: 1e9/reputation.

## Investment offer

There are 4 investment rounds.

Each round has its own `FundingRoundShares` and `FundingRoundMultiplier`.

- $FundingRoundShares = [0.1, 0.35, 0.25, 0.2]$
- $FundingRoundMultiplier = [3, 2, 2, 1.5]$

Formula:

$$Offer = CorporationValuation\ast FundingRoundShares\ast FundingRoundMultiplier$$

Analyses:

- Offer depends on `Funds`, `AssetDelta` and `NumberOfOfficesAndWarehouses`.
  - `Funds` are usually depleted to improve divisions.
  - `NumberOfOfficesAndWarehouses` is the exponent of the multiplier, it can be increased by creating [dummy division](./miscellany.md). It is an easy way to get higher offer in round 3+, when we have enough funds to do that.
  - `AssetDelta` is multiplied by 315000, so it is the main source of offer.
- Assuming that we can sell all produced units and not buy more boost materials, `AssetDelta` is delta of funds, and delta of funds is delta of profit. This is why we try our best to improve profit.

## Dividend

`DividendTax` depends on `CorporationSoftcap`. In BN3, `CorporationSoftcap` is 1.

$$DividendTax = 1 - CorporationSoftcap + 0.15$$

`ShadyAccounting` reduces `DividendTax` by 0.05.

`GovernmentPartnership` reduces `DividendTax` by 0.1.

Formula:

$$TotalDividends = DividendRate\ast(Revenue - Expenses)\ast 10$$

$$Dividend = \left(OwnedShares\ast\frac{TotalDividends}{TotalShares}\right)^{1 - DividendTax}$$

Retained earning:

$$RetainedEarning = (1 - DividendRate)\ast(Revenue - Expenses)\ast 10$$

Dividend is added to player's money. Retained earning is added to corporation's funds. This means if we increase `DividendRate`, corporation's valuation is dwindled.

## Shares

Self-fund:

- Cost 150b.
- Total shares: 1b.
- Initial owned shares: 1b.

Use seed money:

- Does not cost money.
- Total shares: 1.5b.
- Initial owned shares: 1b.

In each investment round, investors take a percentage of initial owned shares. The percentage of each round is in `FundingRoundShares`.

If your corporation is self-funded and you sell CEO position, you only need 50b to create next corporation.

`TargetSharePrice`:

$$TargetSharePrice = \frac{CorporationValuation*\left( 0.5 + \sqrt{\frac{OwnedShares}{TotalShares}} \right)}{TotalShares}$$

When corporation goes public, the initial share price is `TargetSharePrice`.

Share price is updated in START state.

$$SharePrice = \begin{cases} SharePrice\ast(1 + Math.random()\ast 0.01), & SharePrice \leq TargetSharePrice \newline SharePrice\ast(1 - Math.random()\ast 0.01), & SharePrice > TargetSharePrice\end{cases}$$

Minimum share price is 0.01.

Issue new shares:

- Maximum number of new shares is 20% of total shares.
- The number of new shares issued must be a multiple of 10 million.
- New share price: $NewSharePrice = \frac{CorporationValuation\ast\left(0.5 + \sqrt{\frac{OwnedShares}{TotalShares + NewShares}}\right)}{TotalShares}$
- Profit: $Profit = \frac{NewShares\ast(SharePrice + NewSharePrice)}{2}$
- Profit is added to corporation's funds.
- `DefaultCooldown` is 4 hours.
- Cooldown: $Cooldown = DefaultCooldown\ast\frac{TotalShares}{10^{9}}$
- Part of the new shares are added to `InvestorShares`. The remaining ones are added to `IssuedShares`.
  - `MaxPrivateShares`: $MaxPrivateShares = \frac{NewShares}{2}\ast\frac{InvestorShares}{TotalShares}$
  - `PrivateShares` is randomized between 0 and `MaxPrivateShares`, rounded to nearest 10 million.
  - `InvestorShares`: $InvestorShares = InvestorShares + PrivateShares$
  - `IssuedShares`: $IssuedShares = IssuedShares + NewShares - PrivateShares$

Sell shares:

- We cannot sell all our shares.
- We cannot sell more than $10^{14}$ shares at a time.
- Cooldown is 1 hour.
- Sold shares are added to `IssuedShares`.

Buy back shares:

- We can only buy back shares that were issued. The shares that were owned by government (when we use seed money) and investors cannot be bought back.
- Shares must be bought back at a 10% premium over the market price.
- We cannot use corporation's funds to buy back shares. They must be bought with our money.
- We cannot buy back more than $10^{14}$ shares at a time.

Sold/bought back shares are processed in multiple "iterations".

- Number of shares processed each iteration is shareSalesUntilPriceUpdate. Default value is $10^6$.
- Share price is recalculated each iteration.
  - $TargetSharePrice = \frac{CorporationValuation\ast\left(0.5 + \sqrt{\frac{OwnedShares - ProcessedShares}{TotalShares}}\right)}{TotalShares}$

$$SharePrice = \begin{cases} SharePrice\ast 1.005, SharePrice \leq TargetSharePrice \newline SharePrice\ast 0.995, SharePrice > TargetSharePrice\end{cases}$$
