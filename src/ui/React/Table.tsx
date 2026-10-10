import { styled } from "@mui/material/styles";
import { TableCell as MuiTableCell, Table as MuiTable } from "@mui/material";

export const TableCell = styled(MuiTableCell)({
  borderBottom: "none",
});

export const Table = styled(MuiTable)({
  width: "1px",
});
