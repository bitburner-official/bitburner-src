# Unlocks - Upgrade - Research

## Unlocks

| **Name**                  | **Price** | **Description**                                                                                                                                            |
| ------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Export                    | 20e9      | Allow exporting material between different divisions. Extremely important. Buy it at the start of round 2.                                                 |
| Smart Supply              | 25e9      | Enable "Smart Supply" feature. Only buy it if you don't implement your custom [Smart Supply](./smart-supply.md) script.                                    |
| Market Research - Demand  | 5e9       | Grant access to [Demand](./demand-competition.md) data. You need it to implement a custom [Market-TA2](./optimal-selling-price-market-ta2.md) script.      |
| Market Data - Competition | 5e9       | Grant access to [Competition](./demand-competition.md) data. You need it to implement a custom [Market-TA2](./optimal-selling-price-market-ta2.md) script. |
| VeChain                   | 10e9      | View more statistics about Corporation. Useless.                                                                                                           |
| Shady Accounting          | 500e12    | Reduce [DividendTax](./financial-statement.md) by 0.05                                                                                                     |
| Government Partnership    | 2e15      | Reduce [DividendTax](./financial-statement.md) by 0.1                                                                                                      |

&nbsp;

## Upgrade

Each upgrade has different `BasePrice`, `PriceMult`, `Benefit.

Most upgrades affect all divisions.

There are 3 special upgrades. These upgrades only affect its division and have different formulas for cost/benefits.

- Warehouse. Check this [part](./warehouse.md).
- Office. Check this [part](./office.md).
- Advert. Check this [part](./wilson-analytics-advert.md).

Normal upgrade's formulas:

- Upgrade cost:

$$UpgradeCost = BasePrice\ast{PriceMult}^{CurrentLevel}$$

- Upgrade cost from level 0 to level n:

$$UpgradeCost_{From\ 0\ to\ n} = \sum_{k = 0}^{n - 1}{BasePrice\ast {PriceMult}^k}$$

≡

$$UpgradeCost_{From\ 0\ to\ n} = BasePrice\ast\left( \frac{1 - {PriceMult}^{n}}{1 - PriceMult} \right)$$

≡

$$UpgradeCost_{From\ 0\ to\ n} = BasePrice\ast\left( \frac{{PriceMult}^{n} - 1}{PriceMult - 1} \right)$$

- Upgrade cost level a to level b:

$$UpgradeCost_{From\ a\ to\ b} = \sum_{k = 0}^{b - 1}{BasePrice\ast {PriceMult}^k} - \sum_{k = 0}^{a - 1}{BasePrice\ast {PriceMult}^k}$$

≡

$$UpgradeCost_{From\ a\ to\ b} = BasePrice\ast\left( \frac{{PriceMult}^{b} - 1}{PriceMult - 1} \right) - BasePrice\ast\left( \frac{{PriceMult}^{a} - 1}{PriceMult - 1} \right)$$

≡

$$UpgradeCost_{From\ a\ to\ b} = BasePrice\ast\left( \frac{{PriceMult}^{b} - {PriceMult}^{a}}{PriceMult - 1} \right)$$

- Maximum upgrade level with a given `MaxCost`:

$$MaxUpgradeLevel = \log_{PriceMult}\left( MaxCost\ast\frac{PriceMult - 1}{BasePrice} + (PriceMult)^{CurrentLevel} \right)$$

- Benefit:
  - All benefits are multipliers. `BaseBenefit` is 1.
  - The only exception is DreamSense. Its benefit is raw value, its `BaseBenefit` is 0.

$$Benefit = BaseBenefit + Benefit\ast CurrentLevel$$

&nbsp;  
Normal upgrades:

| **Name**                           | **Base price** | **Price multiplier** | **Benefit** | **Type**                |
| ---------------------------------- | -------------- | -------------------- | ----------- | ----------------------- |
| SmartFactories                     | 2e9            | 1.06                 | 0.03        | Production              |
| SmartStorage                       | 2e9            | 1.06                 | 0.1         | Storage                 |
| DreamSense                         | 4e9            | 1.1                  | 0.001       | Awareness/Popularity    |
| WilsonAnalytics                    | 4e9            | 2                    | 0.005       | Advert's benefits       |
| NuoptimalNootropicInjectorImplants | 1e9            | 1.06                 | 0.1         | Employee's creativity   |
| SpeechProcessorImplants            | 1e9            | 1.06                 | 0.1         | Employee's charisma     |
| NeuralAccelerators                 | 1e9            | 1.06                 | 0.1         | Employee's intelligence |
| FocusWires                         | 1e9            | 1.06                 | 0.1         | Employee's efficiency   |
| ABCSalesBots                       | 1e9            | 1.07                 | 0.01        | Sales                   |
| ProjectInsight                     | 5e9            | 1.07                 | 0.05        | RP                      |

&nbsp;  
Special upgrades:

| **Name**  | **Base price** | **Price multiplier** | **Type**             |
| --------- | -------------- | -------------------- | -------------------- |
| Warehouse | 1e9            | 1.07                 | Storage              |
| Office    | 4e9            | 1.09                 | Office's size        |
| Advert    | 1e9            | 1.06                 | Awareness/Popularity |

&nbsp;  
Advices:

- DreamSense is useless. Never buy it.
- Round 1:
  - SmartStorage and Warehouse are the most important upgrades in this round.
  - Only buy 1 or 2 Advert level(s).
- Round 2:
  - SmartFactories, SmartStorage and Warehouse are the most important upgrades in this round.
  - Only buy 1 Office level and a couple of Advert levels for Agriculture division.
  - Do not buy Office/Advert for Chemical division.
- Check this [section](./general-advice.md) for more advices, especially for round 3+.

## Research

Each research has a set of multipliers. For example: `sciResearchMult`, `productionMult`, etc.

Benefit of research type is the product of all research's multiplier of the same type.

| **Type**              | **Research**                                  | **Multiplier** | **Effect**              |
| --------------------- | --------------------------------------------- | -------------- | ----------------------- |
| advertisingMult       | No research                                   | 1              | Advert's benefits       |
| employeeChaMult       | CPH4 Injections                               | 1.1            | Employee's charisma     |
| employeeCreMult       | CPH4 Injections                               | 1.1            | Employee's creativity   |
| employeeEffMult       | CPH4 Injections, Overclock                    | 1.1\*1.25      | Employee's efficiency   |
| employeeIntMult       | CPH4 Injections, Overclock                    | 1.1\*1.25      | Employee's intelligence |
| productionMult        | Drones -- Assembly Self-Correcting Assemblers | 1.2\*1.1       | Production              |
| productProductionMult | uPgrade: Fulcrum                              | 1.05           | Product's production    |
| salesMult             | No research                                   | 1              | Sales                   |
| sciResearchMult       | Hi-Tech R&D Laboratory                        | 1.1            | RP                      |
| storageMult           | Drones - Transport                            | 1.5            | Storage                 |

&nbsp;  
Research list:

| **Name**                      | **Cost** | **Description**                                                                                                                               |
| ----------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Hi-Tech R&D Laboratory        | 5000     | Top priority. Increase RP gain rate. It is the prerequisite of all other researches.                                                          |
| Market-TA.I                   | 20000    | Useless. It is the prerequisite of Market-TA.II.                                                                                              |
| Market-TA.II                  | 50000    | Top priority if you don't write custom script. Check this [section](./optimal-selling-price-market-ta2.md) to see how to write custom script. |
| Automatic Drug Administration | 10000    | It is the prerequisite of Go-Juice and CPH4 Injections.                                                                                       |
| Go-Juice                      | 25000    | Useful. Increase maximum energy.                                                                                                              |
| CPH4 Injections               | 25000    | Useful. Increase employee's stats.                                                                                                            |
| Overclock                     | 15000    | Useful. Increase employee's stats. It is the prerequisite of Sti.mu.                                                                          |
| Sti.mu                        | 30000    | Useful. Increase maximum morale.                                                                                                              |
| Drones                        | 5000     | It is the prerequisite of Drones - Assembly and Drones - Transport.                                                                           |
| Drones - Assembly             | 25000    | Useful. Increase all productions.                                                                                                             |
| Drones - Transport            | 30000    | Useful. Increase warehouse's storage space.                                                                                                   |
| Self-Correcting Assemblers    | 25000    | Useful. Increase all productions.                                                                                                             |
| uPgrade: Fulcrum              | 10000    | Useful. Increase product's production.                                                                                                        |
| uPgrade: Capacity.I           | 20000    | Not useful. The cost is too high for its mediocre benefit. Increase maximum number of products by 1 (from 3 to 4).                            |
| uPgrade: Capacity.II          | 30000    | Not useful. The cost is too high for its mediocre benefit. Increase maximum number of products by 1 (from 4 to 5).                            |
| uPgrade: Dashboard            | 5000     | Useless.                                                                                                                                      |
| AutoBrew                      | 12000    | Useless.                                                                                                                                      |
| AutoPartyManager              | 15000    | Useless.                                                                                                                                      |
| HRBuddy-Recruitment           | 15000    | Useless.                                                                                                                                      |
| HRBuddy-Training              | 20000    | Useless.                                                                                                                                      |

&nbsp;  
Advices:

- Do not deplete entire RP pool to buy research. You should only buy research if it costs less than half of the RP pool. Personally, my conditions for buying researches are:
  - For energy/morale and employee's stats: if it costs less than 20% of RP pool.
  - For production: if it costs less than 10% of RP pool.
- If you don't have a custom Market-TA2 script, you must prioritize Market-TA1 and Market-TA2. Market-TA1 is useless, the only reason to buy it is because it's the prerequisite of Market-TA2. If you buy them, you should stock up on RP and buy them together. However, I recommend implementing a custom Market-TA2 ASAP. Market-TA1 and Market-TA2 cost 70000 RP, that's a huge number of RP at the start of round 3+. **Implementing a custom Market-TA2 script is the best optimization in round 3+.**
- After that, you should prioritize researches for higher maximum energy/morale and employee's stats over production. Researches for production are nice to have, but it's much less important than energy/morale/employee's stats.
- My research order for higher maximum energy/morale and employee's stats: Overclock → Sti.mu → Automatic Drug Administration → Go-Juice → CPH4 Injections.
- Do not buy these useless researches:
  - uPgrade: Dashboard
  - AutoBrew
  - AutoPartyManager
  - HRBuddy-Recruitment
  - HRBuddy-Training
- In most cases, uPgrade: Capacity.I and uPgrade: Capacity.II are useless. New products are usually much better than the old ones, so there is no point in increasing the maximum number of products. The only exception is when you reach the endgame. In the endgame, new products are only marginally better than the old ones, so having more product slots may be beneficial. However, even in the endgame, those researches may do more harm than good. In the endgame, the warehouse's size and high-quality input materials are serious bottlenecks. Having more product slots means that you need more free space in the warehouse and more units of input materials. In some cases, increasing product slots actually reduces the overall profit. You need to fine-tune it per use case.

You can exchange hashes for RP if you have SF9. This number of RP is added to all divisions.

RP gain rate:

- RP is increased in 4 states: PURCHASE, PRODUCTION, EXPORT and SALE.
- RP gain per city per state:
  - `RnDProduction = office.employeeProductionByJob["Research & Development"]`

$$RPGain = 0.004\ast(RnDProduction)^{0.5}\ast UpgradeMultiplier\ast ResearchMultiplier$$

- Industry's `ScienceFactor` does not affect RP gain rate.
