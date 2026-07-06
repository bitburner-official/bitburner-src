/*                       @@@@@@@@@@@@
                      @@@             @@
                   @@     < CLOUD >      @@
                 @@        _--**--_          @@@@@@
        @@@@@@@@          |"--__--"|                @
     @@                   |  $     |                  @@
    @@   < SERVER >       |"--__--"|                    @@@@@
   @@                     |     $  |    < UPGRADES >         @@
   @                       "--__--"                           @@
     @@              @@@@@             @@@@                  @@
       @@@@@@@@@@@@@@@   @@@@@@@@@@@@@@@  @_(c)_2061_jump3r_@
          /     /        /   /      /       /  /
       /    /     /  /        / /        /           /


   Cloud servers are the best way to get ahead of your competitors!
   Cheap to buy, cheap to upgrade, and way below market rate for RAM.

   Now written in TypeScript: for even fewer bugs! Probably!
*/

export async function main(ns: NS) {
  ns.ui.openTail();

  const cloudServers: string[] = ns.cloud.getServerNames;
  const serverToUpgrade: string = cloudServers[0];
  const newRamAmount: number = 1337;

  // TODO: Read the docs for upgradeServer, and figure out how to use it properly?
  const success = ns.cloud.upgradeServer(newRamAmount, serverToUpgrade);

  if (success) {
    ns.print(`Successfully increased ram on ${serverToUpgrade} to ${newRamAmount}GB!`);
  }
}
