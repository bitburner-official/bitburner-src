nFormat() Netscript Function
==============================

.. js:function:: nFormat(number, format)

    :RAM cost: 0 GB

    :param number number: Number to format.
    :param string format: Formatting to use. Read http://numeraljs.com/#format for specifics.

    onverts a number into a string with the specified formatter. 
    This uses the numeral.js library, so the formatters must be compatible with that.

    Examples:

    .. code-block:: javascript

        ns.print(ns.nFormat(123456789.1,"0,0")) //logs "123,456,789"
        ns.print(ns.nFormat(123456789.1,"0.00a")) //logs "123.46m"
        ns.print(ns.nFormat(200000,"$0.00a")) //logs "$200.00k"