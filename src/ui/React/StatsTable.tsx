import React, { ReactNode, ReactElement } from "react";

import { Table, TableCell } from "./Table";
import { TableBody, TableRow, Table as MuiTable, Typography } from "@mui/material";
import type { Property } from "csstype";

interface StatsTableProps {
  rows: ReactNode[][];
  title?: string;
  wide?: boolean;
  textAlign?: Property.TextAlign;
  paddingLeft?: string;
}

export function StatsTable({ rows, title, wide, textAlign, paddingLeft }: StatsTableProps): ReactElement {
  const T = wide ? MuiTable : Table;
  return (
    <>
      {title && <Typography>{title}</Typography>}
      <T size="small" padding="none">
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <TableCell
                  key={cellIndex}
                  sx={
                    cellIndex === 0
                      ? { textAlign: "left" }
                      : { textAlign: textAlign ?? "right", paddingLeft: paddingLeft ?? "0.5em" }
                  }
                >
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
