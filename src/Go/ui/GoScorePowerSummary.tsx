import type { GoScore } from "../Types";

import React from "react";
import { Table, TableBody, TableCell, TableRow, Typography, Tooltip } from "@mui/material";

import { Player } from "@player";
import { GoOpponent, GoColor } from "@enums";
import { Go } from "../Go";
import { getBonusText, getDifficultyMultiplier, getMaxRep, getWinstreakMultiplier } from "../effects/effect";
import { boardStyles } from "../boardState/goStyles";
import { formatNumber } from "../../ui/formatNumber";
import { getOpponentStats } from "../boardAnalysis/scoring";
import { getEnumHelper } from "../../utils/EnumHelper";

interface Props {
  finalScore: GoScore;
  opponent: GoOpponent;
}

export const GoScorePowerSummary = ({ finalScore, opponent }: Props) => {
  const { classes } = boardStyles({});
  const status = getOpponentStats(opponent);
  const winStreak = status.winStreak;
  const oldWinStreak = status.winStreak;
  const nodePower = formatNumber(status.nodePower, 2);
  const blackScore = finalScore[GoColor.black];
  const whiteScore = finalScore[GoColor.white];
  const faction = getEnumHelper("FactionName").getMember(opponent);

  const difficultyMultiplier = getDifficultyMultiplier(whiteScore.komi, Go.currentGame.board[0].length);
  const winstreakMultiplier = getWinstreakMultiplier(winStreak, oldWinStreak);
  const nodePowerIncrease = formatNumber(blackScore.sum * difficultyMultiplier * winstreakMultiplier, 2);
  const showFavorGain = faction && winStreak > 0 && winStreak % 2 === 0 && Player.factions.includes(faction);

  return (
    <>
      <Typography>
        <strong>获得的子网能量：</strong>
      </Typography>
      <br />
      <Table sx={{ display: "table", mb: 1, width: "100%" }}>
        <TableBody>
          <Tooltip title={<>你在此子网上夺取控制的空节点与路由器总数</>}>
            <TableRow>
              <TableCell className={classes.cellNone}>夺取的节点：</TableCell>
              <TableCell className={classes.cellNone}>{blackScore.sum}</TableCell>
            </TableRow>
          </Tooltip>
          <Tooltip title={<>针对该对手派系的难度乘数</>}>
            <TableRow>
              <TableCell className={classes.cellNone}>难度乘数：</TableCell>
              <TableCell className={classes.cellNone}>{formatNumber(difficultyMultiplier, 2)}x</TableCell>
            </TableRow>
          </Tooltip>
          <TableRow>
            <TableCell className={classes.cellNone}>{winStreak >= 0 ? "连胜" : "连败"}：</TableCell>
            <TableCell className={classes.cellNone}>{winStreak}</TableCell>
          </TableRow>
          <Tooltip title={<>连续胜利会为节点能量带来越来越高的乘数。从连败中重回胜轨也会获得额外加成。</>}>
            <TableRow>
              <TableCell className={`${classes.cellNone} ${classes.cellBottomPadding}`}>
                {winStreak >= 0 ? "连胜" : "连败"}乘数：
              </TableCell>
              <TableCell className={`${classes.cellNone} ${classes.cellBottomPadding}`}>
                {formatNumber(winstreakMultiplier, 2)}x
              </TableCell>
            </TableRow>
          </Tooltip>
          <Tooltip
            title={
              <>
                属性加成基于节点能量计算，每完成一局子网都会获得。
                <br />
                它由你控制的节点数量乘以以下修正得出：
                <br />
                对手难度、胜负情况以及当前连胜数。
              </>
            }
          >
            <TableRow>
              <TableCell className={classes.cellNone}>获得的节点能量：</TableCell>
              <TableCell className={classes.cellNone}>{nodePowerIncrease}</TableCell>
            </TableRow>
          </Tooltip>
          <Tooltip title={<>你在所有子网累计的节点能量总量</>}>
            <TableRow>
              <TableCell className={classes.cellNone}>节点能量总量：</TableCell>
              <TableCell className={classes.cellNone}>{nodePower}</TableCell>
            </TableRow>
          </Tooltip>
        </TableBody>
      </Table>
      {showFavorGain ? (
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
          <Typography className={`${classes.inlineFlexBox} ${classes.keyText}`}>
            <span>连胜奖励： </span>
            <span>{getMaxRep() / 200} 声望转化为好感度</span>
          </Typography>
        </Tooltip>
      ) : (
        ""
      )}
      <Tooltip title={<>当前节点能量带来的属性乘数总和。</>}>
        <Typography className={`${classes.inlineFlexBox} ${classes.keyText}`}>
          <span>新总计加成： </span>
          <span>{getBonusText(opponent)}</span>
        </Typography>
      </Tooltip>
    </>
  );
};
