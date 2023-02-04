clearLog() Netscript Function
===============================

.. js:function:: clearLog()

    :RAM cost: 0 GB

    Clears the script’s logs.

    Examples:

    .. code-block:: javascript

        //Opens the logs, clears it of whatever may have been there before and prevents non-print() functions from printing to log
	    ns.tail();ns.clearLog();ns.disableLog("ALL");