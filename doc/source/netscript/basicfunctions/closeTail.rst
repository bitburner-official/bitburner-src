closeTail() Netscript Function
===============================

.. js:function:: closeTail([scriptPid = current script])

    :RAM cost: 0 GB

    :param number scriptPid: PID of the script of which to open the logs.

    Closes a script’s logs.

    If the function is called with no arguments, it will open the current script’s logs.

    Examples:

    .. code-block:: javascript

            ns.closeTail(12);
            ns.closeTail();