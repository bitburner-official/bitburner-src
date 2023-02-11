import { TextField, StandardTextFieldProps } from "@mui/material";
import React from "react";
import { parseBigNumber } from "../formatNumber";

interface IProps extends Omit<StandardTextFieldProps, "onChange"> {
  onChange: (v: number) => void;
}

export function NumberInput(props: IProps): React.ReactElement {
  const textProps = {
    ...props,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const amt = parseBigNumber(event.target.value);
      if (event.target.value === "" || isNaN(amt)) props.onChange(NaN);
      else props.onChange(amt);
    },
  };
  return <TextField {...textProps} />;
}
