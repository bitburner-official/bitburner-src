import React from "react";

import { Typography, TableCell, TableRow } from "@mui/material";

import { formatExp, formatSkill } from "../formatNumber";
import { useStyles } from "./CharacterOverview";

interface ITableRowData {
  content?: string;
  level?: number;
  exp?: number;
}

interface IProps {
  name: string;
  color: string;
  data?: ITableRowData;
  children?: React.ReactElement;
}

export const StatsRow = ({ name, color, children, data }: IProps): React.ReactElement => {
  const { classes } = useStyles();

  let content = "";
  if (data) {
    if (data.content !== undefined) {
      content = data.content;
    } else if (data.level !== undefined && data.exp !== undefined) {
      content = `${formatSkill(data.level)} (${formatExp(data.exp)} exp)`;
    } else if (data.level !== undefined && data.exp === undefined) {
      content = `${formatSkill(data.level)}`;
    }
  }

  return (
    <TableRow>
      <TableCell classes={{ root: classes.cellNone }}>
        <Typography style={{ color: color }}>{name}</Typography>
      </TableCell>
      <TableCell align="right" classes={{ root: classes.cellNone }}>
        {content && <Typography style={{ color: color }}>{content}</Typography>}
        {children}
      </TableCell>
    </TableRow>
  );
};
