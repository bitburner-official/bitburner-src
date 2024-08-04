import * as React from "react";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme: Theme) => ({
  aug: {
    color: theme.colors.combat,
  },
}));

export function Augmentation({ name }: { name: string }): JSX.Element {
  const { classes } = useStyles();
  return <span className={classes.aug}>{name}</span>;
}
