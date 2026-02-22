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
```

### Creating your own command line utilities

`cut.js` using `read()` from the snippet above

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

  let data = await read(ns);
  while (data != null) {
    // slice the characters from the input data to specified range, and print them (aka send to stdout)
    // tprintf is used to avoid printing the script's filename and line number before the message
    ns.tprintf("%s", data.slice(startCharCount - 1, endCharCount));
    data = await read(ns);
  }
}
```
