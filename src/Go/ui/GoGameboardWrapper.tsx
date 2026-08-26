import type { BoardState } from "../Types";

import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";

import { GoColor, GoOpponent, GoPlayType, GoValidity, ToastVariant } from "@enums";
import { Go, GoEvents } from "../Go";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { getNewBoardState, getStateCopy, makeMove, passTurn, updateCaptures } from "../boardState/boardState";
import { bitverseArt, weiArt } from "../boardState/asciiArt";
import { getScore, resetWinstreak } from "../boardAnalysis/scoring";
import {
  boardFromBoardString,
  clearAllPointHighlights,
  evaluateIfMoveIsValid,
  getAllValidMoves,
} from "../boardAnalysis/boardAnalysis";
import { useRerender } from "../../ui/React/hooks";
import { OptionSwitch } from "../../ui/React/OptionSwitch";
import { boardStyles } from "../boardState/goStyles";
import { Settings } from "../../Settings/Settings";
import { GoScoreModal } from "./GoScoreModal";
import { GoGameboard } from "./GoGameboard";
import { GoSubnetSearch } from "./GoSubnetSearch";
import { CorruptibleText } from "../../ui/React/CorruptibleText";
import { handleNextTurn, resetGoPromises } from "../boardAnalysis/goAI";
import { GoScoreExplanation } from "./GoScoreExplanation";
import { exceptionAlert } from "../../utils/helpers/exceptionAlert";

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
  const [scoreOpen, setScoreOpen] = useState(false);
  const [scoreExplanationOpen, setScoreExplanationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { classes } = boardStyles({});
  const boardSize = boardState.board[0].length;
  const currentPlayer = boardState.previousPlayer === GoColor.white ? GoColor.black : GoColor.white;
  const waitingOnAI = boardState.previousPlayer === GoColor.black && boardState.ai !== GoOpponent.none;
  const score = getScore(boardState);

  // Disable showing prior move if there are no prior moves (if a new game is started while looking at a prior move)
  useEffect(() => {
    if (boardState.previousBoards.length === 0) {
      setShowPriorMove(false);
    }
  }, [boardState.previousBoards.length]);

  // Do not implement useCallback for this function without ensuring GoGameboard still rerenders for every move
  // Currently this function changing is what triggers a GoGameboard rerender, which is needed
  function clickHandler(x: number, y: number) {
    if (showPriorMove) {
      SnackbarEvents.emit(`当前正在查看历史棋盘状态。请取消勾选"显示上一手"后再继续。`, ToastVariant.WARNING, 2000);
      return;
    }

    // Lock the board when it isn't the player's turn
    const gameOver = boardState.previousPlayer === null;
    const notYourTurn = boardState.previousPlayer === GoColor.black && Go.currentGame.ai !== GoOpponent.none;
    if (notYourTurn) {
      SnackbarEvents.emit(`还没轮到你落子。`, ToastVariant.WARNING, 2000);
      return;
    }
    if (gameOver) {
      SnackbarEvents.emit(`对局已经结束，请开始新对局后再继续。`, ToastVariant.WARNING, 2000);
      return;
    }

    const validity = evaluateIfMoveIsValid(boardState, x, y, currentPlayer);
    if (validity != GoValidity.valid) {
      SnackbarEvents.emit(`无效落子：${validity}`, ToastVariant.ERROR, 2000);
      return;
    }

    const didUpdateBoard = makeMove(boardState, x, y, currentPlayer);
    if (didUpdateBoard) {
      takeAiTurn(boardState).catch((error) => exceptionAlert(error));
    }
  }

  function passPlayerTurn() {
    if (boardState.previousPlayer === null) {
      setScoreOpen(true);
      return;
    }
    passTurn(boardState, boardState.previousPlayer === GoColor.black ? GoColor.white : GoColor.black);
    takeAiTurn(boardState).catch((error) => exceptionAlert(error));
  }

  async function takeAiTurn(boardState: BoardState) {
    const move = await handleNextTurn(boardState, false);

    if (move.type === GoPlayType.pass) {
      SnackbarEvents.emit(`对手选择停一手；现在轮到你落子。`, ToastVariant.WARNING, 4000);
      return;
    }

    if (boardState.previousPlayer === null) {
      setScoreOpen(true);
    }
  }

  function newSubnet() {
    setScoreOpen(false);
    setSearchOpen(true);
  }

  function resetState(newBoardSize = boardSize, newOpponent = Go.currentGame.ai) {
    setScoreOpen(false);
    setSearchOpen(false);
    setShowPriorMove(false);
    if (boardState.previousPlayer !== null && boardState.previousBoards.length) {
      resetWinstreak(boardState.ai, false);
    }

    Go.currentGame = getNewBoardState(newBoardSize, newOpponent, true);
    resetGoPromises();
    clearAllPointHighlights(Go.currentGame);
  }

  function getPriorMove() {
    if (!boardState.previousBoards.length) return boardState;
    const priorState = getStateCopy(boardState);
    priorState.previousPlayer = boardState.previousPlayer === GoColor.black ? GoColor.white : GoColor.black;
    priorState.board = boardFromBoardString(boardState.previousBoards[0]);
    updateCaptures(priorState.board, priorState.previousPlayer);
    return priorState;
  }

  function showPreviousMove(newValue: boolean) {
    // Only show prior move if there is previous moves to show
    setShowPriorMove(!!boardState.previousBoards.length && newValue);
  }

  function setTraditional(newValue: boolean) {
    Settings.GoTraditionalStyle = newValue;
    rerender();
  }

  const ongoingNoAiGame = boardState.ai === GoOpponent.none && boardState.previousPlayer;
  const manualTurnAvailable = ongoingNoAiGame || boardState.previousPlayer === GoColor.white;
  const endGameAvailable = manualTurnAvailable && boardState.passCount;
  const noLegalMoves = manualTurnAvailable && !getAllValidMoves(boardState, currentPlayer).length;

  const scoreBoxText = boardState.previousBoards.length
    ? `得分：黑方：${score[GoColor.black].sum} 白方：${score[GoColor.white].sum}`
    : "放置一个路由器以开始！";

  const getPassButtonLabel = () => {
    const playerString = boardState.ai === GoOpponent.none ? ` (${currentPlayer})` : "";
    if (endGameAvailable) {
      return `结束对局${playerString}`;
    }
    if (boardState.previousPlayer === null) {
      return "查看最终得分";
    }
    if (waitingOnAI) {
      return "等待对手行动";
    }
    return `停一手${playerString}`;
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
        opponent={Go.currentGame.ai}
        showScoreExplanation={() => setScoreExplanationOpen(true)}
      />
      <GoScoreExplanation onClose={() => setScoreExplanationOpen(false)} open={scoreExplanationOpen} />
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
            {Go.currentGame.ai !== GoOpponent.none ? "子网占据者：" : ""}{" "}
            {Go.currentGame.ai === GoOpponent.w0r1d_d43m0n ? (
              <CorruptibleText content={Go.currentGame.ai} spoiler={false} />
            ) : (
              Go.currentGame.ai
            )}
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
            寻找新子网
          </Button>
          <Typography className={classes.scoreBox}>{scoreBoxText}</Typography>
          <Button
            disabled={waitingOnAI}
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
              text="传统围棋外观"
              tooltip={<>以标准围棋棋盘的样式显示棋子与网格</>}
            />
            <OptionSwitch
              checked={showPriorMove}
              disabled={!boardState.previousBoards.length}
              onChange={(newValue) => showPreviousMove(newValue)}
              text="显示上一手"
              tooltip={<>显示上一手落下之前的棋盘状态</>}
            />
          </Box>
        </div>
      </div>
    </>
  );
}
