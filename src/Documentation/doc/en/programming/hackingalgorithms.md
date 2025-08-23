# Hacking algorithms

The [Beginner's Guide](../help/getting_started.md) introduces how the [hack, grow and weaken](../basic/hacking.md) functions can be used together.
Following it also helps you create the `early-hack-template.js`, which is one of the algorithms described in this section. There are many ways to improve this script. This guide will go over each of them and advise on how they can be implemented.

### Common Fundamentals

Some issues must be resolved before attempting any algorithms.

- Copying scripts to different servers and running them there.
  - You can use the `scan` function recursively to build a list of servers. Using the `scp` and `exec` functions allows you to run your scripts remotely. The [Beginner's Guide](../help/getting_started.md) has an example script without using `scan`.
- Finding and applying a scoring method to potential targets to find the best one.
  - The general approach is to compare the maximum money that could be stored on the server against the minimum security of the server. This ratio is an approximate money per time score for that server.
    Scoring can also incorporate other factors, such as the number of threads or amount of RAM required to take that money, or how close the server is to maximum money and minimum security.
  - It is often time effective to target a server with a hacking level requirement of less than half of your current hacking level.

## Early hacking template (EHT)

**Difficulty**: Easy

Pros:

- Easy to implement
- Does not require other scripts to work
- Works at any stage of the game

Cons:

- Limits income generation
- Extremely [RAM](../basic/ram.md) inefficient
- Utilizes script online time poorly
- Risk of over hacking
- Slow to start producing money

This is the self-contained algorithm implemented in `early-hack-template.js`. Each script is tasked with choosing which function to execute based on the status of the target server.
Because of this, they guarantee a consistent, but relatively small flow of money.

The general logic goes like this:

    loop forever {
        if security is not minimum {
            await ns.weaken(target)
        } else if money is not maximum {
            await ns.grow(target)
        } else {
            await ns.hack(target)
        }
    }

This algorithm is perfectly capable of paving the way through the early stages of the game, but it has a few significant issues.

For ease of visualisation, this is a simplified representation of the hacking sequence:

    |Hack=||=Weaken=============||=Grow===========||=Weaken=============|

- It tends to make all your scripts on every server do the same thing (e.g. If the target is 0.01 security above the minimum, all scripts will decide to weaken, when only a handful of threads should be devoted to the task). This wastes time that could be spent on the next function and delays when the script starts to bring in money.
- At higher thread counts, these scripts have the potential to hack the server to \$0, or maximum security, requiring a long setup time while the scripts return the server to the best stats.
- Requires function calls such as `getServerSecurityLevel` and `getServerMoneyAvailable`, as well as calling all three hacking functions, increasing the script RAM cost which is multiplied by the number of allocated threads.

## Controller

To resolve EHT's issues, we can manage the hack, grow and weaken functions from a centralized controller script.

- Analysis functions such as `getServerSecurityLevel` and `getServerMoneyAvailable` can be kept on the central controller, making the "worker" scripts much lighter in RAM cost.

  - The worker scripts can be as simple as

        await ns.hack(target) // or grow, or weaken

- The central controller can monitor the state of the target server and calculate exactly how many weaken, grow or hack threads are needed at any time to maximise RAM effectiveness and reduce the risk of over hacking.

Additionally, this controller script doesn't have to wait for each hack, grow or weaken to finish before launching the next one. Each function can be executed independently of each other and the controller.

**The following must be considered:**

- The effects of hack and grow depend on the server security level, a higher security level results in a reduced effect.
  You generally want these effects to occur when the security level is minimized.
- Hack and grow are both more effective if the server has more money. You don't want to reduce the server too far from its maximum money value.
  This is because hack takes a fraction of the current money on the server, and grow increases the current amount of money by a fixed multiple.
- The time taken to execute hack, grow, or weaken is determined when the function is called and is based on the security level of the target server and your hacking level.
  You generally want these effects to start when the security level is minimized.
- The effects of hack, grow, and weaken, are determined when the time is completed, rather than at the beginning.
  Hack should finish when security is minimum and money is maximum.
  Grow should finish when security is minimum, shortly after a hack occurred.
  Weaken should occur when security is not at a minimum due to a hack or grow increasing it.

## Batcher

### Concept

Before hacking, you need to grow and weaken the server (this "preparation" process is usually abbreviated as "prep"). After hacking, you need to "prep" that server again. This "prep" step takes a long time.

The idea of "batching" is that, instead of waiting for a long time to prep the server again and again after hacking, you make the server go back to the prepped state instantly or within a few milliseconds by carefully timing actions (i.e., hacking/growing/weakening). A group of hacking/growing/weakening is called a "batch".

A single batch often consists of four actions:

1.  A hack script removes a predefined, precalculated amount of money from the target server.
2.  A weaken script counters the security increase of the hack script.
3.  A grow script counters the money decrease caused by the hack script.
4.  A weaken script counters the security increase caused by the grow script.

                       |Hack=|
         |=Weaken=============|
              |=Grow===========|
           |=Weaken=============|

This is HWGW (Hack-Weaken-Grow-Weaken) batch, which is simple to implement and does not need formulas APIs. There are other batch types that may be better in some cases (e.g., HGW batch), but they usually need formulas APIs.

It is also important that these 4 scripts finish in the order specified above, and all their effects be precalculated to optimize the ratios between them.
This means we must implement a delay into the scripts.

In older versions of the game, this required using `sleep` or `asleep` functions, which have a RAM cost of zero.
However, due to JavaScript limitations, the delay duration is not millisecond-precise and can cause the functions to finish out of order.
Instead, the hack, grow and weaken functions have a special [option](https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.basichgwoptions.md) called `additionalMsec` that allows more precise delays.

As well as the run time for each function, we also need information on the impact of a hack, grow or weaken thread on the target's security and/or money to optimise the thread ratios between the functions.
This information can come from `formulas.exe` and use of the `getPlayer` and `getServer` functions, but cheaper functions such as `hackAnalyze`, `hackAnalyzeSecurity`, `getHackTime`, `growthAnalyze` and `growthAnalyzeSecurity` can still be used.

Don't forget to explore the [NS API](github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.ns.md) for other functions that might be useful in these calculations!

### Proto-batcher

There are many ways to launch batches. The simplest way is to launch them sequentially like this:

    |=Batch=||=Batch=||=Batch=||=Batch=||=Batch=||=Batch=|

This is called "proto-batcher", in which the next batch is only launched when the previous batch completes. The next sections will show you other types of batching.

### Shotgun Batcher

**Difficulty**: Medium

Pros:

- Easy to implement with a working controller script
- Much better income than EHT

Cons:

- Requires a dedicated controller script
- Can be real-life hardware heavy

A shotgun batcher uses a controller script to launch as many batches in parallel as possible.
Each function has a delay to make them all the same run time, meaning if they are launched in the correct order they will finish in the correct order. Each batch looks like this:

    |=Hack+additionalMsec=|
    |=Weaken==============|
    |=Grow+additionalMsec=|
    |=Weaken==============|

Very little - potentially 0 - time is needed between batches if they are launched correctly. In other words, instead of launching batches sequentially (like the proto-batcher), a shotgun batcher uses the available RAM in parallel to hit the target multiple times almost instantly - hence the name.

    |=Batch=|
    |=Batch=|
    |=Batch=|
    |=Batch=|
    |=Batch=|
    |=Batch=|

Launching potentially thousands of batches at the same time is intensive on real-life hardware. It's recommended to limit the number of parallel batches to around 100 000 to reduce the risk of the game soft-crashing. (Also called a "black screen" because of how it appears when this happens.)

### Just-In-Time ("JIT") Batcher

**Difficulty**: Hard

Pros:

- Maximises RAM efficiency
- Maximises income, especially in low RAM

Cons:

- Much more complex to implement

Shotgun batchers are not very RAM efficient because the scripts take up RAM during their delay timer. For example, if a hack function is 4 times faster than a weaken, the same RAM could be used to run the hack function for four different batches. This is shown visually below:

                       |Hack=||Hack=||Hack=||Hack=|
         |=Weaken=============| |=Weaken=============|
              |=Grow===========|   |=Grow===========|
           |=Weaken=============|
                |=Weaken=============|
                     |=Grow===========|
                  |=Weaken=============|
                       |=Weaken=============|
                            |=Grow===========|
                         |=Weaken=============|
                              |=Weaken=============|

By weaving batches between each other, JIT batchers maximise the effectiveness of the RAM at the cost of very precise timing constraints.
Good communication between worker scripts and the controller is necessary to schedule the next batch at the right time.
The controller must have an effective method to predict which scripts need to be launched.

When creating a JIT batcher, it's important to leave a space between each batch step to allow for any calculations or launching of future batches - typically between 5-50ms.
At this precision of timing, it becomes important to consider how much the situation has changed between launching the script and the hack, grow or weaken function starting to run. The "worker" scripts may need to adaptively change their delay value to compensate for other factors and complete on time.
