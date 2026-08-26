import React, { useRef, useState, useEffect, useCallback } from "react";
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
  const { classes } = boardStyles({});
  const [displayText, setDisplayText] = useState(description);
  const [showReset, setShowReset] = useState(false);

  const handleClick = (x: number, y: number) => {
    if (stateRef.current.previousBoards.length) {
      SnackbarEvents.emit(`点击"重置"再试一次`, ToastVariant.WARNING, 2000);
      return;
    }
    setShowReset(true);

    const validity = evaluateIfMoveIsValid(stateRef.current, x, y, GoColor.black);
    if (validity != GoValidity.valid) {
      setDisplayText("无效落子：不能把路由器下在没有任何空节点可连通的位置，那等于让自己的路由器自杀。");
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

  const reset = useCallback(() => {
    stateRef.current = getStateCopy(state);
    stateRef.current.previousBoards = [];
    setDisplayText(description);
    setShowReset(false);
  }, [state, description]);

  // Ensure that the challenge is reset on unmount / mount
  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <div>
      <div className={classes.instructionBoard}>
        <GoGameboard boardState={stateRef.current} traditional={false} clickHandler={handleClick} hover={true} />
      </div>
      <Typography>{displayText}</Typography>
      {showReset ? <Button onClick={reset}>重置</Button> : ""}
    </div>
  );
}
