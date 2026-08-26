import React from "react";
import { Grid, Table, TableBody, TableCell, TableRow, Tooltip, Typography } from "@mui/material";

import { GoOpponent } from "@enums";
import { Go } from "../Go";
import { getOpponentStats, getScore } from "../boardAnalysis/scoring";
import { GoGameboard } from "./GoGameboard";
import { boardStyles } from "../boardState/goStyles";
import { useRerender } from "../../ui/React/hooks";
import { getBonusText, getMaxRep } from "../effects/effect";
import { formatNumber } from "../../ui/formatNumber";
import { GoScoreSummaryTable } from "./GoScoreSummaryTable";
import { getNewBoardState } from "../boardState/boardState";
import { CorruptibleText } from "../../ui/React/CorruptibleText";
import { getRecordKeys } from "../../Types/Record";

export const GoHistoryPage = (): React.ReactElement => {
  useRerender(400);
  const { classes } = boardStyles({});
  const priorBoard = Go.previousGame ?? getNewBoardState(7);
  const score = getScore(priorBoard);
  const opponent = priorBoard.ai;
  const opponentsToShow = getRecordKeys(Go.stats);

  return (
    <div>
      <Grid container>
        <Grid item>
          <div className={classes.statusPageScore}>
            <Typography variant="h5">上一子网：</Typography>
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
      <Typography variant="h5">派系统计：</Typography>
      <Grid container style={{ maxWidth: "1020px" }}>
        {opponentsToShow.map((faction, index) => {
          const data = getOpponentStats(faction);
          return (
            <Grid item key={opponentsToShow[index]} className={classes.factionStatus}>
              <Typography>
                {" "}
                <strong className={classes.keyText}>
                  {faction === GoOpponent.w0r1d_d43m0n ? (
                    <CorruptibleText content="????????????" spoiler={false} />
                  ) : (
                    faction
                  )}
                </strong>
              </Typography>
              <Table sx={{ display: "table", mb: 1, width: "100%" }}>
                <TableBody>
                  <TableRow>
                    <TableCell className={classes.cellNone}>
                      胜场：{faction === GoOpponent.none ? "（黑方 / 白方）" : ""}
                    </TableCell>
                    <TableCell className={classes.cellNone}>
                      {data.wins} / {data.losses + data.wins}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.cellNone}>
                      当前连胜{faction === GoOpponent.none ? "（执黑）" : ""}：
                    </TableCell>
                    <TableCell className={classes.cellNone}>{data.winStreak}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={`${classes.cellNone} ${classes.cellBottomPadding}`}>
                      最高连胜{faction === GoOpponent.none ? "（执黑）" : ""}：
                    </TableCell>
                    <TableCell className={`${classes.cellNone} ${classes.cellBottomPadding}`}>
                      {data.highestWinStreak}
                    </TableCell>
                  </TableRow>
                  <Tooltip
                    title={
                      <>
                        所有子网中你夺取控制的空节点与路由器总数
                        <br />
                      </>
                    }
                  >
                    <TableRow>
                      <TableCell className={classes.cellNone}>夺取的节点：</TableCell>
                      <TableCell className={classes.cellNone}>{data.nodes}</TableCell>
                    </TableRow>
                  </Tooltip>
                  <Tooltip
                    title={
                      <>
                        节点能量是属性加成的来源，每完成一局子网都会获得。
                        <br />
                        它由你控制的节点数量乘以以下修正得出：
                        <br />
                        对手难度、胜负情况以及当前连胜数。
                      </>
                    }
                  >
                    <TableRow>
                      <TableCell className={`${classes.cellNone} ${classes.cellBottomPadding}`}>节点能量：</TableCell>
                      <TableCell className={`${classes.cellNone} ${classes.cellBottomPadding}`}>
                        {formatNumber(data.nodePower, 2)}
                      </TableCell>
                    </TableRow>
                  </Tooltip>
                  <Tooltip
                    title={
                      <>
                        只要你是该派系成员，连续战胜同一对手两次即可获得 {getMaxRep() / 200}{" "}
                        点声望，转化为该派系的好感度（声望上限为 {getMaxRep()}）。
                        <br />
                        这些声望会立即转化为好感度，也就是说无需转生安装即可立刻提升声望获取速度。
                      </>
                    }
                  >
                    <TableRow>
                      <Tooltip
                        title={
                          <>
                            只要你是该派系成员，连续战胜同一对手两次即可获得 {getMaxRep() / 200}{" "}
                            点声望，转化为该派系的好感度（声望上限为 {getMaxRep()}）。
                            <br />
                            这些声望会立即转化为好感度，也就是说无需转生安装即可立刻提升声望获取速度。
                          </>
                        }
                      >
                        <>
                          <TableCell className={classes.cellNone}>
                            连胜所得声望
                            <br />
                            已转为好感度：
                          </TableCell>
                          <TableCell className={classes.cellNone}>
                            {data.rep ?? 0} {data.rep === getMaxRep() ? "（已达上限）" : ""}
                          </TableCell>
                        </>
                      </Tooltip>
                    </TableRow>
                  </Tooltip>
                </TableBody>
              </Table>
              <br />
              <Tooltip title={<>当前节点能量带来的属性乘数总和。</>}>
                <Typography>
                  <strong className={classes.keyText}>加成：</strong>
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
