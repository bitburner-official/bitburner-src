# Autocomplete and Help

Beyond the scope of executing your [scripts](scripts.md) in BitBurner, you have extra functionality that may be **exported** out of your files.

You have the capability of implementing _autocomplete_ for your scripts terminal interaction, and custom _help_ instructions that are shown when you use the `help` command.

These rely on exported functions named `autocomplete()` and `help()`, that must be placed _outside_ of main, in the base scope of the script.

## Autocomplete

The BitBurner terminal offers tab-completion, where pressing `tab` after typing a command offers suggestions for arguments to pass. You can customize this behavior for your scripts.

This function must return an array, the contents of which make up the autocomplete options.

A basic example as a complete script;

```javascript
/**
 * @param {AutocompleteData} data - context about the game, useful when autocompleting
 * @param {string[]} args - current arguments, not including "run script.js"
 * @returns {string[]} - the array of possible autocomplete options
 */
export function autocomplete(data, args) {
  return ["argument0", "argument1", "argument2"];
}

/** @param {NS} ns */
export function main(ns) {
  const args = ns.args;
  ns.tprint(args[0], args[1], args[2]);
}
```

Running this script from the terminal like `run script.js` or `./script.js` and pressing tab, would offer `"argument0", "argument1" and "argument2" as autocomplete options.

### AutocompleteData

To make this feature more useful, an [AutocompleteData](https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.autocompletedata.md) object is provided to the autocomplete function that holds information commonly passed as arguments to scripts, such as server names and filenames.

AutocompleteData is an object with the following properties;

```javascript
  {
    command:    // the command being run, as seen on the terminal.
    enums:      // the ns.enums object with various in-game strings.
    filename:   // the name of the script file containing the autocomplete function.
    hostname:   // the name of the host server the script would be running on.
    processes:  // list of all processes running on the current server.
    servers:    // list of all servers in the game. Some servers are hidden until you satisfy their requirements. This array does not contain those servers if you do not satisfy their requirements.
    txts:       // list of all text files on the current server.
    scripts:    // list of all scripts on the current server.
    flags:      // the same flags function as passed with ns. Calling this function adds all the flags as autocomplete arguments.
  }
```

Here is a more complete example, utilising and returning information from the AutocompleteData object.

```javascript
/**
 * @param {AutocompleteData} data - context about the game, useful when autocompleting
 * @param {string[]} args - current arguments, not including "run script.js"
 * @returns {string[]} - the array of possible autocomplete options
 */
export function autocomplete(data, args) {
  const scripts = data.scripts;
  const servers = data.servers;

  const gymTypesObject = data.enums.GymType; // The data.enums holds the enum information as objects.
  const gymTypes = Object.values(gymTypesObject); // We are only interested in the string values from the enums object.

  return [...scripts, ...servers, ...gymTypes]; // Offer a list of all servers, all scripts on the current server, and gym jobs ("str", "agi" etc) as autocomplete options.
}
```

## args

The args array is also passed to the autocomplete function as a second parameter. Similar to ns.args passed to `main` in normal scripts, this array contains the arguments currently inputted into the terminal.

This can be used to remove already passed arguments from the autocomplete suggestions.

For example;

```javascript
/**
 * @param {AutocompleteData} data - context about the game, useful when autocompleting
 * @param {string[]} args - current arguments, not including "run script.js"
 * @returns {string[]} - the array of possible autocomplete options
 */
export function autocomplete(data, args) {
  const servers = data.servers;
  const serversWithArgsRemoved = servers.filter((server) => !args.includes(server));

  return serversWithArgsRemoved;
}
```

In that example typing `run script.js` and pressing tab would initially suggest every server for autocomplete. Then if "n00dles" is added to the arguments and tab is pressed again, "n00dles" would no longer be suggested in subsequent autocomplete calls.

# Help

The `help` terminal command offers detailed information about existing terminal commands. It can also display custom help messages defined inside a script file.

This function's return type is very flexible; You can either return a string, an array of strings, a [ReactNode](../programming/react.md), or a custom HelpData object.

A basic example of its use;

```javascript
/**
 * @param {AutocompleteData} data - context about the game, may be useful to list argument documentation
 * @returns {string|string[]|ReactNode|HelpData}
 */
export function help(data) {
  return ["This is a simple script.", " ", "This script will output foo."];
}

/** @param {NS} ns */
export function main(ns) {
  ns.tprint("foo");
}
```

Running `help` on the terminal as `help script.js` would display the provided strings line-by-line, as shown below:

```
Usage for script.js:
This is a simple script.

This script will output foo.
```

This function supports ANSI escape codes, in case you'd like a bit of customization in your text.

```javascript
/**
 * @param {AutocompleteData} data - context about the game, may be useful to list argument documentation
 * @returns {string|string[]|ReactNode|HelpData}
 */
export function help() {
  return `${"\x1b[2m"}This is fancy bold text!`;
}
/*
Usage for script.js:
        This is fancy bold text!
*/

/** @param {NS} ns */
export function main(ns) {
  // ...
}
```

## Advanced Use

For these uses of the help function, you might consider using _TypeScript_ files.

The function can return a ReactNode element. For this, it's highly recommended to write a `*.tsx` script file.

```tsx
export function help(): ReactNode {
  return <li>This is a React element!</li>;
}
```

In case of very complex scripts, such as ones that operate advanced [hacking algorithms](../programming/hackingalgorithms.md), you may want to automatically generate documentation through the [HelpData](https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.helpdata.md) object.

### HelpData

This is an object that documentates human-readable information about the script.

```ts
interface HelpData {
  // A short description of the script.
  description: string;

  // The arguments of the script.
  args?: HelpDataArgs[];

  // Detailed information of the script. An array of strings indicates multiple paragraphs.
  overview?: string | string[];

  // Script(s) or command(s) that you might want to read about.
  seeAlso?: string | string[];
}
```

The `args` field must be populated with a list of objects of type `HelpDataArgs`:

```ts
interface HelpDataArgs {
  // The name of the argument to the script.
  name: string;

  // The type of the argument.
  // ScriptArg... represents a variable-amount of arguments.
  // It is currently is limited to the last argument.
  argType: "string" | "number" | "boolean" | "ScriptArg...";

  // Brief description of the purpose of this argument.
  description?: string;

  // Displays the argument as either optional or not.
  // By default, it is required;
  optional?: boolean;
}
```

An example of automatic documentation is seen below, in a `.ts` script:

```ts
export function help(): HelpData {
  return {
    description: "Help module example",
    args: [
      {
        name: "n",
        argType: "number",
        description: "count of foo repetitions",
        optional: true,
      },
    ],
    overview: [
      "This script file repeats the line 'foo' over a default of 10 times.",
      "It may be overriden to output n times, through command-line arguments.",
    ],
    seeAlso: "help",
  };
}

// ...
```

```
[home /]> help script.ts
Usage of script.ts:
NAME
	script.ts - Help module example (1.60GB)

SYNOPSIS
	script.ts  [n: number]

OVERVIEW
	This script file repeats the line 'foo' over a default of 10 times.

	It may be overriden to output n times, through command-line arguments.

ARGUMENTS
	n: number (optional)
		 -- count of foo repetitions

SEE ALSO
	help

```

### Context clues through AutocompleteData

AutocompleteData may be passed into the help function to give custom messages based on context. This may be helpful when you have a script that takes in game-specific arguments, which synergize with the autocomplete function:

_Example: findContract.ts_

```ts
export function help(data: AutocompleteData): HelpData {
  return {
    description: "find contracts in servers",
    args: [
      {
        name: "hostnames",
        argType: "ScriptArg...",
        description: `hostnames to search. Possible values: ${data.servers.join(", ")}`,
      },
    ],
  };
}

// ...
```

```
[home /]> help findContracts.ts
Usage for findContracts.ts:
NAME
	findContracts.ts - find contracts in servers (6.80GB)

SYNOPSIS
	findContracts.ts  <hostnames: ScriptArg...>

ARGUMENTS
	hostnames: ScriptArg...
		 -- hostnames to search. Possible values: n00dles, foodnstuff, sigma-cosmetics, joesguns, hong-fang-tea, harakiri-sushi, iron-gym
```
