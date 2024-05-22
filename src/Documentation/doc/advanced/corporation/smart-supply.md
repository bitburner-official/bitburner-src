# Smart Supply

## Logic

Create a function called `getLimitedRawProduction`:

- Calculate `RawProduction`.
- Multiply `RawProduction` by 10.
- Calculate `RequiredStorageSpaceOfEachOutputUnit`. It is the net change in warehouse's storage space when producing an output unit.
- If `RequiredStorageSpaceOfEachOutputUnit` is greater than 0:
  - Calculate `MaxNumberOfOutputUnits`. It is the maximum number of units that we can produce and store in warehouse's free space.
  - Limit `RawProduction` to `MaxNumberOfOutputUnits` if needed.

Create a map called `SmartSupplyData`. Its key is `${divisionName}|${city}`. Its value is the `TotalRawProduction` that will be calculated later.

After PURCHASE state:

- Initialize `TotalRawProduction` with 0.
- If division produces materials: call `getLimitedRawProduction`, then add the returned value to `TotalRawProduction`.
- If division produces products:
  - Loop through all products of the division.
  - If the product is finished, call `getLimitedRawProduction`, then add the returned value to `TotalRawProduction`.
- Set `TotalRawProduction` to `SmartSupplyData`.

Before PURCHASE state:

- Check if warehouse is congested. If it is, alert player and try to mitigate the situation.
- Find required quantity of each input material to produce material/product:
  - Get `TotalRawProduction` from `SmartSupplyData`.
  - Multiply `TotalRawProduction` with input material's coefficient.
- Find which input material creates the least number of output units.
- Align all the input materials to the smallest amount.
- Calculate the total size of all input materials we are trying to buy.
- If there is not enough free space, we apply a multiplier to required quantity to not overfill warehouse.
- Deduct the number of stored input material units from the required quantity.
- Buy input materials.

## Detect warehouse congestion

Warehouse can be congested due to multiple reasons. One common case is when the logic of calculating required quantity of input materials does not take into account of free space and stored input materials units in warehouse. When it happens, warehouse is filled with excessive input materials and the production process is halted completely due to no free space for produced units.

For each case, we need to find way(s) to detect congestion and mitigate it. In the case above, we can use this simple heuristic:

- Create a map called `WarehouseCongestionData`. Its key is `${divisionName}|${city}`. Its value is the number of times that we suspect the warehouse is congested.
- In each cycle, check `material.productionAmount` and `product.productionAmount` of output material/product.
  - If `productionAmount` is 0, increase the entry's value of this warehouse in the map by 1. If not, set the entry's value to 0.
  - If the entry's value is greater than 5, the warehouse is very likely congested.
- This heuristic is based on the observation: when warehouse is filled with excessive input materials, the production process is halted completely, this means `productionAmount` is 0. We wait for 5 times to reduce false positives.
- When we start our Smart Supply script, `productionAmount` of output material/product may be 0, because nothing controls the production process in previous cycles.

When there are excessive input materials, discarding all of them is the simplest mitigation measure. It's inefficient, but it's the fastest way to make our production line restart.
