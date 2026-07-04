/*
                        ** Shotgun-style Batcher **
                (c) 2074 Fulcrum Tech (Secret Lab Division)
                             Author: jump3

 This script launches "batches" of hack, grow, and weaken scripts at the same time, with the same duration,
 in order to return the target server to min security and max money immediately after the hack finishes.
 This allows for very rapid, efficient hacks on the target, while always keeping the target prepped.


 RULES OF ENGAGEMENT - FOR FULCRUM LABS INTERNAL USE ONLY

 Rule 0: Be Prepared
 The target server chosen to hack should be kept at min security!
 High security greatly reduces the speed of hack, grow, and weaken.

 RULE 1: Timing is Everything
 Hack calls blow up security upon completion!
 grows and weakens must be launched BEFORE the hack finishes, to avoid security debuffs.

 RULE 2: The Rich Get Richer
 Grow is like interest - the more money the server has, the more that grow adds!
 Make sure the server stays near max money. Don't steal big chunks of money at once.

 RULE 3: The Botnet Must Grow
 RAM is everything. Get your hands on any servers' ram that you can buy or steal or upgrade.
 The more hack script threads you can bring to bear, the more you can upgrade your servers, which lets you launch more threads, and repeat!
*/

/** @param {NS} ns */
export async function main(ns) {
  ns.ui.openTail();

  while (true) {
    const hackDelay = ns.getWeakenTime - ns.getHackTime('n00dles');
    const growDelay = ns.getWeakenTime - ns.getGrowTime('n00dles');

    // TODO: calculate good thread counts for the target, instead of hard-coding them (e.g. take 3% of max money per batch, and grow it back and fix security)
    ns.run('hack.wip.js', { threads: 1, temporary: true }, 'n00dles', hackDelay);
    ns.exec('grow.wip.js', { threads: 1, temporary: true }, 'n00dles', growDelay);
    const weakStarted = ns.exec('weak.wip.js', { threads: 1, temporary: true });

    if (!weakStarted) {
      await ns.sleep(ns.getWeakenTime('n00dles'));
    }
  }
}
