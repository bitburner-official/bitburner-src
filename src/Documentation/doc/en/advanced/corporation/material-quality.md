# Material quality

Each material has a `quality` value which is calculated as the average quality of the material's units in a warehouse. This value is recalculated in every stage when units are added to the warehouse. All purchased materials have quality of 1.

The quality formula for the newly produced material units is:

```javascript
let newUnitQuality =
  office.employeeProductionByJob["Engineer"] / 90 +
  Math.pow(division.researchPoints, division.researchFactor) +
  Math.pow(Math.max(0, warehouse.materials["AI Cores"].stored), division.aiCoreFactor) / 10e3;

const qualityLimit = Math.max(Math.sqrt(newUnitQuality), 1);
newUnitQuality = Math.min(newUnitQuality, averageInputQuality * qualityLimit);
```
