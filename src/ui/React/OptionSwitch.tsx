import { FormControlLabel, Switch, Tooltip, Typography } from "@mui/material";
import React, { useState } from "react";

type OptionSwitchProps = {
  checked: boolean;
  onChange: (newValue: boolean, error?: string) => void;
  text: React.ReactNode;
  tooltip: React.ReactNode;
};

export function OptionSwitch({ checked, onChange, text, tooltip }: OptionSwitchProps): React.ReactElement {
  const [value, setValue] = useState(checked);

  function handleSwitchChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const newValue = event.target.checked;
    setValue(newValue);
    onChange(newValue);
  }

  return (
    <>
      <FormControlLabel
        control={<Switch checked={value} onChange={handleSwitchChange} />}
        label={
          <Tooltip title={<Typography>{tooltip}</Typography>}>
            <Typography>{text}</Typography>
          </Tooltip>
        }
      />
      <br />
    </>
  );
}
