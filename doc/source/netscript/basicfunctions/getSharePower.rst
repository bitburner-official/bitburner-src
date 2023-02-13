getSharePower() Netscript Function
==============================

.. js:function:: getSharePower()

    :RAM cost: 0.2 GB

    Calculate your share power. Based on all the active share calls. 
    Returns the reputation gain rate multiplier, i.e. 1.5 means +50% rep gain rate.

    Examples:

    .. code-block:: javascript

        ns.tprint(ns.getSharePower())