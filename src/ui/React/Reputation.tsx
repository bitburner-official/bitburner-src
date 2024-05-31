import * as React from "react";
import { formatReputation } from "../formatNumber";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme: Theme) => ({
  reputation: {
    color: theme.colors.rep,
  },
}));

export function Reputation({ reputation }: { reputation: number | string }): React.ReactElement {
  const { classes } = useStyles();
  return (
    <span className={classes.reputation}>
      {typeof reputation === "number" ? formatReputation(reputation) : reputation}
    </span>
  );
}
