import React, { useEffect, useMemo, useState } from "react";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { ToastVariant } from "@enums";
import { Box, Button, Typography } from "@mui/material";

import { BoardState, opponents, playerColors, playTypes, validityReason } from "../boardState/goConstants";
import { getNewBoardState, getStateCopy, makeMove, passTurn } from "../boardState/boardState";
import { getMove } from "../boardAnalysis/goAI";
import { bitverseArt, weiArt } from "../boardState/asciiArt";
import { getScore, resetWinstreak } from "../boardAnalysis/scoring";
import { evaluateIfMoveIsValid, getAllValidMoves } from "../boardAnalysis/boardAnalysis";
import { useRerender } from "../../ui/React/hooks";
import { OptionSwitch } from "../../ui/React/OptionSwitch";
import { boardStyles } from "../boardState/goStyles";
import { Player } from "@player";
import { Settings } from "../../Settings/Settings";
import { GoScoreModal } from "./GoScoreModal";
import { GoGameboard } from "./GoGameboard";
import { GoSubnetSearch } from "./GoSubnetSearch";
import { CorruptableText } from "../../ui/React/CorruptableText";

interface IProps {
  showInstructions: () => void;
}

// FUTURE: bonus time?

/*
// FUTURE: add AI cheating.
* unlikely unless player cheats first
* more common on some factions
* play two moves that don't capture
 */

export function GoGameboardWrapper({ showInstructions }: IProps): React.ReactElement {
  const rerender = useRerender(400);

  const boardState = Player.go.boardState;
  const traditional = Settings.GoTraditionalStyle;
  const [showPriorMove, setShowPriorMove] = useState(false);
  const [opponent, setOpponent] = useState<opponents>(boardState.ai);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [waitingOnAI, setWaitingOnAI] = useState(false);

  const classes = boardStyles();
  const boardSize = boardState.board[0].length;
  const currentPlayer = boardState.previousPlayer === playerColors.white ? playerColors.black : playerColors.white;
  const score = getScore(boardState);

  // Only run this once on first component mount, to handle scenarios where the game was saved or closed while waiting on the AI to make a move
  useEffect(() => {
    if (boardState.previousPlayer === playerColors.black && !waitingOnAI) {
      takeAiTurn(Player.go.boardState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const notYourTurn = boardState.previousPlayer === playerColors.black && opponent !== opponents.none;
    if (notYourTurn) {
      SnackbarEvents.emit(`It is not your turn to play.`, ToastVariant.WARNING, 2000);
      return;
    }
    if (gameOver) {
      SnackbarEvents.emit(`The game is complete, please reset to continue.`, ToastVariant.WARNING, 2000);
      return;
    }

    const validity = evaluateIfMoveIsValid(boardState, x, y, currentPlayer);
    if (validity != validityReason.valid) {
      SnackbarEvents.emit(`Invalid move: ${validity}`, ToastVariant.ERROR, 2000);
      return;
    }

    const updatedBoard = makeMove(boardState, x, y, currentPlayer);
    if (updatedBoard) {
      updateBoard(updatedBoard);
      opponent !== opponents.none && takeAiTurn(updatedBoard);
    }
  }

  function passPlayerTurn() {
    if (boardState.previousPlayer === playerColors.white) {
      passTurn(boardState, playerColors.black);
      updateBoard(boardState);
    }
    if (boardState.previousPlayer === null) {
      endGame();
      return;
    }

    setTimeout(() => {
      opponent !== opponents.none && takeAiTurn(boardState);
    }, 100);
  }

  async function takeAiTurn(board: BoardState) {
    if (board.previousPlayer === null) {
      return;
    }
    setWaitingOnAI(true);
    const initialState = getStateCopy(board);
    const move = await getMove(initialState, playerColors.white, opponent);

    // If a new game has started while this async code ran, just drop it
    if (boardState.history.length > Player.go.boardState.history.length) {
      return;
    }

    if (move.type === playTypes.pass) {
      SnackbarEvents.emit(`The opponent passes their turn; It is now your turn to move.`, ToastVariant.WARNING, 4000);
      updateBoard(initialState);
      return;
    }

    if (move.type === playTypes.gameOver || move.x === null || move.y === null) {
      endGame(initialState);
      return;
    }

    const updatedBoard = await makeMove(initialState, move.x, move.y, playerColors.white);

    if (updatedBoard) {
      setTimeout(() => {
        updateBoard(updatedBoard);
        setWaitingOnAI(false);
      }, 500);
    }
  }

  function newSubnet() {
    setScoreOpen(false);
    setSearchOpen(true);
  }

  function resetState(newBoardSize = boardSize, newOpponent = opponent) {
    setScoreOpen(false);
    setSearchOpen(false);
    setOpponent(newOpponent);
    if (boardState.previousPlayer !== null && boardState.history.length) {
      resetWinstreak(boardState.ai, false);
    }

    const newBoardState = getNewBoardState(newBoardSize, newOpponent, false);
    updateBoard(newBoardState);
  }

  function updateBoard(initialBoardState: BoardState) {
    Player.go.boardState = getStateCopy(initialBoardState);
    rerender();
  }

  function endGame(state = boardState) {
    setScoreOpen(true);
    updateBoard(state);
  }

  function getPriorMove() {
    if (!boardState.history.length) {
      return boardState;
    }
    const priorBoard = boardState.history.slice(-1)[0];
    const updatedState = getStateCopy(boardState);
    updatedState.board = priorBoard;
    updatedState.previousPlayer =
      boardState.previousPlayer === playerColors.black ? playerColors.white : playerColors.black;

    return updatedState;
  }

  function showPreviousMove(newValue: boolean) {
    if (boardState.history.length) {
      setShowPriorMove(newValue);
    }
  }

  function setTraditional(newValue: boolean) {
    Settings.GoTraditionalStyle = newValue;
  }

  const endGameAvailable = boardState.previousPlayer === playerColors.white && boardState.passCount;
  const noLegalMoves = useMemo(
    () => boardState.previousPlayer === playerColors.white && !getAllValidMoves(boardState, playerColors.black).length,
    [boardState],
  );
  const disablePassButton =
    opponent !== opponents.none && boardState.previousPlayer === playerColors.black && waitingOnAI;

  const scoreBoxText = boardState.history.length
    ? `Score: Black: ${score[playerColors.black].sum} White: ${score[playerColors.white].sum}`
    : "Place a router to begin!";

  const getPassButtonLabel = () => {
    if (endGameAvailable) {
      return "End Game";
    }
    if (boardState.previousPlayer === null) {
      return "View Final Score";
    }
    if (boardState.previousPlayer === playerColors.black && waitingOnAI) {
      return "Waiting for opponent";
    }
    const currentPlayer = boardState.previousPlayer === playerColors.black ? playerColors.white : playerColors.black;
    return `Pass Turn${boardState.ai === opponents.none ? ` (${currentPlayer})` : ""}`;
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
            {opponent !== opponents.none ? "Subnet owner: " : ""}{" "}
            {opponent === opponents.w0r1d_d43m0n ? <CorruptableText content={opponent} spoiler={false} /> : opponent}
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
              disabled={!boardState.history.length}
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
