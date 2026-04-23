# Corporation

Running a corporation can generate massive profits, but it is challenging and error-prone. Don't expect to create a successful corporation on your first try. Funds are limited and it's very easy to spend it on the wrong things. If/when your corporation fails, study the mechanics and take a more optimal approach next time.

This documentation explains how the Corporation mechanics work. It does not offer strategic advice or tips. If you would like some advice, please seek help from the online community. Detailed strategy guides have been written and are available online.

## Basic mechanics

You can create a Corporation at City Hall in Sector-12 or via NS API. It requires $150b of starting funds. In BN3 you can get these funds as a loan from city hall ("Seed Money").

To begin generating profits in your corporation, you must choose an industry, create a division in that industry, acquire materials, then produce and sell something. A division starts with an office and warehhouse in Sector-12, and can expand to other cities with their own offices and warehouses.

Depending on which industry it is in, a division can produce certain input materials into other materials/products at specific rates. For example, an Agriculture division consumes Water and Chemicals to produce Plants and Food:

```javascript
const inputMaterials = { Water: 0.5, Chemicals: 0.2 };
const outputMaterials = { Plants: 1, Food: 1 };
```

A corporation can have up to 20 divisions across different industries. Materials that are produced in one division can be exported to other divisions, forming a production network.

For each warehouse, you can set rates, limits, and prices to manage what comes in and out of the warehouse:

- Purchasing: Each material can be configured with buy-per-second amount. The price is market price.
- Production: You can limit how much of something gets produced.
- Export: Configure how much of which materials to send where (per second).
- Selling: For materials and products, configure sale price and sell-per-second amount limits.

A corporation continuously transitions between 5 phases/states: START → PURCHASE → PRODUCTION → EXPORT → SALE → START. Each state lasts 2 seconds, so one cycle is 10 seconds long. The action occurs when the corresponding state is entered. For example, in the NS API, `corporation.prevState` is set to `PURCHASE` just after executing all the warehouse's material purchase orders.

Please note that configured rates for a warehouse are per-second, while the action happens only once every 10 seconds. For example, if your purchase rate is 10, at the PURCHASE phase your office will purchase 100 (10 per second \* 10 second cycle).

There is no "offline progress" in corporation. When you go offline, the corporation accumulates bonus time. During bonus time, each cycle takes one second and warehouse rates are 10x faster to match.

## How to win

Grow profits. Increase your corporation's valuation and pay yourself from corporate profits via dividends or selling shares. When your corporation's valuation hits \$100t, your corporation can bribe factions for reputation at a cost of \$1b/rep.

- [Financials](./corporation/financials.md) - Valuation, investors, IPO
- [Office](./corporation/office.md) - Employees, office stats
- [Warehouse](./corporation/warehouse.md)
- [Production rates](./corporation/production-rates.md)
- [Sales](./corporation/sales.md) - How to sell for higher prices
- [Products](./corporation/product.md) - Product stats
- [Material quality](./corporation/material-quality.md) - Material stats
- [AdVert](./corporation/advert.md) - Advertising upgrade
- [Unlocks, upgrades, and research](./corporation/unlocks-upgrade-research.md)
- [Demand & competition](./corporation/demand-competition.md)

There is an [FAQ](./corporation/faq.md).
