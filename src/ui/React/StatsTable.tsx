import React, { ReactNode, ReactElement } from "react";

import { Table, TableCell } from "./Table";
import { TableBody, TableRow, Table as MuiTable, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

interface StatsTableProps {
  rows: ReactNode[][];
  title?: string;
  wide?: boolean;
}

const useStyles = makeStyles({
  firstCell: { textAlign: "left" },
  nonFirstCell: { textAlign: "right", paddingLeft: "0.5em" },
});

export function StatsTable({ rows, title, wide }: StatsTableProps): ReactElement {
  const T = wide ? MuiTable : Table;
  const classes = useStyles();
  return (
    <>
      {title && <Typography>{title}</Typography>}
      <T size="small" padding="none">
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex} className={cellIndex === 0 ? classes.firstCell : classes.nonFirstCell}>
                  <Typography noWrap>{cell}</Typography>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </T>
    </>
  );
}
