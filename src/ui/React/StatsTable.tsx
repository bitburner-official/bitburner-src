import React, { ReactNode, ReactElement } from "react";

import { Table, TableCell } from "./Table";
import { TableBody, TableRow, Table as MuiTable, Typography } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import type { Property } from "csstype";

interface StatsTableProps {
  rows: ReactNode[][];
  title?: string;
  wide?: boolean;
  textAlign?: Property.TextAlign;
  paddingLeft?: string;
}

const useStyles = (textAlign: Property.TextAlign, paddingLeft: string) =>
  makeStyles()({
    firstCell: { textAlign: "left" },
    nonFirstCell: { textAlign: textAlign, paddingLeft: paddingLeft },
  })();

export function StatsTable({ rows, title, wide, textAlign, paddingLeft }: StatsTableProps): ReactElement {
  const T = wide ? MuiTable : Table;
  const { classes } = useStyles(textAlign ?? "right", paddingLeft ?? "0.5em");
  return (
    <>
      {title && <Typography>{title}</Typography>}
      <T size="small" padding="none">
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex} className={cellIndex === 0 ? classes.firstCell : classes.nonFirstCell}>
                  <Typography component="div" noWrap>
                    {cell}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </T>
    </>
  );
}
