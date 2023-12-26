import React, { useMemo } from "react";
import Grid from "@mui/material/Grid";

import { getSizeClass, GoPoint } from "./GoPoint";
import { useRerender } from "../../ui/React/hooks";
import { boardStyles } from "../boardState/goStyles";
import { getAllValidMoves, getControlledSpace } from "../boardAnalysis/boardAnalysis";
import { BoardState, opponents, playerColors } from "../boardState/goConstants";

interface IProps {
  boardState: BoardState;
  traditional: boolean;
  clickHandler: (x: number, y: number) => any;
  hover: boolean;
}

export function GoGameboard({ boardState, traditional, clickHandler, hover }: IProps): React.ReactElement {
  useRerender(400);

  const currentPlayer =
    boardState.ai !== opponents.none || boardState.previousPlayer === playerColors.white
      ? playerColors.black
      : playerColors.white;

  const availablePoints = useMemo(
    () => (hover ? getAllValidMoves(boardState, currentPlayer) : []),
    [boardState, hover, currentPlayer],
  );

  const ownedEmptyNodes = useMemo(() => getControlledSpace(boardState), [boardState]);

  function pointIsValid(x: number, y: number) {
    return !!availablePoints.find((point) => point.x === x && point.y === y);
  }

  const boardSize = boardState.board[0].length;
  const classes = boardStyles();

  return (
    <>
      <Grid container id="goGameboard" className={`${classes.board} ${traditional ? classes.traditional : ""}`}>
        {boardState.board.map((row, y) => {
          const yIndex = boardState.board[0].length - y - 1;
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
    </>
  );
}
