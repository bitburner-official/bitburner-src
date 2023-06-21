import React, { useState } from "react";
import { Modal } from "../../ui/React/Modal";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import ReplyIcon from "@mui/icons-material/Reply";
import SaveIcon from "@mui/icons-material/Save";

import { ThemeEvents } from "./Theme";
import { Settings } from "../../Settings/Settings";
import { defaultStyles } from "../Styles";
import { Tooltip } from "@mui/material";
import { IStyleSettings } from "@nsdefs";

interface IProps {
  open: boolean;
  onClose: () => void;
}

interface FontFamilyProps {
  value: React.CSSProperties["fontFamily"];
  onChange: (newValue: React.CSSProperties["fontFamily"], error?: string) => void;
}

function FontFamilyField({ value, onChange }: FontFamilyProps): React.ReactElement {
  const [errorText, setErrorText] = useState<string | undefined>();
  const [fontFamily, setFontFamily] = useState<React.CSSProperties["fontFamily"]>(value);

  const update = (newValue: React.CSSProperties["fontFamily"]) => {
    const errorText = newValue ? "" : "Must have a value";
    setFontFamily(newValue);
    setErrorText(errorText);
    onChange(newValue, errorText);
  };

  return (
    <TextField
      sx={{ my: 1 }}
      label={"Font-Family"}
      error={!!errorText}
      value={fontFamily}
      helperText={errorText}
      onChange={(event) => update(event.target.value)}
      fullWidth
    />
  );
}

interface LineHeightProps {
  value: React.CSSProperties["lineHeight"];
  onChange: (newValue: React.CSSProperties["lineHeight"], error?: string) => void;
}

function LineHeightField({ value, onChange }: LineHeightProps): React.ReactElement {
  const [errorText, setErrorText] = useState<string | undefined>();
  const [lineHeight, setLineHeight] = useState<React.CSSProperties["lineHeight"]>(value);

  const update = (newValue: React.CSSProperties["lineHeight"]) => {
    const errorText = !newValue ? "Must have a value" : isNaN(Number(newValue)) ? "Must be a number" : "";

    setLineHeight(newValue);
    setErrorText(errorText);
    onChange(newValue, errorText);
  };

  return (
    <TextField
      sx={{ my: 1 }}
      label={"Line Height"}
      error={!!errorText}
      value={lineHeight}
      helperText={errorText}
      onChange={(event) => update(event.target.value)}
    />
  );
}

export function StyleEditorModal(props: IProps): React.ReactElement {
  const [error, setError] = useState<string | undefined>();
  const [customStyle, setCustomStyle] = useState<IStyleSettings>({
    ...Settings.styles,
  });

  function persistToSettings(styles: IStyleSettings): void {
    Object.assign(Settings.styles, styles);
    ThemeEvents.emit();
  }

  function saveStyles(): void {
    persistToSettings(customStyle);
  }

  function setDefaults(): void {
    const styles = { ...defaultStyles };
    setCustomStyle(styles);
    persistToSettings(styles);
  }

  function update(styles: IStyleSettings, errorMessage?: string): void {
    setError(errorMessage);
    if (!errorMessage) {
      setCustomStyle(styles);
    }
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography variant="h6">Styles Editor</Typography>
      <Typography>
        WARNING: Changing styles <strong>may mess up</strong> the interface. Drastic changes are{" "}
        <strong>NOT recommended</strong>.
      </Typography>
      <Paper sx={{ p: 2, my: 2 }}>
        <FontFamilyField
          value={customStyle.fontFamily}
          onChange={(value, error) => update({ ...customStyle, fontFamily: value ?? "" }, error)}
        />
        <br />
        <LineHeightField
          value={customStyle.lineHeight}
          onChange={(value, error) => update({ ...customStyle, lineHeight: Number(value) ?? 0 }, error)}
        />
        <br />
        <ButtonGroup sx={{ my: 1 }}>
          <Button onClick={setDefaults} startIcon={<ReplyIcon />} color="secondary" variant="outlined">
            Revert to Defaults
          </Button>
          <Tooltip title={"Save styles to settings"}>
            <Button onClick={saveStyles} endIcon={<SaveIcon />} color={error ? "error" : "primary"} disabled={!!error}>
              Save Modifications
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Paper>
    </Modal>
  );
}
