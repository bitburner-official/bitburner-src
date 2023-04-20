import React, { useState, useEffect, useRef } from "react";
import Typography from "@mui/material/Typography";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import createStyles from "@mui/styles/createStyles";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import TextField from "@mui/material/TextField";

import { KEY, KEYCODE } from "../../utils/helpers/keyCodes";
import { Terminal } from "../../Terminal";
import { Player } from "@player";
import { getTabCompletionPossibilities } from "../getTabCompletionPossibilities";
import { Settings } from "../../Settings/Settings";
import { substituteAliases } from "../../Alias";
import { longestCommonStart } from "../../utils/StringHelperFunctions";
import { maxWidth } from "@mui/system";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    textfield: {
      margin: theme.spacing(0),
    },
    input: {
      backgroundColor: theme.colors.backgroundprimary,
    },
    nopadding: {
      padding: theme.spacing(0),
    },
    preformatted: {
      margin: theme.spacing(0),
    },
    list: {
      padding: theme.spacing(0),
      height: "100%",
    },
  }),
);

// Save command in case we de-load this screen.
let command = "";

export function TerminalInput(): React.ReactElement {
  const terminalInput = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState(command);
  const [postUpdateValue, setPostUpdateValue] = useState<{ postUpdate: () => void } | null>();
  const [possibilities, setPossibilities] = useState<string[]>([]);
  const classes = useStyles();

  // If we have no data in the current terminal history, let's initialize it from the player save
  if (Terminal.commandHistory.length === 0 && Player.terminalCommandHistory.length > 0) {
    Terminal.commandHistory = Player.terminalCommandHistory;
    Terminal.commandHistoryIndex = Terminal.commandHistory.length;
  }

  // Need to run after state updates, for example if we need to move cursor
  // *after* we modify input
  useEffect(() => {
    if (postUpdateValue?.postUpdate) {
      postUpdateValue.postUpdate();
      setPostUpdateValue(null);
    }
  }, [postUpdateValue]);

  function saveValue(newValue: string, postUpdate?: () => void): void {
    command = newValue;
    setValue(newValue);

    if (postUpdate) {
      setPostUpdateValue({ postUpdate });
    }
  }

  function handleValueChange(event: React.ChangeEvent<HTMLInputElement>): void {
    saveValue(event.target.value);
    setPossibilities([]);
  }

  function modifyInput(mod: string): void {
    const ref = terminalInput.current;
    if (!ref) return;
    const inputLength = value.length;
    const start = ref.selectionStart;
    if (start === null) return;
    const inputText = ref.value;

    switch (mod.toLowerCase()) {
      case "backspace":
        if (start > 0 && start <= inputLength + 1) {
          saveValue(inputText.substr(0, start - 1) + inputText.substr(start));
        }
        break;
      case "deletewordbefore": // Delete rest of word before the cursor
        for (let delStart = start - 1; delStart > -2; --delStart) {
          if ((inputText.charAt(delStart) === KEY.SPACE || delStart === -1) && delStart !== start - 1) {
            saveValue(inputText.substr(0, delStart + 1) + inputText.substr(start), () => {
              // Move cursor to correct location
              // foo bar |baz bum --> foo |baz bum
              const ref = terminalInput.current;
              ref?.setSelectionRange(delStart + 1, delStart + 1);
            });
            return;
          }
        }
        break;
      case "deletewordafter": // Delete rest of word after the cursor, including trailing space
        for (let delStart = start + 1; delStart <= value.length + 1; ++delStart) {
          if (inputText.charAt(delStart) === KEY.SPACE || delStart === value.length + 1) {
            saveValue(inputText.substr(0, start) + inputText.substr(delStart + 1), () => {
              // Move cursor to correct location
              // foo bar |baz bum --> foo bar |bum
              const ref = terminalInput.current;
              ref?.setSelectionRange(start, start);
            });
            return;
          }
        }
        break;
      case "clearafter": // Deletes everything after cursor
        saveValue(inputText.substr(0, start));
        break;
      case "clearbefore": // Deletes everything before cursor
        saveValue(inputText.substr(start), () => moveTextCursor("home"));
        break;
      case "clearall": // Deletes everything in the input
        saveValue("");
        break;
    }
  }

  function moveTextCursor(loc: string): void {
    const ref = terminalInput.current;
    if (!ref) return;
    const inputLength = value.length;
    const start = ref.selectionStart;
    if (start === null) return;

    switch (loc.toLowerCase()) {
      case "home":
        ref.setSelectionRange(0, 0);
        break;
      case "end":
        ref.setSelectionRange(inputLength, inputLength);
        break;
      case "prevchar":
        if (start > 0) {
          ref.setSelectionRange(start - 1, start - 1);
        }
        break;
      case "prevword":
        for (let i = start - 2; i >= 0; --i) {
          if (ref.value.charAt(i) === KEY.SPACE) {
            ref.setSelectionRange(i + 1, i + 1);
            return;
          }
        }
        ref.setSelectionRange(0, 0);
        break;
      case "nextchar":
        ref.setSelectionRange(start + 1, start + 1);
        break;
      case "nextword":
        for (let i = start + 1; i <= inputLength; ++i) {
          if (ref.value.charAt(i) === KEY.SPACE) {
            ref.setSelectionRange(i, i);
            return;
          }
        }
        ref.setSelectionRange(inputLength, inputLength);
        break;
      default:
        console.warn("Invalid loc argument in Terminal.moveTextCursor()");
        break;
    }
  }

  // Catch all key inputs and redirect them to the terminal.
  useEffect(() => {
    function keyDown(this: Document, event: KeyboardEvent): void {
      if (Terminal.contractOpen) return;
      if (Terminal.action !== null && event.key === KEY.C && event.ctrlKey) {
        Terminal.finishAction(true);
        return;
      }
      const ref = terminalInput.current;
      if (event.ctrlKey || event.metaKey) return;
      if (event.key === KEY.C && (event.ctrlKey || event.metaKey)) return; // trying to copy

      if (ref) ref.focus();
    }
    document.addEventListener("keydown", keyDown);
    return () => document.removeEventListener("keydown", keyDown);
  });

  async function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): Promise<void> {
    const ref = terminalInput.current;

    // Run command.
    if (event.key === KEY.ENTER && value !== "") {
      event.preventDefault();
      Terminal.print(`[${Player.getCurrentServer().hostname} ~${Terminal.cwd()}]> ${value}`);
      Terminal.executeCommands(value);
      saveValue("");
      return;
    }

    // Autocomplete
    if (event.key === KEY.TAB) {
      event.preventDefault();

      // Apply aliases, but not to the current argument. We are only concerned with the last command.
      // Remove the last semicolon and anything preceding it, then split by whitespace to get the current command array
      const unaliasedArray = value.replace(/.*(?<=;)/, "").split(/\s+/);

      // The last element of this array is always the argument currently being typed (the text needing autocomplete).
      // We remove it from the unaliased array before applying the aliases.
      // .split return value always has at least one member, so this assertion is safe.
      const currentText = unaliasedArray.pop() as string;

      // If the unaliased array has members, convert to string -> apply alias -> capture from last semicolon again -> split back into an array
      // Ternary is needed so that a 0-length unaliased array does not result in a 1-length aliased array
      const aliasedArray = unaliasedArray.length
        ? substituteAliases(unaliasedArray.join(" "))
            .replace(/.*(?<=;)/, "")
            .split(/\s+/)
        : unaliasedArray;

      // Add the current text back onto the aliased array
      aliasedArray.push(currentText);

      const possibilities = await getTabCompletionPossibilities(aliasedArray, Terminal.cwd());
      if (possibilities.length === 0) return;
      if (possibilities.length === 1) {
        saveValue(value.replace(/[^ ]*$/, possibilities[0]) + " ");
        return;
      }
      // More than one possibility, check to see if there is a longer common string than currentText.
      const longestMatch = longestCommonStart(possibilities);
      if (longestMatch.length > currentText.length) saveValue(value.replace(/[^ ]*$/, longestMatch));
      setPossibilities(possibilities);
    }

    // Clear screen.
    if (event.key === KEY.L && event.ctrlKey) {
      event.preventDefault();
      Terminal.clear();
    }

    // Select previous command.
    if (event.key === KEY.UP_ARROW || (Settings.EnableBashHotkeys && event.key === KEY.P && event.ctrlKey)) {
      if (Settings.EnableBashHotkeys) {
        event.preventDefault();
      }
      const i = Terminal.commandHistoryIndex;
      const len = Terminal.commandHistory.length;

      if (len == 0) {
        return;
      }
      if (i < 0 || i > len) {
        Terminal.commandHistoryIndex = len;
      }

      if (i != 0) {
        --Terminal.commandHistoryIndex;
      }
      const prevCommand = Terminal.commandHistory[Terminal.commandHistoryIndex];
      saveValue(prevCommand);
      if (ref) {
        setTimeout(function () {
          ref.selectionStart = ref.selectionEnd = 10000;
        }, 10);
      }
    }

    // Select next command
    if (event.key === KEY.DOWN_ARROW || (Settings.EnableBashHotkeys && event.key === KEY.M && event.ctrlKey)) {
      if (Settings.EnableBashHotkeys) {
        event.preventDefault();
      }
      const i = Terminal.commandHistoryIndex;
      const len = Terminal.commandHistory.length;

      if (len == 0) {
        return;
      }
      if (i < 0 || i > len) {
        Terminal.commandHistoryIndex = len;
      }

      // Latest command, put nothing
      if (i == len || i == len - 1) {
        Terminal.commandHistoryIndex = len;
        saveValue("");
      } else {
        ++Terminal.commandHistoryIndex;
        const prevCommand = Terminal.commandHistory[Terminal.commandHistoryIndex];

        saveValue(prevCommand);
      }
    }

    // Extra Bash Emulation Hotkeys, must be enabled through options
    if (Settings.EnableBashHotkeys) {
      if (event.code === KEYCODE.C && event.ctrlKey && ref && ref.selectionStart === ref.selectionEnd) {
        event.preventDefault();
        Terminal.print(`[${Player.getCurrentServer().hostname} ~${Terminal.cwd()}]> ${value}`);
        modifyInput("clearall");
      }

      if (event.code === KEYCODE.A && event.ctrlKey) {
        event.preventDefault();
        moveTextCursor("home");
      }

      if (event.code === KEYCODE.E && event.ctrlKey) {
        event.preventDefault();
        moveTextCursor("end");
      }

      if (event.code === KEYCODE.B && event.ctrlKey) {
        event.preventDefault();
        moveTextCursor("prevchar");
      }

      if (event.code === KEYCODE.B && event.altKey) {
        event.preventDefault();
        moveTextCursor("prevword");
      }

      if (event.code === KEYCODE.F && event.ctrlKey) {
        event.preventDefault();
        moveTextCursor("nextchar");
      }

      if (event.code === KEYCODE.F && event.altKey) {
        event.preventDefault();
        moveTextCursor("nextword");
      }

      if ((event.code === KEYCODE.H || event.code === KEYCODE.D) && event.ctrlKey) {
        modifyInput("backspace");
        event.preventDefault();
      }

      if (event.code === KEYCODE.W && event.ctrlKey) {
        event.preventDefault();
        modifyInput("deletewordbefore");
      }

      if (event.code === KEYCODE.D && event.altKey) {
        event.preventDefault();
        modifyInput("deletewordafter");
      }

      if (event.code === KEYCODE.U && event.ctrlKey) {
        event.preventDefault();
        modifyInput("clearbefore");
      }

      if (event.code === KEYCODE.K && event.ctrlKey) {
        event.preventDefault();
        modifyInput("clearafter");
      }
    }
  }

  return (
    <>
      <TextField
        fullWidth
        color={Terminal.action === null ? "primary" : "secondary"}
        autoFocus
        disabled={Terminal.action !== null}
        autoComplete="off"
        value={value}
        classes={{ root: classes.textfield }}
        onChange={handleValueChange}
        inputRef={terminalInput}
        InputProps={{
          // for players to hook in
          id: "terminal-input",
          className: classes.input,
          startAdornment: (
            <Typography color={Terminal.action === null ? "primary" : "secondary"} flexShrink={0}>
              [{Player.getCurrentServer().hostname}&nbsp;~{Terminal.cwd()}]&gt;&nbsp;
            </Typography>
          ),
          spellCheck: false,
          onBlur: () => setPossibilities([]),
          onKeyDown: onKeyDown,
        }}
      ></TextField>
      <Popper
        open={possibilities.length > 0}
        anchorEl={terminalInput.current}
        placement={"top"}
        sx={{ maxWidth: "75%" }}
      >
        <Paper sx={{ m: 1, p: 2 }}>
          <Typography classes={{ root: classes.preformatted }} color={"primary"} paragraph={false}>
            Possible autocomplete candidates:
          </Typography>
          <Typography classes={{ root: classes.preformatted }} color={"primary"} paragraph={false}>
            {possibilities.join(" ")}
          </Typography>
        </Paper>
      </Popper>
    </>
  );
}
