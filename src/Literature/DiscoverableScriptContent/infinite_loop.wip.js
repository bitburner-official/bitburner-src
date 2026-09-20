/**
 * Someone "forgot" their wallet and begged me to pay for their noodle bowl. In exchange, they gave me this script and
 * guaranteed that it's helpful. However, when I run it, my machine freezes.
 *
 * What a scam!
 *
 * - Koike-san
 */
/** @param {NS} ns */
export async function main(ns) {
  ns.ui.openTail();
  // Is there an infinite loop here?
  // I wish there was a way to pause execution to debug. Maybe a Pause button? Maybe a breakpoint? Maybe a statement
  // such as "debugger"?
  // I wish there was documentation for this. Or maybe a search engine. Wait! That sounds familiar ...
  while (true) {
    ns.print("Eat noodles");
    // Hmm ...
    ns.asleep(1000);
  }
}
