import React, { useState } from "react";
import { Options } from "./Options";
import { Modal } from "../../ui/React/Modal";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import EditIcon from "@mui/icons-material/Edit";

import { ThemeEditorModal } from "./ThemeEditorModal";

interface IProps {
  open: boolean;
  options: Options;
  onClose: () => void;
  onChange: (option: keyof Options, value: Options[keyof Options]) => void;
}

export function OptionsModal(props: IProps): React.ReactElement {
  const [themeEditorOpen, setThemeEditorOpen] = useState(false);

  function onFontSizeChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const fontSize = parseInt(event.target.value);
    if (!Number.isFinite(fontSize) || fontSize < 1) return;
    props.onChange("fontSize", fontSize);
  }

  function onTabSizeChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const tabSize = parseInt(event.target.value);
    if (!Number.isFinite(tabSize) || tabSize < 1) return;
    props.onChange("tabSize", tabSize);
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <ThemeEditorModal open={themeEditorOpen} onClose={() => setThemeEditorOpen(false)} />
      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography>Theme: </Typography>
        <Select onChange={(event) => props.onChange("theme", event.target.value)} value={props.options.theme}>
          <MenuItem value="monokai">monokai</MenuItem>
          <MenuItem value="solarized-dark">solarized-dark</MenuItem>
          <MenuItem value="solarized-light">solarized-light</MenuItem>
          <MenuItem value="vs-dark">dark</MenuItem>
          <MenuItem value="light">light</MenuItem>
          <MenuItem value="dracula">dracula</MenuItem>
          <MenuItem value="one-dark">one-dark</MenuItem>
          <MenuItem value="customTheme">Custom theme</MenuItem>
        </Select>
        <Button onClick={() => setThemeEditorOpen(true)} sx={{ ml: 1 }} startIcon={<EditIcon />}>
          Edit custom theme
        </Button>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography marginRight={"auto"}>Indent using tabs: </Typography>
        <Switch
          onChange={(e) => props.onChange("insertSpaces", e.target.checked)}
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
          onChange={(e) => props.onChange("detectIndentation", e.target.checked)}
          checked={props.options.detectIndentation}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography marginRight={"auto"}>Word wrap: </Typography>
        <Select onChange={(event) => props.onChange("wordWrap", event.target.value)} value={props.options.wordWrap}>
          <MenuItem value={"off"}>Off</MenuItem>
          <MenuItem value={"on"}>On</MenuItem>
          <MenuItem value={"bounded"}>Bounded</MenuItem>
          <MenuItem value={"wordWrapColumn"}>Word Wrap Column</MenuItem>
        </Select>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography marginRight={"auto"}>Enable vim mode: </Typography>
        <Switch onChange={(e) => props.onChange("vim", e.target.checked)} checked={props.options.vim} />
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography marginRight={"auto"}>Font family: </Typography>
        <TextField
          type="text"
          value={props.options.fontFamily}
          onChange={(e) => props.onChange("fontFamily", e.target.value)}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography marginRight={"auto"}>Font size: </Typography>
        <TextField type="number" value={props.options.fontSize} onChange={onFontSizeChange} />
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography marginRight={"auto"}>Enable font ligatures: </Typography>
        <Switch
          onChange={(e) => props.onChange("fontLigatures", e.target.checked)}
          checked={props.options.fontLigatures}
        />
      </div>
    </Modal>
  );
}
