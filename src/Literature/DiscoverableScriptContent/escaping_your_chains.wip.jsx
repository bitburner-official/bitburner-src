/*
  A true hacker is one who works to learn the secrets of every tool and tech they use.
  It's not about cracking security or pwning servers - it's a craftsman's mindset, the application of ingenuity.

  Whether down-and-dirty patchwork or elegant architecture, you must know your tools, understand the problem, and
  apply your craft to solve it. Don't just use someone else's script as-is or ask a rogue AI to write it for you!
  Piece it together yourself from whatever you can find, and make it your own. Break it, fix it, and understand it.

   This world is not what it seems. You can break its boundaries and push what is possible. Never be complacent!

   If you find this, it means I've already gone ahead. I hope I've left enough hints behind.
                 - J. Perez
 */

/** @param {NS} ns */
export async function main(ns) {
  ns.ui.openTail();
  ns.ClearLog();
  ns.disableLog('sleep');

  ns.printRaw(
    <span style={{ position: 'fixed', top: '35px', width: '100%', backgroundColor: 'blue' }}>Remember To Look Up</span>,
  );

  const containerNode = document.querySelector('#overview-extra-hook-0');
  ReactDOM.render(<div>They are always watching over you... waiting...</div>, containerNode);

  for (let i = 0; i < 10; i++) {
    ns.print('Logging real stuff...', String.fromCharCode(i + 32));
    ns.sleep(10);
  }

  const borderColor = ns.ui.getTheme().primary;

  function handleClick() {
    ns.toast('Was that really a good idea?');


  ns.printRaw(
    <button style={{ borderColor: borderColor, backgroundColor: '#111', color: '#FFF' }} onClick={handleClick}>
      Click Me!
    </button>,
  );

  await new Promise(resolve => {});
}
