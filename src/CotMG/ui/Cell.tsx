import * as React from "react";

import { makeStyles } from "tss-react/mui";
import { TableCell as MuiTableCell, TableCellProps } from "@mui/material";

const useStyles = makeStyles()({
  root: {
    border: "1px solid white",
    width: "5px",
    height: "5px",
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

interface IProps {
  onMouseEnter?: () => void;
  onClick?: () => void;
  color: string;
  borderBottom?: number;
  borderRight?: number;
  borderTop?: number;
  borderLeft?: number;
}

export function Cell(cellProps: IProps): React.ReactElement {
  return (
    <TableCell
      style={{
        backgroundColor: cellProps.color,
        borderBottomWidth: cellProps.borderBottom,
        borderRightWidth: cellProps.borderRight,
        borderTopWidth: cellProps.borderTop,
        borderLeftWidth: cellProps.borderLeft,
      }}
      onMouseEnter={cellProps.onMouseEnter}
      onClick={cellProps.onClick}
    ></TableCell>
  );
}
