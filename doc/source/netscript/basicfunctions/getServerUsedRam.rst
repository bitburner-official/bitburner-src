getServerUsedRam() Netscript Function
=====================================

.. js:function:: getServerUsedRam(hostname)

    :RAM cost: 0.05 GB
    :param string hostname: Hostname of target server.
    :returns: Used ram on that server. In GB.

    Example:

    .. code-block:: javascript

        const usedRam = ns.getServerUsedRam("harakiri-sushi"); // returns: 5.6
        ns.print("harakiri-sushi uses "+ usedRam + "GB"); // prints: "harakiri-sushi uses 5.6GB"
