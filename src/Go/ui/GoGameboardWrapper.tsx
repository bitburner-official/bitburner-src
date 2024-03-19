import type { BoardState } from "../Types";

import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";

import { GoColor, GoOpponent, GoPlayType, GoValidity, ToastVariant } from "@enums";
import { Go, GoEvents } from "../Go";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { getNewBoardState, getStateCopy, makeMove, passTurn, updateCaptures } from "../boardState/boardState";
import { getMove } from "../boardAnalysis/goAI";
import { bitverseArt, weiArt } from "../boardState/asciiArt";
import { getScore, resetWinstreak } from "../boardAnalysis/scoring";
import { boardFromSimpleBoard, evaluateIfMoveIsValid, getAllValidMoves } from "../boardAnalysis/boardAnalysis";
import { useRerender } from "../../ui/React/hooks";
import { OptionSwitch } from "../../ui/React/OptionSwitch";
import { boardStyles } from "../boardState/goStyles";
import { Settings } from "../../Settings/Settings";
import { GoScoreModal } from "./GoScoreModal";
import { GoGameboard } from "./GoGameboard";
import { GoSubnetSearch } from "./GoSubnetSearch";
import { CorruptableText } from "../../ui/React/CorruptableText";

interface GoGameboardWrapperProps {
  showInstructions: () => void;
}

// FUTURE: bonus time?

/*
// FUTURE: add AI cheating.
* unlikely unless player cheats first
* more common on some factions
* play two moves that don't capture
 */

export function GoGameboardWrapper({ showInstructions }: GoGameboardWrapperProps): React.ReactElement {
  const rerender = useRerender();
  useEffect(() => {
    return GoEvents.subscribe(rerender);
  }, [rerender]);

  const boardState = Go.currentGame;
  // Destructure boardState to allow useMemo to trigger correctly
  const traditional = Settings.GoTraditionalStyle;
  const [showPriorMove, setShowPriorMove] = useState(false);
  const [opponent, setOpponent] = useState<GoOpponent>(boardState.ai);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [waitingOnAI, setWaitingOnAI] = useState(false);

  const classes = boardStyles();
  const boardSize = boardState.board[0].length;
  const currentPlayer = boardState.previousPlayer === GoColor.white ? GoColor.black : GoColor.white;
  const score = getScore(boardState);

  // Only run this once on first component mount, to handle scenarios where the game was saved or closed while waiting on the AI to make a move
  useEffect(() => {
    if (boardState.previousPlayer === GoColor.black && !waitingOnAI && boardState.ai !== GoOpponent.none) {
      takeAiTurn(Go.currentGame);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Do not implement useCallback for this function without ensuring GoGameboard still rerenders for every move
  // Currently this function changing is what triggers a GoGameboard rerender, which is needed
  async function clickHandler(x: number, y: number) {
    if (showPriorMove) {
      SnackbarEvents.emit(
        `Currently showing a past board state. Please disable "Show previous move" to continue.`,
        ToastVariant.WARNING,
        2000,
      );
      return;
    }

    // Lock the board when it isn't the player's turn
    const gameOver = boardState.previousPlayer === null;
    const notYourTurn = boardState.previousPlayer === GoColor.black && opponent !== GoOpponent.none;
    if (notYourTurn) {
      SnackbarEvents.emit(`It is not your turn to play.`, ToastVariant.WARNING, 2000);
      return;
    }
    if (gameOver) {
      SnackbarEvents.emit(`The game is complete, please reset to continue.`, ToastVariant.WARNING, 2000);
      return;
    }

    const validity = evaluateIfMoveIsValid(boardState, x, y, currentPlayer);
    if (validity != GoValidity.valid) {
      SnackbarEvents.emit(`Invalid move: ${validity}`, ToastVariant.ERROR, 2000);
      return;
    }

    const didUpdateBoard = makeMove(boardState, x, y, currentPlayer);
    if (didUpdateBoard) {
      rerender();
      opponent !== GoOpponent.none && takeAiTurn(boardState);
    }
  }

  function passPlayerTurn() {
    if (boardState.previousPlayer === GoColor.white) {
      passTurn(boardState, GoColor.black);
      rerender();
    }
    if (boardState.previousPlayer === GoColor.black && boardState.ai === GoOpponent.none) {
      passTurn(boardState, GoColor.white);
      rerender();
    }
    if (boardState.previousPlayer === null) {
      setScoreOpen(true);
      return;
    }

    setTimeout(() => {
      opponent !== GoOpponent.none && takeAiTurn(boardState);
    }, 100);
  }

  async function takeAiTurn(boardState: BoardState) {
    setWaitingOnAI(true);
    const move = await getMove(boardState, GoColor.white, opponent);

    // If a new game has started while this async code ran, just drop it
    if (boardState !== Go.currentGame) return;

    if (move.type === GoPlayType.pass) {
      SnackbarEvents.emit(`The opponent passes their turn; It is now your turn to move.`, ToastVariant.WARNING, 4000);
      rerender();
      return;
    }

    if (move.type === GoPlayType.gameOver || move.x === null || move.y === null) {
      setScoreOpen(true);
      return;
    }

    const didUpdateBoard = makeMove(boardState, move.x, move.y, GoColor.white);

    if (didUpdateBoard) setWaitingOnAI(false);
  }

  function newSubnet() {
    setScoreOpen(false);
    setSearchOpen(true);
  }

  function resetState(newBoardSize = boardSize, newOpponent = opponent) {
    setScoreOpen(false);
    setSearchOpen(false);
    setOpponent(newOpponent);
    if (boardState.previousPlayer !== null && boardState.previousBoards.length) {
      resetWinstreak(boardState.ai, false);
    }

    Go.currentGame = getNewBoardState(newBoardSize, newOpponent, true);
    rerender();
  }

  function getPriorMove() {
    if (!boardState.previousBoards.length) return boardState;
    const priorState = getStateCopy(boardState);
    priorState.previousPlayer = boardState.previousPlayer === GoColor.black ? GoColor.white : GoColor.black;
    priorState.board = boardFromSimpleBoard(boardState.previousBoards[0]);
    updateCaptures(priorState.board, priorState.previousPlayer);
    return priorState;
  }

  function showPreviousMove(newValue: boolean) {
    if (boardState.previousBoards.length) {
      setShowPriorMove(newValue);
    }
  }

  function setTraditional(newValue: boolean) {
    Settings.GoTraditionalStyle = newValue;
  }

  const endGameAvailable = boardState.previousPlayer === GoColor.white && boardState.passCount;
  const noLegalMoves =
    boardState.previousPlayer === GoColor.white && !getAllValidMoves(boardState, GoColor.black).length;
  const disablePassButton = opponent !== GoOpponent.none && boardState.previousPlayer === GoColor.black && waitingOnAI;

  const scoreBoxText = boardState.previousBoards.length
    ? `Score: Black: ${score[GoColor.black].sum} White: ${score[GoColor.white].sum}`
    : "Place a router to begin!";

  const getPassButtonLabel = () => {
    if (endGameAvailable) {
      return "End Game";
    }
    if (boardState.previousPlayer === null) {
      return "View Final Score";
    }
    if (boardState.previousPlayer === GoColor.black && waitingOnAI) {
      return "Waiting for opponent";
    }
    const currentPlayer = boardState.previousPlayer === GoColor.black ? GoColor.white : GoColor.black;
    return `Pass Turn${boardState.ai === GoOpponent.none ? ` (${currentPlayer})` : ""}`;
  };

  return (
    <>
      <GoSubnetSearch
        open={searchOpen}
        search={resetState}
        cancel={() => setSearchOpen(false)}
        showInstructions={showInstructions}
      />
      <GoScoreModal
        open={scoreOpen}
        onClose={() => setScoreOpen(false)}
        newSubnet={() => newSubnet()}
        finalScore={score}
        opponent={opponent}
      ></GoScoreModal>
      <div className={classes.boardFrame}>
        {traditional ? (
          ""
        ) : (
          <div className={`${classes.background} ${boardSize === 19 ? classes.bitverseBackground : ""}`}>
            {boardSize === 19 ? bitverseArt : weiArt}
          </div>
        )}
        <Box className={`${classes.inlineFlexBox} ${classes.opponentTitle}`}>
          <br />
          <Typography variant={"h6"} className={classes.opponentLabel}>
            {opponent !== GoOpponent.none ? "Subnet owner: " : ""}{" "}
            {opponent === GoOpponent.w0r1d_d43m0n ? <CorruptableText content={opponent} spoiler={false} /> : opponent}
          </Typography>
          <br />
        </Box>
        <div className={`${classes.gameboardWrapper} ${showPriorMove ? classes.translucent : ""}`}>
          <GoGameboard
            boardState={showPriorMove ? getPriorMove() : boardState}
            traditional={traditional}
            clickHandler={clickHandler}
            hover={!showPriorMove}
          />
        </div>
        <Box className={classes.inlineFlexBox}>
          <Button onClick={() => setSearchOpen(true)} className={classes.resetBoard}>
            Find New Subnet
          </Button>
          <Typography className={classes.scoreBox}>{scoreBoxText}</Typography>
          <Button
            disabled={disablePassButton}
            onClick={passPlayerTurn}
            className={endGameAvailable || noLegalMoves ? classes.buttonHighlight : classes.resetBoard}
          >
            {getPassButtonLabel()}
          </Button>
        </Box>
        <div className={classes.opponentLabel}>
          <Box className={classes.inlineFlexBox}>
            <br />
            <OptionSwitch
              checked={traditional}
              onChange={(newValue) => setTraditional(newValue)}
              text="Traditional Go look"
              tooltip={<>Show stones and grid as if it was a standard Go board</>}
            />
            <OptionSwitch
              checked={showPriorMove}
              disabled={!boardState.previousBoards.length}
              onChange={(newValue) => showPreviousMove(newValue)}
              text="Show previous move"
              tooltip={<>Show the board as it was before the last move</>}
            />
          </Box>
        </div>
      </div>
    </>
  );
}
