# Autocomplete

The BitBurner terminal offers tab-completion, where pressing tab after typing a command offers suggestions for arguments to pass. You can customize this behavior for your scripts.

This relies on an exported function named "autocomplete" that is placed _outside_ of main, in the base scope of the script.

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

Running this script from the terminal like `run script.js` or `./script.js` and pressing tab, would offer "argument0", "argument1" and "argument2" as autocomplete options.

## AutocompleteData

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

# Notes

- The autocomplete function in the file is called each time the tab key is pressed following `run file.js` or `./file.js` in the terminal.
- The autocomplete function is separate from `main`, and does not receive an `ns` context as a parameter. This means no `ns` game commands will work in autocomplete functions.
- If a multi-element array is returned then multiple options are displayed. If a single-element array is returned then that element is auto-filled to the terminal. This is handy for the "--tail" run argument, for example.
