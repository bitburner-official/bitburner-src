# The Darkweb Network

Easy wealth... secret augments... The siren call of the so-called "dark net" has echoed in rumors for years. Delving into the uncharted and secretive parts of the internet comes with the promise of freedom from oppressive authority and surveillance.

Leaving the internet behind and turning to the dark web, however, comes with its risks... and potential rewards. A person with the right know-how (and enough charm to survive on their wits alone) can find their way into less-than-secure computers on that unregulated network. A person like you, perhaps.

### Network structure

Unlike the traditional BitBurner network, the darknet is constantly changing. Servers may sometimes restart, change its connections to other servers, or even go offline indefinitely. The network is also not a simple tree. It contains loops of connections, backtracks, and disconnected islands of servers to explore.

Due to the instability of the darknet, long-distance communication is often difficult or impossible. Servers on the darknet are not freely accessible from anywhere. Generally, they can only be interacted with or modified if your script is running on a directly connected nearby server. This means you will need to find a way to make deployers or probes that can roam the network and duplicate themselves.

In some cases, the only way to get to deeper parts of the net is to hitch a ride on a server when it moves to another location!

**In order to access the darknet, you will need to purchase `DarkscapeNavigator.exe`**. This can be done with the `buy` command in the terminal after purchasing a Tor router. There is also a location in Chongqing where you can purchase access, as well.

### TL;DR: Executive summary of the darknet API

**There is an example starter script at the bottom of this document, to see some of these API methods in action.**

- `dnet.getServerAuthDetails(hostname)` tells you a server's password hint and format, and if the server is offline or connected to the current server.
- `ns.dnet.probe()` lets you find darknet servers directly connected to your current server. Use this to find targets to crack and copy your script onto.
- `await ns.dnet.authenticate(hostname, password)` lets you guess and check passwords for servers directly connected to your script's server. If you guess right, you get admin access and can use `exec` and `scp` to move scripts onto that server.
- Some servers require interactive feedback to guess their password. Use `await ns.dnet.heartbleed(hostname)` to check that server's logs and get clues after you attempt a password.
- `ns.dnet.connectToSession(hostName, password)` lets you use a password you already know to log in to a darknet server at a distance. This is required to scp files there.
- `await ns.dnet.packetCapture(hostName)` allows you to sometimes find passwords amongst the (mostly) noise coming out of a server.
- Some servers will have part of their max ram blocked off. Use `ns.dnet.influence.memoryReallocation()` to free it.
- Some servers have valuable .cache files you can open with `ns.dnet.openCache(fileName)`
- Darknet servers allow you to run `ns.dnet.phishingAttack()` to get money or .cache files based off of your charisma and crime success stat.
- Using `ns.dnet.setStasisLink()` will stasis lock the current server. This prevents it from moving or going offline, and also allows getting a session on the server at a distance like backdooring does.

### Navigating the Dark Net with `dnet.probe`

Darknet servers, in an attempt to hide from official scrutiny, do not show up when using ns.scan. (This is where the "dark net" got its name!) To find them, you will first need to buy the tool `DarkscapeNavigator.exe` using the `buy` command in the terminal, with a TOR router. This gives access to the `ns.dnet` api. Then, you can use `ns.dnet.probe()` to see a list of darknet servers connected to the current server. Note that probe does not work at a distance: it cannot target distant servers like scan() can. To explore the dark, you will need to place your scripts in it, one server at a time.

```js
const nearbyDarknetServers = ns.dnet.probe();
for (const hostname of nearbyDarknetServers) {
  /* do something with each server here */
}
```

### Gaining server access

Darknet servers cannot simply be broken into with a few port openers you can buy off the shelf. Instead, you must find a way to crack the password of each one to run scripts on it and pass through it. Fortunately, each server's logs give some hints and feedback as you attempt to guess the password, and you will find that similar models of computer have similar vulnerabilities. If you aren't sure how to guess a server's auth codes, look around for notes on darknet servers you have already unlocked; they may have hints for how to solve some of the puzzles (and sometimes other helpful data files, too.)

### Cracking servers with `dnet.authenticate` and `dnet.heartbleed`

Darknet servers require a password to interact with. To get started, use `dnet.getServerAuthDetails` to find out critical information about a server. It will give a hint to the password, and tell you if the server is still online.

You can use `await ns.dnet.authenticate` to check if a guessed password is correct. (Remember to await it, network requests take time!) The higher your charisma, the faster you can smooth-talk your way through these vulnerable servers' security. Using more threads also speeds up this process. It may be faster to divide up the work across multiple scripts, if you can coordinate them. (Note that **`dnet.authenticate` can only target nearby connected servers**. You can verify if a server is connected to the current one using `dnet.probe` or `dnet.getServerAuthDetails`.)

```js
const details = ns.dnet.getServerAuthDetails(hostname);
if (!details.isConnectedToCurrentServer || !details.isOnline) {
  /* If the server isn't connected or is offline, we can't authenticate */
  return false;
}

if (details.modelId === "ZeroLogon") {
  /* Try to guess the password, based on the model ID and static password hint */
  ns.print(details.passwordHint);
}
```

When you are trying to find the password, you can extract the server's logs using the exploit `await ns.dnet.heartbleed`. This will extract the most recent logs from the target server, which in some cases lets you see extra hints or clues to why the last password attempt was not correct. In addition to your authentication attempts, the server's own traffic will register some logs as well. They're often useless, but sometimes have interesting hints or even other server's passwords! (these are the same logs you can see in the Darknet UI when you click on a server.)

Once you successfully run `dnet.authenticate` with the correct password, you gain admin rights to the server (similar to what NUKE.EXE does). It also gives your scripts a session with that server, so you can edit that server with `scp` and `exec`.

Once you figure out the right password, you will want it later (so other scripts can connect, or in case the server restarts & you need to start your scripts again.) Make sure to save the password somewhere durable, so it isn't lost if your script gets stopped later on.

```js
const result = await ns.dnet.authenticate(hostname, passwordToAttempt);
if (result.success === false) {
  const recentLogResult = await ns.dnet.heartbleed(server, { peek: true });
  ns.print(recentLogResult.logs);
}
```

### Modifying servers with `exec` and `scp`

Darknet servers are password-protected. This means that you will need to get a session in order to get admin rights, or to `scp` files onto them or `exec` scripts on them. Successfully finding a password with `dnet.authenticate` will automatically grant a session to the script that ran the command.

Once you have authenticated, other scripts can then connect to that same server using `dnet.connectToSession` and the password for the server. This is synchronous and can be done at any distance, meaning you don't have to wait for an authenticate call.

`scp` file transfers can be performed at any distance once you have established a session. However, `exec` also requires the script to either be run from a server adjacent to and connected to the target server, or a backdoor or stasis link on the target server. You can identify direct connections using `probe` or `getServerAuthDetails`.

```js
// the darknet server in "hostname" must be either backdoored, stasis linked, or directly connected to the server this script is running on
// to allow exec calls from the current server
if (ns.dnet.getServerAuthDetails(hostname).isConnectedToCurrentServer) {
  ns.dnet.connectToSession(hostname, previouslyDiscoveredPassword);
  ns.scp("my_script.js", hostname);
  ns.exec("my_script.js", hostname, {
    preventDuplicates: true, // This prevents running multiple copies of this script, if there is already one on that server
  });
}
```

### Looting servers with `dnet.openCache` and `dnet.phishingAttack`

Sometimes you will find valuable data in .cache files on servers you unlock. They can contain money or experience, programs, or even stock market access keys. They can be opened via `run` from the terminal, or `dnet.openCache` from a script on that server.

Once you have access to a darknet server, you can begin to use it for your own purposes. One option is to run `dnet.phishingAttack()` to raise your charisma levels and to try and con money out of the less tech-savvy middle managers out there. Occasionally you will even lift .cache data files from the attempt!

### Password stealing with `dnet.packetCapture`

If you get stuck on a puzzle, you can try to brute-force it. Most servers will tell you their password length and format, allowing you to try each of the possibilities. It's not likely to be fast, but it's an option.

If you don't want to wait on that, you can social-engineer your way around it. Not everyone uses secure internet connections, and a lot of interesting things can be pulled from their network traffic... including passwords. `dnet.packetCapture` will let you spend some time scraping data from outgoing packets from that server. Most of what you overhear will be useless, but the password will eventually show up inside some of that noise, sooner or later. (It may take a long time to stumble upon the password on higher-difficulty servers, though!)

### Freeing up more ram with `dnet.memoryReallocation`

Darknet servers belong to somebody already, and they are often already doing stuff on them. When you first authenticate on some of these servers, a chunk of the ram will be "in use" by the owner's (clearly wasteful) purposes, and needs to be... liberated. You can fully free up that ram for yourself using repeated calls to `dnet.memoryReallocation`. You will usually find valuable .cache files left behind after all the ram is cleared.

### Stabilizing a server with `dnet.setStasisLink`

Servers on the darknet are notoriously unreliable. They may restart or go offline, killing all the running scripts on them. They also can move away from the area you are working on. To combat this problem, you have a limited number of "stasis links" available to you, which can be applied (or removed from) the current server using `dnet.setStasisLink`. Placing a stasis link on a server allows you to `dnet.connectToSession` and `exec`, and `connect` to it from the terminal, from any distance.

You can see the currently stasis-linked servers with `dnet.getStasisLinkedServers`, and see the current limit using `dnet.getStasisLinkLimit`.

## Example Script

### **Warning: STOP HERE IF YOU WANT TO START YOUR CODE COMPLETELY FROM SCRATCH!**

(or don't stop here, it's up to you)

(this is to help you get started quickly - you can decide if you want this much help or not)

(by looking at this with your eyeballs, you consent to learning less-than-forbidden knowledge)

This is a simple self-replicating script that demonstrates how the darknet api can be used.

This is intended to be run starting on the `darkweb` server (the root of the dark network). It needs some improvements, and only works on one model type right now. See the `// TODO`s in the code for suggestions and ideas.

```js
/* This script is intended to be run from the `darkweb` server (the root of the dark network). */

/** @param {NS} ns */
export async function main(ns) {
  while (true) {
    // Get a list of all darknet hostnames directly connected to the current server
    const nearbyServers = ns.dnet.probe();

    // Attempt to authenticate with each of the nearby servers, and spread this script to them
    for (const hostname of nearbyServers) {
      const authenticationSuccessful = await serverSolver(ns, hostname);
      if (!authenticationSuccessful) {
        continue; // If we failed to auth, just move on to the next server
      }

      // If we have successfully authenticated, we can now copy and run this script on the target server
      ns.scp(ns.getScriptName(), hostname);
      ns.exec(ns.getScriptName(), hostname, {
        preventDuplicates: true, // This prevents running multiple copies of this script
      });
    }

    // TODO: free up blocked ram on this server using ns.dnet.memoryReallocation

    // TODO: look for .cache files on this server and open them with ns.dnet.openCache

    // TODO: take advantage of the extra ram on darknet servers to run ns.dnet.phishingAttack calls for money

    await ns.sleep(5000);
  }
}

/** Attempts to authenticate with the specified server using the Darknet API.
 * @param {NS} ns
 * @param {string} hostname - the name of the server to attempt to authorize on
 */
export const serverSolver = async (ns, hostname) => {
  // Get key info about the server, so we know what kind it is and how to authenticate with it
  const details = ns.dnet.getServerAuthDetails(hostname);
  if (!details.isConnectedToCurrentServer || !details.isOnline) {
    // If the server isn't connected or is offline, we can't authenticate
    return false;
  }

  switch (details.modelId) {
    case "ZeroLogon":
      return authenticateWithNoPassword(ns, hostname);

    // TODO: handle other models of darknet servers here

    // TODO: get recent server logs with `await ns.dnet.heartbleed(hostname)` for more detailed logging on failed auth attempts

    default:
      ns.tprint(`Unrecognized modelId: ${details.modelId}`);
      return false;
  }
};

/** Authenticates on 'ZeroLogon' type servers, which always have an empty password.
 *  @param {NS} ns
 * @param {string} hostname - the name of the server to attempt to authorize on
 */
const authenticateWithNoPassword = async (ns, hostname) => {
  const result = await ns.dnet.authenticate(hostname, "");
  // TODO: store discovered passwords somewhere safe, in case we need them later
  return result.success;
};
```
