# Office

Each city that a division has expanded to has an office. The office has stats and can employ 6 different types of employees. The office's stats and employee spread affects production and sales in various ways: production quantity, produced material quality, product ratings and product quality, etc.

## Stats

Employee stats are stored as office averages: `avgEnergy`, `avgMorale`, `avgIntelligence`, `avgCharisma`, `avgCreativity`, and `avgEfficiency`.

Total experience is increased in each cycle during the START phase.

```javascript
const totalExperienceGain = 0.0015 * (totalEmployees - unassignedEmployees + internEmployees * 9);
```

Salary per cycle:

```javascript
const salary =
  3 *
  totalEmployees *
  (avgIntelligence + avgCharisma + avgCreativity + avgEfficiency + totalExperience / totalEmployees);
```

Office upgrade cost:

```javascript
const upgradeCost = basePrice * ((Math.cbrt(1.09) - 1) / 0.09) * Math.pow(1.09, currentSize / 3);
```

## Energy and morale

Energy and morale are updated during every START state. Their minimum value is 10 and their maximum value starts at 100 and can be increased by research.

```javascript
const internEffect = 0.002 * Math.min(1 / 9, internEmployees / totalEmployees - 1 / 9) * 9;
const debtPenalty = corpFunds < 0 && divisionLastCycleRevenue < divisionLastCycleExpenses ? 0.001 : 0;
const perfMult = totalEmployees < 9 ? 1.002 : Math.pow(1 + internEffect - debtPenalty, marketCycles);

const partyMult = 1 + partyCostPerEmployee / 10_000_000;
const reduction = 0.002 * marketCycles;
const increase = partyMult > 1 ? (partyMult - 1) * 10 : 0;

avgEnergy = (avgEnergy - reduction * Math.random()) * perfMult + (teaPending ? 2 : 0);
avgMorale = ((avgMorale - reduction * Math.random()) * perfMult + increase) * partyMult;
```

When hiring a new employee:

```javascript
this.avgMorale = (this.avgMorale * this.numEmployees + getRandomIntInclusive(50, 100)) / (this.numEmployees + 1);
this.avgEnergy = (this.avgEnergy * this.numEmployees + getRandomIntInclusive(50, 100)) / (this.numEmployees + 1);
```

## Employee production by job

In each START state, the office calculates a production value for each job.

The effective employee stats are the office averages multiplied by corporation upgrade multipliers and division research multipliers:

```javascript
const effectiveCreativity =
  avgCreativity * corporationEmployeeCreativityMultiplier * divisionEmployeeCreativityMultiplier;
const effectiveCharisma = avgCharisma * corporationEmployeeCharismaMultiplier * divisionEmployeeCharismaMultiplier;
const effectiveIntelligence =
  avgIntelligence * corporationEmployeeIntelligenceMultiplier * divisionEmployeeIntelligenceMultiplier;
const effectiveEfficiency =
  avgEfficiency * corporationEmployeeEfficiencyMultiplier * divisionEmployeeEfficiencyMultiplier;
```

Energy and morale are applied through the production base:

```javascript
const productionBase = (avgMorale / 100) * (avgEnergy / 100);
```

Experience is average experience per employee. With no employees, it is 0:

```javascript
const experience = totalEmployees > 0 ? totalExperience / totalEmployees : 0;
```

A production multiplier is determined per job:

```javascript
const operationsProductionMultiplier =
  0.6 * effectiveIntelligence + 0.1 * effectiveCharisma + experience + 0.5 * effectiveCreativity + effectiveEfficiency;

const engineerProductionMultiplier =
  effectiveIntelligence + 0.1 * effectiveCharisma + 1.5 * experience + effectiveEfficiency;

const businessProductionMultiplier = 0.4 * effectiveIntelligence + effectiveCharisma + 0.5 * experience;

const managementProductionMultiplier =
  2 * effectiveCharisma + experience + 0.2 * effectiveCreativity + 0.7 * effectiveEfficiency;

const researchAndDevelopmentProductionMultiplier =
  1.5 * effectiveIntelligence + 0.8 * experience + effectiveCreativity + 0.5 * effectiveEfficiency;
```

The production value for a job is the job's employee count multiplied by that job's production multiplier and the production base:

```javascript
office.employeeProductionByJob[jobName] = office.employeeJobs[jobName] * jobProductionMultiplier * productionBase;
```

Unassigned employees and interns do not create employee production.
