# Division raw production

## Definition

Each industry requires different input materials. Each required material has its own coefficient. This value is not the same as the boost material's coefficient; they are different things. For example:

- Agriculture: { Water: 0.5, Chemicals: 0.2 }
- Chemical: { Plants: 1, Water: 0.5 }
- Tobacco: { Plants: 1 }

Each division has a number that I call "Division raw production". This raw value is the division's production capability. Let's call it `RawProduction`. It's used for:

- Calculating how much input material that we need. It's multiplied by the input material's coefficient to find the required quantity of that input material.
- Calculating how much material/product that division can produce. It's multiplied by `ProducibleFrac`. `ProducibleFrac` starts at 1 and is reduced if there are not enough input materials.

For example, with Agriculture, if `RawProduction` is 1000, we need 500 units of Water and 200 units of Chemicals. With these input materials, we can produce 1000 units of Plants and 1000 units of Food.

### Formula

`RawProduction` is the product of 4 multipliers:

- Office multiplier:
  - Employee production in 3 jobs (Operations, Engineer, Management) and their sum:
    - $OperationsProd = office.employeeProductionByJob.Operations$
    - $EngineerProd = office.employeeProductionByJob.Engineer$
    - $ManagementProd = office.employeeProductionByJob.Management$
    - $TotalEmployeesProd = OperationsProd + EngineerProd + ManagementProd$
  - Management factor:
    $$ManagementFactor = 1 + \frac{ManagementProd}{1.2*TotalEmployeesProd}$$
  - Employee production multiplier:
    $$EmployeeProductionMultiplier = \left( (OperationsProd)^{0.4} + (EngineerProd)^{0.3} \right)*ManagementFactor$$
  - Balancing multiplier:
    $$BalancingMultiplier = 0.05$$
  - If output is material:
    $$OfficeMultiplier = BalancingMultiplier*EmployeeProductionMultiplier$$
  - If output is product:
    $$OfficeMultiplier = 0.5*BalancingMultiplier*EmployeeProductionMultiplier$$
- Division production multiplier: see previous [section](./boost-material.md).
- Upgrade multiplier: multiplier from Smart Factories.
- Research multiplier: multiplier from researches.
