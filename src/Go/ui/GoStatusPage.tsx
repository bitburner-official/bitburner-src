import React from "react";
import Typography from "@mui/material/Typography";

import { opponentList } from "../boardState/goConstants";
import { getScore } from "../boardAnalysis/scoring";
import { Player } from "@player";
import { Grid, Table, TableBody, TableCell, TableRow } from "@mui/material";
import { GoGameboard } from "./GoGameboard";
import { boardStyles } from "../boardState/goStyles";
import { useRerender } from "../../ui/React/hooks";
import { getBonusText } from "../effects/effect";
import { GoScoreSummaryTable } from "./GoScoreSummaryTable";

export const GoStatusPage = (): React.ReactElement => {
  useRerender(400);
  const classes = boardStyles();
  const score = getScore(Player.go.boardState);
  const opponent = Player.go.boardState.ai;

  return (
    <div>
      <Grid container>
        <Grid item>
          <div className={classes.statusPageScore}>
            <Typography variant="h5">Current Subnet:</Typography>
            <GoScoreSummaryTable score={score} opponent={opponent} />
          </div>
        </Grid>
        <Grid item>
          <div className={classes.statusPageGameboard}>
            <GoGameboard
              boardState={Player.go.boardState}
              traditional={false}
              clickHandler={(x, y) => ({ x, y })}
              hover={false}
            />
          </div>
        </Grid>
      </Grid>
      <br />
      <Typography variant="h5">Summary of All Subnet Boosts:</Typography>
      <br />
      <Table sx={{ display: "table", mb: 1, width: "550px" }}>
        <TableBody>
          <TableRow>
            <TableCell className={classes.cellNone}>
              <strong>Faction:</strong>
            </TableCell>
            <TableCell className={classes.cellNone}>
              <strong>Effect:</strong>
            </TableCell>
          </TableRow>
          {opponentList.map((faction, index) => {
            return (
              <TableRow key={index}>
                <TableCell className={classes.cellNone}>
                  <br />
                  <span>{faction}:</span>
                </TableCell>
                <TableCell className={classes.cellNone}>
                  <br />
                  <strong className={classes.keyText}>{getBonusText(faction)}</strong>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
