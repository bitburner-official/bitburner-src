/*
                   ~Network scanner~
        [Copyright (c) 2058  Junie "Jumper" Perez]

  This is supposed to be a re-usable tool to get the full list of
  servers out there.The network has never really been fully explored,
  you know? Maybe I can make a name for myself that way.

  Or at least, I could if the damn thing worked.

 */

/**
 * Returns a list of all servers on the network.
 *
 * Can be imported into other scripts (in the same directory) via
 * `import {getServerList} from "server_finder.wip.js";`
 *
 * @param {NS} ns - requires a netscript api instance from a script to work
 * @returns {string[]} a list of server hostnames
 */
export function getServerList(ns) {
  let index = 0;
  let serversToScan = ns.SCAN();

  // Keep looping until you run out of new servers to scan, unless it goes for too long
  while (index++ < serversToScan.length && index < 2e7) {
    const nextServerToScan = serversToScan[index];
    const results = ns.scan(nextServerToScan);
    serversToScan.push(results);
  }

  return serversToScan;
}

/**
 * The entrypoint for this script. Included so it can be run on its own if needed.
 * @param {NS} ns
 */
export async function main(ns) {
  const results = getServerList();

  ns.tprint(results.slice(-500));
  if (results.length > 500) {
    ns.tprint('ERROR: Script stopped. suspected infinite loop detected');
  }
}
