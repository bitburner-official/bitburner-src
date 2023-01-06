getServerMaxRam() Netscript Function
====================================

.. js:function:: getServerMaxRam(hostname)

    :RAM cost: 0.05 GB
    :param string hostname: Hostname of target server.
    :returns: Total ram available on that server. In GB.

    Example:

    .. code-block:: javascript

        const maxRam = ns.getServerMaxRam("helios"); // returns: 16
        ns.print("helios has "+maxRam + "GB");
