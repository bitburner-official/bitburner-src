mv() Netscript Function
==============================

.. js:function:: mv(hostname, sourceFile, targetFile)

    :RAM cost: 0 GB

    :param string hostname: Hostname of the target server.
    :param string sourceFile: Name of the file to be moved/renamed.
    :param string targetFile: Target name of the file.

    Move the source file to target file on the given server.

    This command only works for scripts and text files (.txt). It cannot, however, be used to convert from script to text file, or vice versa.

    This function can also be used to rename files.

    Examples:

    .. code-block:: javascript

        ns.mv("home", "foo.js", "old_foo.txt")