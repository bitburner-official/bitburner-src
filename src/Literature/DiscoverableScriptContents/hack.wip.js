/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL');
  const [target, additionalMsec] = ns.args;
  await ns.hack(target, { additionalMsec });
}
