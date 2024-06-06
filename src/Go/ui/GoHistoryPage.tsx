import React from "react";
import { Grid, Table, TableBody, TableCell, TableRow, Tooltip, Typography } from "@mui/material";

import { GoOpponent } from "@enums";
import { Go } from "../Go";
import { getOpponentStats, getScore } from "../boardAnalysis/scoring";
import { GoGameboard } from "./GoGameboard";
import { boardStyles } from "../boardState/goStyles";
import { useRerender } from "../../ui/React/hooks";
import { getBonusText, getMaxFavor } from "../effects/effect";
import { formatNumber } from "../../ui/formatNumber";
import { GoScoreSummaryTable } from "./GoScoreSummaryTable";
import { getNewBoardState } from "../boardState/boardState";
import { CorruptableText } from "../../ui/React/CorruptableText";
import { getRecordKeys } from "../../Types/Record";

export const GoHistoryPage = (): React.ReactElement => {
  useRerender(400);
  const { classes } = boardStyles();
  const priorBoard = Go.previousGame ?? getNewBoardState(7);
  const score = getScore(priorBoard);
  const opponent = priorBoard.ai;
  const opponentsToShow = getRecordKeys(Go.stats);

  return (
    <div>
      <Grid container>
        <Grid item>
          <div className={classes.statusPageScore}>
            <Typography variant="h5">Previous Subnet:</Typography>
            <GoScoreSummaryTable score={score} opponent={opponent} />
          </div>
        </Grid>
        <Grid item>
          <div className={`${classes.historyPageGameboard} ${classes.translucent}`}>
            <GoGameboard
              boardState={priorBoard}
              traditional={false}
              clickHandler={(x, y) => ({ x, y })}
              hover={false}
            />
          </div>
        </Grid>
      </Grid>
      <br />
      <br />
      <Typography variant="h5">Faction Stats:</Typography>
      <Grid container style={{ maxWidth: "1020px" }}>
        {opponentsToShow.map((faction, index) => {
          const data = getOpponentStats(faction);
          return (
            <Grid item key={opponentsToShow[index]} className={classes.factionStatus}>
              <Typography>
                {" "}
                <strong className={classes.keyText}>
                  {faction === GoOpponent.w0r1d_d43m0n ? (
                    <CorruptableText content="????????????" spoiler={false} />
                  ) : (
                    faction
                  )}
                </strong>
              </Typography>
              <Table sx={{ display: "table", mb: 1, width: "100%" }}>
                <TableBody>
                  <TableRow>
                    <TableCell className={classes.cellNone}>Wins:</TableCell>
                    <TableCell className={classes.cellNone}>
                      {data.wins} / {data.losses + data.wins}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.cellNone}>Current winstreak:</TableCell>
                    <TableCell className={classes.cellNone}>{data.winStreak}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={`${classes.cellNone} ${classes.cellBottomPadding}`}>
                      Highest winstreak:
                    </TableCell>
                    <TableCell className={`${classes.cellNone} ${classes.cellBottomPadding}`}>
                      {data.highestWinStreak}
                    </TableCell>
                  </TableRow>
                  <Tooltip
                    title={
                      <>
                        The total number of empty points and routers <br /> you took control of, across all subnets
                      </>
                    }
                  >
                    <TableRow>
                      <TableCell className={classes.cellNone}>Captured nodes:</TableCell>
                      <TableCell className={classes.cellNone}>{data.nodes}</TableCell>
                    </TableRow>
                  </Tooltip>
                  <Tooltip
                    title={
                      <>
                        Node power is what stat bonuses scale from, and is gained on each completed subnet. <br />
                        It is calculated from the number of nodes you control, multiplied by modifiers for the <br />
                        opponent difficulty, if you won or lost, and your current winstreak.
                      </>
                    }
                  >
                    <TableRow>
                      <TableCell className={`${classes.cellNone} ${classes.cellBottomPadding}`}>Node power:</TableCell>
                      <TableCell className={`${classes.cellNone} ${classes.cellBottomPadding}`}>
                        {formatNumber(data.nodePower, 2)}
                      </TableCell>
                    </TableRow>
                  </Tooltip>
                  <Tooltip
                    title={
                      <>
                        Win streaks against a faction will give you +1 favor to that faction <br />
                        at certain numbers of wins (up to a max of {getMaxFavor()} favor), <br />
                        if you are currently a member of that faction
                      </>
                    }
                  >
                    <TableRow>
                      <TableCell className={classes.cellNone}>Favor from winstreaks:</TableCell>
                      <TableCell className={classes.cellNone}>
                        {data.favor ?? 0} {data.favor === getMaxFavor() ? "(max)" : ""}
                      </TableCell>
                    </TableRow>
                  </Tooltip>
                </TableBody>
              </Table>
              <br />
              <Tooltip title={<>The total stat multiplier gained via your current node power.</>}>
                <Typography>
                  <strong className={classes.keyText}>Bonus:</strong>
                  <br />
                  <strong className={classes.keyText}>{getBonusText(faction)}</strong>
                </Typography>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};
