nuke() Netscript Function
=========================

.. js:function:: nuke(hostname)

    :RAM cost: 0.05 GB
    :param string hostname: Hostname of the target server.

    Runs the ``NUKE.exe`` program on the target server. ``NUKE.exe`` must exist
    on your home computer. Requires the targeted server to have enough ports opened,
    otherwise will throw an error.


    Example:

    .. code-block:: javascript

        ns.nuke("foodnstuff");
