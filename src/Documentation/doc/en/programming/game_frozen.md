# Game Frozen or Stuck?

## Infinite Loop in Scripts

### Overview

If your game is frozen or stuck in any way, then the most likely culprit is an infinite loop in your script.
To recover from the freeze, run the game with `?noScripts` in the URL:

[Link to no freeze](https://bitburner-official.github.io?noScripts)

If you are playing the Steam version, you can reload the game without running scripts by using the menu option: Reloads => Reload & Kill All Scripts.

If you run the executable file from the command line, you can use the `--no-scripts` parameter.

### Fix the infinite loop

Then, to fix your script, make sure you have a `sleep()` or any other timed function like `hack()` or `grow()` in any infinite loops:

    while(true) {
        // This is an infinite loop that does something
        ...
        await ns.sleep(1000); // Add a 1s sleep to prevent freezing
    }

Also make sure that each while loop gets to the `await`ed function or `break`, for example the next snippet has a `sleep()` function, but it nor any possible conditional breaks are never reached and therefore will crash the game:

    while(true) {
        let currentMoney = ns.getServerMoneyAvailable("n00dles");
        let maxMoney = ns.getServerMaxMoney("n00dles");
        if (currentMoney < maxMoney/2){
            await ns.grow("n00dles");
        }
        if (currentMoney === maxMoney){
            break;
        }
    }

If `n00dles` current money is, for example, 75% of the maximum money, the script will reach neither `grow()` nor `break` and the game will crash.
Adding a sleep like in the first example, or changing the code so that the `awaited` function or `break` is always reached, would prevent the crash.

Common infinite loop when translating the server purchasing script in starting guide to scripts is to have a while loop, where the condition's change is conditional:

    const ram = 8;
    let i = ns.cloud.getServerNames().length;

    while (i < ns.cloud.getServerLimit()) {
        if (ns.getServerMoneyAvailable("home") > ns.cloud.getServerCost(ram)) {
            const hostname = ns.cloud.purchaseServer("cloud-server-" + i, ram);
            ns.scp("early-hack-template.js", hostname);
            ns.exec("early-hack-template.js", hostname, 3);
            ++i;
        }
    }

If the player does not currently have enough money to purchase a server, the `if`'s condition will be false and `++i` will not be reached.
Since the script doesn't have `sleep()` and value `i` will not change without the `if` being true, this will crash the game.
Adding a `sleep()` that is always reached would prevent the crash.

### Use a debugger

If you cannot find where the infinite loop is, you can use the Pause button in the debugger.

The first step is to open the built-in developer tools of your browser:

- Web version:
  - Windows/Linux: Ctrl + Shift + I or F12
  - macOS: Cmd + Option + I
- Steam version:
  - Menu: Debug => Activate
  - Shortcut:
    - Windows/Linux: F12
    - macOS: Cmd + Option + I

In the developer tools:

- Open the Sources tab (Chrome/Safari) or the Debugger tab (Firefox).
- Click the Pause button. It usually looks like this: ⏸ and is located on the right side of the Sources/Debugger tab.

This pauses execution so you can debug the infinite loop. The call stack is also very useful.

## Black screen

If the game window becomes a black screen without the game itself crashing, this is caused by the game running too many concurrent scripts (the game runs on a browser and each tab can only use so much ram until it crashes).
Depending on which scripts are running and your hardware, this number can vary between 50000 to 100000 instances (in version 2.0.2. In prior versions this number was about 1/5th of that).
To prevent this from happening make sure to multithread the scripts as much as possible.

## Bug

Otherwise, the game is probably frozen/stuck due to a bug.
To report a bug, follow the guidelines [here](../../../../../CONTRIBUTING.md#reporting-bugs).
