# "Netscript 2" Migration Guide

The game allows two script formats:

- `.script` (also sometimes called "Netscript 1" or "NS1") files are ran through an interpreter that is based on a version of Javascript from 2009 (ES5). These files are no longer actively supported and should be converted to the newer `.js` format.

- `.js` (also sometimes called "Netscript 2" or "NS2") files are native javascript that is ran directly by the web browser. Modern features of javascript that are supported by your web browser are supported in `.js` files, because they are run as native js.

Support for `.script` files will be completely removed in future version 3.0. Some basic autoconversion will be attempted at that time, but it is highly recommended to convert your remaining `.script` files to the `.js` format before that, to ensure correctness and, if needed, to familiarize yourself with the `.js` format requirements.

## Why do I have to change anything?

Since all ES5 code is still valid Javascript, you may be wondering why the old code doesn't just work when renamed to `.js`. In this section, some key differences are explained.

- **API access method**: In `.script` files, the game API is available at top-level scope within the file, as if they were at global scope. In `.js` files, the game API is passed as an argument into a script's `main` function, and is not available at top-level scope.
- **Execution differences**: Running a `.script` file begins code execution at the top of the file. Running a `.js` file launches the `main` function (passing the game API in as the first argument, typically named `ns`).
- **Timing differences**: In `.script` files, code execution contains automatic delays between every statement. In `.js` files, the code is being run natively so there are no builtin delays, so any needed delays must be added manually.

## Basic steps for script migration

1. Wrap the entire script inside of an exported main function, like so:

```js
/** @param {NS} ns */
export async function main(ns) {
  // your code here
}
```

2. Add `ns.` as a prefix to all game functions or objects (such as `ns.hack()` or `ns.args`).
3. If a function returns a `Promise`, you need to put the `await` keyword before it (With the JSDoc comment you can hover over the function to see the return type). Note that only functions declared as `async` are allowed to `await` anything, and typically you should also await the calls to your own `async` functions.
4. Because there are no forced delays, an infinite loop will cause the game to hang if a delay is not manually added. Such loops should `await` a function (usually `ns.sleep()`) at least once to avoid this.
5. The `var` keyword is rarely used in modern js for declaring variables. `let` or `const` (if the variable is never reassigned) keywords are preferred. This change is not required.

## Example migration

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
