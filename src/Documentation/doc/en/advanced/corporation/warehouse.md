# Warehouse

Warehouses store products and materials. The Sector-12 office in each division starts with a warehouse,
but other cities don't have a warehouse initially. Adding a warehouse costs $5b.

```javascript
// Warehouse upgrade cost
const upgradeCost = 1e9 * Math.pow(1.07, currentLevel + 1);
const warehouseSize = warehouseLevel * 100 * smartStorageMultiplier * researchMultiplier;
```
