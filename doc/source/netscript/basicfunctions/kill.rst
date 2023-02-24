kill() Netscript Function
=========================

.. js:function:: kill(script[, hostname=current hostname[, args...]])

    :RAM cost: 0.5 GB
    :param string script: Filename of the script to kill.
    :param string hostname: Hostname of the server on which to kill the script. 
    :param args...: Arguments to identify which script to kill.
    :returns: ``true`` is that script was killed.

    Kills the script on the target server specified by the script's name and
    arguments. Remember that scripts are uniquely identified by both their name
    and arguments. For example, if ``foo.js`` is run with the argument 1,
    then this is not the same as ``foo.js`` run with the argument 2, even
    though they have the same code.

    Examples:

    The following example will try to kill a script named ``foo.js`` on the
    ``foodnstuff`` server that was ran with no arguments:

    .. code-block:: javascript

        ns.kill("foo.js", "foodnstuff");

    The following will try to kill a script named ``foo.js`` on the current
    server that was ran with no arguments:

    .. code-block:: javascript

        ns.kill("foo.js");

    The following will try to kill a script named ``foo.js`` on the current
    server that was ran with the arguments 1 and "foodnstuff":

    .. code-block:: javascript

        ns.kill("foo.js", ns.getHostname(), 1, "foodnstuff");

.. js:function:: kill(scriptPid)

    :RAM cost: 0.5 GB
    :param number scriptPid: PID of the script to kill
    :returns: ``true`` that script was killed.

    Kills the script with the specified PID. Killing a script by its PID will
    typically have better performance, especially if you have many scripts
    running.


    Example:

    .. code-block:: javascript

        if (ns.kill(10)) {
            ns.print("Killed script with PID 10!");
        }
