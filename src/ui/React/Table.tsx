import React from "react";
import { TableCell as MuiTableCell, TableCellProps, Table as MuiTable, TableProps } from "@mui/material";

import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  root: {
    borderBottom: "none",
  },
  small: {
    width: "1px",
  },
});

export const TableCell: React.FC<TableCellProps> = (props: TableCellProps) => {
  return (
    <MuiTableCell
      {...props}
      classes={{
        root: useStyles().classes.root,
        ...props.classes,
      }}
    />
  );
};

export const Table: React.FC<TableProps> = (props: TableProps) => {
  return (
    <MuiTable
      {...props}
      classes={{
        root: useStyles().classes.small,
        ...props.classes,
      }}
    />
  );
};
