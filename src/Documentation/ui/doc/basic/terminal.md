# Terminal

The Terminal is a console emulator program that lets you interface with all of the
Servers in the game. The Terminal can be accessed by clicking the `Terminal` tab
on the navigation menu on the left-hand side of the game (you may need to expand
the 'Hacking' header in order to see the `Terminal` tab). Alternatively, the shortcut Alt + t can be used to open the Terminal.

## Filesystem (Directories)

The Terminal contains a **very** basic filesystem that allows you to store and
organize your files into different directories. Note that this is **not** a true
filesystem implementation. Instead, it is done almost entirely using string manipulation.
For this reason, many of the nice & useful features you'd find in a real
filesystem do not exist.

Here are the Terminal commands you'll commonly use when dealing with the filesystem.

- `ls` (view all files in the current folder)
- `cd` (change folder)
- `mv` (rename a file)

## Directories

In order to create a directory, simply name a file using a full absolute Linux-style path:

    /scripts/myScript.js

This will automatically create a "directory" called `scripts`. This will also work
for subdirectories:

    /scripts/hacking/helpers/myHelperScripts.js

Files in the root directory do not need to begin with a forward slash:

    thisIsAFileInTheRootDirectory.txt

Note that there is no way to manually create or remove directories. The creation and
deletion of directories is automatically handled as you name/rename/delete
files.

## Absolute vs Relative Paths

Many Terminal commands accept both absolute and relative paths for specifying a
file.

An absolute path specifies the location of the file from the root directory (/).
Any path that begins with the forward slash is an absolute path:

    $ nano /scripts/myScript.js
    $ cat /serverList.txt

A relative path specifies the location of the file relative to the current working directory.
Any path that does **not** begin with a forward slash is a relative path. Note that the
Linux-style dot symbols will work for relative paths:

    . (a single dot) - represents the current directory
    .. (two dots) - represents the parent directory

    $ cd ..
    $ nano ../scripts/myScript.js
    $ nano ../../helper.js

## Scripts

Note that in order to reference a file, `functions` require the
**full** absolute file path. For example

    ns.run("/scripts/hacking/helpers.myHelperScripts.js");
    ns.rm("/logs/myHackingLogs.txt");
    ns.rm("thisIsAFileInTheRootDirectory.txt");

A full file path **must** begin with a forward slash (/) if that file
is not in the root directory.

## Missing Features

These features that are typically in Linux filesystems have not yet been added to the game:

- Tab autocompletion does not work with relative paths
- `mv` only accepts full filepaths for the destination argument. It does not accept directories

## Argument Parsing

When evaluating a terminal command, arguments are initially parsed based on whitespace (usually spaces).
Each whitespace character signifies the end of an argument, and potentially the start
of new one. For most terminal commands, this is all you need to know.

When running scripts, however, it is important to know in more detail how arguments are parsed.
There are two main points:

1. Quotation marks can be used to wrap a single argument and force it to be parsed as
   a string. Any whitespace inside the quotation marks will not cause a new argument
   to be parsed.
2. Anything that can represent a number is automatically cast to a number, unless its
   surrounded by quotation marks.

Here's an example to show how these rules work. Consider the following script `argType.js`:

    export async function main(ns) {
        ns.tprint("Number of args: " + ns.args.length);
        for (var i = 0; i < ns.args.length; ++i) {
            ns.tprint(typeof ns.args[i]);
        }
    }

Then if we run the following terminal command:

    $ run argType.js 123 1e3 "5" "this is a single argument"

We'll see the following in the Terminal:

    Running script with 1 thread(s) and args: [123, 1000, "5", "this is a single argument"].
    May take a few seconds to start up the process...
    argType.js: Number of args: 4
    argType.js: number
    argType.js: number
    argType.js: string
    argType.js: string

## Chaining Commands

You can run multiple Terminal commands at once by separating each command
with a semicolon (;).

Example:

    $ run foo.js; tail foo.js

This does `not` wait for commands with a delay to finish executing, so it
generally doesn't work with things like `hack`, `wget`, etc.
