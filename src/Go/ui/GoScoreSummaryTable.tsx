import type { GoScore } from "../Types";

import React from "react";
import { Table, TableBody, TableCell, TableRow, Tooltip } from "@mui/material";

import { GoOpponent, GoColor } from "@enums";
import { boardStyles } from "../boardState/goStyles";

interface GoScoreSummaryTableProps {
  score: GoScore;
  opponent: GoOpponent;
}

export const GoScoreSummaryTable = ({ score, opponent }: GoScoreSummaryTableProps) => {
  const { classes } = boardStyles({});
  const blackScore = score[GoColor.black];
  const whiteScore = score[GoColor.white];
  const blackPlayerName = opponent === GoOpponent.none ? GoColor.black : "你";
  const whitePlayerName = opponent === GoOpponent.none ? GoColor.white : opponent;

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
            <TableCell className={classes.cellNone}>占据的空节点：</TableCell>
            <TableCell className={classes.cellNone}>{whiteScore.territory}</TableCell>
            <TableCell className={classes.cellNone}>{blackScore.territory}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classes.cellNone}>已放置路由器：</TableCell>
            <TableCell className={classes.cellNone}>{whiteScore.pieces}</TableCell>
            <TableCell className={classes.cellNone}>{blackScore.pieces}</TableCell>
          </TableRow>
          <Tooltip
            title={
              <>
                贴目代表当前派系在此子网的主场优势，
                <br />
                用以平衡执黑路由器一方玩家的先行之利。
              </>
            }
          >
            <TableRow>
              <TableCell className={classes.cellNone}>贴目：</TableCell>
              <TableCell className={classes.cellNone}>{whiteScore.komi}</TableCell>
              <TableCell className={classes.cellNone} />
            </TableRow>
          </Tooltip>
          <TableRow>
            <TableCell className={classes.cellNone}>
              <br />
              <strong className={classes.keyText}>总分：</strong>
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
