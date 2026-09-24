## Introduction to Terminal Pipes and Redirects

### What is a pipe?

When you run a command in the terminal, it normally prints its output directly to the screen. A **pipe** (`|`) lets you take that output and send it as input to another command instead. One command produces output, and the next command consumes it.

```
[home /]> echo "hello world" | grep "hello"
```

Here, `echo` produces the text `"hello world"`, and instead of printing it to the terminal, that text is passed as input (stdin) to grep for it to search.

### What is a redirect?

A **redirect** changes where a command's output goes, or where a command reads its input from.

- `>` sends output to a file, **overwriting** any existing content
- `>>` sends output to a file, **appending** to any existing content
- `<` reads a file and sends its contents as input to a command

This can be used for writing to a file from the terminal:

```
[home /]> echo "hello world" > myFile.txt
```

or appending script logs to a file:

```
[home /]> tail hack.js >> logs.txt
```

### Why are pipes and redirects useful?

- **Save output to a file** — capture results from a long-running script for later review
- **Chain commands together** — pass data through multiple processing steps without saving intermediate results
- **Build reusable utilities** — write small scripts that do one thing well and compose them with pipes

---

## Supported Features

### Append redirect: `>>`

Writes command output to a file, adding to any existing content instead of replacing it.

```
[home /]> echo "first line" >> log.txt
[home /]> echo "second line" >> log.txt
```

After this, `log.txt` contains:

```
first line
second line
```

This can also be used to take the output of a script and save it to files:

```
[home /]> run myScript.js >> output.txt
[home /]> tail myScript.js >> logs.txt
```

### Output redirect: `>`

Writes command output to a file. If the file already exists, its contents are replaced.

```
[home /]> echo "first" > notes.txt
[home /]> echo "second" > notes.txt
```

After this, `notes.txt` contains only `second`.

### Pipe: `|`

Sends the output (stdout) of one command as the input (stdin) of the next.

```
[home /]> cat myfile.txt | grep "error"
```

This reads `myfile.txt` and passes its contents to `grep`, which filters for lines containing `"error"`.

Pipes can be chained across multiple commands:

```
[home /]> echo "some data" | myScript.js | anotherScript.js > output.txt
```

### Input redirect: `<`

Reads a file and provides its contents as stdin to a command. This can only be used as the **first** command in a pipe chain.

```
[home /]> grep "error" < myfile.txt
```

If you try to use `<` anywhere other than the first position, you will get an error.

### Semicolons: `;`

Semicolons let you run multiple independent commands on one line. Each command is separate — they do not share pipes or redirects.

```
[home /]> echo "foo" > file1.txt; echo "bar" > file2.txt
```

### The `$!` variable

`$!` expands to the PID (process ID) of the last script that was started with `run`.

This is useful for piping the output of `tail` to a file:

```
[home /]> run myScript.js; tail $! > output.txt
```

You can also use it with `echo` to capture the PID:

```
[home /]> run myScript.js; echo $! > pid.txt
```

### Piping into scripts

When a script is part of a pipe chain, it can read any input piped into its `run` command using `ns.getStdin()`. The script receives anything the previous command wrote to its stdout.

```
[home /]> echo "input data" | run myScript.js
```

Inside `myScript.js`, call `ns.getStdin()` to access the piped input.

### Piping out of scripts

When a script is followed by a `|` or `>`, its `ns.tprint()` output is captured and sent to the next step in the chain instead of the terminal.

```
[home /]> run myScript.js > output.txt
```

### Accessing stdin via script

`ns.getStdin()` returns a port handle that contains any input piped into the script from the terminal, if the script is part of a pipe chain (or null otherwise). When this pipe is closed by an upstream process, a `null` value will be passed through the pipe as a flag indicating the pipe has been closed.

```js
/**
 * A simple utility to read from the script's stdin, if present
 * @param {NS} ns
 */
export async function read(ns) {
  const stdin = ns.getStdin();
  if (!stdin) {
    return null;
  }
  if (stdin.empty()) {
    await stdin.nextWrite();
  }
  return stdin.read();
}
```

### Creating your own command line utilities

By using `ns.tprint()` as stdout and the read() function above or ns.getStdin() as stdin, custom terminal utilities can be written. For example, the below is a simple implementation of the `cut` Unix command using `read()` from the snippet above.

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

Scripts can be aliased to the command they support - for example, `alias -g cut="run cut.js"` will let you run the above using just the `cut` command:

```
[home /]> echo "Hello World!" | cut -c 2-5
ello
```

---

## Unsupported Features

Bitburner's terminal supports a useful subset of Unix pipes and redirects, but it is not a full Unix shell. This is intentional - players are encouraged to solve problems via script, or write their own terminal utilities as scripts.

The following common Unix features are **not supported**:

- **Multi-line command processing** — Unlike Unix, commands in Bitburner do not support commands wrapping multiple lines.
- **Here-documents (`<< EOF`)** — There is no way to provide multi-line string literals as stdin inline in the terminal.
- **Here-strings (`<<<`)** — The `<<<` operator for passing a single string directly to stdin is not supported.
- **Stderr redirect (`2>`, `2>>`, `&>`)** — There is no way to separately redirect or suppress error output.
- **Process substitution (`<(cmd)`, `>(cmd)`)** — Commands cannot be used in place of file arguments.
- **Background jobs (`&`)** — Long-running commands like `hack` and `backdoor` are always blocking/foreground, and cannot be run as background tasks. (Other commands like `run` are effectively "background" already.)
- **Subshells (`$(cmd)` or backtick substitution)** — Command output cannot be substituted inline as an argument to another command.
- **Named pipes (FIFOs)** — There is no `mkfifo` or equivalent.
- **Multiple output targets (`tee`)** — You cannot split output to both the terminal and a file simultaneously (no built-in `tee` command). This can be implemented by the player, though.
