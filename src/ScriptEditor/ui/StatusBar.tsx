import { Input, Typography } from "@mui/material";
import { Modal } from "../../ui/React/Modal";
import { styled } from "@mui/material/styles";
import type { editor } from "monaco-editor";
import React from "react";
type IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

const StatusBarContainer = styled("div")({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  height: 36,
  marginLeft: 4,
  marginRight: 4,
});

const StatusBarLeft = styled("div")({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
});

// This Class is injected into the monaco-vim initVimMode function to override the status bar.
export class StatusBar {
  // modeInfoNode is used to display the mode in the status bar.
  // notifNode is used to display notifications in the status bar.
  // secInfoNode is used to display the input box in the status bar.
  // keyInfoNode is used to display the operator and count in the status bar.
  // editor is kept to focus when closing the input box.
  // sanitizer is weird.

  node: React.MutableRefObject<React.ReactElement | null>;
  editor: IStandaloneCodeEditor;

  mode = "--NORMAL--";
  showInput = false;
  inputValue = "";
  buffer = "";
  notification = "";
  showRegisters = false;
  registers: Record<string, string> = {};

  rerender: () => void;

  onCloseHandler: ((query: string) => void) | null;
  onKeyDownHandler: ((e: React.KeyboardEvent, query: string, close: () => void) => void) | null;
  onKeyUpHandler: ((e: React.KeyboardEvent, query: string, close: () => void) => void) | null;

  // node is used to setup the status bar. However, we use it to forward the resulting status bar to the outside.
  // sanitizer is weird, so we use it to forward a rerender hook.
  constructor(
    node: React.MutableRefObject<React.ReactElement | null>,
    editor: IStandaloneCodeEditor,
    rerender: () => void,
  ) {
    this.node = node;
    this.editor = editor;

    this.rerender = rerender;

    this.onCloseHandler = null;
    this.onKeyDownHandler = null;
    this.onKeyUpHandler = null;

    this.update();
  }

  // this is used to change the mode shown in the status bar.
  setMode(ev: { mode: string; subMode?: string }) {
    if (ev.mode === "visual") {
      if (ev.subMode === "linewise") {
        this.mode = "--VISUAL LINE--";
      } else if (ev.subMode === "blockwise") {
        this.mode = "--VISUAL BLOCK--";
      } else {
        this.mode = "--VISUAL--";
      }
    } else {
      this.mode = `--${ev.mode.toUpperCase()}--`;
    }

    this.update();
  }

  // this is used to set the current operator, like d, r, etc or the count, like 5j, 3w, etc.
  setKeyBuffer(key: string) {
    this.buffer = key;

    this.update();
  }

  // this is used to set the input box.
  setSec(
    // this is the created HTML element from monaco-vim. We're not going to use it, so it is marked as unused.
    __text: HTMLElement,
    // this is used to close the input box and set the cursor back to the line in the monaco-editor. query is the text in the input box.
    onClose: ((query: string) => void) | null,
    options: {
      // This handles ESC, Backspace when input is empty, CTRL-C and CTRL-[. query is the text in the input box. close is a function that closes the input box. e is the key event.
      onKeyDown: ((e: React.KeyboardEvent, query: string, close: () => void) => void) | undefined;
      // This handles all other key events. query is the text in the input box. close is a function that closes the input box. e is the key event.
      onKeyUp: ((e: React.KeyboardEvent, query: string, close: () => void) => void) | undefined;
      // this is a default value for the input box. The box should be empty if this is not set.
      value: string | undefined;
    },
  ) {
    this.onCloseHandler = onClose;
    this.onKeyDownHandler = options.onKeyDown ?? null;
    this.onKeyUpHandler = options.onKeyUp ?? null;
    this.inputValue = options.value || "";
    this.showInput = true;

    this.update();
  }

  // this is used to toggle showing the status bar.
  toggleVisibility(toggle: boolean) {
    if (toggle) {
      this.node.current = this.StatusBar();
    } else {
      this.node.current = null;
    }
  }

  // this is used to close the input box.
  closeInput = () => {
    this.showInput = false;
    this.update();
    this.editor.focus();
  };

  // this is used to clean up the status bar on unmount.
  clear = () => {
    this.node.current = null;
  };

  parseRegisters = (html: HTMLElement) => {
    this.registers = {};

    const registerValues = html.innerText.split("\n").filter((s) => s.startsWith('"'));
    for (const registerValue of registerValues) {
      const name = registerValue[1];
      const value = registerValue.slice(2).trim();
      this.registers[name] = value;
    }
    console.log(this.registers);
  };
  // this is used to show notifications.
  // The package passes a new HTMLElement, but we only want to show the text.
  showNotification(html: HTMLElement) {
    // Registers are too big for the status bar, so we show them in a modal.
    if (html.innerText.startsWith("----------Registers----------\n\n") && html.innerText.length > 31) {
      this.parseRegisters(html);
      this.showRegisters = true;
      return this.update();
    }
    if (html.innerText.startsWith("----------Registers----------\n\n")) this.notification = "Registers are empty";
    else this.notification = html.innerText;

    const currentNotification = this.notification;

    setTimeout(() => {
      // don't update if the notification has changed in the meantime
      if (this.notification !== currentNotification) return;
      this.notification = "";
      this.update();
    }, 5000);

    this.update();
  }

  update = () => {
    this.node.current = this.StatusBar();
    this.rerender();
  };

  keyUp = (e: React.KeyboardEvent) => {
    if (this.onKeyUpHandler !== null) {
      this.onKeyUpHandler(e, this.inputValue, this.closeInput);
    } else {
      // if the player somehow gets stuck here, they can also press enter to close the input box.
      if (e.key === "Enter") this.closeInput();
    }
  };

  keyDown = (e: React.KeyboardEvent) => {
    if (this.onKeyDownHandler !== null) {
      this.onKeyDownHandler(e, this.inputValue, this.closeInput);
    }

    // this handles pressing escape in the input box.
    if (e.key === "Escape") {
      e.stopPropagation();
      this.closeInput();
    }

    // this handles pressing enter in the input box.
    if (e.key === "Enter" && this.onCloseHandler !== null) {
      e.stopPropagation();
      e.preventDefault();
      this.onCloseHandler(this.inputValue);
      this.closeInput();
    }
  };

  handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.inputValue = e.target.value;

    this.update();
  };

  StatusBar(): React.ReactElement {
    const registers = Object.entries(this.registers).map(([name, value]) => `[${name}]: ${value.slice(0, 100)}`);

    return (
      <StatusBarContainer>
        <Modal
          open={this.showRegisters}
          onClose={() => {
            this.showRegisters = false;
            this.update();
          }}
          removeFocus={false}
        >
          {registers.map((registers) => (
            <Typography key={registers}>{registers}</Typography>
          ))}
        </Modal>
        <StatusBarLeft>
          <Typography sx={{ mr: 4 }}>{this.mode}</Typography>
          {this.showInput && (
            <Input
              value={this.inputValue}
              onChange={this.handleInput}
              onKeyUp={this.keyUp}
              onKeyDown={this.keyDown}
              autoFocus={true}
              sx={{ mr: 4 }}
            />
          )}
          <Typography overflow="hidden">{this.notification}</Typography>
        </StatusBarLeft>
        <Typography>{this.buffer}</Typography>
      </StatusBarContainer>
    );
  }
}
