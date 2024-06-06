import type { GoScore } from "../Types";

import React from "react";
import { Table, TableBody, TableCell, TableRow, Typography, Tooltip } from "@mui/material";

import { Player } from "@player";
import { GoOpponent, GoColor } from "@enums";
import { Go } from "../Go";
import { getBonusText, getDifficultyMultiplier, getMaxFavor, getWinstreakMultiplier } from "../effects/effect";
import { boardStyles } from "../boardState/goStyles";
import { formatNumber } from "../../ui/formatNumber";
import { getOpponentStats } from "../boardAnalysis/scoring";
import { getEnumHelper } from "../../utils/EnumHelper";

interface Props {
  finalScore: GoScore;
  opponent: GoOpponent;
}

export const GoScorePowerSummary = ({ finalScore, opponent }: Props) => {
  const { classes } = boardStyles();
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
        <strong>Subnet power gained:</strong>
      </Typography>
      <br />
      <Table sx={{ display: "table", mb: 1, width: "100%" }}>
        <TableBody>
          <Tooltip title={<>The total number of empty points and routers you took control of on this subnet</>}>
            <TableRow>
              <TableCell className={classes.cellNone}>Nodes Captured:</TableCell>
              <TableCell className={classes.cellNone}>{blackScore.sum}</TableCell>
            </TableRow>
          </Tooltip>
          <Tooltip title={<>The difficulty multiplier for this opponent faction</>}>
            <TableRow>
              <TableCell className={classes.cellNone}>Difficulty Multiplier:</TableCell>
              <TableCell className={classes.cellNone}>{formatNumber(difficultyMultiplier, 2)}x</TableCell>
            </TableRow>
          </Tooltip>
          <TableRow>
            <TableCell className={classes.cellNone}>{winStreak >= 0 ? "Win" : "Loss"} Streak:</TableCell>
            <TableCell className={classes.cellNone}>{winStreak}</TableCell>
          </TableRow>
          <Tooltip
            title={
              <>
                Consecutive wins award progressively higher multipliers for node power. Coming back from a loss streak
                also gives an extra bonus.
              </>
            }
          >
            <TableRow>
              <TableCell className={`${classes.cellNone} ${classes.cellBottomPadding}`}>
                {winStreak >= 0 ? "Win Streak" : "Loss"} Multiplier:
              </TableCell>
              <TableCell className={`${classes.cellNone} ${classes.cellBottomPadding}`}>
                {formatNumber(winstreakMultiplier, 2)}x
              </TableCell>
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
              <TableCell className={classes.cellNone}>Node power gained:</TableCell>
              <TableCell className={classes.cellNone}>{nodePowerIncrease}</TableCell>
            </TableRow>
          </Tooltip>
          <Tooltip title={<>Your total node power from all subnets</>}>
            <TableRow>
              <TableCell className={classes.cellNone}>Total node power:</TableCell>
              <TableCell className={classes.cellNone}>{nodePower}</TableCell>
            </TableRow>
          </Tooltip>
        </TableBody>
      </Table>
      {showFavorGain ? (
        <Tooltip
          title={
            <>
              Win streaks against a faction will give you +1 favor to that faction <br /> at certain numbers of wins (up
              to a max of {getMaxFavor()} favor), <br />
              if you are currently a member of that faction
            </>
          }
        >
          <Typography className={`${classes.inlineFlexBox} ${classes.keyText}`}>
            <span>Winstreak Bonus: </span>
            <span>+1 favor to {opponent}</span>
          </Typography>
        </Tooltip>
      ) : (
        ""
      )}
      <Tooltip title={<>The total stat multiplier gained via your current node power.</>}>
        <Typography className={`${classes.inlineFlexBox} ${classes.keyText}`}>
          <span>New Total Bonus: </span>
          <span>{getBonusText(opponent)}</span>
        </Typography>
      </Tooltip>
    </>
  );
};
