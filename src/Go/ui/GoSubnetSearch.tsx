import React, { useState } from "react";
import { Box, Button, MenuItem, Select, SelectChangeEvent, Tooltip, Typography } from "@mui/material";

import { GoOpponent } from "@enums";
import { Go } from "../Go";
import { boardSizes, opponentDetails } from "../Constants";
import { boardStyles } from "../boardState/goStyles";
import { Modal } from "../../ui/React/Modal";
import { getHandicap } from "../boardState/boardState";
import { CorruptableText } from "../../ui/React/CorruptableText";
import { Settings } from "../../Settings/Settings";
import { getOpponentStats } from "../boardAnalysis/scoring";
import { showWorldDemon } from "../boardAnalysis/goAI";

interface IProps {
  open: boolean;
  search: (size: number, opponent: GoOpponent) => void;
  cancel: () => void;
  showInstructions: () => void;
}
const boardSizeOptions = boardSizes.filter((size) => size !== 19);

export const GoSubnetSearch = ({ open, search, cancel, showInstructions }: IProps): React.ReactElement => {
  const { classes } = boardStyles();
  const [opponent, setOpponent] = useState<GoOpponent>(Go.currentGame?.ai ?? GoOpponent.SlumSnakes);
  const preselectedBoardSize =
    opponent === GoOpponent.w0r1d_d43m0n ? 19 : Math.min(Go.currentGame?.board?.[0]?.length ?? 7, 13);
  const [boardSize, setBoardSize] = useState(preselectedBoardSize);

  const opponentFactions = Object.values(GoOpponent).filter(
    (opponent) => opponent !== GoOpponent.w0r1d_d43m0n || showWorldDemon(),
  );

  const handicap = getHandicap(boardSize, opponent);

  function changeOpponent(event: SelectChangeEvent): void {
    const newOpponent = event.target.value as GoOpponent;
    setOpponent(newOpponent);
    if (newOpponent === GoOpponent.w0r1d_d43m0n) {
      setBoardSize(19);

      const stats = getOpponentStats(GoOpponent.w0r1d_d43m0n);
      if (stats.wins + stats.losses === 0) {
        Settings.GoTraditionalStyle = false;
      }
    } else if (boardSize > 13) {
      setBoardSize(13);
    }
  }

  function changeBoardSize(event: SelectChangeEvent) {
    const newSize = +event.target.value;
    setBoardSize(newSize);
  }

  const onSearch = () => {
    search(boardSize, opponent);
  };

  return (
    <Modal open={open} onClose={cancel}>
      <div className={classes.searchBox}>
        <Box className={`${classes.inlineFlexBox} ${classes.opponentTitle}`}>
          <br />
          <Typography variant="h4">IPvGO Subnet Search</Typography>
          <br />
        </Box>
        <br />
        <br />
        <Box className={`${classes.inlineFlexBox} ${classes.opponentTitle}`}>
          <Typography className={classes.opponentLabel}>
            {opponent !== GoOpponent.none ? "Opponent Faction: " : ""}
          </Typography>
          <Select value={opponent} onChange={changeOpponent} sx={{ mr: 1 }}>
            {opponentFactions.map((faction) => (
              <MenuItem key={faction} value={faction}>
                {faction === GoOpponent.w0r1d_d43m0n ? (
                  <CorruptableText content="???????????????" spoiler={false} />
                ) : (
                  `${faction} (${opponentDetails[faction].description})`
                )}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box className={`${classes.inlineFlexBox} ${classes.opponentTitle}`}>
          <Typography className={classes.opponentLabel}>Subnet size: </Typography>
          {opponent === GoOpponent.w0r1d_d43m0n ? (
            <Typography>????</Typography>
          ) : (
            <Select value={`${boardSize}`} onChange={changeBoardSize} sx={{ mr: 1 }}>
              {boardSizeOptions.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}x{size}
                </MenuItem>
              ))}
            </Select>
          )}
        </Box>
        <Box className={`${classes.inlineFlexBox} ${classes.opponentTitle}`}>
          <Tooltip
            title={
              <>
                This faction will also get a few points as a home-field advantage in the subnet, and to balance the
                player's advantage of having the first move.
              </>
            }
          >
            <Typography className={classes.opponentLabel}>Komi: {opponentDetails[opponent].komi}</Typography>
          </Tooltip>
          {handicap ? (
            <Tooltip title={<>This faction has placed a few routers to defend their subnet already.</>}>
              <Typography className={classes.opponentLabel}>Handicap: {handicap}</Typography>
            </Tooltip>
          ) : (
            ""
          )}
        </Box>
        <br />
        <br />
        <Box className={`${classes.inlineFlexBox} ${classes.opponentTitle} ${classes.flavorText}`}>
          <Typography>
            {opponent === GoOpponent.w0r1d_d43m0n ? (
              <>
                <CorruptableText content={opponentDetails[opponent].flavorText.slice(0, 40)} spoiler={false} />
                <CorruptableText content={opponentDetails[opponent].flavorText.slice(40)} spoiler={false} />
              </>
            ) : (
              opponentDetails[opponent].flavorText
            )}
          </Typography>
        </Box>
        <br />
        <br />
        <Box className={`${classes.inlineFlexBox} ${classes.opponentTitle}`}>
          <Typography>
            {opponent !== GoOpponent.none ? "Faction subnet bonus:" : ""} {opponentDetails[opponent].bonusDescription}
          </Typography>
        </Box>
        <br />
        <br />
        <Box className={`${classes.inlineFlexBox} ${classes.opponentTitle}`}>
          <Button onClick={onSearch}>Search for Subnet</Button>
          <Button onClick={cancel}>Cancel</Button>
        </Box>
        <Box className={`${classes.inlineFlexBox} ${classes.opponentTitle}`}>
          <Typography onClick={showInstructions} className={classes.link}>
            How to Play
          </Typography>
        </Box>
      </div>
    </Modal>
  );
};
