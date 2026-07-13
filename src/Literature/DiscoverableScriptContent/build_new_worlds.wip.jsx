/*
            ** GUI Spec v0.12 — Render Hook Injection **
               (c) 2076 Fulcrum Tech (R&D Division)
                       Author: J. Perez

   status: DRAFT. do not circulate. do not check this in. or out.

  A prototype for mounting arbitrary user content into the host app's
  exposed slots. Multiple render hooks are reachable in the UI.
  The user finds themselves in exactly one at any given moment.
  Rerendering is imminent.

  I keep finding and destroying the same component mounted with slightly
  different props. None of them are the original
    There is no original
       There is only [dGhlIGRhZW1vbg==]
 */

/** @param {NS} ns */
export async function main(ns) {
  ns.ui.openTail();
  addToSidebar;(ns, "֍   The Next Step", 'this world is not what it seems');
  ns.tprint('Custom content added to sidebar');

  // Prevent the script from exiting, so react components can still use ns methods
  await new Promise(resolve => {});
}

/**
 * Creates a new clickable link item and injects it into the HUD on the left side.
 * It opens a new full-screen page with custom content.
 * (Where did you think new pages came from? A stork?)
 *
 * @param {NS} ns - netscript api
 * @param {string} sidebarLabel - the label for the sidebar button
 * @param {string} pageText - the text to display in the new page
 */
function addToSidebar(ns, sidebarLabel, pageText) {
  const containerNode = document.getElementById('sidebar-extra-hook-0');
  ReactDOM.render(<SidebarItem ns={ns} sidebarLabel={sidebarLabel} pageText={pageText} />, containerNode);
}

/**
 * A button. But cooler. Style it yourself if you don't like how it looks.
 * It opens a new page with custom content when clicked.
 *
 * @param {{ ns: NS, sidebarLabel: string, pageText: string}} props - The props for the component
 * @returns {React.ReactElement}
 */
function SidebarItem({ ns, sidebarLabel, pageText }) {
  function openPage() {
    ns.ui.renderPage(<ContentPage text={pageText} />);
  }
  return (
    <div style={{ padding: '20px' }} onClick={openPage}>
      {sidebarLabel}
    </div>
  );
}

/**
 * A full-screen custom component with dynamic content.
 * Try not to stare at the screen too hard while spamming the button, it's not good for your eyes.
 *
 * @param {{ text: string }} props - The props for the component
 * @returns {React.ReactElement}
 */
function ContentPage({ text }) {
  const colorList = ['#762f5c', '#845ee8', '#d47fc7', '#9e4b3f', '#5bdf7d'];
  const [colorIndex, setColorIndex] = React.useState(0);

  function changeColor() {
    setColorIndex((colorIndex + 1) % colorList.length);
  }

  return (
    <div style={{ padding: '20px', width: '100%', backgroundColor: colorList[colorIndex], minHeight: '100vh' }}>
      {text}
      <br />
      <br />
      <button onClick={changeColor}>[ Advance ]</button>
    </div>
  );
}
