mv() Netscript Function
==============================

.. js:function:: mv(serverName, sourceFile, targetFile)

    :RAM cost: 0 GB

    Move the source file to target file on the given server.

    This command only works for scripts and text files (.txt). It cannot, however, be used to convert from script to text file, or vice versa.

    This function can also be used to rename files.

    Examples:

    .. code-block:: javascript

        ns.tprint("home", "foo.js", "old_foo.txt")