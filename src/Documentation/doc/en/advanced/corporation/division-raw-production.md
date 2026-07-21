# Division raw production

## Definition

Each industry requires different input materials. Each required material has its own coefficient. This value is not the same as the boost material's coefficient; they are different things. For example:

- Agriculture: { Water: 0.5, Chemicals: 0.2 }
- Chemical: { Plants: 1, Water: 0.5 }
- Tobacco: { Plants: 1 }

Each division has a number that I call "Division raw production". This raw value is the division's production capability. Let's call it `RawProduction`. It's used for:

- Calculating how much input material that we need. It's multiplied by the input material's coefficient to find the required quantity of that input material.
- Calculating how much material/product that division can produce. It's multiplied by `ProducibleFrac`. `ProducibleFrac` starts at 1 and is reduced if there are not enough input materials.

For example, with Agriculture, Suppose `RawProduction` is 1000, we consume 500 units of Water and 200 units of Chemicals
and produce 1000 units of Plants and 1000 units of Food.

## Production scaling due to insufficient storage space

`RawProduction` will be scaled down if there is insufficient free space in the warehouse. The game calculates the net
change in storage space, then scales down `RawProduction` based on the net change and the free space.

For example, with Agriculture, for each unit of `RawProduction`, we consume 0.5 units of Water and 0.2 units of Chemicals
to produce 1 unit of Plants and 1 unit of Food. The sizes of these materials:

- Water: 0.05
- Chemicals: 0.05
- Plants: 0.05
- Food: 0.03

The net change in storage is: `0.05 + 0.03 - (0.5 * 0.05 + 0.2 * 0.05) = 0.045`.

This means for each unit of `RawProduction`, we need 0.045 units of free space. Suppose `RawProduction` is 1000 and
free space is 22.5. We need 45 units of free space for 1000 units of `RawProduction`, but there are only 22.5 units of
free space, so the effective `RawProduction` is scaled down to 500.

## Formula

`RawProduction` is the product of 4 multipliers:

- Office multiplier:
  - Employee production in 3 jobs (Operations, Engineer, Management) and their sum:
    - `OperationsProd = office.employeeProductionByJob.Operations`
    - `EngineerProd = office.employeeProductionByJob.Engineer`
    - `ManagementProd = office.employeeProductionByJob.Management`
    - $TotalEmployeesProd = OperationsProd + EngineerProd + ManagementProd$
  - Management factor:
    $$ManagementFactor = 1 + \frac{ManagementProd}{1.2\ast TotalEmployeesProd}$$
  - Employee production multiplier:
    $$EmployeeProductionMultiplier = \left( (OperationsProd)^{0.4} + (EngineerProd)^{0.3} \right)\ast ManagementFactor$$
  - Balancing multiplier:
    $$BalancingMultiplier = 0.05$$
  - If output is material:
    $$OfficeMultiplier = BalancingMultiplier\ast EmployeeProductionMultiplier$$
  - If output is product:
    $$OfficeMultiplier = 0.5\ast BalancingMultiplier\ast EmployeeProductionMultiplier$$
- Division production multiplier: see previous [section](./boost-material.md).
- Upgrade multiplier: multiplier from [Smart Factories](./unlocks-upgrade-research.md).
- Research multiplier: multiplier from [research](./unlocks-upgrade-research.md).
