moveTail() Netscript Function
===============================

.. js:function:: moveTail(width, heigth[, pid])

    :RAM cost: 0 GB

    :param number width: Width of the window.
    :param number heigth: Heigth of the window.
    :param number pid: PID of the script of which tail window to resize. Defaults to current script.

    resizes the tail window to the specified size.
    
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