# Production quantity

Production per second for materials is calculated in the PRODUCTION state like this:

```javascript
const maxProduction =
  divisionProductionMultiplier * officeProductivity * SmartFactoriesMultiplier * divisionProductionResearchMultiplier;
```

For products, it is the same, except an additional factor for the product production research multiplier.

This production amount would be reduced if there is a production limit, or if there's not enough space in the warehouse or not enough input materials.

## Division production multiplier

The boost materials AI Cores, Hardware, Real Estate, and Robots can be stored in warehouses to improve production rates. Each industry gets a different amount of benefit for each boost material.

This is how the division production is calculated:

```javascript
let divisionProductionMultiplier = 0;
for (const warehouse of getRecordValues(this.warehouses)) {
  const materials = warehouse.materials;
  const cityMult =
    Math.pow(0.002 * materials["Real Estate"].stored + 1, this.realEstateFactor) *
    Math.pow(0.002 * materials.Hardware.stored + 1, this.hardwareFactor) *
    Math.pow(0.002 * materials.Robots.stored + 1, this.robotFactor) *
    Math.pow(0.002 * materials["AI Cores"].stored + 1, this.aiCoreFactor);
  divisionProductionMultiplier += Math.pow(cityMult, 0.73);
}

if (divisionProductionMultiplier < 1) divisionProductionMultiplier = 1;
```

## Office productivity

Operations, Engineer, and Management employees contribute to office productivity. The production amounts for these roles are stored on the Office interface and are described in more detail in [office.md](./office.md).

Calculation for materials:

```javascript
const operationsJobProduction = office.employeeProductionByJob["Operations"];
const engineerJobProduction = office.employeeProductionByJob["Engineer"];
const managementJobProduction = office.employeeProductionByJob["Management"];

const totalProduction = operationsJobProduction + engineerJobProduction + managementJobProduction;

const managementFactor = totalProduction <= 0 ? 0 : 1 + managementJobProduction / (1.2 * totalProduction);

const officeProductivity =
  totalProduction <= 0
    ? 0
    : (Math.pow(operationsJobProduction, 0.4) + Math.pow(engineerJobProduction, 0.3)) * managementFactor * 0.05;
```

For products, it is the same, except multipled by `0.5`.
