import React from "react";

import { Table, TableCell } from "./Table";
import TableBody from "@mui/material/TableBody";
import { Table as MuiTable } from "@mui/material";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

interface IProps {
  rows: React.ReactNode[][];
  title?: React.ReactNode;
  wide?: boolean;
  centered?: boolean;
}

export function StatsTable({ rows, title, wide, centered }: IProps): React.ReactElement {
  const T = wide ? MuiTable : Table;
  return (
    <>
      {title && <Typography>{title}</Typography>}
      <T size="small" padding="none" sx={centered ? { margin: "auto" } : {}}>
        <TableBody>
          {rows.map((row: React.ReactNode[], i: number) => (
            <TableRow key={i}>
              {row.map((elem: React.ReactNode, i: number) => (
                <TableCell key={i} align={i !== 0 ? "right" : "left"} sx={i !== 0 ? { paddingLeft: "0.5em" } : {}}>
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
