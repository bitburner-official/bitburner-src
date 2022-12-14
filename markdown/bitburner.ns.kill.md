<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [bitburner](./bitburner.md) &gt; [NS](./bitburner.ns.md) &gt; [kill](./bitburner.ns.kill.md)

## NS.kill() method

Terminate another script.

<b>Signature:</b>

```typescript
kill(script: number): boolean;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  script | number | Filename or PID of the script to kill. |

<b>Returns:</b>

boolean

True if the script is successfully killed, and false otherwise.

## Remarks

RAM cost: 0.5 GB

Kills the script on the target server specified by the script’s name and arguments. Remember that scripts are uniquely identified by both their names and arguments. For example, if `foo.script` is run with the argument 1, then this is not the same as `foo.script` run with the argument 2, even though they have the same name.

## Example 1


```ts
// NS1:
//The following example will try to kill a script named foo.script on the foodnstuff server that was ran with no arguments:
kill("foo.script", "foodnstuff");

//The following will try to kill a script named foo.script on the current server that was ran with no arguments:
kill("foo.script", getHostname());

//The following will try to kill a script named foo.script on the current server that was ran with the arguments 1 and “foodnstuff”:
kill("foo.script", getHostname(), 1, "foodnstuff");
```

## Example 2


```ts
// NS2:
//The following example will try to kill a script named foo.script on the foodnstuff server that was ran with no arguments:
ns.kill("foo.script", "foodnstuff");

//The following will try to kill a script named foo.script on the current server that was ran with no arguments:
ns.kill("foo.script", getHostname());

//The following will try to kill a script named foo.script on the current server that was ran with the arguments 1 and “foodnstuff”:
ns.kill("foo.script", getHostname(), 1, "foodnstuff");
```

