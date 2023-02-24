import React, { useState } from "react";
import { Options, WordWrapOptions } from "./Options";
import { Modal } from "../../ui/React/Modal";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

import { ThemeEditorModal } from "./ThemeEditorModal";

interface IProps {
  options: Options;
  save: (options: Options) => void;
  onClose: () => void;
  open: boolean;
}

export function OptionsModal(props: IProps): React.ReactElement {
  const [theme, setTheme] = useState(props.options.theme);
  const [insertSpaces, setInsertSpaces] = useState(props.options.insertSpaces);
  const [tabSize, setTabSize] = useState(props.options.tabSize);
  const [detectIndentation, setDetectIndentation] = useState(props.options.detectIndentation);
  const [fontFamily, setFontFamily] = useState(props.options.fontFamily);
  const [fontSize, setFontSize] = useState(props.options.fontSize);
  const [fontLigatures, setFontLigatures] = useState(props.options.fontLigatures);
  const [wordWrap, setWordWrap] = useState(props.options.wordWrap);
  const [vim, setVim] = useState(props.options.vim);
  const [themeEditorOpen, setThemeEditorOpen] = useState(false);

  function save(): void {
    props.save({
      theme,
      insertSpaces,
      tabSize,
      detectIndentation,
      fontFamily,
      fontSize,
      fontLigatures,
      wordWrap,
      vim,
    });
    props.onClose();
  }

  function onFontSizeChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const n = parseInt(event.target.value);
    if (!Number.isFinite(n) || n < 1) return;
    setFontSize(n);
  }

  function onTabSizeChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const n = parseInt(event.target.value);
    if (!Number.isFinite(n) || n < 1) return;
    setTabSize(n);
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <ThemeEditorModal open={themeEditorOpen} onClose={() => setThemeEditorOpen(false)} />
      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography>Theme: </Typography>
        <Select onChange={(event) => setTheme(event.target.value)} value={theme}>
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
        <Switch onChange={(e) => setInsertSpaces(e.target.checked)} checked={insertSpaces} />
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography marginRight={"auto"}>Tab size: </Typography>
        <TextField type="number" value={tabSize} onChange={onTabSizeChange} />
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography marginRight={"auto"}>Auto-detect indentation: </Typography>
        <Switch onChange={(e) => setDetectIndentation(e.target.checked)} checked={detectIndentation} />
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography marginRight={"auto"}>Word wrap: </Typography>
        <Select onChange={(event) => setWordWrap(event.target.value as WordWrapOptions)} value={wordWrap}>
          <MenuItem value={"off"}>Off</MenuItem>
          <MenuItem value={"on"}>On</MenuItem>
          <MenuItem value={"bounded"}>Bounded</MenuItem>
          <MenuItem value={"wordWrapColumn"}>Word Wrap Column</MenuItem>
        </Select>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography marginRight={"auto"}>Enable vim mode: </Typography>
        <Switch onChange={(e) => setVim(e.target.checked)} checked={vim} />
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography marginRight={"auto"}>Font family: </Typography>
        <TextField type="text" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} />
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography marginRight={"auto"}>Font size: </Typography>
        <TextField type="number" value={fontSize} onChange={onFontSizeChange} />
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography marginRight={"auto"}>Enable font ligatures: </Typography>
        <Switch onChange={(e) => setFontLigatures(e.target.checked)} checked={fontLigatures} />
      </div>

      <br />
      <Button onClick={save} startIcon={<SaveIcon />}>
        Save
      </Button>
    </Modal>
  );
}
