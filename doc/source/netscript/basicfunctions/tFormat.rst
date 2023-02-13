tFormat() Netscript Function
==============================

.. js:function:: tFormat(milliseconds[, milliPrecision])

    :RAM cost: 0 GB

    :param string milliseconds: Number of millisecond to format.
    :param boolean milliPrecision: Format time with subsecond precision. Defaults to false.

    Format time to a readable string.

    Examples:

    .. code-block:: javascript

        ns.print(ns.tFormat(123456789)) //logs "1 day 10 hours 17 minutes 36 seconds"
        ns.print(ns.tFormat(123456789,true)) //logs "1 day 10 hours 17 minutes 36.789 seconds"