/**
 * React Component for displaying the total production and production rate
 * of scripts on the 'Active Scripts' UI page
 */
import * as React from "react";

import { Money } from "../React/Money";
import { MoneyRate } from "../React/MoneyRate";
import { Player } from "@player";

import { Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";

const cellSx = {
  borderBottom: "none",
  p: 1,
  m: 1,
  whiteSpace: "nowrap",
};

export function ScriptProduction(): React.ReactElement {
  let prodRateSinceLastAug = Player.scriptProdSinceLastAug / (Player.playtimeSinceLastAug / 1000);
  if (!Number.isFinite(prodRateSinceLastAug)) {
    prodRateSinceLastAug = 0;
  }

  return (
    <Table size="small" sx={{ width: "1px" }}>
      <TableBody>
        <TableRow>
          <TableCell component="th" scope="row" sx={cellSx}>
            <Typography variant="body2">Total production since last Augment Installation:</Typography>
          </TableCell>
          <TableCell align="left" sx={cellSx}>
            <Typography variant="body2">
              <Money money={Player.scriptProdSinceLastAug} />
            </Typography>
          </TableCell>
          <TableCell align="left" sx={cellSx}>
            <Typography variant="body2">
              (<MoneyRate money={prodRateSinceLastAug} />)
            </Typography>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
