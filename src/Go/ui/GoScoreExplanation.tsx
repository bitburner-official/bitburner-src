import React from "react";
import { Typography } from "@mui/material";

import { Modal } from "../../ui/React/Modal";
import { boardStyles } from "../boardState/goStyles";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const GoScoreExplanation = ({ open, onClose }: Props): React.ReactElement => {
  const { classes } = boardStyles();

  return (
    <Modal open={open} onClose={onClose}>
      <>
        <div className={classes.scoreExplanationModal}>
          <Typography>
            IPvGO uses one of the oldest scoring systems in Go, "area scoring", rather than "territory scoring" later
            popularized by Japan. All stones are alive unless captured, chains that could be dead are not automatically
            captured after the game, and prisoners are not calculated. The displayed score is always the ending score if
            both players pass. <br /> <br />
            This scoring ruleset was chosen for its simplicity to teach and to calculate, rather than using territory
            scoring shortcuts designed to make physical games quicker.
            <br /> <br />
            Territory scoring relies heavily on all players having a clear understanding of which chains on the board
            will be "alive" or "dead" given future perfect play. It is much more complicated to implement, and requires
            a much deeper knowledge of Go for new players, and for their IPvGO automation scripts.
            <br /> <br />
            In most cases the winner, and the difference in score between players, comes out to be the same in both
            scoring systems, but in area scoring you "show your work" and prove that something is alive or dead, and
            gives opportunities for the player to capitalize on the computer's mistakes (or vice versa).
          </Typography>
        </div>
      </>
    </Modal>
  );
};
