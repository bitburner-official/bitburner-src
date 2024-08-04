import React, { ReactElement } from "react";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import EditIcon from "@mui/icons-material/Edit";

import { useBoolean } from "../../ui/React/hooks";
import { Modal } from "../../ui/React/Modal";
import { ThemeEditorModal } from "./ThemeEditorModal";
import { CursorBlinking, CursorStyle, Options } from "./Options";

const CURSOR_STYLES: CursorStyle[] = ["line", "block", "underline", "line-thin", "block-outline", "underline-thin"];
const CURSOR_BLINKING_MODES: CursorBlinking[] = ["blink", "smooth", "phase", "expand", "solid"];

export type OptionsModalProps = {
  open: boolean;
  options: Options;
  onClose: () => void;
  onOptionChange: (option: keyof Options, value: Options[keyof Options]) => void;
  onThemeChange: () => void;
};

export function OptionsModal(props: OptionsModalProps): ReactElement {
  const [themeEditorOpen, { on: openThemeEditor, off: closeThemeEditor }] = useBoolean(false);

  const onFontSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fontSize = parseInt(event.target.value);
    if (!Number.isFinite(fontSize) || fontSize < 1) return;
    props.onOptionChange("fontSize", fontSize);
  };

  const onTabSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const tabSize = parseInt(event.target.value);
    if (!Number.isFinite(tabSize) || tabSize < 1) return;
    props.onOptionChange("tabSize", tabSize);
  };

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <ThemeEditorModal open={themeEditorOpen} onChange={props.onThemeChange} onClose={closeThemeEditor} />
      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography>Theme: </Typography>
        <Select onChange={(event) => props.onOptionChange("theme", event.target.value)} value={props.options.theme}>
          <MenuItem value="monokai">monokai</MenuItem>
          <MenuItem value="solarized-dark">solarized-dark</MenuItem>
          <MenuItem value="solarized-light">solarized-light</MenuItem>
          <MenuItem value="vs-dark">dark</MenuItem>
          <MenuItem value="light">light</MenuItem>
          <MenuItem value="dracula">dracula</MenuItem>
          <MenuItem value="one-dark">one-dark</MenuItem>
          <MenuItem value="customTheme">Custom theme</MenuItem>
        </Select>
        <Button onClick={openThemeEditor} sx={{ ml: 1 }} startIcon={<EditIcon />}>
          Edit custom theme
        </Button>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography marginRight={"auto"}>Indent using spaces: </Typography>
        <Switch
          onChange={(e) => props.onOptionChange("insertSpaces", e.target.checked)}
          checked={props.options.insertSpaces}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography marginRight={"auto"}>Tab size: </Typography>
        <TextField type="number" value={props.options.tabSize} onChange={onTabSizeChange} />
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography marginRight={"auto"}>Auto-detect indentation: </Typography>
        <Switch
          onChange={(e) => props.onOptionChange("detectIndentation", e.target.checked)}
          checked={props.options.detectIndentation}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography marginRight={"auto"}>Word wrap: </Typography>
        <Select
          onChange={(event) => props.onOptionChange("wordWrap", event.target.value)}
          value={props.options.wordWrap}
        >
          <MenuItem value={"off"}>Off</MenuItem>
          <MenuItem value={"on"}>On</MenuItem>
          <MenuItem value={"bounded"}>Bounded</MenuItem>
          <MenuItem value={"wordWrapColumn"}>Word Wrap Column</MenuItem>
        </Select>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography marginRight={"auto"}>Font family: </Typography>
        <TextField
          type="text"
          value={props.options.fontFamily}
          onChange={(e) => props.onOptionChange("fontFamily", e.target.value)}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography marginRight={"auto"}>Font size: </Typography>
        <TextField type="number" value={props.options.fontSize} onChange={onFontSizeChange} />
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography marginRight={"auto"}>Enable font ligatures: </Typography>
        <Switch
          onChange={(e) => props.onOptionChange("fontLigatures", e.target.checked)}
          checked={props.options.fontLigatures}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography marginRight={"auto"}>Cursor style: </Typography>
        <Select
          onChange={(event) => props.onOptionChange("cursorStyle", event.target.value)}
          value={props.options.cursorStyle}
        >
          {CURSOR_STYLES.map((cursorStyle) => (
            <MenuItem key={cursorStyle} value={cursorStyle}>
              {cursorStyle}
            </MenuItem>
          ))}
        </Select>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography marginRight={"auto"}>Cursor blinking: </Typography>
        <Select
          onChange={(event) => props.onOptionChange("cursorBlinking", event.target.value as CursorBlinking)}
          value={props.options.cursorBlinking}
        >
          {CURSOR_BLINKING_MODES.map((cursorBlinking) => (
            <MenuItem key={cursorBlinking} value={cursorBlinking}>
              {cursorBlinking}
            </MenuItem>
          ))}
        </Select>
      </div>
    </Modal>
  );
}
