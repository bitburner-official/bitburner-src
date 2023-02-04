import { Paper, Typography } from "@mui/material";
import React from "react";
import { OptionsTabName } from "./GameOptionsRoot";

interface IProps {
  children: React.ReactNode;
  title: OptionsTabName;
}

export const GameOptionsPage = (props: IProps): React.ReactElement => {
  return (
    <Paper sx={{ height: "fit-content", p: 1 }}>
      <Typography variant="h6">{props.title}</Typography>
      {props.children}
    </Paper>
  );
};
