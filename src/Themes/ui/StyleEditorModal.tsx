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

interface StyleFieldProps<T extends keyof React.CSSProperties> {
  name: string;
  type: "string" | "number";
  value: React.CSSProperties[T];
  onChange: (newValue: React.CSSProperties[T], error?: string) => void;
}

function StyleField<T extends keyof React.CSSProperties>({
  value,
  onChange,
  name,
  type,
}: StyleFieldProps<T>): React.ReactElement {
  const [errorText, setErrorText] = useState<string | undefined>();
  const [fieldValue, setFieldValue] = useState<React.CSSProperties[T]>(value);

  const update = (newValue: React.CSSProperties[T]) => {
    const errorText = !newValue
      ? "Must have a value"
      : type === "number" && Number.isNaN(Number(newValue))
      ? "Must be a number"
      : "";
    setFieldValue(newValue);
    setErrorText(errorText);
    onChange(newValue, errorText);
  };

  return (
    <TextField
      sx={{ my: 1 }}
      label={name}
      error={!!errorText}
      value={fieldValue}
      helperText={errorText}
      onChange={(event) => update(event.target.value as React.CSSProperties[T])}
      fullWidth
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
        <StyleField<"fontFamily">
          name="Font Family"
          type="string"
          value={customStyle.fontFamily}
          onChange={(value, error) => update({ ...customStyle, fontFamily: value ?? "" }, error)}
        />
        <br />
        <StyleField<"fontSize">
          name="Font Size"
          type="number"
          value={customStyle.fontSize}
          onChange={(value, error) => update({ ...customStyle, fontSize: Math.max(5, Number(value) ?? 8) }, error)}
        />
        <br />
        <StyleField<"fontSize">
          name="Tail Font Size"
          type="number"
          value={customStyle.tailFontSize}
          onChange={(value, error) => update({ ...customStyle, tailFontSize: Number(value) ?? 0 }, error)}
        />
        <br />
        <StyleField<"lineHeight">
          name="Line Height"
          type="number"
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
