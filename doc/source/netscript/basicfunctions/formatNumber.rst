formatRam() Netscript Function
==============================

.. js:function:: formatRam(number[, fractionalDigits = 3[, suffixStart = 1000[, isInteger = false]]])
    
    :RAM cost: 0 GB

    :param number number: Number to format.
    :param number fractionalDigits: Number of digits to show in the fractional part of the decimal number. 
    :param number suffixStart: How high a number must be before a suffix will be added. 
    :param boolean isInteger: Whether the number represents an integer. Integers do not display fractional digits until a suffix is present. 

    :returns: Formatted string.

    Converts a number into a string with formatting. 

    The format depends on the Numeric Display settings (all options on the "Numeric Display" options page).

    Examples:

    .. code-block:: javascript

        const number = 1.23456789
        ns.print(ns.formatNumber(number)); //1.235
        ns.print(ns.formatNumber(number,4)); //1.2346
        ns.print(ns.formatNumber(number*1e9,3,1e10)); //1234567890
        ns.print(ns.formatNumber(number*1e10,5,1e6)); //12.34568b or 1.23457e9
        ns.print(ns.formatNumber(number,4,1000, true)); //1.235
        ns.print(ns.formatNumber(number,4,1000, false)); //1.2346