import React from "react";

import { Typography, TableCell, TableRow } from "@mui/material";

import { formatExp, formatSkill } from "../formatNumber";
import { cellNoneSx } from "./CharacterOverview";

interface ITableRowData {
  content?: string;
  level?: number;
  exp?: number;
}

interface IProps {
  name: string | React.ReactElement;
  color: string;
  data?: ITableRowData;
  children?: React.ReactElement;
}

export const StatsRow = ({ name, color, children, data }: IProps): React.ReactElement => {
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
      <TableCell sx={cellNoneSx}>
        <Typography style={{ color: color }}>{name}</Typography>
      </TableCell>
      <TableCell align="right" sx={cellNoneSx}>
        {content && <Typography style={{ color: color }}>{content}</Typography>}
        {children}
      </TableCell>
    </TableRow>
  );
};
