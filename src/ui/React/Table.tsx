import { styled } from "@mui/material/styles";
import { TableCell as MuiTableCell, Table as MuiTable } from "@mui/material";

export const TableCell = styled(MuiTableCell)({
  // Doesn't work with .root any longer, though .root's never been applied to this
  borderBottom: "none",
});

export const Table = styled(MuiTable)({
  // Doesn't work with .root any longer, though .root's never been applied to this
  width: "1px",
});
