import { GlkOteReact, TerminalState } from "../../../src/Arcade/Zork/GlkOteReact";
import { ZorkDialog } from "../../../src/Arcade/Zork/ZorkDialog";

function makeGlkOte(): { glkote: GlkOteReact; states: TerminalState[]; accepted: unknown[] } {
  const states: TerminalState[] = [];
  const accepted: unknown[] = [];
  const glkote = new GlkOteReact(new ZorkDialog("test"), (s) => states.push(s));
  glkote.init({ accept: (ev: unknown) => accepted.push(ev) });
  return { glkote, states, accepted };
}

describe("GlkOteReact", () => {
  it("sends an init event with metrics on init()", () => {
    const { accepted } = makeGlkOte();
    expect(accepted).toHaveLength(1);
    const ev = accepted[0] as { type: string; gen: number; metrics: { width: number } };
    expect(ev.type).toBe("init");
    expect(ev.metrics.width).toBeGreaterThan(0);
  });

  it("parses grid and buffer content updates (both run formats)", () => {
    const { glkote, states } = makeGlkOte();
    glkote.update({
      type: "update",
      gen: 1,
      windows: [
        { id: 1, type: "grid", rock: 202, gridwidth: 80, gridheight: 1 },
        { id: 2, type: "buffer", rock: 201 },
      ],
      content: [
        { id: 1, lines: [{ line: 0, content: ["normal", " West of House"] }] },
        {
          id: 2,
          text: [
            { content: [{ style: "normal", text: "You are standing in an open field" }] },
            { append: true, content: ["normal", " west of a white house."] },
          ],
        },
      ],
      input: [{ id: 2, gen: 1, type: "line", maxlen: 200 }],
    });
    const s = states[states.length - 1];
    expect(s.gridLines[0].map((r) => r.text).join("")).toContain("West of House");
    expect(s.bufferLines).toHaveLength(1);
    expect(s.bufferLines[0].map((r) => r.text).join("")).toBe(
      "You are standing in an open field west of a white house.",
    );
    expect(s.inputRequest).toMatchObject({ id: 2, type: "line" });
  });

  it("clears buffer on clear, surfaces file prompts, and echoes line events back", () => {
    const { glkote, states, accepted } = makeGlkOte();
    glkote.update({
      type: "update",
      gen: 1,
      windows: [{ id: 2, type: "buffer", rock: 201 }],
      content: [{ id: 2, text: [{ content: ["normal", "old text"] }] }],
      input: [{ id: 2, gen: 1, type: "line", maxlen: 200 }],
    });
    glkote.sendLine("save");
    const lineEv = accepted[accepted.length - 1] as { type: string; window: number; value: string };
    expect(lineEv).toMatchObject({ type: "line", window: 2, value: "save" });

    glkote.update({
      type: "update",
      gen: 2,
      specialinput: { type: "fileref_prompt", filemode: "write", filetype: "save" },
    });
    expect(states[states.length - 1].filePrompt).toMatchObject({ filemode: "write" });

    glkote.sendFileref({ filename: "slot1", usage: "save" });
    const frEv = accepted[accepted.length - 1] as { type: string; response: string };
    expect(frEv).toMatchObject({ type: "specialresponse", response: "fileref_prompt" });

    glkote.update({
      type: "update",
      gen: 3,
      content: [{ id: 2, clear: true, text: [{ content: ["normal", "fresh"] }] }],
    });
    const s = states[states.length - 1];
    expect(s.bufferLines.map((l) => l.map((r) => r.text).join("")).join("\n")).toBe("fresh");
  });
});
