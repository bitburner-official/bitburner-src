## Unlocks

| **Name**                  | **Price** | **Description**                                              |
| ------------------------- | --------- | ------------------------------------------------------------ |
| Export                    | 20e9      | Allow exporting material between different divisions.        |
| Smart Supply              | 25e9      | Enable "Smart Supply" feature.                               |
| Market Research - Demand  | 5e9       | Grant access to [Demand](./demand-competition.md) data.      |
| Market Data - Competition | 5e9       | Grant access to [Competition](./demand-competition.md) data. |
| Shady Accounting          | 500e12    | Reduce [tribute modifier](./financials) by 0.05.             |
| Government Partnership    | 2e15      | Reduce [tribute modifier](./financials) by 0.1.              |

## Division upgrades

- [Warehouse](./warehouse.md).
- [Office](./office.md).
- [AdVert](./advert.md).

## Upgrades

For normal upgrades, the `Benefit` column is the per-level additive increase, not the final multiplier used by formulas.

```javascript
const upgradeMultiplier = 1 + benefit * currentLevel;
```

For example, `WilsonAnalytics` has `Benefit = 0.005`, so its actual multiplier is:

```javascript
const wilsonUpgradeBenefit = 1 + 0.005 * currentLevel;
```

| **Name**                           | **Base price** | **Price multiplier** | **Benefit** | **Type**                |
| ---------------------------------- | -------------- | -------------------- | ----------- | ----------------------- |
| SmartFactories                     | 2e9            | 1.06                 | 0.03        | Production              |
| SmartStorage                       | 2e9            | 1.06                 | 0.1         | Storage                 |
| WilsonAnalytics                    | 4e9            | 2                    | 0.005       | Advert's benefits       |
| NuoptimalNootropicInjectorImplants | 1e9            | 1.06                 | 0.1         | Employee's creativity   |
| SpeechProcessorImplants            | 1e9            | 1.06                 | 0.1         | Employee's charisma     |
| NeuralAccelerators                 | 1e9            | 1.06                 | 0.1         | Employee's intelligence |
| FocusWires                         | 1e9            | 1.06                 | 0.1         | Employee's efficiency   |
| ABCSalesBots                       | 1e9            | 1.07                 | 0.01        | Sales                   |
| ProjectInsight                     | 5e9            | 1.07                 | 0.05        | RP                      |

## Research

Research Points (RP) is a division-level value. Each office contributes an RP gain to its division's research pool in the states PURCHASE, PRODUCTION, EXPORT, and SALE.

```javascript
const rndProduction = office.employeeProductionByJob["Research & Development"];
const rpGain = 0.004 * Math.pow(rndProduction, 0.5) * corpResearchMult * divisionResearchMult;
```

If you have SF9, you can exchange hashes for RP. This amount is added to all divisions.

If multiple researched upgrades contribute to the same multiplier type, their multipliers are multiplied together.

| **Name**                      | **Cost** | **Multiplier** | **Description**                                                                  |
| ----------------------------- | -------- | -------------- | -------------------------------------------------------------------------------- |
| Hi-Tech R&D Laboratory        | 5000     | 1.1            | Increase RP gain rate. It is the prerequisite of all other research upgrades.    |
| Market-TA.I                   | 20000    | —              | It is the prerequisite of Market-TA.II.                                          |
| Market-TA.II                  | 50000    | —              | Enables automatic price calculation. See [Sales](./sales.md).                    |
| Automatic Drug Administration | 10000    | —              | It is the prerequisite of Go-Juice and CPH4 Injections.                          |
| Go-Juice                      | 25000    | —              | Increase maximum energy.                                                         |
| CPH4 Injections               | 25000    | 1.1            | Increase employee creativity, charisma, efficiency, and intelligence.            |
| Overclock                     | 15000    | 1.25           | Increase employee efficiency and intelligence. It is the prerequisite of Sti.mu. |
| Sti.mu                        | 30000    | —              | Increase maximum morale.                                                         |
| Drones                        | 5000     | —              | It is the prerequisite of Drones - Assembly and Drones - Transport.              |
| Drones - Assembly             | 25000    | 1.2            | Increase all productions.                                                        |
| Drones - Transport            | 30000    | 1.5            | Increase warehouse's storage space.                                              |
| Self-Correcting Assemblers    | 25000    | 1.1            | Increase all productions.                                                        |
| uPgrade: Fulcrum              | 10000    | 1.05           | Increase product's production.                                                   |
| uPgrade: Capacity.I           | 20000    | —              | Increase maximum number of products by 1 (from 3 to 4).                          |
| uPgrade: Capacity.II          | 30000    | —              | Increase maximum number of products by 1 (from 4 to 5).                          |
| uPgrade: Dashboard            | 5000     | —              | Unlocks Dashboard.                                                               |
| AutoBrew                      | 12000    | —              | Automatically maintains energy.                                                  |
| AutoPartyManager              | 15000    | —              | Automatically maintains morale.                                                  |
| HRBuddy-Recruitment           | 15000    | —              | Improves hiring automation.                                                      |
| HRBuddy-Training              | 20000    | —              | Improves employee training.                                                      |
