formatRam() Netscript Function
==============================

.. js:function:: formatRam(number[, fractionalDigits = 2])

    :RAM cost: 0 GB

    :param number number: Number to format.
    :param number fractionalDigits: Number of digits to show in the fractional part of the decimal number. 
    
    :returns: Formatted string.

    Converts a number into a string with ram formatting. 

    The format depends on the Numeric Display settings (all options on the "Numeric Display" options page).

    Examples:

    .. code-block:: javascript

        const number = 1.23456789
        ns.print(ns.formatRam(number));   //1.23GB  or 1.23GiB
        ns.print(ns.formatRam(number,0)); //1GB     or 1GiB
        ns.print(ns.formatRam(number,3)); //1.235GB or 1.235GiB
        ns.print(ns.formatRam(2**12,3));  //4.096tB or 4tiB
        ns.print(ns.formatRam(2**20,3));  //1.049PB or 1PiB