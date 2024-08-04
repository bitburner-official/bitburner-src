import * as React from "react";
import { formatHashes } from "../formatNumber";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme: Theme) => ({
  money: {
    color: theme.colors.money,
  },
}));

export function Hashes({ hashes }: { hashes: number | string }): React.ReactElement {
  const { classes } = useStyles();
  return <span className={classes.money}>{typeof hashes === "number" ? formatHashes(hashes) : hashes}</span>;
}
