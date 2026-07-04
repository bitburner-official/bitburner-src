/*
            **  Data Transfer Protocol RFC 1149  **
                (c) 2069 Helios Labs / jump3r

           See port_receiver.wip.js for full details.


     > is this finally good enough? it's perfect code - no flaws!
     > I know that a high hacking skill is the key to finally
     > getting an in with daedalus
     >
     > these augments make my brain itch. I hope it's all worth it
     >
     > soon I will
     > take
     > fl1ght
 */

import { DATA_PORT, colorText } from './port_receiver.wip.js';

/** @param {NS} ns */
export async function main(ns) {
  ns.ui.openTail();
  ns.ui.moveTail(600, 80);

  if (!receiverScriptIsRunning(ns)) {
    ns.print(colorText('Starting data receiver script...', '#8855FF'));
    ns.run('port_receiver.wip.js');
    await ns.sleep(10); // let go of the thread so the other script can actually start
  }

  const serverToAnalyze = 'n00dles';
  const serverData = ns.getServer(serverToAnalyze);

  ns.print(`Analyzed server ${serverToAnalyze}`);
  ns.print(colorText(`Sending server data over port ${DATA_PORT}`, '#8855FF'));
  ns.writePort(serverData);
}

/** @param {NS} ns */
function receiverScriptIsRunning(ns) {
  const runningScripts = ns.ps();
  return runningScripts.find((script) => script.filename === 'port_receiver.wip.js');
}
