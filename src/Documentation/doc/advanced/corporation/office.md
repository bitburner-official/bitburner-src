# Office

## Basic information

Employee's stats are kept track as average value. There are 6 average values: `AvgEnergy`, `AvgMorale`, `AvgIntelligence`, `AvgCharisma`, `AvgCreativity`, `AvgEfficiency`. Every time you hire a new employee, these average values are recalculated, they are modified by a randomized number from 50 to 100:

```typescript
this.avgMorale =
  (this.avgMorale * this.numEmployees + getRandomInt(averageStat, averageStat)) / (this.numEmployees + 1);
```

Job assignment:

- Each office has 2 records: `employeeJobs` and `employeeNextJobs`. Data in `employeeJobs` (number of employees in each job) is used for calculations of other relevant data like `EmployeeProductionByJob`, `AvgEnergy`, `AvgMorale`, `TotalExperience`. When you call `setAutoJobAssignment`, its parameter is calculated and assigned to `employeeNextJobs`. In next cycle's START state, data in `employeeNextJobs` will be copied to `employeeJobs`.
- Behavior of `setAutoJobAssignment` may be confused at first glance. Let's say you call it like this: `ns.corporation.setAutoJobAssignment("Agriculture","Sector-12","Operations", 5)`
  - If you have 5 \"Operations\" employees, it does nothing.
  - If you have 7 \"Operations\" employees, it reduces number of \"Operations\" employees to 5, and set \"Unassigned\" employees to 2.
  - If you have 2 \"Operations\" employees, it checks if you have at least 3 \"Unassigned\" employees. If yes, it changes \"Operations\" employees to 5 and reduces \"Unassigned\" employees by 3. If not, it throws error. Essentially, it tries to move employees from \"Unassigned\" to \"Operations\".
- This means the proper way to use `setAutoJobAssignment` is:
  - Use it to set all jobs to 0.
  - Use it to set all jobs to your requirements.

Total experience is increased in these cases:

- Hire new employee. Each new employee increases total experience by `getRandomInt(50, 100)`.
- In START state. Gain per cycle:

$$TotalExperienceGain = 0.0015\ast(TotalEmployees - UnassignedEmployees + InternEmployees\ast 9)$$

- If an office has 100 employees and all employees are assigned to non-intern positions, it gains 0.15 experience/cycle. It's 54 experience/hour without bonus time.

Salary per cycle:

$$Salary = 3\ast TotalEmployees\ast\left(AvgIntelligence+AvgCharisma+AvgCreativity+AvgEfficiency+\frac{TotalExperience}{TotalEmployees}\right)$$

## Upgrade

Upgrade cost:

$$UpgradeCost = BasePrice\ast\left( \frac{\sqrt[3]{1.09} - 1}{0.09} \right)\ast{1.09}^{\frac{CurrentSize}{3}}$$

Upgrade cost from size 3 to size n:

$$UpgradeCost_{From\ 3\ to\ n} = \sum_{k = 3}^{n - 1}{BasePrice\ast\left( \frac{\sqrt[3]{1.09} - 1}{0.09} \right)\ast{1.09}^{\frac{k}{3}}}$$

≡

$$UpgradeCost_{From\ 3\ to\ n} = \sum_{k = 3}^{n - 1}{BasePrice\ast\left( \frac{\sqrt[3]{1.09} - 1}{0.09} \right)\ast\left( \sqrt[3]{1.09} \right)^{k}}$$

≡

$$UpgradeCost_{From\ 3\ to\ n} = BasePrice\ast\left( \frac{\sqrt[3]{1.09} - 1}{0.09} \right)\ast\left( \frac{\left( \sqrt[3]{1.09} \right)^{n} - 1.09}{\sqrt[3]{1.09} - 1} \right)$$

≡

$$UpgradeCost_{From\ 3\ to\ n} = BasePrice\ast\left( \frac{{1.09}^{\frac{n}{3}} - 1.09}{0.09} \right)$$

Upgrade cost size a to size b:

$$UpgradeCost_{From\ a\ to\ b} = BasePrice\ast\left( \frac{{1.09}^{\frac{b}{3}} - {1.09}^{\frac{a}{3}}}{0.09} \right)$$

Maximum size with a given `MaxCost`:

$$MaxSize = 3\ast\log_{1.09}\left( MaxCost\ast\frac{0.09}{BasePrice} + {1.09}^{\frac{CurrentSize}{3}} \right)$$

## Energy and morale

They are calculated in START state.

They start dropping when your office's number of employees is greater than or equal to 9. The minimum value is 10.

PerfMult is a multiplier that increases/decreases energy/morale.

$$InternMultiplier = 0.002\ast Min\left(\frac{1}{9},\frac{InternEmployees}{TotalEmployees}-\frac{1}{9}\right)\ast 9$$

$$PenaltyMultiplier = \begin{cases}0, & (CorpFunds > 0) \vee (DivisionLastCycleRevenue > DivisionLastCycleExpenses) \newline 0.001, & (CorpFunds < 0) \land (DivisionLastCycleRevenue < DivisionLastCycleExpenses)\end{cases}$$

$$PerfMult = \begin{cases}1.002, & TotalEmployees < 9 \newline 1 + InternMultiplier - PenaltyMultiplier, & TotalEmployees \geq 9\end{cases}$$

Buying tea gives a flat +2 to energy. It costs 500e3 per employee.

When throwing party, `PartyMult` is calculated. It's used in the calculation of morale in the next cycle.

$$PartyMult = 1 + \frac{PartyCostPerEmployee}{10^{7}}$$

`PartyMult` is not affected by number of employees. Therefore, you can throw a "big party" (high `PartyCostPerEmployee`) when you have 1 employee at low total cost (due to having only 1 employee), then hire the rest of employees later.

There is a flat randomized reduction of energy/morale per cycle. It's capped at 0.002 per cycle. This is tiny so it's not a problem.

There is a flat increase of morale if `PartyMult` is greater than 1. `PartyMult` is based on `PartyCostPerEmployee`, so this increase is based on `PartyCostPerEmployee`.

$$IncreaseOfMorale = (PartyMult - 1)\ast 10$$

≡

$$IncreaseOfMorale = \frac{PartyCostPerEmployee}{10^{6}}$$

```typescript
const reduction = 0.002 * marketCycles;
const increase = this.partyMult > 1 ? (this.partyMult - 1) * 10 : 0;
this.avgEnergy = (this.avgEnergy - reduction * Math.random()) * perfMult + (this.teaPending ? 2 : 0);
this.avgMorale = ((this.avgMorale - reduction * Math.random()) * perfMult + increase) * this.partyMult;
```

There are 3 ways to counter the drop of energy/morale:

- Buy tea and throw party. You should always use this option. Writing script to automate them is very easy.
- Assign Intern. Many people throw around the ratio 1/9 as the way to counter the drop of energy/morale. You can only use that ratio when your corporation/division works fine. If it does not, there is a penalty multiplier (0.001). In this case, you need to use 1/6.
- Buy 2 researches: AutoBrew and AutoPartyManager. They keep energy/morale at maximum value. However, you should never buy them. It's always better to spend your RP on other useful researches or just stock up on RP.

`AvgEnergy` and `AvgMorale` are increased by a randomized amount when we hire new employee.

```typescript
this.avgMorale = (this.avgMorale * this.numEmployees + getRandomInt(50, 100)) / (this.numEmployees + 1);
this.avgEnergy = (this.avgEnergy * this.numEmployees + getRandomInt(50, 100)) / (this.numEmployees + 1);
```

Optimal `PartyCostPerEmployee`:

- The flat randomized reduction is tiny, so we can ignore it.
- We want to increase `AvgMorale` from `CurrentMorale` to `MaxMorale`:

$$\left( CurrentMorale\ast PerfMult + \frac{PartyCostPerEmployee}{10^{6}} \right)\ast\left( 1 + \frac{PartyCostPerEmployee}{10^{7}} \right) = MaxMorale$$

- Define:

$$a = CurrentMorale$$

$$b = MaxMorale$$

$$k = PerfMult$$

$$x = PartyCostPerEmployee$$

- We have equation:

$$\left( a\ast k + \frac{x}{10^{6}} \right)\ast\left( 1 + \frac{x}{10^{7}} \right) = b$$

≡

$$x_{1} = - 500000\ast\left( \sqrt{(a\ast k - 10)^{2} + 40\ast b} + a\ast k + 10 \right)$$

$$x_{2} = 500000\ast\left( \sqrt{(a\ast k - 10)^{2} + 40\ast b} - a\ast k - 10 \right)$$

- $x_{1}$ is always negative. Therefore, $x_{2}$ is the only solution.

One big party is less cost-effective than multiple small parties. For example: throwing 1 big party for 70→100 morale costs more than throwing 3 small parties: 70→80, 80→90, 90→100.

Don't be a cheapskate when it comes to tea/party. Energy and morale are vital to efficient office. Check the next part for the formulas.

- It's fine to spend 500e3 per employee when throwing party. You can spend more if you want.
- Try to maintain maximum energy/morale at all times. Personally, I always buy tea / throw party when energy/morale decreases to 99.5 (109.5, if I bought the relevant researches).
- In round 1 and 2, the office's size is small, it's usually smaller than 9, so energy/morale is not a problem. In round 3+, you should buy tea / throw party every cycle.

## Employee production by job

In each cycle's START state, all stats are used for calculating "production" values, these values are saved in `office.employeeProductionByJob`. These values can be used later for calculating:

- RP.
- Material's quality.
- Product's stats.
- Division raw production.
- Material/product's MaxSalesVolume.

Formulas:

- Calculate multipliers of Intelligence, Charisma, Creativity, and Efficiency. They are the product of average value, upgrade benefit and research benefit.
- Production base:

$$ProductionBase = AvgMorale\ast AvgEnergy\ast 10^{-4}$$

- Experience:

$$Exp = \frac{TotalExperience}{TotalEmployees}$$

- Production multiplier:
  - Operations: $$ProductionMultiplier = 0.6\ast IntelligenceMult + 0.1\ast CharismaMult + Exp + 0.5\ast CreativityMult + EfficiencyMult$$
  - Engineer: $$ProductionMultiplier = IntelligenceMult + 0.1\ast CharismaMult + 1.5\ast Exp + EfficiencyMult$$
  - Business: $$ProductionMultiplier = 0.4\ast IntelligenceMult + CharismaMult + 0.5\ast Exp$$
  - Management: $$ProductionMultiplier = 2\ast CharismaMult + Exp + 0.2\ast CreativityMult + 0.7\ast EfficiencyMult$$
  - Research and Development: $$ProductionMultiplier = 1.5\ast IntelligenceMult + 0.8\ast Exp + CreativityMult + 0.5\ast EfficiencyMult$$
- $EmployeesJobCount = office.employeeJobs[JobName]$
- Employee production by job:

$$EmployeeProductionByJob = EmployeesJobCount\ast ProductionMultiplier\ast ProductionBase$$

## Calculate employee's stat

4 stats `AvgIntelligence`, `AvgCharisma`, `AvgCreativity`, `AvgEfficiency` are inaccessible through NS API.

We can calculate them by using the formulas from previous part and [Ceres Solver](./miscellany.md). In 5 jobs Operations, Engineer, Business, Management, Research & Development, we need at least 4 jobs having 1 employee at the minimum to use this solution.
