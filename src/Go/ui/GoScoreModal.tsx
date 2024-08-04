import type { GoScore } from "../Types";
import React from "react";
import { Button, Typography } from "@mui/material";

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
  opponent: GoOpponent;
}

export const GoScoreModal = ({ open, onClose, finalScore, newSubnet, opponent }: Props): React.ReactElement => {
  const { classes } = boardStyles();

  const blackScore = finalScore[GoColor.black];
  const whiteScore = finalScore[GoColor.white];

  const playerWinsText = opponent === GoOpponent.none ? "Black wins!" : "You win!";
  const opponentWinsText = opponent === GoOpponent.none ? "White wins!" : `Winner: ${opponent}`;

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
          {opponent !== GoOpponent.none ? (
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
