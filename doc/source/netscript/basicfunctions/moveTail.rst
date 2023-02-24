moveTail() Netscript Function
===============================

.. js:function:: moveTail(x , y[, pid = current script])

    :RAM cost: 0 GB

    :param number x: X coordinate to move the tail window to.
    :param number y: Y coordinate to move the tail window to.
    :param number pid: PID of the script of which tail window to move. Defaults to current script.

    Moves the tail window to the specified coordinates. The top left corner is (0,0).

    .. note::

        Due to inner workings, something has to be awaited between opening a tail window and moving or resizing it.

    Examples:

    .. code-block:: javascript

        //open tail
        ns.tail();
        await ns.sleep(0);

        //move the tail close to top left corner and make it big
        ns.moveTail(10, 10);
        ns.resizeTail(780, 510)