# Netscript Script Arguments

Arguments passed into a script can be accessed in Netscript using a special array called `args`. The arguments can be accessed using a normal array using the `[]` operator (`args[0]`, `args[1]`, etc.). These arguments can be of type `string`, `number`, or `boolean`.

For example, let's say we want to make a generic script `generic-run.script` and we plan to pass two arguments into that script. The first argument will be the name of another script, and the second argument will be a number. This generic script will run the script specified in the first argument with the number of threads specified in the second argument. The code would look like:

```javascript
var fileName = args[0];
var threads = args[1];
run(fileName, threads);
```

And it could be run from the terminal like:

```
run generic-run.script myscript.script 7
```

### Netscript 2 (.js / ns2) Version

In `.js / ns2`, the above script would look like:

```javascript
export async function main(ns) {
  let fileName = ns.args[0];
  let threads = ns.args[1];
  ns.run(fileName, threads);
}
```

### Getting the Number of Arguments

It is also possible to get the number of arguments that were passed into a script using `args.length`.

For example, if we want to create a script `foo.js` that takes 2 arguments:
- A string to print
- A number of times to print that string

The code would look like:

```javascript
export async function main(ns) {
  for (let i = 0; i < ns.args[1]; i++) {
    ns.tprint(ns.args[0]);
  }
}
```

Then we can have another script launch `foo.js` with the two arguments like:

```javascript
export async function main(ns) {
  ns.exec("foo.js", "n00dles", 1, "this will be printed twice", 2);
}
```
