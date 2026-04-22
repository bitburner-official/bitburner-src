# AdVert

AdVert is a division-level upgrade which increases a division's awareness and popularity stats. These affect sales volume and the initial demand for new products. Awareness and popularity are capped at `Number.MAX_VALUE` (~1.7976931348623157E+308). Popularity decreases by 0.0001 per cycle.

The effect of an AdVert purchase can be boosted by the Wilson Analytics corporation upgrade.

```javascript
const wilsonUpgradeBenefit = 1 + 0.005 * wilsonAnalyticsLevel;
const advertMultiplier = wilsonUpgradeBenefit * researchAdvertisingMultiplier;
awareness = (awareness + 3 * advertMultiplier) * (1.005 * advertMultiplier);
popularity = (popularity + advertMultiplier) * (1 + random(1, 3) * 0.005) * advertMultiplier;
```

```javascript
const adVertCost = 1e9 * Math.pow(1.06, numAdVerts);
```
