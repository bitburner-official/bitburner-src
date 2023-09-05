# Before you start -

It is highly recommended that you have a basic familiarity with programming concepts like [`for`/`while` loops](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for), [conditionals like `if`/`else`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else), [`functions`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions),[`arrays`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) and [`variables`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const) before starting to write scripts - but you can start with basic skills and learn with practice.

If you'd like to first learn a bit about programming, see [this page](../programming/learn.md).

# Scripts

Bitburner scripts are written in real, working JavaScript and can be used to automate basic hacking logic, and almost any mechanic in the game.

Running any script requires in-game [RAM](ram.md), with a minimum cost of 1.6 GB per script.
More complex scripts and API functions generally require more [RAM](ram.md), which you will gain in many ways.
Scripts can be run on any [server](server.md) you have root access to, but not all servers you find will have useable RAM.

## Identifying a Script

Many commands and functions target other scripts running on the same or a different server.
Therefore, there must be a way to specify which script you want to affect.

One way to identify a script is by its unique PID (Process IDentifier).
A PID number is returned from `ns.run()`, `ns.exec()`, etc; and is also shown in the output of `ns.ps()`.

A second way to identify scripts is by filename, hostname **and** arguments.
However, you will probably run multiple copies of a script with the same arguments, so this method is not necessarily **unique** to a script.
In case of multiple matches, most functions will return an arbitrary one (typically the oldest).

If searching by filename, arguments must be an **exact** match - both the order and [type](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof) of the arguments you supply matter.

## Script Arguments

When running a script, you can use [flags](https://github.com/bitburner-official/bitburner-src/blob/bec737a25307be29c7efef147fc31effca65eedc/markdown/bitburner.ns.flags.md) and [arguments](https://github.com/bitburner-official/bitburner-src/blob/bec737a25307be29c7efef147fc31effca65eedc/markdown/bitburner.ns.args.md), which the script's logic can access and act on, allowing flexibility in your script designs. For example allowing you to get different results or attack different targets without re-writing your code:

    $ run hack.js "harakiri-sushi"
    $ run hack.js "silver-helix"

## Multithreading scripts

A script can be run with multiple threads, which we call "multithreading."
Multithreading affects every call to the `ns.hack()`, `ns.grow()`, and `ns.weaken()` methods, multiplying their effects by the number of threads used.
For example, if a script run with 1 thread is able to hack $10,000, then running the same script with 5 threads would hack $50,000.

[Note -- Scripts will not actually become multithreaded in the real-world sense - Javascript is a "single-threaded" coding language.]

When "multithreading" a script, the total [RAM](ram.md) cost can be calculated by simply multiplying the [RAM](ram.md) cost of a single instance of your script by the number of threads you will use. [See [`ns.getScriptRam()`](https://github.com/bitburner-official/bitburner-src/blob/bec737a25307be29c7efef147fc31effca65eedc/markdown/bitburner.ns.getscriptram.md) or the `mem` terminal command detailed below]

## Working with Scripts in Terminal

Here are some [terminal](terminal.md) commands you will find useful when working with scripts:

**check [script] [args...]**

Prints the logs of the script specified by the name and arguments to [Terminal](terminal.md).
Remember that scripts are uniquely identified by their arguments as well as their name, and
Arguments should be separated by a space.
For example, if you ran a script `foo.js` with the argument `foodnstuff` then in order to 'check' it you must also add `foodnstuff` as an argument for the `check` command:

    $ check foo.js foodnstuff

**free**

Shows the current server's [RAM](ram.md) usage and availability

**kill [pid]** or **kill [script] [args...]**

Stops a script that is running with the specified PID, or script name and arguments.
Remember that scripts are identified by their arguments as well as their name, and
Arguments should be separated by a space.
For example, if you ran a script `foo.js` with the arguments `1` and `2`, then just typing `kill foo.js` will not work.
Instead use:

    $ kill foo.js 1 2

**mem [script] [-t] [n]**

Check how much [RAM](ram.md) a script requires to run with "n" threads

    $ mem [scriptname] -t n
    $ mem hack.js -t 500

**nano [script]**

Create/Edit a script.
The name of a script must end with `.js`, but you can also create `.txt` files.

**ps**

Displays all scripts that are actively running on the current [server](servers.md)

**rm [script]**

Permanently delete a script from the [server](servers.md). Can only be undone with a save import.

**run [script] [-t] [n] [args...]**

Run a script with n threads and the specified arguments.
Each argument should be separated by a space.
Both the thread count and arguments are optional.
If neither are specified, then the script will be run with a single thread and no arguments.

Examples:

Run `foo.js` single-threaded with no arguments::

    $ run foo.js

Run `foo.js` with 10 threads and no arguments:

    $ run foo.js -t 10

Run `foo.js` single-threaded with three arguments: `[foodnstuff, sigma-cosmetics, 10]`:

    $ run foo.js foodnstuff sigma-cosmetics 10

Run `foo.js` with 50 threads and a single argument: `foodnstuff`:

    $ run foo.js -t 50 foodnstuff

**tail [pid]** or **tail [script] [args...]**

Displays the logs of the script specified by the PID or filename and arguments.
Remember that scripts are identified by their arguments as well as their filename.
For example, if you ran a script `foo.js` with the argument `foodnstuff`, in order to `tail` it you must also add the `foodnstuff` argument to the `tail` command as so:

    $ tail foo.js foodnstuff

**top**

Displays all active scripts and their [RAM](ram.md) usage.

## How Scripts work offline

The scripts you write and execute in the BitVerse are real, working JavaScript.
For this reason, it is not possible for Bitburner scripts to run when

- the game is closed
- the browser tab is inactive (if playing Bitburner in a web browser)
- or your system is sleeping
  all of which we call being "offline" for game purposes.

It is important to know that logic such as `if`/`else` statements and many commands such as `ns.purchaseHacknetNode()` or `ns.nuke()` will not work while the game is offline.

However, Scripts WILL continue to generate money and hacking exp for you while offline.
This offline production is based on the average online production of all your hacking scripts since your last augmentation, as shown on your Active Scripts page.

`ns.grow()` and `ns.weaken()` functions are also applied when the game is offline, although at a slower rate.
This is done by having each script track the rate at which the `ns.grow()` and `ns.weaken()` commands are called while online.
These calculated rates are used to determine how many calls would have been made while offline, and their effect is applied.

Also, note that because of the way the JavaScript engine works, whenever you reload or re-open the game all of your Active Scripts will start again from the BEGINNING of their code. The game does not keep track of where exactly the execution of a script is when it saves/loads.
