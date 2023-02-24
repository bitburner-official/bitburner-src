formatPercent() Netscript Function
==============================

.. js:function:: formatPercent(number[, fractionalDigits = 2])

    :RAM cost: 0 GB

    :param number number: Number to format.
    :param number fractionalDigits: Number of digits to show in the fractional part of the decimal number. 
    
    :returns: Formatted string.

    Converts a number into a string with percent formatting. 

    The format depends on the Numeric Display settings (all options on the "Numeric Display" options page).

    Examples:

    .. code-block:: javascript

        const number = 1.23456789
        ns.print(ns.formatPercent(number)); //123.46%
        ns.print(ns.formatPercent(number,4)); //123.4568%