<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [bitburner](./bitburner.md) &gt; [NS](./bitburner.ns.md) &gt; [growthAnalyze](./bitburner.ns.growthanalyze.md)

## NS.growthAnalyze() method

Calculate the number of grow threads needed to grow a server by a certain multiplier.

<b>Signature:</b>

```typescript
growthAnalyze(host: string, growthAmount: number, cores?: number): number;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  host | string | Hostname of the target server. |
|  growthAmount | number | Multiplicative factor by which the server is grown. Decimal form. |
|  cores | number |  |

<b>Returns:</b>

number

The amount of grow calls needed to grow the specified server by the specified amount.

## Remarks

RAM cost: 1 GB

This function returns the number of “growths” needed in order to increase the amount of money available on the specified server by the specified amount. The specified amount is multiplicative and is in decimal form, not percentage.

Due to limitations of mathematics, this function won't be the true value, but an approximation.

Warning: The value returned by this function isn’t necessarily a whole number.

## Example 1


```ts
// NS1:
//For example, if you want to determine how many grow calls you need to double the amount of money on foodnstuff, you would use:
var growTimes = growthAnalyze("foodnstuff", 2);
//If this returns 100, then this means you need to call grow 100 times in order to double the money (or once with 100 threads).
```

## Example 2


```ts
// NS2:
//For example, if you want to determine how many grow calls you need to double the amount of money on foodnstuff, you would use:
const growTimes = ns.growthAnalyze("foodnstuff", 2);
//If this returns 100, then this means you need to call grow 100 times in order to double the money (or once with 100 threads).
```

