renamePurchasedServer() Netscript Function
===================================

.. js:function:: renamePurchasedServer(hostname, newName)

    :RAM cost: 2 GB
    :param string hostname: Hostname of the purchased server.
    :param string newName: New name for the given server.
    :returns: ``true`` if the renaming was succesful.

    Upgrades the purchased server with the specified hostname to have specified amount of RAM.

    The ``hostname`` argument can be any data type, but it will be converted to
    a string and have whitespace removed. New RAM amount has to be higher than the current RAM
    and a power of 2. Upgrading a server costs the difference of old RAM server cost and new RAM
    server cost.

    Example:

    .. code-block:: javascript

        ns.renamePurchasedServer("server", "old_server");
