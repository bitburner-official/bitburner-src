enableLog() Netscript Function
==============================

.. js:function:: enableLog(functionName)

    :RAM cost: 0 GB

    :param string functionName: Name of function for which to enable logging.

    Re-enables logging for the given function. If 'ALL' is passed into this
    function as an argument, then it will revert the effects of
    ``disableLog('ALL')``

    Examples:

    .. code-block:: javascript

        //Opens the logs, clears it of whatever may have been there before and prevents non-print() functions from printing to log
	    ns.tail();ns.clearLog();ns.disableLog("ALL");
        //let hack() log normally
        ns.enableLog("hack");