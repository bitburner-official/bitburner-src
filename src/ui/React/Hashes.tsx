import * as React from "react";

import { Theme } from "@mui/material/styles";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";

import { formatHashes } from "../formatNumber";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    money: {
      color: theme.colors.money,
    },
  }),
);

export function Hashes({ hashes }: { hashes: number | string }): React.ReactElement {
  const classes = useStyles();
  return <span className={classes.money}>{typeof hashes === "number" ? formatHashes(hashes) : hashes}</span>;
}
