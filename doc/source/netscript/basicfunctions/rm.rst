mv() Netscript Function
==============================

.. js:function:: rm(Filename [,hostname = current hostname])

    :RAM cost: 0 GB

    :param string Filename: Name of the file to be deleted.
    :param string hostname: Hostname of the target server.

    Delete a file on the given server.

    .. warning!:: There is no safetychecks or recycling bins. Deleted files are lost.

    Examples:

    .. code-block:: javascript

        ns.rm("foo.js");