import type { BoardState } from "../Types";

import React, { useMemo } from "react";
import { Grid } from "@mui/material";

import { GoOpponent, GoColor } from "@enums";
import { getSizeClass, GoPoint } from "./GoPoint";
import { useRerender } from "../../ui/React/hooks";
import { boardStyles } from "../boardState/goStyles";
import { getAllValidMoves, getControlledSpace } from "../boardAnalysis/boardAnalysis";

interface GoGameboardProps {
  boardState: BoardState;
  traditional: boolean;
  clickHandler: (x: number, y: number) => any;
  hover: boolean;
}

export function GoGameboard({ boardState, traditional, clickHandler, hover }: GoGameboardProps): React.ReactElement {
  useRerender(400);
  // Destructure boardState to allow useMemo to trigger correctly
  const { ai, board, cheatCount, passCount, previousBoard, previousPlayer } = boardState;

  const currentPlayer = ai !== GoOpponent.none || previousPlayer === GoColor.white ? GoColor.black : GoColor.white;

  const availablePoints = useMemo(
    () =>
      hover ? getAllValidMoves({ ai, board, cheatCount, passCount, previousBoard, previousPlayer }, currentPlayer) : [],
    [ai, board, cheatCount, currentPlayer, hover, passCount, previousBoard, previousPlayer],
  );

  const ownedEmptyNodes = useMemo(
    () => getControlledSpace({ ai, board, cheatCount, passCount, previousBoard, previousPlayer }),
    [ai, board, cheatCount, passCount, previousBoard, previousPlayer],
  );

  function pointIsValid(x: number, y: number) {
    return !!availablePoints.find((point) => point.x === x && point.y === y);
  }

  const boardSize = board[0].length;
  const classes = boardStyles();

  return (
    <Grid container id="goGameboard" className={`${classes.board} ${traditional ? classes.traditional : ""}`}>
      {board.map((row, y) => {
        const yIndex = board[0].length - y - 1;
        return (
          <Grid container key={`column_${yIndex}`} item className={getSizeClass(boardSize, classes)}>
            {row.map((point, x: number) => {
              const xIndex = x;
              return (
                <Grid
                  item
                  key={`point_${xIndex}_${yIndex}`}
                  onClick={() => clickHandler(xIndex, yIndex)}
                  className={getSizeClass(boardSize, classes)}
                >
                  <GoPoint
                    state={boardState}
                    x={xIndex}
                    y={yIndex}
                    traditional={traditional}
                    hover={hover}
                    valid={pointIsValid(xIndex, yIndex)}
                    emptyPointOwner={ownedEmptyNodes[xIndex]?.[yIndex]}
                  />
                </Grid>
              );
            })}
          </Grid>
        );
      })}
    </Grid>
  );
}
