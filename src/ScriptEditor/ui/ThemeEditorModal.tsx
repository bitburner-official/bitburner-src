import React from "react";
import _ from "lodash";

import { Grid, Box, Button, IconButton, Paper, TextField, Tooltip, Typography } from "@mui/material";
import { History, Reply } from "@mui/icons-material";

import { Settings } from "../../Settings/Settings";
import { useRerender } from "../../ui/React/hooks";
import { Modal } from "../../ui/React/Modal";
import { OptionSwitch } from "../../ui/React/OptionSwitch";

import { defaultMonacoTheme } from "./themes";
import { OpenColorPickerButton } from "../../Themes/ui/ColorPicker";

type ColorEditorProps = {
  label: string;
  themePath: string;
  color: string | undefined;
  onColorChange: (name: string, value: string) => void;
  defaultColor: string;
};

// Slightly tweaked version of the same function found in game options
function ColorEditor({ label, themePath, onColorChange, color, defaultColor }: ColorEditorProps): React.ReactElement {
  if (color === undefined) {
    console.error(`color ${themePath} was undefined, reverting to default`);
    color = defaultColor;
  }
  return (
    <Tooltip title={label}>
      <span>
        <TextField
          label={themePath}
          value={"#" + color}
          sx={{ display: "block", my: 1 }}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <OpenColorPickerButton
                title={""}
                color={`#${color}`}
                onColorChange={(c) => onColorChange(themePath, c)}
              />
            ),
            endAdornment: (
              <IconButton onClick={() => onColorChange(themePath, defaultColor)}>
                <Reply color="primary" />
              </IconButton>
            ),
          }}
        />
      </span>
    </Tooltip>
  );
}

type ThemeEditorProps = {
  onClose: () => void;
  onChange: () => void;
  open: boolean;
};

export function ThemeEditorModal(props: ThemeEditorProps): React.ReactElement {
  const rerender = useRerender();

  function onThemePropChange(prop: string, value: string): void {
    _.set(Settings.EditorTheme, prop, value);
    props.onChange();
    rerender();
  }

  function onThemeChange(event: React.ChangeEvent<HTMLInputElement>): void {
    try {
      const importedTheme = JSON.parse(event.target.value);
      if (typeof importedTheme !== "object") return;
      Settings.EditorTheme = importedTheme;
      props.onChange();
    } catch (err) {
      // ignore
    }
  }

  const onResetToDefault = () => {
    Settings.EditorTheme = defaultMonacoTheme;
    props.onChange();
    rerender();
  };

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography variant="h4">Customize Editor theme</Typography>
      <Typography>Hover over input boxes for more information</Typography>
      <Paper sx={{ p: 1, my: 1 }}>
        <OptionSwitch
          checked={Settings.EditorTheme.base === "vs"}
          onChange={(val) => {
            onThemePropChange("base", val ? "vs" : "vs-dark");
          }}
          text="Use light theme as base"
          tooltip={
            <>
              If enabled, the <code>vs</code> light theme will be used as the theme base, otherwise,{" "}
              <code>vs-dark</code> will be used.
            </>
          }
        />
        <Grid container gap={1} columns={2}>
          <Grid item>
            <Typography variant="h6">UI</Typography>
            <ColorEditor
              label="Background color"
              themePath="common.bg"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.common.bg}
              defaultColor={defaultMonacoTheme.common.bg}
            />
            <ColorEditor
              label="Current line and minimap background color"
              themePath="ui.line"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.ui.line}
              defaultColor={defaultMonacoTheme.ui.line}
            />
            <ColorEditor
              label="Base text color"
              themePath="common.fg"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.common.fg}
              defaultColor={defaultMonacoTheme.common.fg}
            />
            <ColorEditor
              label="Popup background color"
              themePath="ui.panel.bg"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.ui.panel.bg}
              defaultColor={defaultMonacoTheme.ui.panel.bg}
            />
            <ColorEditor
              label="Background color for selected item in popup"
              themePath="ui.panel.selected"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.ui.panel.selected}
              defaultColor={defaultMonacoTheme.ui.panel.selected}
            />
            <ColorEditor
              label="Popup border color"
              themePath="ui.panel.border"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.ui.panel.border}
              defaultColor={defaultMonacoTheme.ui.panel.border}
            />
            <ColorEditor
              label="Background color of highlighted text"
              themePath="ui.selection.bg"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.ui.selection.bg}
              defaultColor={defaultMonacoTheme.ui.selection.bg}
            />
          </Grid>
          <Grid item>
            <Typography variant="h6">Syntax</Typography>
            <ColorEditor
              label="Numbers, function names, and other key vars"
              themePath="common.accent"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.common.accent}
              defaultColor={defaultMonacoTheme.common.accent}
            />
            <ColorEditor
              label="Keywords"
              themePath="syntax.keyword"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.syntax.keyword}
              defaultColor={defaultMonacoTheme.syntax.keyword}
            />
            <ColorEditor
              label="Strings"
              themePath="syntax.string"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.syntax.string}
              defaultColor={defaultMonacoTheme.syntax.string}
            />
            <ColorEditor
              label="Regexp literals as well as escapes within strings"
              themePath="syntax.regexp"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.syntax.regexp}
              defaultColor={defaultMonacoTheme.syntax.regexp}
            />
            <ColorEditor
              label="Constants"
              themePath="syntax.constant"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.syntax.constant}
              defaultColor={defaultMonacoTheme.syntax.constant}
            />
            <ColorEditor
              label="Entities"
              themePath="syntax.entity"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.syntax.entity}
              defaultColor={defaultMonacoTheme.syntax.entity}
            />
            <ColorEditor
              label="'this', 'ns', types, and tags"
              themePath="syntax.tag"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.syntax.tag}
              defaultColor={defaultMonacoTheme.syntax.tag}
            />
            <ColorEditor
              label="Netscript functions and constructors"
              themePath="syntax.markup"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.syntax.markup}
              defaultColor={defaultMonacoTheme.syntax.markup}
            />
            <ColorEditor
              label="Errors"
              themePath="syntax.error"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.syntax.error}
              defaultColor={defaultMonacoTheme.syntax.error}
            />
            <ColorEditor
              label="Comments"
              themePath="syntax.comment"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.syntax.comment}
              defaultColor={defaultMonacoTheme.syntax.comment}
            />
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p: 1 }}>
        <TextField
          multiline
          fullWidth
          maxRows={10}
          label={"import / export theme"}
          value={JSON.stringify(Settings.EditorTheme, undefined, 2)}
          onChange={onThemeChange}
        />
        <Box sx={{ mt: 1 }}>
          <Button onClick={onResetToDefault} startIcon={<History />}>
            Reset to default
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
}
