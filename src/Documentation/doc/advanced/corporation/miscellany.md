# Miscellany

## Corporation's state

Corporation continuously transitions between 5 states: START → PURCHASE → PRODUCTION → EXPORT → SALE → START. 1 cycle of these transitions takes 10 seconds. If you have enough bonus time, it takes 1 second.

START:

- Division:
  - Office:
    - Calculate: energy, morale, total experience, salary, employee production by jobs.
    - Set employees' jobs: copy data from `employeeNextJobs` to `employeeJobs`.
  - Material market: update `demand`, `competition`, `marketPrice`.
  - Product market: decrease `demand` and increase `competition`.
- Calculate corporation's financial statements: revenue, expenses, profit, dividend, total assets, valuation, share price.

PURCHASE:

- Buy input materials.
- If we have unlocked "Smart Supply", it's used for calculating optimal quantity of input material units.

PRODUCTION:

- Produce output materials and products.
- If new product's `developmentProgress` is greater than or equal to 100, it's finished. New finished product's stats are calculated in this state.

EXPORT: export output materials.

SALE:

- Sell output materials and product.
- If we have unlocked "Market-TA1" / "Market-TA2", it's used for calculating selling price.

Special cases: RP and salary expense are increased in 4 states: PURCHASE, PRODUCTION, EXPORT, SALE.

## Import and export

Importing/exporting material is done in EXPORT state.

EXPORT state is before SALE state. It means you sell the material units remained after being exported.

Export string can use "MAX", "EINV", "IINV", "EPROD" and "IPROD". Read the description in export popup for the meaning of these values.

The optimal export string is `(IPROD+IINV/10)\*(-1)`. For example: export "Chemicals" from Chemical division to Agriculture division:

- Agriculture division needs 100 Chemicals/s and has 700 Chemicals in warehouse.
  - IPROD = -100 ("Consumption is negative production")
  - IINV = 700
- "Export" is expressed by number of units per second, so we want to export:

$$\left(100-\frac{700}{10}\right)=\left(-100+\frac{700}{10}\right)\ast(-1)=\left(IPROD+\frac{IINV}{10}\right)\ast(-1)$$

Export route is FIFO. You can remove an export route by using `cancelExportMaterial` NS API.

Export data is in `material.exports`.

## Use mathematical library

I use the JavaScript ports of these libraries. They don't support JavaScript.

I use the default setting without any tuning. If you tune their parameters properly, their accuracy and performance will be improved.

### Ceres Solver

Quote from <http://ceres-solver.org/>

> Ceres Solver is an open source C++ library for modeling and solving large, complicated optimization problems. It can be used to solve Non-linear Least Squares problems with bounds constraints and general unconstrained optimization problems.

JavaScript port: <https://github.com/Pterodactylus/Ceres.js>

We can use it to solve the non-linear systems in these cases:

- Case 1: Find the optimal quantities of boost materials.
- Case 2: Find `CreationJobFactors[JobName]` when calculating product markup.

The accuracy and performance are acceptable, so we employ it case 2. We don't use it in case 1 because there is another optimal solution, it's better in both accuracy and performance.

Quick test for case 2 shows that the accuracy is pretty good:

- `creationJobFactors`:
  - Business: 420.103620358641
  - Engineer: 29666.47672073447
  - Management: 40466.091598191015
  - Operations: 25760.399443536793
- Solver's result:
  - Business: 420.08121628008024
  - Engineer: 29664.894610028987
  - Management: 40463.933544920386
  - Operations: 25759.025643594476

## Noodles trick

There is a place called "Noodle Bar" in New Tokyo. After going there, there is a button that says "Eat noodles". Eating noodles gives you multiple benefits. Each benefit is miniscule, but you can press that button programmatically. With Corporation, the benefit is:

```typescript
Player.corporation.gainFunds(Player.corporation.revenue * 0.000001, "glitch in reality");
```

In previous versions, the revenue is multiplied by 0.01. If you do it fast enough, it'll raise the investment offer by a considerable amount. Nowadays, this trick is useless.

## "sudo.Assist" research

This research exists in ResearchMap.ts, but it's unused in BaseResearchTree.ts. If you use it in NS API, it will throw error.

```typescript
"sudo.Assist": new Research({
  name: "sudo.Assist",
  cost: 15e3,
  desc: "Develop a virtual assistant AI to handle and manage administrative issues for your corporation.",
})
```

## Dummy division

Dummy division is the division that you create only to increase the [valuation](./financial-statement.md) and the [investment offer](./financial-statement.md).

Use Restaurant industry for dummy division. Its starting cost is only 10e9. Spring Water's starting cost is also 10e9, but it's a newbie trap, so it's best not to touch it.

For dummy division, you only need to expand to 6 cities and buy 6 warehouses. Don't invest in other things (Warehouse/Office/Advert upgrades).

If you start round 3 with large budget, you can create dummy divisions immediately to simplify the script's logic. It's not optimal but still acceptable. However, if the budget is tight, you should not create them at the start of round 3. After completing first product, profit will be high enough to get enough funds to create them without any problem.
