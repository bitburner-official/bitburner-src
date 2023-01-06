upgradePurchasedServer() Netscript Function
===================================

.. js:function:: upgradePurchasedServer(hostname, ram)

    :RAM cost: 0.25 GB
    :param string hostname: Hostname of the purchased server.
    :param number ram: Amount of RAM of the purchased server. Must be a power of
        2. Maximum value of :doc:`getPurchasedServerMaxRam<getPurchasedServerMaxRam>`
    :returns: ``true`` if the upgrade succeeded, ``false`` otherwise

    Upgrades the purchased server with the specified hostname to have specified amount of RAM.

    The ``hostname`` argument can be any data type, but it will be converted to
    a string and have whitespace removed. New RAM amount has to be higher than the current RAM
    and a power of 2. Upgrading a server costs the difference of old RAM server cost and new RAM
    server cost.

    Example:

    .. code-block:: javascript

        const ram = 64;
        const name = "pserv-";
        for (const i = 0; i < 5; ++i) {
            ns.upgradePurchasedServer(name + i, ram);
        }
