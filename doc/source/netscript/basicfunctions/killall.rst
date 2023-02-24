killall() Netscript Function
============================

.. js:function:: killall([hostname = current hostname[, safetyguard = true]])

    :RAM cost: 0.5 GB
    :param string hostname: Hostname of the server on which to kill all scripts.
    :param boolean safetyguard: Whether the function will safeguard the current script or not.
    :returns: ``true`` if scripts were killed on target server.

    Kills all running scripts on the specified server.


    Example:

    .. code-block:: javascript

        ns.killall('foodnstuff'); // returns: true

    .. code-block:: javascript

        ns.killall(); // returns: true, kills all scripts on the current server, except the current script
        ns.killall(); // returns: false, because all no available scripts are running anymore
        ns.killall(ns.getHostname(),false) // returns: true, but also kills the current script
