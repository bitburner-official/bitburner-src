import React from "react";
import ReactDOM from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import { ZorkTerminal } from "../../../src/Arcade/Zork/ZorkTerminal";
import type { TerminalState } from "../../../src/Arcade/Zork/GlkOteReact";

const baseState: TerminalState = {
  gridLines: [[{ style: "normal", text: " West of House      Score: 0  Moves: 0" }]],
  bufferLines: [
    [{ style: "normal", text: "You are standing in an open field west of a white house." }],
    [{ style: "normal", text: "There is a small mailbox here." }],
  ],
  inputRequest: { id: 2, gen: 1, type: "line", maxlen: 200, initial: "" },
  filePrompt: null,
  disabled: false,
  error: null,
};

describe("ZorkTerminal", () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });
  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  it("renders status line, story text, and an input", () => {
    act(() => {
      ReactDOM.render(
        <ZorkTerminal state={baseState} onLine={jest.fn()} onChar={jest.fn()} onFileref={jest.fn()} />,
        container,
      );
    });
    expect(container.textContent).toContain("West of House");
    expect(container.textContent).toContain("small mailbox");
    expect(container.querySelector("input")).not.toBeNull();
  });

  it("submits a line on Enter", () => {
    const onLine = jest.fn();
    act(() => {
      ReactDOM.render(
        <ZorkTerminal state={baseState} onLine={onLine} onChar={jest.fn()} onFileref={jest.fn()} />,
        container,
      );
    });
    const input = container.querySelector("input") as HTMLInputElement;
    act(() => {
      Simulate.change(input, { target: { value: "open mailbox" } as unknown as EventTarget & HTMLInputElement });
    });
    act(() => {
      Simulate.keyDown(input, { key: "Enter" });
    });
    expect(onLine).toHaveBeenCalledWith("open mailbox");
  });

  it("shows the save-slot prompt when filePrompt is set", () => {
    const state: TerminalState = { ...baseState, inputRequest: null, filePrompt: { filemode: "write", filetype: "save" } };
    act(() => {
      ReactDOM.render(
        <ZorkTerminal state={state} onLine={jest.fn()} onChar={jest.fn()} onFileref={jest.fn()} />,
        container,
      );
    });
    expect(container.textContent).toMatch(/slot|file|name/i);
  });
});
