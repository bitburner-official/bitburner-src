import React, { useRef, useState } from "react";
import { Typography, Button } from "@mui/material";

import { GoColor, GoValidity, ToastVariant } from "@enums";
import { BoardState } from "../Types";
import { GoGameboard } from "./GoGameboard";
import { evaluateIfMoveIsValid } from "../boardAnalysis/boardAnalysis";
import { SnackbarEvents } from "../../ui/React/Snackbar";
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
  const stateRef = useRef(getStateCopy(state));
  const { classes } = boardStyles();
  const [displayText, setDisplayText] = useState(description);
  const [showReset, setShowReset] = useState(false);

  const handleClick = (x: number, y: number) => {
    if (stateRef.current.previousBoards.length) {
      SnackbarEvents.emit(`Hit 'Reset' to try again`, ToastVariant.WARNING, 2000);
      return;
    }
    setShowReset(true);

    const validity = evaluateIfMoveIsValid(stateRef.current, x, y, GoColor.black);
    if (validity != GoValidity.valid) {
      setDisplayText(
        "Invalid move: You cannot suicide your routers by placing them with no access to any empty ports.",
      );
      return;
    }

    if (makeMove(stateRef.current, x, y, GoColor.black)) {
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
    stateRef.current = getStateCopy(state);
    stateRef.current.previousBoards = [];
    setDisplayText(description);
    setShowReset(false);
  };

  return (
    <div>
      <div className={classes.instructionBoard}>
        <GoGameboard boardState={stateRef.current} traditional={false} clickHandler={handleClick} hover={true} />
      </div>
      <Typography>{displayText}</Typography>
      {showReset ? <Button onClick={reset}>Reset</Button> : ""}
    </div>
  );
}
