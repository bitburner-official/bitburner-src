import * as React from "react";
import { TableCell as MuiTableCell, TableCellProps } from "@mui/material";

export const TableCell: React.FC<TableCellProps> = (props: TableCellProps) => {
  return (
    <MuiTableCell
      {...props}
      sx={{
        border: "1px solid white",
        width: "5px",
        height: "5px",
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
