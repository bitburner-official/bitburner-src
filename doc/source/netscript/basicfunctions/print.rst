print() Netscript Function
===========================

.. js:function:: print(args...)

    :RAM cost: 0 GB
    :param args: Values to be printed.

    Prints any number of values to the script's logs.

    Example:

    .. code-block:: javascript

        ns.print("Hello world!"); // Prints "Hello world!" in the logs.
        ns.print({a:5}); // Prints '{"a":5}' in the logs.
        const text = "can"
        ns.print("I "+ text +" use variables :)") // Prints "I can use variables :)"