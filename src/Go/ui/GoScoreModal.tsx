import type { GoScore } from "../Types";
import React from "react";
import { Button, Typography, Box } from "@mui/material";

import { GoOpponent, GoColor } from "@enums";
import { Modal } from "../../ui/React/Modal";
import { boardStyles } from "../boardState/goStyles";
import { GoScorePowerSummary } from "./GoScorePowerSummary";
import { GoScoreSummaryTable } from "./GoScoreSummaryTable";

interface Props {
  open: boolean;
  onClose: () => void;
  finalScore: GoScore;
  newSubnet: () => void;
  showScoreExplanation: () => void;
  opponent: GoOpponent;
}

export const GoScoreModal = ({
  open,
  onClose,
  finalScore,
  newSubnet,
  showScoreExplanation,
  opponent,
}: Props): React.ReactElement => {
  const { classes } = boardStyles({});

  const blackScore = finalScore[GoColor.black];
  const whiteScore = finalScore[GoColor.white];

  const playerWinsText = opponent === GoOpponent.none ? "黑方获胜！" : "你赢了！";
  const opponentWinsText = opponent === GoOpponent.none ? "白方获胜！" : `获胜者：${opponent}`;

  return (
    <Modal open={open} onClose={onClose}>
      <>
        <div className={classes.scoreModal}>
          <Typography variant="h5" className={classes.centeredText}>
            对局结束！
          </Typography>
          <GoScoreSummaryTable score={finalScore} opponent={opponent} />
          <br />
          <Typography variant="h5" className={classes.centeredText}>
            {blackScore.sum > whiteScore.sum ? playerWinsText : opponentWinsText}
          </Typography>
          <br />
          {opponent !== GoOpponent.none ? (
            <>
              <GoScorePowerSummary opponent={opponent} finalScore={finalScore} />
              <br />
              <br />
            </>
          ) : (
            ""
          )}
          <Box className={classes.inlineFlexBox}>
            <Button onClick={showScoreExplanation}>得分说明</Button>
            <Button onClick={newSubnet}>新子网</Button>
          </Box>
        </div>
      </>
    </Modal>
  );
};
