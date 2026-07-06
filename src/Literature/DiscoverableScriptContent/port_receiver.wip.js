/*
                      **  Data Transfer Protocol RFC 1149  **
                          (c) 2069 Helios Labs / jump3r

        A proposal for a new standard data transfer protocol using Netscript ports.

  Coordinating actions and data between scripts is a key part of network architecture. This script demonstrates
  a simple way to start a child process, let it do work for some time, and have it send its results back.

  This allows a parent script to delegate tasks to other scripts, which allows for concurrent processing,
  and reduces the continuous RAM load required of calling expensive netscript methods.
 */

export const DATA_PORT = 31337;

/** @param {NS} ns */
export async function main(ns) {
  ns.ui.openTail();
  ns.ui.moveTail(50, 80);
  ns.ui.resizeTail(500, 800);

  // Launch script to get data and report back
  if (!senderScriptIsRunning(ns)) {
    ns.print(colorText('Starting data sender script.', '#00FFFF'));
    ns.run('port_sender.wip.js', 1);
  }

  ns.print(colorText('Waiting for data...', '#00FFFF'));
  await ns.nextPortWrite();
  const data = ns.readPort(DATA_PORT);
  ns.print(colorText(`Received data over port:`, '#00FFFF'));
  ns.print(JSON.stringify(data, null, 2));
}

/** @param {NS} ns */
function senderScriptIsRunning(ns) {
  const runningScripts = ns.ps();
  return runningScripts.find((script) => script.filename === 'port_sender.wip.js');
}

export function colorText(text, colorHexCode) {
  const r = parseInt(colorHexCode.slice(1, 3), 16);
  const g = parseInt(colorHexCode.slice(3, 5), 16);
  const b = parseInt(colorHexCode.slice(5, 7), 16);
  const colorCode = `\x1b[38;2;0x${r};0x${g};0x${b}m`;
  return colorCode + text + '\x1b[0m';
}
