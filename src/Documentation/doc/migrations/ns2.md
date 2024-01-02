# Netscript 2 Migration Guide

With the deprecation of NS1 (`.script`) there are required changes to migrate scripts over to NS2 (`.js`).

## Basic Steps

1. You need to wrap the entire script inside of an exported main function, like so:

```js
/** @param {NS} ns */
export async function main(ns) {
  // your code here
}
```

2. Add `ns.` as a prefix to all game functions (such as `ns.hack()` or `ns.nuke()`).
3. If a function returns a `Promise`, you need to put the `await` keyword before it (With the JSDoc comment you can hover over the function to see the return type).
4. Long-running loops (like `while(true)`) need to `await` a function (usually `ns.sleep()`) at least once or they will crash the game.

## A demonstration of migration

Original (`early-hacking-template.script`):

```js
var target = "n00dles";
var moneyThresh = getServerMaxMoney(target) * 0.9;
var securityThresh = getServerMinSecurityLevel(target) + 5;

while (true) {
  if (getServerSecurityLevel(target) > securityThresh) {
    weaken(target);
  } else if (getServerMoneyAvailable(target) < moneyThresh) {
    grow(target);
  } else {
    hack(target);
  }
}
```

Migrated (`early-hacking-template.js`):

```js
/** @param {NS} ns */
export async function main(ns) {
  const target = "n00dles";
  const moneyThresh = ns.getServerMaxMoney(target) * 0.9;
  const securityThresh = ns.getServerMinSecurityLevel(target) + 5;

  while(true) {
    if (ns.getServerSecurityLevel(target) > securityThresh) {
      await ns.weaken(target);
    } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
      await ns.grow(target):
    } else {
      await ns.hack(target);
    }
  }
}
```

## Additional problems or edge cases

To get additional help with the migration join the [official Discord server](https://discord.gg/TFc3hKD).
