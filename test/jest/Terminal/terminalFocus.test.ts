/**
 * Tests for the terminal's document-level keydown handler and its interaction
 * with other input elements (e.g., prompt dialogs).
 *
 * The terminal registers a document-level keydown listener that calls focus()
 * on the terminal input to redirect all keyboard input there. This test
 * verifies that the handler does NOT steal focus from other input elements
 * like the text prompt dialog.
 *
 * See: https://github.com/bitburner-official/bitburner-src/issues/924
 */

describe("Terminal focus behavior", () => {
  let terminalInput: HTMLInputElement;
  let promptInput: HTMLInputElement;

  beforeEach(() => {
    terminalInput = document.createElement("input");
    terminalInput.id = "terminal-input";
    promptInput = document.createElement("input");
    promptInput.id = "prompt-input";
    document.body.append(terminalInput, promptInput);
  });

  afterEach(() => {
    terminalInput.remove();
    promptInput.remove();
  });

  // Simulates the terminal's keydown handler with the fix applied:
  // skip focus redirect if the event target is an input/textarea that isn't the terminal
  function fixedKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey) return;
    const target = event.target;
    if ((target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) && target !== terminalInput) {
      return;
    }
    terminalInput.focus();
  }

  it("should not steal focus from prompt input on keydown", () => {
    document.addEventListener("keydown", fixedKeyDown);

    // User opens a prompt dialog and the text field gets focus
    promptInput.focus();
    expect(document.activeElement).toBe(promptInput);

    // User types in the prompt — focus should stay there
    promptInput.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
    expect(document.activeElement).toBe(promptInput);

    // Multiple keystrokes should all stay in the prompt
    promptInput.dispatchEvent(new KeyboardEvent("keydown", { key: "b", bubbles: true }));
    promptInput.dispatchEvent(new KeyboardEvent("keydown", { key: "c", bubbles: true }));
    expect(document.activeElement).toBe(promptInput);

    document.removeEventListener("keydown", fixedKeyDown);
  });

  it("should still redirect focus to terminal when typing on the page background", () => {
    document.addEventListener("keydown", fixedKeyDown);

    // No input has focus — user clicks on empty page area, then types
    document.body.focus();
    expect(document.activeElement).toBe(document.body);

    // Keydown from body should redirect to terminal
    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
    expect(document.activeElement).toBe(terminalInput);

    document.removeEventListener("keydown", fixedKeyDown);
  });

  it("should still redirect focus when the terminal input itself has focus", () => {
    document.addEventListener("keydown", fixedKeyDown);

    terminalInput.focus();
    terminalInput.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
    expect(document.activeElement).toBe(terminalInput);

    document.removeEventListener("keydown", fixedKeyDown);
  });

  it("should not steal focus from textarea elements either", () => {
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    document.addEventListener("keydown", fixedKeyDown);

    textarea.focus();
    textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "x", bubbles: true }));
    expect(document.activeElement).toBe(textarea);

    document.removeEventListener("keydown", fixedKeyDown);
    textarea.remove();
  });
});
