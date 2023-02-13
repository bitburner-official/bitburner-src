getPurchasedServerUpgradeCost() Netscript Function
===========================================

.. js:function:: getPurchasedServerUpgradeCost(hostname, ram)

    :RAM cost: 0.1 GB

    :param string hostname: Hostname of target purchased server.
    :param number ram: Target amount of RAM for purchased server. Must be a power of 2 (2, 4, 8, 16, etc.). Maximum value of :doc:`getPurchasedServerMaxRam<getPurchasedServerMaxRam>`
    :returns: Cost to purchase a server with the specified amount of ``ram``.

    Giving any non-power-of-2 as an argument results in the function returning `-1`

    Example:

    .. code-block:: javascript
        ns.purchaseServer("smallServer",2) //costs 110000
        ns.getPurchasedServerUpgradeCost("smallServer",8); // returns: 330000
