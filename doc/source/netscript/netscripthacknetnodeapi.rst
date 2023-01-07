.. _netscript_hacknetnodeapi:

Netscript Hacknet Node API
==========================

.. warning:: Not all functions in the Hacknet Node API are immediately available.
             For this reason, the documentation for this API may contains spoilers
             for the game.

Netscript provides the following API for accessing and upgrading your Hacknet Nodes
through scripts.

Note that none of these functions will write to the script's logs. If you want
to see what your script is doing you will have to print to the logs yourself.

**Hacknet Node API functions must be accessed through the hacknet namespace**

In Netscript 1.0::

    hacknet.purchaseNode();
    hacknet.getNodeStats(3).level;

In :ref:`netscriptjs`::

    ns.hacknet.purchaseNode();
    ns.hacknet.getNodeStats(3).level;

.. toctree::
    :caption: Hacknet Nodes API Functions:

    numNodes() <hacknetnodeapi/numNodes>
    purchaseNode() <hacknetnodeapi/purchaseNode>
    getPurchaseNodeCost() <hacknetnodeapi/getPurchaseNodeCost>
    getNodeStats() <hacknetnodeapi/getNodeStats>
    upgradeLevel() <hacknetnodeapi/upgradeLevel>
    upgradeRam() <hacknetnodeapi/upgradeRam>
    upgradeCore() <hacknetnodeapi/upgradeCore>
    getLevelUpgradeCost() <hacknetnodeapi/getLevelUpgradeCost>
    getRamUpgradeCost() <hacknetnodeapi/getRamUpgradeCost>
    getCoreUpgradeCost() <hacknetnodeapi/getCoreUpgradeCost>

.. _netscript_hacknetnodeapi_referencingahacknetnode:

Referencing a Hacknet Node
--------------------------
Most of the functions in the Hacknet Node API perform an operation on a single
Node. Therefore, a numeric index is used to identify and specify which Hacknet
Node a function should act on. This index number corresponds to the number
at the end of the name of the Hacknet Node. For example, the first Hacknet Node you
purchase will have the name "hacknet-node-0" and is referenced using index 0.
The fifth Hacknet Node you purchase will have the name "hacknet-node-4" and is
referenced using index 4.

RAM Cost
--------
Accessing the `hacknet` namespace incurs a one time cost of 4 GB of RAM.
In other words, using multiple Hacknet Node API functions in a script will not cost
more than 4 GB of RAM.

Utilities
---------
The following functions are not officially part of the Hacknet Node API, but they
can be useful when writing Hacknet Node-related scripts. Since they are not part
of the API, they do not need to be accessed using the *hacknet* namespace.

* :js:func:`getHacknetMultipliers`

Example(s)
----------

The following is an example of one way a script can be used to automate the
purchasing and upgrading of Hacknet Nodes.

This script attempts to purchase Hacknet Nodes until the player has a total of 8. Then
it gradually upgrades those Node's to level 80, 16 GB RAM, and 8 cores

.. code:: javascript

        export async function main(ns) {
            function myMoney() {
                return ns.getServerMoneyAvailable("home");
            }

            ns.disableLog("getServerMoneyAvailable");
            ns.disableLog("sleep");

            const cnt = 8;

            while (ns.hacknet.numNodes() < cnt) {
                res = ns.hacknet.purchaseNode();
                if (res != -1) ns.print("Purchased hacknet Node with index " + res);
                await ns.sleep(1000);
            };

            ns.tprint("All " + cnt + " nodes purchased")

            for (const i = 0; i < cnt; i++) {
                while (ns.hacknet.getNodeStats(i).level <= 80) {
                    var cost = ns.hacknet.getLevelUpgradeCost(i, 1);
                    while (myMoney() < cost) {
                        ns.print("Need $" + cost + " . Have $" + myMoney());
                        await ns.sleep(3000);
                    }
                    res = ns.hacknet.upgradeLevel(i, 1);
                };
            };

            ns.tprint("All nodes upgraded to level 80");

            for (var i = 0; i < cnt; i++) {
                while (ns.hacknet.getNodeStats(i).ram < 16) {
                    var cost = ns.hacknet.getRamUpgradeCost(i, 1);
                    while (myMoney() < cost) {
                        ns.print("Need $" + cost + " . Have $" + myMoney());
                        await ns.sleep(3000);
                    }
                    res = ns.hacknet.upgradeRam(i, 1);
                };
            };

            ns.tprint("All nodes upgraded to 16GB RAM");

            for (var i = 0; i < cnt; i++) {
                while (ns.hacknet.getNodeStats(i).cores < 8) {
                    var cost = ns.hacknet.getCoreUpgradeCost(i, 1);
                    while (myMoney() < cost) {
                        ns.print("Need $" + cost + " . Have $" + myMoney());
                        await ns.sleep(3000);
                    }
                    res = ns.hacknet.upgradeCore(i, 1);
                };
            };

            ns.tprint("All nodes upgraded to 8 cores");
        }