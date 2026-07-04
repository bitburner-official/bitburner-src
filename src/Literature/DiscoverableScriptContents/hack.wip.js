/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL');
  const [target] = `${ns.args}`;
  while(true) {
    await ns.hack(target);
  }
}
