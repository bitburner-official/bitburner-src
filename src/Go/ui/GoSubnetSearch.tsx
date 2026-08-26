import React, { useState } from "react";
import { Box, Button, MenuItem, Select, SelectChangeEvent, Tooltip, Typography } from "@mui/material";

import { GoOpponent } from "@enums";
import { Go } from "../Go";
import { boardSizes, opponentDetails } from "../Constants";
import { boardStyles } from "../boardState/goStyles";
import { Modal } from "../../ui/React/Modal";
import { getHandicap } from "../boardState/boardState";
import { CorruptibleText } from "../../ui/React/CorruptibleText";
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
  const { classes } = boardStyles({});
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
          <Typography variant="h4">IPvGO 子网搜索</Typography>
          <br />
        </Box>
        <br />
        <br />
        <Box className={`${classes.inlineFlexBox} ${classes.opponentTitle}`}>
          <Typography className={classes.opponentLabel}>{opponent !== GoOpponent.none ? "对手派系： " : ""}</Typography>
          <Select value={opponent} onChange={changeOpponent} sx={{ mr: 1 }}>
            {opponentFactions.map((faction) => (
              <MenuItem key={faction} value={faction}>
                {faction === GoOpponent.w0r1d_d43m0n ? (
                  <CorruptibleText content="???????????????" spoiler={false} />
                ) : (
                  `${faction} (${opponentDetails[faction].description})`
                )}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box className={`${classes.inlineFlexBox} ${classes.opponentTitle}`}>
          <Typography className={classes.opponentLabel}>子网大小： </Typography>
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
          <Tooltip title={<>该派系也会得到几分作为其在本子网的主场优势，用以平衡玩家先行落子的优势。</>}>
            <Typography className={classes.opponentLabel}>贴目：{opponentDetails[opponent].komi}</Typography>
          </Tooltip>
          {handicap ? (
            <Tooltip title={<>该派系已预先放置了几个路由器来防守其子网。</>}>
              <Typography className={classes.opponentLabel}>让子：{handicap}</Typography>
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
                <CorruptibleText content={opponentDetails[opponent].flavorText.slice(0, 40)} spoiler={false} />
                <CorruptibleText content={opponentDetails[opponent].flavorText.slice(40)} spoiler={false} />
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
            {opponent !== GoOpponent.none ? "派系子网加成：" : ""} {opponentDetails[opponent].bonusDescription}
          </Typography>
        </Box>
        <br />
        <br />
        <Box className={`${classes.inlineFlexBox} ${classes.opponentTitle}`}>
          <Button onClick={onSearch}>搜索子网</Button>
          <Button onClick={cancel}>取消</Button>
        </Box>
        <Box className={`${classes.inlineFlexBox} ${classes.opponentTitle}`}>
          <Typography onClick={showInstructions} className={classes.link}>
            玩法说明
          </Typography>
        </Box>
      </div>
    </Modal>
  );
};
