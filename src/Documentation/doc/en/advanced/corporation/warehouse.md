# Warehouse

Warehouses store products and materials. The Sector-12 office in each division starts with a warehouse,
but other cities don't have a warehouse initially. The warehouse costs 1e9 and can be upgraded.

```javascript
// Warehouse upgrade cost
const upgradeCost = basePrice * Math.pow(1.07, currentLevel + 1);
const warehouseSize = warehouseLevel * 100 * smartStorageMultiplier * researchMultiplier;
```
