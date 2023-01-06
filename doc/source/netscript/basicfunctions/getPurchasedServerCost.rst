getPurchasedServerCost() Netscript Function
===========================================

.. js:function:: getPurchasedServerCost(ram)

    :RAM cost: 0.25 GB

    :param number ram: Amount of RAM of a potential purchased server. Must be a power of 2 (2, 4, 8, 16, etc.). Maximum value of :doc:`getPurchasedServerMaxRam<getPurchasedServerMaxRam>`
    :returns: Cost to purchase a server with the specified amount of ``ram``.

    Giving any non-power-of-2 as an argument results in the function returning `Infinity`

    Example:

    .. code-block:: javascript

        ns.getPurchasedServerCost(8192); // returns: 450560000
