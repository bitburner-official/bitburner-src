import { FormControlLabel, Switch, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

type OptionSwitchProps = {
  checked: boolean;
  disabled?: boolean;
  onChange: (newValue: boolean, error?: string) => void;
  text: React.ReactNode;
  tooltip: React.ReactNode;
  wrapperStyles?: React.CSSProperties;
};

export function OptionSwitch({
  checked,
  disabled = false,
  onChange,
  text,
  tooltip,
  wrapperStyles,
}: OptionSwitchProps): React.ReactElement {
  const [value, setValue] = useState(checked);

  function handleSwitchChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const newValue = event.target.checked;
    setValue(newValue);
    onChange(newValue);
  }

  useEffect(() => {
    setValue(checked);
  }, [checked]);

  return (
    <div style={wrapperStyles}>
      <FormControlLabel
        disabled={disabled}
        control={<Switch checked={value} onChange={handleSwitchChange} />}
        label={
          <Tooltip title={<Typography component="div">{tooltip}</Typography>}>
            <Typography component="div">{text}</Typography>
          </Tooltip>
        }
      />
    </div>
  );
}
