import React, { useState } from "react";
import { Typography, Button } from "@mui/material";

import { BoardState, playerColors, validityReason } from "../boardState/goConstants";
import { GoGameboard } from "./GoGameboard";
import { evaluateIfMoveIsValid } from "../boardAnalysis/boardAnalysis";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { ToastVariant } from "@enums";
import { getStateCopy, makeMove } from "../boardState/boardState";
import { boardStyles } from "../boardState/goStyles";

interface IProps {
  state: BoardState;
  description: string;
  correctMoves: [{ x: number; y: number }];
  correctText: string;
  incorrectText: string;
  incorrectMoves1?: [{ x: number; y: number }];
  incorrectText1?: string;
  incorrectMoves2?: [{ x: number; y: number }];
  incorrectText2?: string;
}

export function GoTutorialChallenge({
  state,
  description,
  correctMoves,
  correctText,
  incorrectText,
  incorrectMoves1,
  incorrectText1,
  incorrectMoves2,
  incorrectText2,
}: IProps): React.ReactElement {
  const classes = boardStyles();
  const [currentState, setCurrentState] = useState(getStateCopy(state));
  const [displayText, setDisplayText] = useState(description);
  const [showReset, setShowReset] = useState(false);

  const handleClick = (x: number, y: number) => {
    if (currentState.history.length) {
      SnackbarEvents.emit(`Hit 'Reset' to try again`, ToastVariant.WARNING, 2000);
      return;
    }
    setShowReset(true);

    const validity = evaluateIfMoveIsValid(currentState, x, y, playerColors.black);
    if (validity != validityReason.valid) {
      setDisplayText(
        "Invalid move: You cannot suicide your routers by placing them with no access to any empty ports.",
      );
      return;
    }

    const updatedBoard = makeMove(currentState, x, y, playerColors.black);

    if (updatedBoard) {
      setCurrentState(getStateCopy(updatedBoard));

      if (correctMoves.find((move) => move.x === x && move.y === y)) {
        setDisplayText(correctText);
      } else if (incorrectMoves1?.find((move) => move.x === x && move.y === y)) {
        setDisplayText(incorrectText1 ?? "");
      } else if (incorrectMoves2?.find((move) => move.x === x && move.y === y)) {
        setDisplayText(incorrectText2 ?? "");
      } else {
        setDisplayText(incorrectText);
      }
    }
  };

  const reset = () => {
    setCurrentState(getStateCopy(state));
    setDisplayText(description);
    setShowReset(false);
  };

  return (
    <div>
      <div className={classes.instructionBoard}>
        <GoGameboard boardState={currentState} traditional={false} clickHandler={handleClick} hover={true} />
      </div>
      <Typography>{displayText}</Typography>
      {showReset ? <Button onClick={reset}>Reset</Button> : ""}
    </div>
  );
}
