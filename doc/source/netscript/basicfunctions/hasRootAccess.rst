hasRootAccess() Netscript Function
==================================

.. js:function:: hasRootAccess(hostname)

    :RAM cost: 0.05 GB
    :param string hostname: Hostname of the target server.
    :returns: ``true`` if you have root access on the target server.

    Example:

    .. code-block:: javascript

        if (ns.hasRootAccess("foodnstuff") == false) {
            ns.nuke("foodnstuff");
        }

    .. code-block:: javascript

        if (ns.hasRootAccess("foodnstuff")) {
            ns.exec("foo.js", 1, "foodnstuff");
        }
