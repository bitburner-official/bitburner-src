# Servers

In this game, a server refers to a computer that can be connected to, accessed, and manipulated through the [Terminal](terminal.md).
All servers in the game are connected to each other to form a large, global network.
To learn about how to navigate this network and connect to other servers, see the [terminal](terminal.md) page.

## Server Statistics

Each server has its own statistics, such as [RAM](ram.md), required hacking level, and number of ports required to successfully `NUKE` it.

Perhaps the most important property of a server to make note of is its [RAM](ram.md), which refers to how much memory is available on that machine. [RAM](ram.md) is important because it is required to run [Scripts](scripts.md).
More [RAM](ram.md) allows the user to run more powerful and complicated [scripts](scripts.md), as well as executing scripts with more threads.

The `free`, `scan-analyze`, and `analyze` [Terminal](terminal.md) commands can be used to check how much [RAM](ram.md) a server has.

Some servers have some randomized statistics, such as [RAM](ram.md), max Money, or required hacking level.
These statistics are randomly generated from a range of values.

## Identifying Servers

A server is identified by its hostname.
A hostname is a label assigned to a server.
A hostname will usually give you a general idea of what the server is.
For example, the company Nova Medical might have a server with the hostname `nova-med`.

Hostnames are unique.
This means that if one server has the the hostname `some-server`, then no other server in the game can have that that hostname.

There are many `functions` and [terminal](terminal.md) commands in the game that will require you to target a specific server by hostname.

## Player-owned Servers

The player starts with a single server: his/her home computer.
This server will have the hostname `home`.
The player's home computer is special for a variety of reasons:

- The home computer's [RAM](ram.md) can be upgraded.
  This can be done by visiting certain locations in the [World](world.md).
- The home computer persists through [Augmentation](augmentations.md) installations.
  This means that you will not lose any [RAM](ram.md) upgrades or [Scripts](scripts.md) on your home computer when you install [Augmentations](augmentations.md)
  (you will, however, lose programs and messages on your home computer).

The player can also purchase additional servers.
This can be done by visiting certain locations in the [World](world.md), or it can be done automatically through a script using the `purchaseServer` function.
The advantage of purchased servers is that, in terms of [RAM](ram.md), they are cheaper than upgrading your home computer.
The disadvantage is that your purchased servers are lost when you install [Augmentations](augmentations.md).

## Hackable Servers

Most servers that are not owned by the player can be [hacked](hacking.md) for money and exp.

Different servers have different levels of security, but also offer different rewards when being hacked.

## Server Connections

The servers are in a randomly organized tree-structure.
The distance from the home computer to each server is fixed, but the exact route to them is randomized when you install [augmentations](augmentations.md).
In general, the further away from home computer a server is the higher its statistics are.
