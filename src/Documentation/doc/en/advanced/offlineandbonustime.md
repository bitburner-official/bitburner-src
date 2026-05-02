# How Scripts Work Offline

The scripts you write and execute in the BitVerse are real, working JavaScript.
For this reason, it is not possible for Bitburner scripts to run when

- the game is closed
- the browser tab is inactive (if playing Bitburner in a web browser)
- or your system is sleeping

all of which we call being "offline" for game purposes.

It is important to know that logic such as `if`/`else` statements and most functions such as `ns.purchaseHacknetNode()`, `ns.hack()`, and `ns.nuke()` will not work while the game is offline.

However, scripts WILL continue to generate money and hacking exp for you while offline.
This offline production is based on the average online production of all your hacking scripts since your last augmentation, as shown on your Active Scripts page.

`ns.grow()` and `ns.weaken()` methods are also applied when the game is offline, although at a slower rate.
This is done by having each script track the rate at which the `ns.grow()` and `ns.weaken()` commands are called while online,
then determining how many calls would have been made while offline, and their effect is applied.

Also, note that because of the way the JavaScript engine works, whenever you reload or re-open the game all of your Active Scripts will start again from the BEGINNING of their code. The game does not keep track of where exactly the execution of a script is when it saves/loads.

# Bonus Time

Because of the above details, some activities in Bitburner accumulate "Bonus Time" while the game is closed or in an inactive browser tab. For mechanics that have a Bonus Time effect, the rate of the associated activity or task is significantly increased.

For example, if a certain [Bladeburner](bladeburners.md) contract requires 15 seconds to complete under normal conditions, the same task will be finished instead in 3 seconds if the Bonus Time effect is 5x. The specific details and effects of Bonus Time vary by mechanic.
