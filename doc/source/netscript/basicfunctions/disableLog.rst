disableLog() Netscript Function
===============================

.. js:function:: disableLog(functionName)

    :RAM cost: 0 GB

    :param string functionName: Name of function for which to disable logging.

    Disables logging for the given function. Logging can be disabled for
    all functions by passing 'ALL' as the argument. Print() can always print to log.

    Examples:

    .. code-block:: javascript

        //Opens the logs, clears it of whatever may have been there before and prevents non-print() functions from logging
	    ns.tail();ns.clearLog();ns.disableLog("ALL");