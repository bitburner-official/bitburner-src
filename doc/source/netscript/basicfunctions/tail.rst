tail() Netscript Function
===============================

.. js:function:: tail([script, hostname[, numThreads=1[, args...]]])

    :RAM cost: 0 GB

    :param string script: Filename of the script of which to open the logs.
    :param string hostname: Hostname of the server on which the script is running on. 
    :param args...: Arguments to identify which script's log to open.

    Opens a script’s logs. This is functionally the same as the tail Terminal command.

    If the function is called with no arguments, it will open the current script’s logs.

    Examples:

    .. code-block:: javascript

            ns.tail("foo.js", "foodnstuff");
            ns.tail();

.. js:function:: tail(scriptPid)

    :RAM cost: 0 GB
    :param number scriptPid: PID of the script of which to open the logs.

    Same as the above version but with pid.

    Example:

    .. code-block:: javascript

            ns.tail(12);