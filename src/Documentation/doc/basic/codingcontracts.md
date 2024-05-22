# Coding Contracts

Coding Contracts are a mechanic that lets players earn rewards in exchange for solving programming problems.

Coding Contracts are files with the `.cct` extension.
They can be accessed through the [Terminal](terminal.md) or through [Scripts](scripts.md) using the [Coding Contract API](https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.codingcontract.md).

Each contract has a limited number of attempts.
If you provide the wrong answer too many times and exceed the number of attempts, the contract will self destruct (delete itself).

Currently, Coding Contracts are randomly generated and spawned over time.
They can appear on any [server](servers.md) (including your home computer), except for your purchased [servers](servers.md).

## Running in Terminal

To run a Coding Contract in the [Terminal](terminal.md), simply use the `run` command:

    $ run some-contract.cct

Doing this will bring up a popup.
The popup will display the contract's problem, the number of attempts remaining, and an area to provide an answer.

## Interacting through Scripts

See the [Coding Contract API](https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.codingcontract.md).
Interacting with Coding Contracts via the [Terminal](terminal.md) can be tedious the more contracts you solve.
Consider using the [API](https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.codingcontract.md) to automate various aspects of your solution.
For example, some contracts have long solutions while others have even longer solutions.
You might want to use the [API](https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.codingcontract.md) to automate the process of submitting your solution rather than copy and paste a long solution into an answer box.

However, using the [API](https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.codingcontract.md) comes at a cost.
Like most functions in other APIs, each function in the [Coding Contract API](https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.codingcontract.md) has a RAM cost.
Depending on which function you use, the initial [RAM](ram.md) on your home server might not be enough to allow you to use various [API](https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.codingcontract.md) functions.
Plan on upgrading the [RAM](ram.md) on your home server if you want to use the [Coding Contract API](https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.codingcontract.md).

## Submitting Solutions

Different contract problem types will require different types of solutions.
Some may be numbers, others may be strings or arrays.
If a contract asks for a specific solution format, then use that.
Otherwise, follow these rules when submitting solutions:

- String-type solutions should **not** have quotation marks surrounding the string (unless specifically asked for).
  Only quotation marks that are part of the actual string solution should be included.
- Array-type solutions should be submitted with each element in the array separated by commas.
  Brackets are optional.
  For example, both of the following are valid solution formats:
  - `1,2,3`
  - `[1,2,3]`
- If the solution is a multidimensional array, then all arrays that are not the outer-most array DO require the brackets.
  For example, an array of arrays can be submitted as one of the following:
  - `[1,2],[3,4]`
  - `[[1,2],[3,4]]`

Numeric solutions should be submitted normally, as expected

## Rewards

There are currently four possible rewards for solving a Coding Contract:

- [Faction](factions.md) [Reputation](reputation.md) for a specific [Faction](factions.md)
- [Faction](factions.md) [Reputation](reputation.md) for all [Factions](factions.md) that you are a member of
- [Company](companies.md) [Reputation](reputation.md) for a specific [Company](companies.md)
- Money

The `amount` of the reward varies based on the difficulty of the problem posed by the Coding Contract.
There is no way to know what a Coding Contract's exact reward will be until it is solved.

## Notes

- The `scp` [Terminal](terminal.md) command does not work on Coding Contracts
