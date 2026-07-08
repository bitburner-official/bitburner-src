/**
 * Retro terminal renderer for the Zork arcade cabinets.
 * Pure presentation: renders TerminalState, forwards input upward.
 * Colors come from Settings.theme so player themes apply.
 */
import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Settings } from "../../Settings/Settings";
import type { StyledRun, TerminalState } from "./GlkOteReact";

export interface ZorkTerminalProps {
  state: TerminalState;
  onLine: (text: string) => void;
  onChar: (key: string) => void;
  onFileref: (value: { filename: string; usage: string } | null) => void;
}

const MONO: React.CSSProperties = {
  fontFamily: '"Lucida Console", "Consolas", monospace',
  fontSize: "14px",
  lineHeight: "18px",
};

function runStyle(run: StyledRun): React.CSSProperties {
  return {
    fontStyle: run.style === "emphasized" ? "italic" : undefined,
    fontWeight: run.style === "subheader" || run.style === "header" ? "bold" : undefined,
  };
}

function Line({ runs }: { runs: StyledRun[] }): React.ReactElement {
  return (
    <div style={{ whiteSpace: "pre-wrap", minHeight: "18px" }}>
      {runs.map((run, i) => (
        <span key={i} style={runStyle(run)}>
          {run.text}
        </span>
      ))}
    </div>
  );
}

export function ZorkTerminal({ state, onLine, onChar, onFileref }: ZorkTerminalProps): React.ReactElement {
  const [entry, setEntry] = useState("");
  const [slotName, setSlotName] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [focused, setFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const slotInputRef = useRef<HTMLInputElement>(null);

  function focusGame(): void {
    // Don't steal focus while the player is selecting text to copy.
    if (window.getSelection()?.toString()) return;
    (state.filePrompt ? slotInputRef : inputRef).current?.focus();
  }

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    inputRef.current?.focus();
  }, [state]);

  // The game's own prompt (e.g. "> ") is the last buffer line while line input
  // is pending; render the input as a continuation of it instead of doubling it.
  const lastLine = state.bufferLines[state.bufferLines.length - 1];
  const inlineInput =
    !!state.inputRequest &&
    !state.filePrompt &&
    !!lastLine &&
    lastLine
      .map((run) => run.text)
      .join("")
      .trim().length <= 2;

  function keyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    // Keep keystrokes inside the cabinet: no Bitburner hotkeys mid-game.
    event.stopPropagation();
    if (state.inputRequest?.type === "char") {
      event.preventDefault();
      onChar(event.key.length === 1 ? event.key : event.key.toLowerCase());
      return;
    }
    if (event.key === "Enter") {
      const text = entry;
      setEntry("");
      setHistory((h) => (text.trim() ? [...h, text] : h));
      setHistoryIndex(-1);
      onLine(text);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const idx = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1);
      if (history[idx] !== undefined) {
        setHistoryIndex(idx);
        setEntry(history[idx]);
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      const idx = historyIndex + 1;
      if (idx >= history.length) {
        setHistoryIndex(-1);
        setEntry("");
      } else {
        setHistoryIndex(idx);
        setEntry(history[idx]);
      }
    }
  }

  return (
    <Box
      onClick={focusGame}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      data-focused={focused}
      sx={{
        width: "740px",
        cursor: "text",
        border: `1px solid ${focused ? Settings.theme.primary : Settings.theme.primarydark}`,
        boxShadow: focused ? `0 0 8px ${Settings.theme.primary}` : "none",
        opacity: focused ? 1 : 0.7,
        transition: "opacity 150ms, box-shadow 150ms, border-color 150ms",
        backgroundColor: Settings.theme.backgroundprimary,
      }}
    >
      {/* Status line: classic inverse-video Infocom bar */}
      <Box sx={{ backgroundColor: Settings.theme.primary, color: Settings.theme.backgroundprimary, px: 1, ...MONO }}>
        {state.gridLines.length > 0 ? (
          state.gridLines.map((runs, i) => <Line key={i} runs={runs} />)
        ) : (
          <div style={{ minHeight: "18px" }} />
        )}
      </Box>
      {/* Story buffer. The game prints its own "> " prompt as the final buffer
          line, so when line input is wanted the input field continues that line. */}
      <Box ref={scrollRef} sx={{ height: "430px", overflowY: "auto", p: 1, color: Settings.theme.primary, ...MONO }}>
        {(inlineInput ? state.bufferLines.slice(0, -1) : state.bufferLines).map((runs, i) => (
          <Line key={i} runs={runs} />
        ))}
        {state.error && <Typography sx={{ color: Settings.theme.error, ...MONO }}>[ {state.error} ]</Typography>}
        {state.disabled && !state.error && !state.filePrompt && (
          <Typography sx={{ color: Settings.theme.secondary, ...MONO }}>
            [ The cabinet hums quietly. Press Back to leave. ]
          </Typography>
        )}
        {/* Input line */}
        {state.inputRequest && !state.filePrompt && (
          <Box sx={{ display: "flex", alignItems: "baseline" }}>
            {inlineInput ? (
              <span style={{ ...MONO, whiteSpace: "pre" }}>
                {state.bufferLines[state.bufferLines.length - 1].map((run) => run.text).join("")}
              </span>
            ) : (
              <span style={MONO}>&gt;</span>
            )}
            <TextField
              inputRef={inputRef}
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              onKeyDown={keyDown}
              variant="standard"
              autoFocus
              fullWidth
              InputProps={{
                disableUnderline: true,
                sx: { color: Settings.theme.primary, backgroundColor: "transparent", ...MONO },
              }}
              inputProps={{
                maxLength: state.inputRequest.maxlen,
                "aria-label": "Zork command input",
                style: { padding: 0 },
              }}
            />
          </Box>
        )}
        {/* Save/restore slot prompt */}
        {state.filePrompt && (
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography sx={{ color: Settings.theme.info, ...MONO }}>
              {state.filePrompt.filemode === "read" ? "Restore from slot:" : "Save to slot:"}
            </Typography>
            <TextField
              inputRef={slotInputRef}
              value={slotName}
              onChange={(e) => setSlotName(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter" && slotName.trim()) {
                  onFileref({ filename: slotName.trim(), usage: state.filePrompt?.filetype ?? "save" });
                  setSlotName("");
                }
              }}
              variant="standard"
              autoFocus
              placeholder="slot name"
              InputProps={{ sx: { color: Settings.theme.primary, ...MONO } }}
            />
            <Button size="small" onClick={() => onFileref(null)}>
              Cancel
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
