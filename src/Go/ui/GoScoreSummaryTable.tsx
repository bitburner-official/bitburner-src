import React from "react";
import { Table, TableBody, TableCell, TableRow, Tooltip } from "@mui/material";
import { boardStyles } from "../boardState/goStyles";
import { goScore, opponents, playerColors } from "../boardState/goConstants";

interface IProps {
  score: goScore;
  opponent: opponents;
}

export const GoScoreSummaryTable = ({ score, opponent }: IProps) => {
  const classes = boardStyles();
  const blackScore = score[playerColors.black];
  const whiteScore = score[playerColors.white];
  const blackPlayerName = opponent === opponents.none ? "Black" : "You";
  const whitePlayerName = opponent === opponents.none ? "White" : opponent;

  return (
    <>
      <br />
      <Table sx={{ display: "table", mb: 1, width: "100%" }}>
        <TableBody>
          <TableRow>
            <TableCell className={classes.cellNone} />
            <TableCell className={classes.cellNone}>
              <strong>{whitePlayerName}:</strong>
            </TableCell>
            <TableCell className={classes.cellNone}>
              <strong>{blackPlayerName}:</strong>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classes.cellNone}>Owned Empty Nodes:</TableCell>
            <TableCell className={classes.cellNone}>{whiteScore.territory}</TableCell>
            <TableCell className={classes.cellNone}>{blackScore.territory}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classes.cellNone}>Routers placed:</TableCell>
            <TableCell className={classes.cellNone}>{whiteScore.pieces}</TableCell>
            <TableCell className={classes.cellNone}>{blackScore.pieces}</TableCell>
          </TableRow>
          <Tooltip
            title={
              <>
                Komi represents the current faction's home-field advantage on this subnet, <br />
                to balance the first-move advantage that the player with the black routers has.
              </>
            }
          >
            <TableRow>
              <TableCell className={classes.cellNone}>Komi:</TableCell>
              <TableCell className={classes.cellNone}>{whiteScore.komi}</TableCell>
              <TableCell className={classes.cellNone} />
            </TableRow>
          </Tooltip>
          <TableRow>
            <TableCell className={classes.cellNone}>
              <br />
              <strong className={classes.keyText}>Total score:</strong>
            </TableCell>
            <TableCell className={classes.cellNone}>
              <strong className={classes.keyText}>{whiteScore.sum}</strong>
            </TableCell>
            <TableCell className={classes.cellNone}>
              <strong className={classes.keyText}>{blackScore.sum}</strong>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  );
};
