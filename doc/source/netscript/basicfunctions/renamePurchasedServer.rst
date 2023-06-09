renamePurchasedServer() Netscript Function
===================================

.. js:function:: renamePurchasedServer(hostname, newName)

    :RAM cost: 2 GB
    :param string hostname: Hostname of the purchased server.
    :param string newName: New name for the given server.
    :returns: ``true`` if the renaming was succesful.

    Renames the purchased server with the specified ``hostname`` to have the new name ``newName``.

    Example:

    .. code-block:: javascript

        ns.renamePurchasedServer("server", "old_server");
