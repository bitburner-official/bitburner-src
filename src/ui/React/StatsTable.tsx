import React from "react";

import { Table, TableCell } from "./Table";
import TableBody from "@mui/material/TableBody";
import { Table as MuiTable } from "@mui/material";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

interface IProps {
  rows: React.ReactNode[][];
  title?: string;
  wide?: boolean;
}

export function StatsTable({ rows, title, wide }: IProps): React.ReactElement {
  const T = wide ? MuiTable : Table;
  return (
    <>
      {title && <Typography>{title}</Typography>}
      <T size="small" padding="none">
        <TableBody>
          {rows.map((row: React.ReactNode[], i: number) => (
            <TableRow key={i}>
              {row.map((elem: React.ReactNode, i: number) => (
                <TableCell key={i} align={i !== 0 ? "right" : "left"}>
                  <Typography noWrap>{elem}</Typography>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </T>
    </>
  );
}
