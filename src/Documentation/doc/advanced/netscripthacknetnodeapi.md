# Netscript Hacknet Node API

## Warning

Not all functions in the Hacknet Node API are immediately available. For this reason, the documentation for this API may contain spoilers for the game.

Netscript provides the following API for accessing and upgrading your Hacknet Nodes through scripts.

Note that none of these functions will write to the script's logs. If you want to see what your script is doing, you will have to print to the logs yourself.

Hacknet Node API functions must be accessed through the `hacknet` namespace.

### In Netscript 1.0:
```javascript
hacknet.purchaseNode();
hacknet.getNodeStats(3).level;
```

### In NetscriptJS:
```javascript
ns.hacknet.purchaseNode();
ns.hacknet.getNodeStats(3).level;
```

## Hacknet Nodes API Functions

- [`numNodes()`](hacknetnodeapi/numNodes)
- [`purchaseNode()`](hacknetnodeapi/purchaseNode)
- [`getPurchaseNodeCost()`](hacknetnodeapi/getPurchaseNodeCost)
- [`getNodeStats()`](hacknetnodeapi/getNodeStats)
- [`upgradeLevel()`](hacknetnodeapi/upgradeLevel)
- [`upgradeRam()`](hacknetnodeapi/upgradeRam)
- [`upgradeCore()`](hacknetnodeapi/upgradeCore)
- [`getLevelUpgradeCost()`](hacknetnodeapi/getLevelUpgradeCost)
- [`getRamUpgradeCost()`](hacknetnodeapi/getRamUpgradeCost)
- [`getCoreUpgradeCost()`](hacknetnodeapi/getCoreUpgradeCost)

## Referencing a Hacknet Node

Most of the functions in the Hacknet Node API perform an operation on a single node. Therefore, a numeric index is used to identify and specify which Hacknet Node a function should act on. This index number corresponds to the number at the end of the name of the Hacknet Node.

For example:
- The first Hacknet Node you purchase will have the name `hacknet-node-0` and is referenced using index `0`.
- The fifth Hacknet Node you purchase will have the name `hacknet-node-4` and is referenced using index `4`.

## RAM Cost

Accessing the `hacknet` namespace incurs a one-time cost of **4 GB of RAM**. In other words, using multiple Hacknet Node API functions in a script will not cost more than 4 GB of RAM.

## Utilities

The following function is not officially part of the Hacknet Node API, but it can be useful when writing Hacknet Node-related scripts. Since it is not part of the API, it does not need to be accessed using the `hacknet` namespace.

- `getHacknetMultipliers`

## Example Script

The following is an example of one way a script can be used to automate the purchasing and upgrading of Hacknet Nodes.

This script attempts to purchase Hacknet Nodes until the player has a total of 8. Then, it gradually upgrades those nodes to **level 80**, **16 GB RAM**, and **8 cores**.

```javascript
export async function main(ns) {
    function myMoney() {
        return ns.getServerMoneyAvailable("home");
    }

    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");

    const cnt = 8;

    while (ns.hacknet.numNodes() < cnt) {
        let res = ns.hacknet.purchaseNode();
        if (res != -1) ns.print("Purchased Hacknet Node with index " + res);
        await ns.sleep(1000);
    }

    ns.tprint("All " + cnt + " nodes purchased");

    for (let i = 0; i < cnt; i++) {
        while (ns.hacknet.getNodeStats(i).level <= 80) {
            let cost = ns.hacknet.getLevelUpgradeCost(i, 1);
            while (myMoney() < cost) {
                ns.print("Need $" + cost + " . Have $" + myMoney());
                await ns.sleep(3000);
            }
            ns.hacknet.upgradeLevel(i, 1);
        }
    }

    ns.tprint("All nodes upgraded to level 80");

    for (let i = 0; i < cnt; i++) {
        while (ns.hacknet.getNodeStats(i).ram < 16) {
            let cost = ns.hacknet.getRamUpgradeCost(i, 1);
            while (myMoney() < cost) {
                ns.print("Need $" + cost + " . Have $" + myMoney());
                await ns.sleep(3000);
            }
            ns.hacknet.upgradeRam(i, 1);
        }
    }

    ns.tprint("All nodes upgraded to 16GB RAM");

    for (let i = 0; i < cnt; i++) {
        while (ns.hacknet.getNodeStats(i).cores < 8) {
            let cost = ns.hacknet.getCoreUpgradeCost(i, 1);
            while (myMoney() < cost) {
                ns.print("Need $" + cost + " . Have $" + myMoney());
                await ns.sleep(3000);
            }
            ns.hacknet.upgradeCore(i, 1);
        }
    }

    ns.tprint("All nodes upgraded to 8 cores");
}
```

This script ensures that the player's Hacknet Nodes are upgraded efficiently while maintaining sufficient funds.

