import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { Typography } from "@mui/material";
import React from "react";
import { Settings } from "../../Settings/Settings";

Settings.theme.primary;

export interface IReqProps {
  value: string;
  color?: string;
  incompleteColor?: string;
  fulfilled: boolean;
}

export const Requirement = (props: IReqProps): React.ReactElement => {
  const completeColor = props.color || Settings.theme.primary;
  const incompleteColor = props.incompleteColor || Settings.theme.primarydark;

  return (
    <Typography
      sx={{ display: "flex", alignItems: "center", color: props.fulfilled ? completeColor : incompleteColor }}
    >
      {props.fulfilled ? <CheckBox sx={{ mr: 1 }} /> : <CheckBoxOutlineBlank sx={{ mr: 1 }} />}
      {props.value}
    </Typography>
  );
};
