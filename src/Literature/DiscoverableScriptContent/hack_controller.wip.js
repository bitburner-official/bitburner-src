/*
                        ** Hack Loop Controller **
                (c) 2074 Fulcrum Tech (Secret Lab Division)
                             Author: J. Perez

 This script launches children that loop just one of either hack, grow, or
 weaken. They run alongside each other in order to constantly keep the server
 near max cash (to increase the power of hack and grow) and minsec
 (to reduce the penalties for high security on runtime and money hacked)


 RULES OF ENGAGEMENT - FOR FULCRUM LABS INTERNAL USE ONLY

 Rule 0: Be Prepared
 The target server chosen to hack should be kept at min security!
 High security greatly reduces the speed of hack, grow, and weaken.

 RULE 1: Timing is Everything
 Hack calls blow up security upon completion!
 grows and weakens must be started BEFORE the hack finishes, to avoid security debuffs.

 RULE 2: The Rich Get Richer
 Grow is like interest - the more money the server has, the more that grow adds!
 Make sure the server stays near max money. Don't steal big chunks of money at once.

 RULE 3: Be Ready For Anything
 Expect things to go wrong. Watch out for security and money drift over time!
 Add a little extra to however much it seems like you would need.

*/

/** @param {NS} ns */
export async function main(ns) {
  ns.ui.openTail();

  while (true) {
    ns.run('hack.wip.js', { threads: 1, temporary: true }, 'n00dles');
    ns.exec('grow.wip.js', { threads: 1, temporary: true }, 'n00dles');
    const weakStarted = ns.run('weak.wip.js', { threads: 1, temporary: true });

    if (!weakStarted) {
      break;
    }
  }
}
