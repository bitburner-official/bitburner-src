/**
 * Wires a fresh ZVM + glkapi instance to our display adapter and dialog.
 * Wiring pattern verified against ifvms 1.1.6 bin/zvm.js:
 *   vm.prepare(story, options); Glk.init(options); // Glk.init calls vm.init()
 */
import ZVM from "./vendor/zvm.js";
import { GlkClass } from "./vendor/glkapi.js";
import { GlkOteReact, TerminalListener } from "./GlkOteReact";
import { ZorkDialog } from "./ZorkDialog";

export interface ZorkSession {
  glkote: GlkOteReact;
  dispose(): void;
}

export function createZorkSession(story: Uint8Array, gameKey: string, listener: TerminalListener): ZorkSession {
  const dialog = new ZorkDialog(gameKey);
  const glkote = new GlkOteReact(dialog, listener);
  const vm = new ZVM();
  const Glk = new GlkClass();
  const options = { vm, Glk, GlkOte: glkote, Dialog: dialog };
  vm.prepare(story, options);
  Glk.init(options); // synchronously runs the VM to its first input request
  return {
    glkote,
    dispose: () => glkote.detach(),
  };
}
