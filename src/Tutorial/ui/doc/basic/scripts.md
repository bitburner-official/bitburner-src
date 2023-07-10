# Scripts

Scripts are programs that can be used to automate the hacking process
and almost every other part of the game. Scripts must be written
in javascript.

It is highly recommended that you have a basic background in programming
to start writing scripts. You by no means need to be an expert. All you
need is some familiarity with basic programming constructs like
`for`/`while` loops, conditionals (`if`/`else`), `functions`, `variables`, etc.
If you'd like to learn a little bit about programming, see
[this page](../programming/learn.md).

## Script Arguments

When running a script, you can choose to pass arguments to that script.
The script's logic can access and act on these arguments. This allows
for flexibility in your scripts.

For information on how to run scripts with arguments, see
[Scripts](scripts.md)

## Identifying a Script

Many commands and functions act on an executing script
(i.e. a script that is running). Therefore, there must
be a way to specify which script you want those commands & functions
to act on.

The best way to identify a script is by its PID (Process IDentifier). This
unique number is returned from `run`, `exec`, etc., and also
shows in the output of `ps`.

A secondary way to identify scripts is by name **and** arguments. However (by
default) you can run a multiple copies of a script with the same arguments, so
this does not necessarily **uniquely** identify a script. In case of multiple
matches, most functions will return an arbitrary one (typically the first one
to be started). An exception is `kill`, which will kill all the
matching scripts.

The arguments must be an **exact** match. This means that both
the order and type of the arguments matter.

## Multithreading scripts

A script can be run with multiple threads. This is also called multithreading.
The effect of multithreading is that every call to the
`hack`, `grow`, and `weaken` functions
will have their results multiplied by the number of threads.
For example, if a normal single-threaded script
is able to hack $10,000, then running the same script with 5 threads would
yield $50,000.

(This is the **only** affect of running a script with multiple threads.
Scripts will not actually become multithreaded in the real-world
sense.)

When multithreading a script, the total [RAM](ram.md) cost can be calculated by
simply multiplying the base [RAM](ram.md) cost of the script with the number of
threads, where the base cost refers to the amount of [RAM](ram.md) required to
run the script single-threaded. In the [terminal](terminal.md), you can run the
`mem` [Terminal](terminal.md) command to see how much [RAM](ram.md) a script
requires with `n` threads::

    $ mem [scriptname] -t n

## Working with Scripts in Terminal

Running a script requires [RAM](ram.md). The more complex a script is, the more
[RAM](ram.md) it requires to run. Scripts can be run on any [server](server.md) you have root
access to.

Here are some [terminal](terminal.md) commands that are useful when working
with scripts:

**check [script] [args...]**

Prints the logs of the script specified by the name and arguments to
[Terminal](terminal.md). Arguments should be separated by a space. Remember that scripts
are uniquely identified by their arguments as well as their name. For
example, if you ran a script `foo.js` with the argument `foodnstuff`
then in order to 'check' it you must also add the `foodnstuff` argument
to the check command::

    $ check foo.js foodnstuff

**free**

Shows the current server's [RAM](ram.md) usage and availability

**kill [pid]** or **kill [script] [args...]**

Stops a script that is running with the specified PID, or script name and
arguments. Arguments should be separated by a space. Remember that
scripts are identified by their arguments as well as their name.
For example, if you ran a script `foo.js` with
the argument 1 and 2, then just typing `kill foo.js` will
not work. You have to use:

    $ kill foo.js 1 2

**mem [script] [-t] [n]**

Check how much [RAM](ram.md) a script requires to run with n threads

**nano [script]**

Create/Edit a script. The name of the script must end with `.js`

**ps**

Displays all scripts that are actively running on the current [server](servers.md)

**rm [script]**

Delete a script from the [server](servers.md). This is permanent

**run [script] [-t] [n] [args...]**

Run a script with n threads and the specified arguments. Each argument should
be separated by a space. Both the arguments and thread specification are
optional. If neither are specified, then the script will be run single-threaded
with no arguments.

Examples:

Run `foo.js` single-threaded with no arguments::

    $ run foo.js

Run `foo.js` with 10 threads and no arguments:

    $ run foo.js -t 10

Run `foo.js` single-threaded with three arguments: [foodnstuff, sigma-cosmetics, 10]:

    $ run foo.js foodnstuff sigma-cosmetics 10

Run `foo.js` with 50 threads and a single argument: [foodnstuff]:

    $ run foo.js -t 50 foodnstuff

**tail [pid]** or **tail [script] [args...]**

Displays the logs of the script specified by the PID or name and arguments. Note that
scripts are identified by their arguments as well as their name. For example,
if you ran a script `foo.js` with the argument `foodnstuff` then in order to
`tail` it you must also add the `foodnstuff` argument to the tail command as
so: `tail foo.js foodnstuff`

**top**

Displays all active scripts and their [RAM](ram.md) usage

## Notes about how Scripts work offline

The scripts that you write and execute are in Javascript.
For this reason, it is not possible for these scripts to run while
offline (when the game is closed). It is important to note that for
this reason, conditionals such as `if`/`else` statements and certain
commands such as `purchaseHacknetNode()` or `nuke()` will not work while
the game is offline.

However, Scripts WILL continue to generate money and hacking exp
for you while the game is offline. This offline production is based
off of the scripts' production while the game is online.

`grow()` and `weaken()` are two functions that will also be
applied when the game is offline, although at a slower rate compared
to if the game was open. This is done by having each script keep
track of the rate at which the `grow()` and `weaken()` commands are called
when the game is online. These calculated rates are used to determine
how many times these function calls would be made while the game is
offline.

Also, note that because of the way the javascript engine works, whenever you reload or re-open the game all of the
scripts that you are running will start running from the BEGINNING
of the code. The game does not keep track of where exactly the
execution of a script is when it saves/loads.
