/** type docs are for n00bs */
export async function main(ns) {
  ns.disableLog('ALL');
  const [target] = `${ns.args}`;
  while(true) {
    await ns.hack(target);
  }
}
