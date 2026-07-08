import * as fs from "fs";
import * as path from "path";
import type { TerminalState } from "../../../src/Arcade/Zork/GlkOteReact";
import { createZorkSession } from "../../../src/Arcade/Zork/session";

function textOf(state: TerminalState): string {
  return state.bufferLines.map((line) => line.map((r) => r.text).join("")).join("\n");
}

describe("Zork I engine smoke test", () => {
  beforeEach(() => localStorage.clear());

  it("boots Zork I, walks the opening, and saves", () => {
    const story = new Uint8Array(fs.readFileSync(path.join(__dirname, "../../../src/Arcade/Zork/games/zork1.z3")));
    let state: TerminalState | null = null;
    const session = createZorkSession(story, "zork1", (s) => (state = s));

    // ZVM runs synchronously until the first input request.
    expect(state).not.toBeNull();
    let s = state as unknown as TerminalState;
    expect(textOf(s)).toContain("West of House");
    expect(textOf(s)).toContain("white house");
    expect(s.inputRequest?.type).toBe("line");

    session.glkote.sendLine("open mailbox");
    s = state as unknown as TerminalState;
    expect(textOf(s)).toContain("leaflet");

    // Status line (grid window) shows the room.
    expect(s.gridLines.map((l) => l.map((r) => r.text).join("")).join("\n")).toContain("West of House");

    // save -> fileref prompt -> localStorage entry appears.
    session.glkote.sendLine("save");
    s = state as unknown as TerminalState;
    expect(s.filePrompt?.filemode).toBe("write");
    session.glkote.sendFileref({ filename: "slot1", usage: "save" });
    s = state as unknown as TerminalState;
    expect(textOf(s).toLowerCase()).toContain("ok");
    expect(localStorage.getItem("zork.zork1.save.slot1")).not.toBeNull();

    session.dispose();
  });
});
