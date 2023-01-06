.. _netscript_misc:

Netscript Miscellaneous
=======================

.. _netscript_ports:

Netscript Ports
---------------
Netscript Ports are endpoints that can be used to communicate between scripts.
A port is implemented as a sort of serialized queue, where you can only write
and read one element at a time from the port. Only string and number types may be written to ports. When you read data from a port,
the element that is read is removed from the port.

The :js:func:`read`, :js:func:`write`, :js:func:`tryWrite`, :js:func:`clear`, and :js:func:`peek`
Netscript functions can be used to interact with ports.

Right now, there are only 20 ports for Netscript, denoted by the number 1
through 20. When using the functions above, the ports are specified
by passing the number as the first argument and the value as the second. 
The default maximum capacity of a port is 50, but this can be changed in Options > System. Setting this too high can cause the game to use a lot of memory. 

.. important:: The data inside ports are not saved! This means if you close and
re-open the game, or reload the page then you will lose all of the data in
the ports!

**Example Usage**

Here's a brief example of how ports work. For the sake of simplicity we'll only deal with port 1.

Let's assume Port 1 starts out empty (no data inside). We'll represent the port as such::

    []

Now assume we ran the following simple script

.. code-block:: js

.. code:: javascript

    export async function main(ns) {
        for (const i = 0; i < 10; ++i) {
            ns.writePort(1, i); //Writes the value of i to port 1
        }
    }

After this script executes, our script will contain every number from 0 through 9, as so::

    [0, 1, 2, 3, 4, 5, 6, 7 , 8, 9]

Then, assume we run the following script

.. code-block:: js

.. code:: javascript

    export async function main(ns) {
        for (const i = 0; i < 3; ++i) {
            ns.print(ns.readPort(1)); //Reads a value from port 1 and then prints it
        }
    }

This script above will read the first three values from port 1 and then print them to the script's log. The log will end up looking like::

    0
    1
    2

And the data in port 1 will look like::

    [3, 4, 5, 6, 7, 8, 9]

.. warning:: In :ref:`netscriptjs`, do not try writing base
             `Promises <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise>`_
             to a port.

**Port Handles**

.. warning:: Port Handles only work in :ref:`netscriptjs`. They do not work in :ref:`netscript1`

The :js:func:`getPortHandle` Netscript function can be used to get a handle to a Netscript Port.
This handle allows you to access several new port-related functions. The functions are:

.. js:method:: NetscriptPort.writePort(data)

    :param data: Data to write to the port
    :returns: If the port is full, the item that is removed from the port is returned.
              Otherwise, null is returned.

    Writes `data` to the port. Works the same as the Netscript function `write`.

.. js:method:: NetscriptPort.tryWritePort(data)

    :param data: Data to try to write to the port
    :returns: True if the data is successfully written to the port, and false otherwise.

    Attempts to write `data` to the Netscript port. If the port is full, the data will
    not be written. Otherwise, the data will be written normally.

.. js::method:: NetscriptPort.readPort()

    :returns: The data read from the port. If the port is empty, "NULL PORT DATA" is returned

    Removes and returns the first element from the port.
    Works the same as the Netscript function `read`

.. js::method:: NetscriptPort.peek()

    :returns: The first element in the port, or "NULL PORT DATA" if the port is empty.

    Returns the first element in the port, but does not remove it.
    Works the same as the Netscript function `peek`

.. js:method:: NetscriptPort.full()

    :returns: True if the Netscript Port is full, and false otherwise

.. js:method:: NetscriptPort.empty()

    :returns: True if the Netscript Port is empty, and false otherwise

.. js:method:: NetscriptPort.clear()

    Clears all data from the port. Works the same as the Netscript function `clear`

Port Handle Example

.. code-block:: js

.. code:: javascript

    export async function main(ns) {
        port = ns.getPortHandle(5);
        back = port.data.pop(); //Get and remove last element in port

        //Wait for port data before reading
        while(port.empty()) {
            await ns.sleep(10000);
        }
        res = port.read();

        //Wait for there to be room in a port before writing
        while (!port.tryWrite(5)) {
            await ns.sleep(5000);
        }

        //Successfully wrote to port!
    }

Comments
--------
Netscript supports comments using the same syntax as `Javascript comments <https://www.w3schools.com/js/js_comments.asp>`_.
Comments are not evaluated as code, and can be used to document and/or explain code::

    //This is a comment and will not get executed even though its in the code
    /* Multi
     * line
     * comment */
    ns.print("This code will actually get executed");

.. _netscriptimporting:

Importing Functions
-------------------

In Netscript you can import functions that are declared in other scripts.
The script will incur the RAM usage of all imported functions.
There are two ways of doing this::

    import * as namespace from "script filename"; //Import all functions from script
    import {fn1, fn2, ...} from "script filename"; //Import specific functions from script

Suppose you have a library script called *testlibrary.js*::


.. code:: javascript

    export function foo1(args) {
        //function definition...
    }

    export function foo2(args) {
        //function definition...
    }

    export async function foo3(args) {
        //function definition...
    }

    export function foo4(args) {
        //function definition...
    }

    export async function main(ns) {
        //main function definition, can be empty but must exist...
    }

Then, if you wanted to use these functions in another script, you can import them like so::

.. code:: javascript

    import * as testlib from "testlibrary.js";

    export async function main(ns) {
        const values = [1,2,3];

        //The imported functions must be specified using the namespace
        const someVal1 = await testlib.foo3(...values); //'...' separates the array into separate values
        const someVal2 = testlib.foo1(values[0]);
        if (someVal1 > someVal2) {
            //...
        } else {
            //...
        }
    }

If you only wanted to import certain functions, you can do so without needing
to specify a namespace for the import

.. code-block:: js

.. code:: javascript

    import {foo1, foo3} from "testlibrary.js"; //Saves RAM since not all functions are imported!

    export async function main(ns) {
        const values = [1,2,3];

        //No namespace needed
        const someVal1 = await foo3(...values);
        const someVal2 = foo1(values[1]);
        if (someVal1 > someVal2) {
            //...
        } else {
            //...
        }
    }

.. warning:: Note that the `export` keyword can **NOT** be used in :ref:`netscript1` as it's not supported.
             It can, however, be used in :ref:`netscriptjs` (but it's not required).

Standard, Built-In JavaScript Objects
-------------------------------------
Standard built-in JavaScript objects such as
`Math <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math>`_,
`Date <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date>`_,
`Number <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number>`_,
and others are supported as expected based on which version
of Netscript you use (i.e. :ref:`netscript1` will support built-in objects that are
defined in ES5, and :ref:`netscriptjs` will support whatever your browser supports).
