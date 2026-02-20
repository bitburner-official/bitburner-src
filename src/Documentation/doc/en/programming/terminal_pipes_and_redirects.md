# Terminal Pipes and Redirects - WIP

The output of commands and scripts, that normally would be logged to the terminal, can instead be redirected and sent to another location.

For example, `echo` logs whatever input it is given.

```
[home /]> echo test123
test123
```

However, its output can instead be sent to a file using the output redirect `>` :

```
[home /]> echo test123 >> newFile.txt
```

After this, `newFile.txt` will be created (if it didn't exist) and will contain `test123`

### Accessing stdin via script

```js
/** @param {NS} ns */
async function read(ns) {
  const stdin = ns.getStdin();
  if (stdin.empty()) {
    await stdin.nextWrite();
  }
  return stdin.read();
}

/**
 * Each time that data comes in through stdin, call callback with it as input, until stdin is closed
 * @param {function (string): void} callback
 * @param {NS} ns
 */
async function onRead(ns, callback) {
  while (true) {
    const input = await read(ns);
    if (input === null) {
      return; // If we get a null, stdin is closed: stop reading
    }
    callback(input);
  }
}
```

### Creating your own command line utilities

`cut.js` using `onRead()` from the snippet above

```js
/** @param {NS} ns */
export async function main(ns) {
  if (!ns.getStdin()) {
    ns.tprint("ERROR: No piped input given");
    return;
  }

  // The '-c' flag expects a range of characters like 2-4
  // Other flags, such as '-b' bytes and '-d' delimeter, are left as an excercise for the reader
  const flags = ns.flags([["c", "0"]]);
  const charCountRange = flags.c.split("-");
  const startCharCount = Number(charCountRange[0]?.trim());
  const endCharCount = Number(charCountRange[1]?.trim() ?? startCharCount);

  await onRead(ns, (data) => {
    // slice the characters from the input data to specified range, and print them (aka send to stdout)
    // tprintf is used to avoid printing the script's filename and line number before the message
  let data = await read(ns);
  while(data != null) {
      ns.tprintf("%s", data.slice(startCharCount - 1, endCharCount));
      data = await read(ns);
    }
  });
}
```
