# Netscript Miscellaneous

## Netscript Ports

Netscript Ports are endpoints that can be used to communicate between scripts and across servers. A port is implemented as a serialized queue, where you can only write and read one element at a time from the port. Only string and number types may be written to ports. When you read data from a port, the element that is read is removed from the port.

The following Netscript functions can be used to interact with ports:

- `read`
- `write`
- `tryWrite`
- `clear`
- `peek`

Ports are specified by passing the port number as the first argument and the value as the second. The default maximum capacity of a port is 50, but this can be changed in **Options > System**. Setting this too high can cause the game to use a lot of memory.

### Important

The data inside ports are **not saved**! If you close and re-open the game or reload the page, all data in the ports will be lost.

### Example Usage

Here's a brief example of how ports work. For simplicity, we'll only deal with port 1.

Let's assume Port 1 starts out empty:

```plaintext
[]
```

Now assume we run the following script:

```javascript
export async function main(ns) {
    for (var i = 0; i < 10; ++i) {
        ns.writePort(1, i); // Writes the value of i to port 1
    }
}
```

After execution, Port 1 will contain:

```plaintext
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
```

Now, running the following script:

```javascript
export async function main(ns) {
    for (var i = 0; i < 3; ++i) {
        ns.print(ns.readPort(1)); // Reads a value from port 1 and prints it
    }
}
```

Will print:

```plaintext
0
1
2
```

And the remaining data in Port 1 will be:

```plaintext
[3, 4, 5, 6, 7, 8, 9]
```

### Warning

In **NetscriptJS**, do not try writing base Promises to a port.

## Port Handles

### Warning

Port Handles only work in **NetscriptJS**. They do not work in **Netscript1**.

The `getPortHandle` Netscript function can be used to get a handle to a Netscript Port. This handle allows access to several new port-related functions:

### Methods

#### `NetscriptPort.writePort(data)`

- **Parameter:** `data` - Data to write to the port
- **Returns:** If the port is full, the item that is removed from the port is returned. Otherwise, `null` is returned.
- Works the same as the Netscript function `write`.

#### `NetscriptPort.tryWritePort(data)`

- **Parameter:** `data` - Data to try to write to the port
- **Returns:** `true` if the data is successfully written, `false` otherwise.
- If the port is full, the data will **not** be written.

#### `NetscriptPort.full()`

- **Returns:** `true` if the Netscript Port is full, `false` otherwise.

#### `NetscriptPort.empty()`

- **Returns:** `true` if the Netscript Port is empty, `false` otherwise.

#### `NetscriptPort.clear()`

- Clears all data from the port.
- Works the same as the Netscript function `clear`.

### Port Handle Example

```javascript
export async function main(ns) {
    port = ns.getPortHandle(5);
    back = port.data.pop(); // Get and remove last element in port

    // Wait for port data before reading
    while (port.empty()) {
        await ns.sleep(10000);
    }
    res = port.read();

    // Wait for room in the port before writing
    while (!port.tryWrite(5)) {
        await ns.sleep(5000);
    }

    // Successfully wrote to port!
}
```

## Comments

Netscript supports comments using JavaScript syntax. Comments are ignored by the interpreter and can be used to document code:

```javascript
// This is a comment and will not get executed
/* Multi-line
 * comment */
ns.print("This code will be executed");
```

## Importing Functions

In Netscript, you can import functions declared in other scripts. The script will incur the RAM usage of all imported functions. There are two ways to do this:

```javascript
import * as namespace from "script filename"; // Import all functions
import {fn1, fn2, ...} from "script filename"; // Import specific functions
```

### Example

Consider a library script called `testlibrary.js`:

```javascript
export function foo1(args) {
    // function definition...
}

export function foo2(args) {
    // function definition...
}

export async function foo3(args) {
    // function definition...
}

export function foo4(args) {
    // function definition...
}

export async function main(ns) {
    // main function definition, can be empty but must exist...
}
```

To use these functions in another script:

```javascript
import * as testlib from "testlibrary.js";

export async function main(ns) {
    const values = [1,2,3];
    
    // Use imported functions with the namespace
    const someVal1 = await testlib.foo3(...values);
    const someVal2 = testlib.foo1(values[0]);
    
    if (someVal1 > someVal2) {
        // ...
    } else {
        // ...
    }
}
```

To import only certain functions and save RAM:

```javascript
import {foo1, foo3} from "testlibrary.js"; // Saves RAM

export async function main(ns) {
    const values = [1,2,3];
    
    // No namespace needed
    const someVal1 = await foo3(...values);
    const someVal2 = foo1(values[1]);
    
    if (someVal1 > someVal2) {
        // ...
    } else {
        // ...
    }
}
```

### Warning

The `export` keyword **cannot** be used in **Netscript1** as it's not supported. It can, however, be used in **NetscriptJS** (but it's not required).

## Standard JavaScript Objects

Standard built-in JavaScript objects such as `Math`, `Date`, `Number`, and others are supported based on the Netscript version you are using:

- **Netscript1**: Supports built-in objects defined in ES5.
- **NetscriptJS**: Supports objects based on your browser's JavaScript engine.

