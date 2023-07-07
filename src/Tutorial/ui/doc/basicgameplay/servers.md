# Servers

In this game, a server refers to a computer that can be connected to,
accessed, and manipulated through the Terminal. All servers in the
game are connected to each other to form a large, global network.
To learn about how to navigate this network and connect to other
servers, see the terminal page.

## Server Statistics

Each server has it's own statistics, such as RAM, required hacking level and number of
ports required to successfully NUKE it.

Perhaps the most important property of a server to make note of is its RAM,
which refers to how much memory is available on that machine. RAM is
important because it is required to run Scripts. More RAM allows
the user to run more powerful and complicated scripts as well as executing
a script with more threads.

The `free`, `scan-analyze`, and `analyze` Terminal commands
can be used to check how much RAM a server has.

Some servers have some randomized statistics, such as RAM, max Money or
required hacking level. These statistics are randomly generated from a range of values.

## Identifying Servers

A server is identified by its hostname.
A hostname is a label assigned to a server.
A hostname will usually give you a general idea of what the server
is. For example, the company Nova Medical might have a server with
the hostname "nova-med".

Hostnames are unique. This means that if one
server has the the hostname "some-server", then no other server
in the game can have that that hostname.

There are many `functions`
and `terminal` commands in the game
that will require you to target a specific server by hostname.

## Player-owned Servers

The player starts with a single server: his/her home computer.
This server will have the hostname "home." The player's home
computer is special for a variety of reasons:

1. The home computer's RAM can be upgraded. This can be done by visiting
   certain locations in the World.

2. The home computer persists through Augmentation Installations. This means
   that you will not lose any RAM upgrades or Scripts on your
   home computer when you install Augmentations (you will
   however, lose programs and messages on your home computer).

The player can also purchase additional servers. This can be
done by visiting certain locations in the World, or it can be
done automatically through a script using the `purchaseServer`
Netscript Function. The advantage of purchased servers is that,
in terms of RAM, they are cheaper than upgrading your home
computer. The disadvantage is that your purchased servers
are lost when you install Augmentations.

## Hackable Servers

Most servers that are not owned by the player can be hacked for money
and exp. See the hacking page for more details.

Different servers have different levels of security, but also offer
different rewards when being hacked.

## Server Connections

The servers are in a randomly organized tree-structure. The distance from
the home computer to each server is fixed, but the exact route to them is
randomized when you install augmentations. In general the
further away from home computer a server is the higher it's statistics are.
