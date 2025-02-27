# Autocomplete

The BitBurner terminal offers tab-completion, where pressing tab after typing a script name offers suggestions for arguments to pass to the script.

This relies on an exported function named "autocomplete" that is placed _outside_ of main, in the base scope of the script.

```
  autocomplete(data, args)
  data (Object) – general data about the game you might want to autocomplete.
  args (string[]) – current arguments. Minus run script.js
```

This function must return an array, the contents of which make up the autocomplete options.

A basic example as a complete script;

```javascript
export function autocomplete(data, args) {
  return ["argument0", "argument1", "argument2"];
}

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
    servers:    // list of all servers in the game.
    txts:       // list of all text files on the current server.
    scripts:    // list of all scripts on the current server.
    flags:      // the same flags function as passed with ns. Calling this function adds all the flags as autocomplete arguments.
  }
```

Here is a more complete example, utilising and returning information from the AutocompleteData object.

```javascript
export function autocomplete(data, args) {
  const scripts = data.scripts;
  const servers = data.servers;

  const gymTypesObject = data.enums.GymType; // The data.enums holds the enum information as objects.
  const gymTypes = Object.values(gymTypesObject); // We are only interested in the string values from the enums object.

  return [...scripts, ...servers, ...gymTypes]; // Offer a list of all servers, all scripts on the current server, and gym jobs ("str", "agi" etc) as autocomplete options.
}
```

## args

The args array is also passed to the autocomplete function as a second parameter. Similar to ns.args in normal scripts, this array contains the arguments already passed to a script.

This can be used to remove already passed arguments from the autocomplete suggestions.

For example;

```javascript
export function autocomplete(data, args) {
  const servers = data.servers;
  const serversWithArgsRemoved = servers.filter((server) => !args.includes(server));

  return serversWithArgsRemoved;
}
```

Using this autocomplete function, typing `run script.js` and pressing tab would suggest every server for autocomplete.

If that script is typed again like `run script.js n00dles` then n00dles would not be suggested.

# Notes

- The autocomplete function is run separately from main, and does not receive an `ns` context as a parameter. This means no regular `ns` game commands will work in autocomplete functions.
- If a multi-element array is returned, multiple options are displayed. If a single-element array is returned than that string is auto-filled to the command line. This is handy for the "--tail" run argument, for example.
