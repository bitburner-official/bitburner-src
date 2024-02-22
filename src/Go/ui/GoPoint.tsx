import React from "react";
import { ClassNameMap } from "@mui/styles";

import { BoardState, columnIndexes, GoColor } from "../boardState/goConstants";
import { findNeighbors } from "../boardState/boardState";
import { pointStyle } from "../boardState/goStyles";
import { findAdjacentLibertiesAndAlliesForPoint } from "../boardAnalysis/boardAnalysis";

interface IProps {
  state: BoardState;
  x: number;
  y: number;
  traditional: boolean;
  hover: boolean;
  valid: boolean;
  emptyPointOwner: GoColor;
}

export function GoPoint({ state, x, y, traditional, hover, valid, emptyPointOwner }: IProps): React.ReactElement {
  const classes = pointStyle();

  const currentPoint = state.board[x]?.[y];
  const player = currentPoint?.player;

  const isInAtari = currentPoint && currentPoint.liberties?.length === 1 && player !== GoColor.empty && !traditional;
  const liberties = player !== GoColor.empty ? findAdjacentLibertiesAndAlliesForPoint(state, x, y) : null;
  const neighbors = findNeighbors(state, x, y);

  const hasNorthLiberty = traditional ? neighbors.north : liberties?.north;
  const hasEastLiberty = traditional ? neighbors.east : liberties?.east;
  const hasSouthLiberty = traditional ? neighbors.south : liberties?.south;
  const hasWestLiberty = traditional ? neighbors.west : liberties?.west;

  const pointClass =
    player === GoColor.white ? classes.whitePoint : player === GoColor.black ? classes.blackPoint : classes.emptyPoint;

  const colorLiberty = `${player === GoColor.white ? classes.libertyWhite : classes.libertyBlack} ${classes.liberty}`;

  const sizeClass = getSizeClass(state.board[0].length, classes);

  const isNewStone = state.history?.[state.history?.length - 1]?.[x]?.[y]?.player === GoColor.empty;
  const isPriorMove = player === state.previousPlayer && isNewStone;

  const emptyPointColorClass =
    emptyPointOwner === GoColor.white
      ? classes.libertyWhite
      : emptyPointOwner === GoColor.black
      ? classes.libertyBlack
      : "";

  const mainClassName = `${classes.point} ${sizeClass} ${traditional ? classes.traditional : ""} ${
    hover ? classes.hover : ""
  } ${valid ? classes.valid : ""} ${isPriorMove ? classes.priorPoint : ""}
      ${isInAtari ? classes.fadeLoopAnimation : ""}`;

  return (
    <div className={`${mainClassName} ${currentPoint ? "" : classes.hideOverflow}`}>
      {currentPoint ? (
        <>
          <div className={hasNorthLiberty ? `${classes.northLiberty} ${colorLiberty}` : classes.liberty}></div>
          <div className={hasEastLiberty ? `${classes.eastLiberty} ${colorLiberty}` : classes.liberty}></div>
          <div className={hasSouthLiberty ? `${classes.southLiberty} ${colorLiberty}` : classes.liberty}></div>
          <div className={hasWestLiberty ? `${classes.westLiberty} ${colorLiberty}` : classes.liberty}></div>
          <div className={`${classes.innerPoint} `}>
            <div
              className={`${pointClass} ${player !== GoColor.empty ? classes.filledPoint : emptyPointColorClass}`}
            ></div>
          </div>
          <div className={`${pointClass} ${classes.tradStone}`} />
          {traditional ? <div className={`${pointClass} ${classes.priorStoneTrad}`}></div> : ""}
          <div className={classes.coordinates}>
            {columnIndexes[x]}
            {traditional ? "" : "."}
            {y + 1}
          </div>
        </>
      ) : (
        <>
          <div className={classes.broken}>
            <div className={classes.coordinates}>no signal</div>
          </div>
        </>
      )}
    </div>
  );
}

export function getSizeClass(
  size: number,
  classes: ClassNameMap<"fiveByFive" | "sevenBySeven" | "nineByNine" | "thirteenByThirteen" | "nineteenByNineteen">,
) {
  switch (size) {
    case 5:
      return classes.fiveByFive;
    case 7:
      return classes.sevenBySeven;
    case 9:
      return classes.nineByNine;
    case 13:
      return classes.thirteenByThirteen;
    case 19:
      return classes.nineteenByNineteen;
  }
}
