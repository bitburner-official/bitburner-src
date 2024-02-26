# Boost material

## Division production multiplier

Each industry has a different set of boost material's coefficients. For example:

- Agriculture:
  - AI Cores: 0.3
  - Hardware: 0.2
  - Real Estate: 0.72
  - Robots: 0.3
- Chemical:
  - AI Cores: 0.2
  - Hardware: 0.2
  - Real Estate: 0.25
  - Robots: 0.25
- Tobacco:
  - AI Cores: 0.15
  - Hardware: 0.15
  - Real Estate: 0.15
  - Robots: 0.25

The division production multiplier is used for calculating [division raw production](./division-raw-production.md) in the PRODUCTION state. It's sum of each warehouse's `cityMult`, and `cityMult` is calculated by combining the quantity of each boost material with the boost material's coefficient.

This multiplier is `this.productionMult` in `Division.ts`.

```typescript
calculateProductionFactors(): void {
  let multSum = 0;
  for (const warehouse of getRecordValues(this.warehouses)) {
    const materials = warehouse.materials;

    const cityMult =
      Math.pow(0.002 * materials["Real Estate"].stored + 1, this.realEstateFactor) *
      Math.pow(0.002 * materials.Hardware.stored + 1, this.hardwareFactor) *
      Math.pow(0.002 * materials.Robots.stored + 1, this.robotFactor) *
      Math.pow(0.002 * materials["AI Cores"].stored + 1, this.aiCoreFactor);
    multSum += Math.pow(cityMult, 0.73);
  }

  multSum < 1 ? (this.productionMult = 1) : (this.productionMult = multSum);
}
```

This is the reason we must expand to all 6 cities. More cities → Higher `this.productionMult` → Higher raw production → More produced materials/products → Higher profit per city → Higher total profit.

Expanding to 6 cities means `this.productionMult` is multiplied by 6, and we have 6 cities, so effectively production is multiplied by 36. This is not exactly true because there are more things that affect the raw production value of each city, but x36 can be seen as a rough estimate of benefit, especially in early rounds. In those rounds, division production multiplier is the most important thing.

## Optimizer

In order to increase `this.productionMult`, we need to buy boost materials. The problem is how much we should buy each material, given a specific constraint on storage space.

Each boost material has a coefficient ("factor" in source code) and a base size (size for 1 unit in storage).

Let's define:

- 4 coefficients: ${c_{1}}$, ${c_{2}}$, ${c_{3}}$, ${c_{4}}$
- 4 base sizes: ${s_{1}}$, ${s_{2}}$, ${s_{3}}$, ${s_{4}}$
- Quantities of each boost materials: x, y, z, w

Assuming the same warehouse setup in all cities, the division production multiplier is:

$$F(x,y,z,w) = \sum_{i = 1}^{6}\left( (1 + 0.002*x)^{c_{1}}*(1 + 0.002*y)^{c_{2}}{*(1 + 0.002*z)}^{c_{3}}{*(1 + 0.002*w)}^{c_{4}} \right)^{0.73}$$

In order to find the maximum of the function above, we can find the maximum of this function:

$$F(x,y,z,w) = (1 + 0.002*x)^{c_{1}}*(1 + 0.002*y)^{c_{2}}{*(1 + 0.002*z)}^{c_{3}}{*(1 + 0.002*w)}^{c_{4}}$$

Constraint function (S is storage space):

$$G(x,y,z,w) = s_{1}*x + s_{2}*y + s_{3}*z + s_{4}*w = S$$

Problem: Find the maximum of $F(x,y,z,w)$ with constraint $G(x,y,z,w)$.

## Solution

### Lagrange multiplier method

Disclaimer: This is based on discussion between \@Jesus and \@yichizhng on Discord. All credit goes to them.

By using the [Lagrange multiplier](https://en.wikipedia.org/wiki/Lagrange_multiplier) method, we have this system:

$$\frac{\partial F}{\partial x} = \lambda\frac{\partial G}{\partial x}$$

$$\frac{\partial F}{\partial y} = \lambda\frac{\partial G}{\partial y}$$

$$\frac{\partial F}{\partial z} = \lambda\frac{\partial G}{\partial z}$$

$$\frac{\partial F}{\partial w} = \lambda\frac{\partial G}{\partial w}$$

$$G(x,y,z,w) = S$$

In order to solve this system, we have 2 choices:

- Solve that system with [Ceres Solver](./miscellany.md).
- Do the hard work with basic calculus and algebra. This is the optimal way in both accuracy and performance, so we'll focus on it. In the following sections, I'll show the proof for this solution.

$$x*s_{1} = \frac{S - 500*\left( \frac{s_{1}}{c_{1}}*\left( c_{2} + c_{3} + c_{4} \right) - \left( s_{2} + s_{3} + s_{4} \right) \right)}{\frac{c_{1} + c_{2} + c_{3} + c_{4}}{c_{1}}}$$

$$y*s_{2} = \frac{S - 500*\left( \frac{s_{2}}{c_{2}}*\left( c_{1} + c_{3} + c_{4} \right) - \left( s_{1} + s_{3} + s_{4} \right) \right)}{\frac{c_{1} + c_{2} + c_{3} + c_{4}}{c_{2}}}$$

$$z*s_{3} = \frac{S - 500*\left( \frac{s_{3}}{c_{3}}*\left( c_{1} + c_{2} + c_{4} \right) - \left( s_{1} + s_{2} + s_{4} \right) \right)}{\frac{c_{1} + c_{2} + c_{3} + c_{4}}{c_{3}}}$$

$$w*s_{4} = \frac{S - 500*\left( \frac{s_{4}}{c_{4}}*\left( c_{1} + c_{2} + c_{3} \right) - \left( s_{1} + s_{2} + s_{3} \right) \right)}{\frac{c_{1} + c_{2} + c_{3} + c_{4}}{c_{4}}}$$

## Proof

Define: $k = 0.002$

$$\frac{\partial F}{\partial x} = \left( k*c_{1}*(1 + k*x)^{c_{1} - 1} \right)*(1 + k*y)^{c_{2}}*(1 + k*z)^{c_{3}}*(1 + k*w)^{c_{4}} = \lambda*s_{1}$$

$$\frac{\partial F}{\partial y} = (1 + k*x)^{c_{1}}*\left( k*c_{1}*(1 + k*y)^{c_{2} - 1} \right)*(1 + k*z)^{c_{3}}*(1 + k*w)^{c_{4}} = \lambda*s_{2}$$

≡

$$k*c_{1}*(1 + k*x)^{- 1}*s_{2} = k*c_{2}*(1 + k*y)^{- 1}*s_{1}$$

≡

$$c_{1}*s_{2}*(1 + k*y) = c_{2}*s_{1}*(1 + k*x)$$

≡

$$1 + k*y = \frac{c_{2}*s_{1}}{c_{1}*s_{2}}*(1 + k*x)$$

≡

$$y = \frac{c_{2}*s_{1} + k*x*c_{2}*s_{1} - c_{1}*s_{2}}{{k*c}_{1}*s_{2}}$$

≡

$$y*s_{2} = \frac{c_{2}*s_{1}*s_{2} + k*x*c_{2}*s_{1}*s_{2} - c_{1}*s_{2}*s_{2}}{{k*c}_{1}*s_{2}}$$

≡

$$y*s_{2} = \frac{c_{2}*s_{1}}{{k*c}_{1}} + \frac{x*c_{2}*s_{1}}{c_{1}} - \frac{s_{2}}{k}$$

≡

$$y*s_{2} = \frac{c_{2}}{c_{1}}*x*s_{1} + \frac{1}{k}*\frac{c_{2}*s_{1} - c_{1}*s_{2}}{c_{1}}$$

≡

$$y*s_{2} = \frac{c_{2}}{c_{1}}*x*s_{1} + 500*\frac{c_{2}*s_{1} - c_{1}*s_{2}}{c_{1}}$$

Repeating the above steps, we have:

$$z*s_{3} = \frac{c_{3}}{c_{1}}*x*s_{1} + 500*\frac{c_{3}*s_{1} - c_{1}*s_{3}}{c_{1}}$$

$$w*s_{4} = \frac{c_{4}}{c_{1}}*x*s_{1} + 500*\frac{c_{4}*s_{1} - c_{1}*s_{4}}{c_{1}}$$

Substituting into the constraint function:

$$x*s_{1} + y*s_{2} + z*s_{3} + w*s_{4} = S$$

≡

$$x*s_{1} + \frac{c_{2}}{c_{1}}*x*s_{1} + 500*\frac{c_{2}*s_{1} - c_{1}*s_{2}}{c_{1}} + \frac{c_{3}}{c_{1}}*x*s_{1} + 500*\frac{c_{3}*s_{1} - c_{1}*s_{3}}{c_{1}} + \frac{c_{4}}{c_{1}}*x*s_{1} + 500*\frac{c_{4}*s_{1} - c_{1}*s_{4}}{c_{1}} = S$$

≡

$$\frac{x*s_{1}*\left( c_{1} + c_{2} + c_{3} + c_{4} \right)}{c_{1}} + \frac{500}{c_{1}}*\left( c_{2}*s_{1} - c_{1}*s_{2} + c_{3}*s_{1} - c_{1}*s_{3} + c_{4}*s_{1} - c_{1}*s_{4} \right) = S$$

≡

$$\frac{x*s_{1}*\left( c_{1} + c_{2} + c_{3} + c_{4} \right)}{c_{1}} + \frac{500}{c_{1}}*\left( s_{1}*\left( c_{2} + c_{3} + c_{4}\  \right) - c_{1}*\left( s_{2} + s_{3} + s_{4} \right) \right) = S$$

≡

$$x*s_{1}*\frac{c_{1} + c_{2} + c_{3} + c_{4}}{c_{1}} + \frac{500}{c_{1}}*\left( s_{1}*\left( c_{2} + c_{3} + c_{4}\  \right) - c_{1}*\left( s_{2} + s_{3} + s_{4} \right) \right) = S$$

≡

$$x*s_{1} = \frac{S - 500*\left( \frac{s_{1}}{c_{1}}*\left( c_{2} + c_{3} + c_{4} \right) - \left( s_{2} + s_{3} + s_{4} \right) \right)}{\frac{c_{1} + c_{2} + c_{3} + c_{4}}{c_{1}}}$$

We can do the same steps for y,z,w.

## Handle low storage space

With small S, any variable (x,y,z,w) can be negative. In that case, we remove the variable that ends up being negative and then redo the steps above. When implementing this solution, we can use a recursive function to handle those cases.
