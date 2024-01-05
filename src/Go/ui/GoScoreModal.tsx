import React from "react";
import { Button, Typography } from "@mui/material";

import { Modal } from "../../ui/React/Modal";
import { goScore, opponents, playerColors } from "../boardState/goConstants";
import { boardStyles } from "../boardState/goStyles";
import { GoScorePowerSummary } from "./GoScorePowerSummary";
import { GoScoreSummaryTable } from "./GoScoreSummaryTable";

interface IProps {
  open: boolean;
  onClose: () => void;
  finalScore: goScore;
  newSubnet: () => void;
  opponent: opponents;
}

export const GoScoreModal = ({ open, onClose, finalScore, newSubnet, opponent }: IProps): React.ReactElement => {
  const classes = boardStyles();

  const blackScore = finalScore[playerColors.black];
  const whiteScore = finalScore[playerColors.white];

  const playerWinsText = opponent === opponents.none ? "Black wins!" : "You win!";
  const opponentWinsText = opponent === opponents.none ? "White wins!" : `Winner: ${opponent}`;

  return (
    <Modal open={open} onClose={onClose}>
      <>
        <div className={classes.scoreModal}>
          <Typography variant="h5" className={classes.centeredText}>
            Game complete!
          </Typography>
          <GoScoreSummaryTable score={finalScore} opponent={opponent} />
          <br />
          <Typography variant="h5" className={classes.centeredText}>
            {blackScore.sum > whiteScore.sum ? playerWinsText : opponentWinsText}
          </Typography>
          <br />
          {opponent !== opponents.none ? (
            <>
              <GoScorePowerSummary opponent={opponent} finalScore={finalScore} />
              <br />
              <br />
            </>
          ) : (
            ""
          )}
          <Button onClick={newSubnet}>New Subnet</Button>
        </div>
      </>
    </Modal>
  );
};
