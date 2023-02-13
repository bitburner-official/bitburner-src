getHacknetMultipliers() Netscript Function
==========================================

.. js:function:: getHacknetMultipliers()

    :RAM cost: 0.25 GB
    :returns: object containing the player's hacknet multipliers. These
        multipliers are returned in decimal forms, not percentages (e.g. 1.5
        instead of 150%).

    Structure::

        {
            production: Player's hacknet production multiplier,
            purchaseCost: Player's hacknet purchase cost multiplier,
            ramCost: Player's hacknet ram cost multiplier,
            coreCost: Player's hacknet core cost multiplier,
            levelCost: Player's hacknet level cost multiplier
        }

    Example:

    .. code-block:: javascript

        const mults = ns.getHacknetMultipliers();
        ns.print(mults.production);
        ns.print(mults.purchaseCost);
