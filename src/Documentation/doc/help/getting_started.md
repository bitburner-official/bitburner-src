# Getting Started Guide for Beginner Programmers

_Note_: The [Scripts](../basic/scripts.md) and strategies in this guide aren't necessarily optimal or comprehensive.
This guide is tailored to help those with minimal programming knowledge experience Bitburner during early stages of the game.

If you are confused or overwhelmed by the game, especially the coding and scripting aspects, this guide is perfect for you!

## Introduction

Bitburner is a cyberpunk-themed incremental RPG.
You will progress by raising your [Stats](../basic/stats.md), earning money, and with practice, advancing your real-world coding skills.
After reaching certain criteria, you will receive invitations from in-game [Factions](../basic/factions.md).
Joining [Factions](../basic/factions.md) and working for them will unlock various [Augmentations](../basic/augmentations.md),
which are purchased and "installed," adding a persistent bonus to [stats](../basic/stats.md) and other abilities. Working with Factions and installing Augmentations is a basic step for progressing in Bitburner.

The game has an open, minimalistic storyline that can be played in multiple ways to reach your goals.
Since this guide is written as a basic introduction to Bitburner, it will not expose the entire scope or storyline available.

## First Steps

I'm going to assume you followed the introductory tutorial when you first began the game.
In this introductory tutorial, you created a [Script](../basic/scripts.md) called `n00dles.js` and ran it on the `n00dles` server.
Now, we'll kill this [Script](../basic/scripts.md). There are two ways to do this:

- You can go to the Terminal and enter: `$ kill n00dles.js`
- You can go to the `Active Scripts` page (Alt + s) and press the `Kill Script` button for `n00dles.js`.

If you skipped the introductory tutorial, then ignore the part above.
Instead, go to the `Hacknet Nodes` page (Alt + h) and purchase a [Hacknet Node](../basic/hacknet_nodes.md) to start generating some passive income.

## Creating our First Script

Now, we'll create a generic [hacking](../basic/hacking.md) [Script](../basic/scripts.md) that can be used early on in the game (or throughout the entire game, if you want).

Before we write the [Script](../basic/scripts.md), here are some things you'll want to familiarize yourself with:

- `hacking`
- `security`
- `hack`
- `grow`
- `weaken`
- `brutessh`
- `nuke`

To briefly summarize: Each [Server](../basic/servers.md) has a security level that affects how difficult it is to hack.
Each [Server](../basic/servers.md) also has a certain amount of money, as well as a maximum amount of money it can hold.
[Hacking](../basic/hacking.md) a [Server](../basic/servers.md) steals a percentage of that [Server](../basic/servers.md)'s money.
The `hack()` function is used to hack a [Server](../basic/servers.md).
The `grow()` function is used to increase the amount of money available on a [Server](../basic/servers.md).
The `weaken()` function is used to decrease a [Server](../basic/servers.md)'s security level.

Now let's move on to actually creating the [Script](../basic/scripts.md).
Go to your home computer and then create a [Script](../basic/scripts.md) called `early-hack-template.js` by going to [Terminal](../basic/terminal.md) and entering the following two commands:

    $ home
    $ nano early-hack-template.js

This will take you to the [Script](../basic/scripts.md) editor, which you can use to code and create [Scripts](../basic/scripts.md).

Enter the following code in the [Script](../basic/scripts.md) editor:

    /** @param {NS} ns */
    export async function main(ns) {
        // Defines the "target server", which is the server
        // that we're going to hack. In this case, it's "n00dles"
        const target = "n00dles";

        // Defines how much money a server should have before we hack it
        // In this case, it is set to the maximum amount of money.
        const moneyThresh = ns.getServerMaxMoney(target);

        // Defines the minimum security level the target server can
        // have. If the target's security level is higher than this,
        // we'll weaken it before doing anything else
        const securityThresh = ns.getServerMinSecurityLevel(target);

        // If we have the BruteSSH.exe program, use it to open the SSH Port
        // on the target server
        if (ns.fileExists("BruteSSH.exe", "home")) {
            ns.brutessh(target);
        }

        // Get root access to target server
        ns.nuke(target);

        // Infinite loop that continously hacks/grows/weakens the target server
        while(true) {
            if (ns.getServerSecurityLevel(target) > securityThresh) {
                // If the server's security level is above our threshold, weaken it
                await ns.weaken(target);
            } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
                // If the server's money is less than our threshold, grow it
                await ns.grow(target);
            } else {
                // Otherwise, hack it
                await ns.hack(target);
            }
        }
    }

The [Script](../basic/scripts.md) above contains comments that document what it does, but let's go through it step-by-step anyway.

    const target = "n00dles";

This first command defines a string which contains our target [Server](../basic/servers.md).
That's the [Server](../basic/servers.md) that we're going to [hack](../basic/hacking.md).
For now, it's set to `"n00dles"` because that's the only [Server](../basic/servers.md) with a required hacking level of `1`.
If you want to [hack](../basic/hacking.md) a different [Server](../basic/servers.md), simply change this variable to be the hostname of another [Server](../basic/servers.md).

    const moneyThresh = ns.getServerMaxMoney(target);

This second command defines a numerical value representing the minimum amount of money that must be available on the target [Server](../basic/servers.md) in order for our [Script](../basic/scripts.md) to [hack](../basic/hacking.md) it.
If the money available on the target [Server](../basic/servers.md) is less than this value, then our [Script](../basic/scripts.md) will `grow()` the [Server](../basic/servers.md) rather than [hacking](../basic/hacking.md) it.
It is set to the maximum amount of money that can be available on the [Server](../basic/servers.md).
The `getServerMaxMoney()` function is used to find this value

    const securityThresh = ns.getServerMinSecurityLevel(target);

This third command defines a numerical value representing the minimum security level the target [Server](../basic/servers.md) can have.
If the target [Server](../basic/servers.md)'s security level is higher than this value, then our [Script](../basic/scripts.md) will `weaken()` the [Script](../basic/scripts.md) before doing anything else.

    if (ns.fileExists("BruteSSH.exe", "home")) {
        ns.brutessh(target);
    }

    ns.nuke(target);

This section of code is used to gain root access on the target [Server](../basic/servers.md).
This is necessary for [hacking](../basic/hacking.md).

    while (true) {
        if (ns.getServerSecurityLevel(target) > securityThresh) {
            // If the server's security level is above our threshold, weaken it
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            // Otherwise, if the server's money is less than our threshold, grow it
            await ns.grow(target);
        } else {
            // Otherwise, hack it
            await ns.hack(target);
        }
    }

This is the main section that drives our [Script](../basic/scripts.md).
It dictates the [Script](../basic/scripts.md)'s logic and carries out the [hacking](../basic/hacking.md) operations.
The `while (true)` creates an infinite loop that will continuously run the [hacking](../basic/hacking.md) logic until the the [Script](../basic/scripts.md) is killed.

The await keyword is needed for `hack()` / `grow()` / `weaken()` because these commands take time to execute, unlike the others.
If you forget to await these commands, you will get an exception saying you tried to do multiple things at once, because your code will immediately finish the function call without waiting for the operation to be done.
Also important is that await can only be used in functions marked `async` (note that `main()` is marked `async`).

## Running our Scripts

Now we want to start running our [hacking](../basic/hacking.md) [Script](../basic/scripts.md) so that it can start earning us money and experience.
Our home computer only has 8GB of [RAM](../basic/ram.md), and we'll be using it for something else later.
Instead, we'll take advantage of the [RAM](../basic/ram.md) on other machines.

Go to `Terminal` and enter the following command:

    $ scan-analyze 2

This will show detailed information about some [Servers](../basic/servers.md) on the network.
The **network is randomized so it will be different for every person**.
Here's what mine showed at the time I made this:

    [home ~]> scan-analyze 2
    ┕ home
      ┃   Root Access: YES, Required hacking skill: 1
      ┃   Number of open ports required to NUKE: 5
      ┃   RAM: 8.00GB
      ┣ n00dles
      ┃ ┃   Root Access: YES, Required hacking skill: 1
      ┃ ┃   Number of open ports required to NUKE: 0
      ┃ ┃   RAM: 4.00GB
      ┃ ┕ nectar-net
      ┃       Root Access: NO, Required hacking skill: 20
      ┃       Number of open ports required to NUKE: 0
      ┃       RAM: 16.00GB
      ┣ foodnstuff
      ┃ ┃   Root Access: NO, Required hacking skill: 1
      ┃ ┃   Number of open ports required to NUKE: 0
      ┃ ┃   RAM: 16.00GB
      ┃ ┕ zer0
      ┃       Root Access: NO, Required hacking skill: 75
      ┃       Number of open ports required to NUKE: 1
      ┃       RAM: 32.00GB
      ┣ sigma-cosmetics
      ┃ ┃   Root Access: NO, Required hacking skill: 5
      ┃ ┃   Number of open ports required to NUKE: 0
      ┃ ┃   RAM: 16.00GB
      ┃ ┕ max-hardware
      ┃       Root Access: NO, Required hacking skill: 80
      ┃       Number of open ports required to NUKE: 1
      ┃       RAM: 32.00GB
      ┣ joesguns
      ┃     Root Access: NO, Required hacking skill: 10
      ┃     Number of open ports required to NUKE: 0
      ┃     RAM: 16.00GB
      ┣ hong-fang-tea
      ┃     Root Access: NO, Required hacking skill: 30
      ┃     Number of open ports required to NUKE: 0
      ┃     RAM: 16.00GB
      ┣ harakiri-sushi
      ┃     Root Access: NO, Required hacking skill: 40
      ┃     Number of open ports required to NUKE: 0
      ┃     RAM: 16.00GB
      ┕ iron-gym
        ┃   Root Access: NO, Required hacking skill: 100
        ┃   Number of open ports required to NUKE: 1
        ┃   RAM: 32.00GB
        ┕ CSEC
              Root Access: NO, Required hacking skill: 55
              Number of open ports required to NUKE: 1
              RAM: 8.00GB

Take note of the following servers:

- `sigma-cosmetics`
- `joesguns`
- `nectar-net`
- `hong-fang-tea`
- `harakiri-sushi`

All of these servers have 16GB of [RAM](../basic/ram.md).
Furthermore, all of these servers do not require any open ports in order to NUKE.
In other words, we can gain root access to all of these servers and then run [Scripts](../basic/scripts.md) on them.

First, let's determine how many threads of our [hacking](../basic/hacking.md) [Script](../basic/scripts.md) we can run.
(See the page on [scripts](../basic/scripts.md) for more information on multithreading.)

The [Script](../basic/scripts.md) we wrote uses 2.6GB of [RAM](../basic/ram.md).
You can check this using the following `Terminal` command:

    $ mem early-hack-template.js

This means we can run 6 threads on a 16GB server.
Now, to run our [Scripts](../basic/scripts.md) on all of these servers, we have to do the following:

1. Use the `scp` command to copy our [Script](../basic/scripts.md) to each server.
2. Use the `connect` command to connect to a server.
3. Use the `run` command to run the `NUKE.exe` program and gain root access.
4. Use the `run` command again to run our [Script](../basic/scripts.md).
5. Repeat steps 2-4 for each server.

Here's the sequence of `Terminal` commands I used in order to achieve this:

    $ home
    $ scp early-hack-template.js n00dles
    $ scp early-hack-template.js sigma-cosmetics
    $ scp early-hack-template.js joesguns
    $ scp early-hack-template.js nectar-net
    $ scp early-hack-template.js hong-fang-tea
    $ scp early-hack-template.js harakiri-sushi
    $ connect n00dles
    $ run NUKE.exe
    $ run early-hack-template.js -t 1
    $ home
    $ connect sigma-cosmetics
    $ run NUKE.exe
    $ run early-hack-template.js -t 6
    $ home
    $ connect joesguns
    $ run NUKE.exe
    $ run early-hack-template.js -t 6
    $ home
    $ connect hong-fang-tea
    $ run NUKE.exe
    $ run early-hack-template.js -t 6
    $ home
    $ connect harakiri-sushi
    $ run NUKE.exe
    $ run early-hack-template.js -t 6
    $ home
    $ connect hong-fang-tea
    $ connect nectar-net
    $ run NUKE.exe
    $ run early-hack-template.js -t 6

Pressing the `Tab` key in the middle of a Terminal command will attempt to auto-complete the command.
For example, if you type in `scp ea` and then hit `Tab`, the rest of the [Script](../basic/scripts.md)'s name should automatically be filled in.
This works for most commands in the game!

The `home` command is used to connect to the home computer. When running our [Scripts](../basic/scripts.md) with the `run early-hack-template.js -t 6` command, the `-t 6` specifies that the [Script](../basic/scripts.md) should be run with 6 threads.

Note that the `nectar-net` [Server](../basic/servers.md) isn't in the home computer's immediate network.
This means you can't directly connect to it from home. You will have to search for it inside the network.
The results of the `scan-analyze 2` command we ran before will show where it is.
In my case, I could connect to it by going from `hong-fang-tea` -> `nectar-net`.
However, this will probably be different for you.

After running all of these `Terminal` commands, our [Scripts](../basic/scripts.md) are now up and running.
These will earn money and hacking experience over time.
These gains will be really slow right now, but they will increase once our hacking skill rises and we start running more [Scripts](../basic/scripts.md).

## Increasing Hacking Level

There are many [Servers](../basic/servers.md) besides `n00dles` that can be hacked, but they have higher required hacking levels.
Therefore, we should raise our hacking level.
Not only will this let us hack more [Servers](../basic/servers.md), but it will also increase the effectiveness of our [hacking](../basic/hacking.md) against `n00dles`.

The easiest way to train your hacking level is to visit Rothman University.
You can do this from the `City` tab (Alt + w) on the left-hand navigation menu.
Rothman University should be the "U" near the bottom-right.
Click the "U" to go to the location.

Once you go to Rothman University, you should see a screen with several options.
These options describe different courses you can take.
You should click the first button, which says: `Study Computer Science (free)`.

After you click the button, you will start studying and earning hacking experience.
While you are doing this, you cannot interact with any other part of the game until you click either `Stop taking course` or `Do something else simultaneously`.

Right now, we want a hacking level of 10.
You need approximately 174 hacking experience to reach level 10.
You can check how much hacking experience you have by going to the `Stats` tab (Alt + c) on the left-hand navigation menu.
Since studying at Rothman University earns you 1 experience per second, this will take 174 seconds, or approximately 3 minutes.
Feel free to do something in the meantime!

## Editing our Hacking Script

Now that we have a hacking level of 10, we can hack the `joesguns` [Server](../basic/servers.md).
This [Server](../basic/servers.md) will be slightly more profitable than `n00dles`.
Therefore, we want to change our [hacking](../basic/hacking.md) [Script](../basic/scripts.md) to target `joesguns` instead of `n00dles`.

Go to `Terminal` and edit the [hacking](../basic/hacking.md) [Script](../basic/scripts.md) by entering:

    $ home
    $ nano early-hack-template.js

At the top of the [Script](../basic/scripts.md), change the `target` variable to be `"joesguns"`:

    const target = "joesguns";

Note that this will **NOT** affect any instances of the [Script](../basic/scripts.md) that are already running.
This will only affect instances of the [Script](../basic/scripts.md) that are run from this point forward.

## Creating a New Script to Purchase New Servers

Next, we're going to create a [Script](../basic/scripts.md) that automatically purchases additional [Servers](../basic/servers.md).
These [Servers](../basic/servers.md) will be used to run many [Scripts](../basic/scripts.md).
Running this [Script](../basic/scripts.md) will initially be very expensive since purchasing a [Server](../basic/servers.md) costs money, but it will pay off in the long run.

In order to create this [Script](../basic/scripts.md), you should familiarize yourself with the following functions:

- `purchaseServer()`
- `getPurchasedServerCost()`
- `getPurchasedServerLimit()`
- `getServerMoneyAvailable()`
- `scp()`
- `exec()`

Create the [Script](../basic/scripts.md) by going to `Terminal` and typing:

    $ home
    $ nano purchase-server-8gb.js

Paste the following code into the [Script](../basic/scripts.md) editor:

    /** @param {NS} ns */
    export async function main(ns) {
        // How much RAM each purchased server will have. In this case, it'll
        // be 8GB.
        const ram = 8;

        // Iterator we'll use for our loop
        let i = 0;

        // Continuously try to purchase servers until we've reached the maximum
        // amount of servers
        while (i < ns.getPurchasedServerLimit()) {
            // Check if we have enough money to purchase a server
            if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
                // If we have enough money, then:
                //  1. Purchase the server
                //  2. Copy our hacking script onto the newly-purchased server
                //  3. Run our hacking script on the newly-purchased server with 3 threads
                //  4. Increment our iterator to indicate that we've bought a new server
                let hostname = ns.purchaseServer("pserv-" + i, ram);
                ns.scp("early-hack-template.js", hostname);
                ns.exec("early-hack-template.js", hostname, 3);
                ++i;
            }
            //Make the script wait for a second before looping again.
            //Removing this line will cause an infinite loop and crash the game.
            await ns.sleep(1000);
        }
    }

This code uses a while loop to purchase the maximum amount of [Servers](../basic/servers.md) using the `purchaseServer()` function.
Each of these [Servers](../basic/servers.md) will have 8GB of [RAM](../basic/ram.md), as defined in the `ram` variable.
Note that the [Script](../basic/scripts.md) uses the command `getServerMoneyAvailable("home")` to get the amount of money you currently have.
This is then used to check if you can afford to purchase a [Server](../basic/servers.md).

Whenever the script purchases a new [Server](../basic/servers.md), it uses the `scp()` function to copy our [Script](../basic/scripts.md) onto that new [Server](../basic/servers.md), and then it uses the `exec()` function to execute it on that [Server](../basic/servers.md).

To run this [Script](../basic/scripts.md), go to `Terminal` and type:

    $ run purchase-server-8gb.js

This purchase will continuously run until it has purchased the maximum number of [Servers](../basic/servers.md).
When this happens, it'll mean that you have a bunch of new [Servers](../basic/servers.md) that are all running [hacking](../basic/hacking.md) [Scripts](../basic/scripts.md) against the `joesguns` [Server](../basic/servers.md)!

The reason we're using so many [Scripts](../basic/scripts.md) to hack `joesguns` instead of targeting other [Servers](../basic/servers.md) is because it's more effective.
This early in the game, we don't have enough [RAM](../basic/ram.md) to efficiently hack multiple targets, and trying to do so would be slow as we'd be spread too thin.
You should definitely do this later on, though!

Note that purchasing a [Server](../basic/servers.md) is fairly expensive, and purchasing the maximum amount of [Servers](../basic/servers.md) even more so.
At the time of writing this guide, the [Script](../basic/scripts.md) above requires \$11 million in order to finish purchasing all of the 8GB [Servers](../basic/servers.md).
Therefore, we need to find additional ways to make money to speed up the process!
These are covered in the next section.

## Additional Sources of Income

There are other ways to gain money in this game besides [Scripts](../basic/scripts.md) & [hacking](../basic/hacking.md).

## Hacknet Nodes

If you completed the introductory tutorial, you were already introduced to this method: [Hacknet Nodes](../basic/hacknet_nodes.md).
Once you have enough money, you can start upgrading your [Hacknet Nodes](../basic/hacknet_nodes.md) in order to increase your passive income stream.
This is completely optional.
Since each [Hacknet Node](../basic/hacknet_nodes.md) upgrade takes a certain amount of time to "pay itself off", it may not necessarily be in your best interest to use these.

Nonetheless, [Hacknet Nodes](../basic/hacknet_nodes.md) are a good source of income early in the game, although their effectiveness tapers off later on.
If you do wind up purchasing and upgrading [Hacknet Nodes](../basic/hacknet_nodes.md), I would suggest only upgrading their levels for now.
I wouldn't bother with [RAM](../basic/ram.md) and Core upgrades until later on.

## Crime

The best source of income right now is from [crimes](../basic/crimes.md).
This is because it not only gives you a large amount of money, but it also raises your hacking level.
To commit [crimes](../basic/crimes.md), go to the `City` tab (Alt + w).
Then, click on the link that says `The Slums`.

In the Slums, you can attempt to commit a variety of [crimes](../basic/crimes.md), each of which gives certain types of experience and money if successful.
See [crimes](../basic/crimes.md) for more details.

You are not always successful when you attempt to commit a crime.
Nothing bad happens if you fail a [crime](../basic/crimes.md), but you won't earn any money and the experience gained will be reduced.
Raising your stats improves your chance of successfully committing a [crime](../basic/crimes.md).

Right now, the best option is the `Rob Store` [crime](../basic/crimes.md).
This takes 60 seconds to attempt, gives \$400k if successful, and gives hacking experience (which is very important right now).

Alternatively, you can also use the `Shoplift` [crime](../basic/crimes.md).
This takes 2 seconds to attempt and gives \$15k if successful.
This [crime](../basic/crimes.md) is slightly easier and more profitable than `Rob Store`, but doesn't give hacking experience.

## Work for a Company

If you don't want to commit [crimes](../basic/crimes.md), there's another option - working for a [company](../basic/companies.md).
This will not be nearly as profitable as [crimes](../basic/crimes.md), but will provide [company](../basic/companies.md) [reputation](../basic/reputation.md).

Go to the `City` tab on the left-hand navigation menu and then go to `Joe's Guns`.
At `Joe's Guns`, there will be an option that says `Apply to be an Employee`.
Click this to get the job.
Then, a new option will appear that simply says `Work`.
Click this to start working.
Working at `Joe's Guns` earns \$110 per second and also grants some experience for every stat except hacking.

Working for a [company](../basic/companies.md), like [crime](../basic/crimes.md), is completely passive.
You can choose to focus on your work, do something else simultaneously, or switch between those two.
While you focus on work, you will not be able to do anything else in the game.
If you do something else simultaneously, you will not gain [reputation](../basic/reputation.md) at the same speed.
You can cancel working at any time.

Once your hacking hits level 75, you can visit `Carmichael Security` in the city and get a software job there.
This job offers higher pay and also earns you hacking experience.

There are many more companies in the `City` tab that offer more pay and also more gameplay features.
Feel free to explore!

## After you Purchase your New Servers

After you've made a total of \$11 million, your automatic [Server](../basic/servers.md)-purchasing [Script](../basic/scripts.md) should finish running.
This will free up some [RAM](../basic/ram.md) on your home computer.
We don't want this [RAM](../basic/ram.md) to go to waste, so we'll make use of it.
Go to `Terminal` and enter the following commands:

    $ home
    $ run early-hack-template.js -t 3

## Reaching a Hacking Level of 50

Once you reach a hacking level of 50, two new important parts of the game open up.

## Creating your first program: BruteSSH.exe

On the left-hand navigation menu you will notice a `Create Program` tab (Alt + p) with a red notification icon.
This indicates that there are programs available to be created.
Go to that tab, and you'll see a list of all the programs you can currently create.
Hovering over a program will give a brief description of its function.
Simply click on a program to start creating it.

Right now, the program we want to create is `BruteSSH.exe`.
This program is used to open up SSH ports on [Servers](../basic/servers.md).
This will allow you to hack more [Servers](../basic/servers.md), as many [Servers](../basic/servers.md) in the game require a certain number of opened ports in order for `NUKE.exe` to gain root access.

Feel free to cancel your work on creating a program at any time, as your progress will be saved and can be picked back up later.
`BruteSSH.exe` takes about 10 minutes to complete.

## Optional: Create AutoLink.exe

On the `Create Programs` page, you will notice another program you can create called `AutoLink.exe`.
If you don't mind waiting another 10-15 minutes, you should go ahead and create this program.
It makes it much less tedious to connect to other [Servers](../basic/servers.md), but it's not necessary for progression.

## Joining your first faction: CyberSec

Shortly after you reached level 50 hacking, you should have received a message that said this:

    Message received from unknown sender:

    We've been watching you. Your skills are very impressive. But you're wasting your talents.
    If you join us, you can put your skills to good use and change the world for the better.
    If you join us, we can unlock your full potential.

    But first, you must pass our test. Find and install the backdoor on our server.

    -CyberSec

    This message was saved as csec-test.msg onto your home computer.

If you didn't, or if you accidentally closed it, that's okay!
Messages get saved onto your home computer.
Enter the following `Terminal` commands to view the message:

    $ home
    $ cat csec-test.msg

This message is part of the game's main "quest-line".
It is a message from the `CyberSec` [faction](../basic/factions.md) that is asking you to pass their test.
Passing their test is simple, you just have to find their [Server](../basic/servers.md), hack it, and install a backdoor through the `Terminal`.
Their [Server](../basic/servers.md) is called `CSEC`.
To do this, we'll use the `scan-analyze` Terminal command, just like we did before:

    $ home
    $ scan-analyze 2

This will show you the network for all [Servers](../basic/servers.md) that are up to 2 "nodes" away from your home computer.
Remember that the network is randomly generated so it'll look different for everyone.
Here's the relevant part of my `scan-analyze` results:

    ┕ home
      ┃   Root Access: YES, Required hacking skill: 1
      ┃   Number of open ports required to NUKE: 5
      ┃   RAM: 8.00GB
      ┣ harakiri-sushi
      ┃     Root Access: NO, Required hacking skill: 40
      ┃     Number of open ports required to NUKE: 0
      ┃     RAM: 16.00GB
      ┕ iron-gym
        ┃   Root Access: NO, Required hacking skill: 100
        ┃   Number of open ports required to NUKE: 1
        ┃   RAM: 32.00GB
        ┕ CSEC
                  Root Access: NO, Required hacking skill: 55
              Number of open ports required to NUKE: 1
              RAM: 8.00GB

This tells me that I can reach `CSEC` by going through `iron-gym`:

    $ connect iron-gym
    $ connect CSEC

If you created the `AutoLink.exe` program earlier, then there is an easier method of connecting to `CSEC`.
You'll notice that in the `scan-analyze` results, all of the [Server](../basic/servers.md) hostnames are white and underlined.
You can simply click one of the [Server](../basic/servers.md) hostnames in order to connect to it.
So, simply click `CSEC`!

Make sure you notice the required hacking skill for the `CSEC` [Server](../basic/servers.md).
This is a random value between 51 and 60.
Although you receive the message from CSEC once you hit 50 hacking, you cannot actually pass their test until your hacking is high enough to install a backdoor on their [Server](../basic/servers.md).

After you are connected to the `CSEC` [Server](../basic/servers.md), you can backdoor it.
Note that this [Server](../basic/servers.md) requires one open port in order to gain root access.
We can open the SSH port using the `BruteSSH.exe` program we created earlier.
In `Terminal`:

    $ run BruteSSH.exe
    $ run NUKE.exe
    $ backdoor

After you successfully install the backdoor, you should receive a [faction](../basic/factions.md) invitation from `CyberSec` shortly afterwards.
Accept it.
If you accidentally reject the invitation, that's okay.
Just go to the `Factions` tab (Alt + f) and you should see an option that lets you accept the invitation.

Congrats!
You just joined your first [faction](../basic/factions.md).
Don't worry about doing anything with this [faction](../basic/factions.md) yet, we can come back to it later.

## Using Additional Servers to Hack Joesguns

Once you have the `BruteSSH` program, you will be able to gain root access to several additional [Servers](../basic/servers.md).
These [Servers](../basic/servers.md) have more [RAM](../basic/ram.md) that you can use to run [Scripts](../basic/scripts.md).
We'll use the [RAM](../basic/ram.md) on these [Servers](../basic/servers.md) to run more [Scripts](../basic/scripts.md) that target `joesguns`.

## Copying our Scripts

The [Servers](../basic/servers.md) we'll be using to run our [Scripts](../basic/scripts.md) are:

- `neo-net`
- `zer0`
- `max-hardware`
- `iron-gym`

All of these [Servers](../basic/servers.md) have 32GB of [RAM](../basic/ram.md).
You can use the `Terminal` command `scan-analyze 3` to see for yourself.
To copy our [hacking](../basic/hacking.md) [Scripts](../basic/scripts.md) onto these [Servers](../basic/servers.md), go to `Terminal` and run:

    $ home
    $ scp early-hack-template.js neo-net
    $ scp early-hack-template.js zer0
    $ scp early-hack-template.js max-hardware
    $ scp early-hack-template.js iron-gym

Since each of these [Servers](../basic/servers.md) has 32GB of [RAM](../basic/ram.md), we can run our [hacking](../basic/hacking.md) script with 12 threads on each [Server](../basic/servers.md).
By now, you should know how to connect to [Servers](../basic/servers.md).
So find and connect to each of the [Servers](../basic/servers.md) above using the `scan-analyze 3` `Terminal` command.
Then, use following `Terminal` command to run our [hacking](../basic/hacking.md) script with 12 threads:

    $ run early-hack-template.js -t 12

Remember that if you have the `AutoLink` program, you can simply click on the hostname of a [Server](../basic/servers.md) after running `scan-analyze` to connect to it.

## Profiting from Scripts & Gaining Reputation with CyberSec

Now it's time to play the waiting game.
It will take some time for your [Scripts](../basic/scripts.md) to start earning money.
Remember that most of your [Scripts](../basic/scripts.md) are targeting `joesguns`.
It will take a bit for them to `grow()` and `weaken()` the [Server](../basic/servers.md) to the appropriate values before they start [hacking](../basic/hacking.md) it.
Once they do, however, the [Scripts](../basic/scripts.md) will be very profitable.

For reference, in about two hours after starting my first [Script](../basic/scripts.md), my [Scripts](../basic/scripts.md) had a production rate of \$20k per second and had earned a total of \$70 million.
(You can see these stats on the `Active Scripts` tab).

After another 15 minutes, the production rate had increased to \$25k per second and the [Scripts](../basic/scripts.md) had made an additional \$55 million.

Your results will vary based on how fast you earned money from [crime](../basic/crimes.md)/[working](../basic/companies.md)/[hacknet nodes](../basic/hacknet_nodes.md), but this will hopefully give you a good indication of how much the [Scripts](../basic/scripts.md) can earn.

In the meantime, we are going to be gaining reputation with the `CyberSec` [faction](../basic/factions.md).
Go to the `Factions` tab (Alt + f) on the left-hand navigation menu, and from there select `CyberSec`.
In the middle of the page there should be a button for `Hacking Contracts`.
Click it to start earning [reputation](../basic/reputation.md) for the `CyberSec` [faction](../basic/factions.md) (as well as some hacking experience).
The higher your hacking level, the more [reputation](../basic/reputation.md) you will gain.
Note that while you are working for a [faction](../basic/factions.md), you can choose to not interact with the rest of the game in any way to gain [reputation](../basic/reputation.md) at full speed.
You can also select to do something else simultaneously, gaining [reputation](../basic/reputation.md) a bit more slowly, until you focus again.
You can cancel your [faction](../basic/factions.md) work at any time with no penalty to your [reputation](../basic/reputation.md) gained so far.

## Purchasing Upgrades and Augmentations

As I mentioned before, within 1-2 hours I had earned over \$200 million.
Now, it's time to spend all of this money on some persistent upgrades to help progress!

## Upgrading RAM on Home computer

The most important thing to upgrade right now is the [RAM](../basic/ram.md) on your home computer.
This will allow you to run more [Scripts](../basic/scripts.md).

To upgrade your [RAM](../basic/ram.md), go to the `City` tab and visit the company `Alpha Enterprises`.
There will be a button that says `Upgrade 'home' RAM (8.00GB -> 16.00GB) - $1.010m`.
Click it to upgrade your [RAM](../basic/ram.md).

I recommend getting your home computer's [RAM](../basic/ram.md) to **at least** 128GB.
Getting it even higher would be better.

## Purchasing your First Augmentations

Once you get ~1000 [reputation](../basic/reputation.md) with the `CyberSec` [faction](../basic/factions.md), you can purchase your first [Augmentation](../basic/augmentations.md) from them.

To do this, go to the `Factions` tab on the left-hand navigation menu (Alt + f) and select `CyberSec`.
There is a button near the bottom that says `Purchase Augmentations`.
This will bring up a page that displays all of the [Augmentations](../basic/augmentations.md) available from `CyberSec`.
Some of them may be locked right now.
To unlock these, you will need to earn more [reputation](../basic/reputation.md) with `CyberSec`.

[Augmentations](../basic/augmentations.md) give persistent upgrades in the form of multipliers.
These aren't very powerful early in the game because the multipliers are small.
However, the effects of [Augmentations](../basic/augmentations.md) stack multiplicatively **with each other**, so as you continue to install many [Augmentations](../basic/augmentations.md), their effects will increase significantly.

Because of this, I would recommend investing more in [RAM](../basic/ram.md) upgrades for your home computer rather than [Augmentations](../basic/augmentations.md) early on.
Having enough [RAM](../basic/ram.md) to run many [Scripts](../basic/scripts.md) will allow you to make much more money, and then you can come back later on and get all these [Augmentations](../basic/augmentations.md).

Right now, I suggest purchasing at the very least the `Neurotrainer I` [Augmentation](../basic/augmentations.md) from `CyberSec`.
If you have the money to spare, I would also suggest getting `BitWire` and several levels of the `NeuroFlux Governor` (`NFG`) [Augmentations](../basic/augmentations.md).
Note that each time you purchase an [Augmentation](../basic/augmentations.md), **the price of purchasing another increases by 90%**, so make sure you buy the most expensive [Augmentation](../basic/augmentations.md) first.
Don't worry, once you choose to install [Augmentations](../basic/augmentations.md), their prices will reset back to their original values.

## Next Steps

That's the end of the walkthrough portion of this guide!
You should continue to explore what the game has to offer.
There's quite a few features that aren't covered or mentioned in this guide, and even more that get unlocked as you continue to play!

Also, check out the API documentation to see what it has to offer.
Writing [Scripts](../basic/scripts.md) to perform and automate various tasks is where most of the fun in the game comes from (in my opinion)!

The following are a few things you may want to consider doing in the near future.

## Installing Augmentations (and Resetting)

If you've purchased any [Augmentations](../basic/augmentations.md), you'll need to install them before you actually gain their effects.
Installing [Augmentations](../basic/augmentations.md) is the game's "soft-reset" or "prestige" mechanic.

To install your [Augmentations](../basic/augmentations.md), go to the `Augmentations` tab (Alt + a) on the left-hand navigation menu.
You will see a list of all of the [Augmentations](../basic/augmentations.md) you have purchased.
Below that, you will see a button that says `Install Augmentations`.
Be warned, after clicking this there is no way to undo it (unless you load an earlier save).

## Automating the Script Startup Process

Whenever you install [Augmentations](../basic/augmentations.md), all of your [Scripts](../basic/scripts.md) are killed and you'll have to re-run them.
Doing this every time you install [Augmentations](../basic/augmentations.md) would be very tedious and annoying, so you should write a [Script](../basic/scripts.md) to automate the process.
Here's a simple example for a startup [Script](../basic/scripts.md).
Feel free to adjust it to your liking.

    /** @param {NS} ns */
    export async function main(ns) {
        // Array of all servers that don't need any ports opened
        // to gain root access. These have 16 GB of RAM
        const servers0Port = ["sigma-cosmetics",
                            "joesguns",
                            "nectar-net",
                            "hong-fang-tea",
                            "harakiri-sushi"];

        // Array of all servers that only need 1 port opened
        // to gain root access. These have 32 GB of RAM
        const servers1Port = ["neo-net",
                            "zer0",
                            "max-hardware",
                            "iron-gym"];

        // Copy our scripts onto each server that requires 0 ports
        // to gain root access. Then use nuke() to gain admin access and
        // run the scripts.
        for (let i = 0; i < servers0Port.length; ++i) {
            const serv = servers0Port[i];

            ns.scp("early-hack-template.js", serv);
            ns.nuke(serv);
            ns.exec("early-hack-template.js", serv, 6);
        }

        // Wait until we acquire the "BruteSSH.exe" program
        while (!ns.fileExists("BruteSSH.exe")) {
            await ns.sleep(60000);
        }

        // Copy our scripts onto each server that requires 1 port
        // to gain root access. Then use brutessh() and nuke()
        // to gain admin access and run the scripts.
        for (let i = 0; i < servers1Port.length; ++i) {
            const serv = servers1Port[i];

            ns.scp("early-hack-template.js", serv);
            ns.brutessh(serv);
            ns.nuke(serv);
            ns.exec("early-hack-template.js", serv, 12);
        }
    }

## Random Tips

- Early on in the game, it's better to spend your money on upgrading [RAM](../basic/ram.md) and purchasing new [Servers](../basic/servers.md) rather than spending it on [Augmentations](../basic/augmentations.md)
- The more money available on a [Server](../basic/servers.md), the more effective the `hack()` and `grow()` functions will be.
  This is because both of these functions use percentages rather than flat values.
  `hack()` steals a percentage of a [Server](../basic/servers.md)'s total available money, and `grow()` increases a [Server](../basic/servers.md)'s money by X%.
- There is a limit to how much money can exist on a [Server](../basic/servers.md).
  This value is different for each [Server](../basic/servers.md).
  The `getServerMaxMoney()` function will tell you this maximum value.
- At this stage in the game, your combat stats (strength, defense, etc.) are not nearly as useful as your hacking stat.
  Do not invest too much time or money into gaining combat stat exp.
- As a rule of thumb, your hacking target should be the [Server](../basic/servers.md) with highest max money that's required hacking level is under 1/2 of your hacking level.
