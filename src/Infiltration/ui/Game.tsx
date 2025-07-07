import { Button, Container, Paper, Typography } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FactionName, ToastVariant } from "@enums";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { Player } from "@player";
import { BackwardGame } from "./BackwardGame";
import { BracketGame } from "./BracketGame";
import { BribeGame } from "./BribeGame";
import { CheatCodeGame } from "./CheatCodeGame";
import { Countdown } from "./Countdown";
import { Cyberpunk2077Game } from "./Cyberpunk2077Game";
import { MinesweeperGame } from "./MinesweeperGame";
import { SlashGame } from "./SlashGame";
import { Victory } from "./Victory";
import { WireCuttingGame } from "./WireCuttingGame";
import { calculateDamageAfterFailingInfiltration } from "../utils";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { PlayerEventType, PlayerEvents } from "../../PersonObjects/Player/PlayerEvents";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { clampNumber } from "../../utils/helpers/clampNumber";

type GameProps = {
  StartingDifficulty: number;
  Difficulty: number;
  Reward: number;
  MaxLevel: number;
};

enum Stage {
  Countdown = 0,
  Minigame,
  Result,
  Sell,
}

const date = globalThis.Date;
const defaultWaitTimeBetweenFloors = 900;

function calculateCountDownTime(tsStartOfMinigame: number, gameId: number) {
  if (gameId === -1) {
    return defaultWaitTimeBetweenFloors;
  }
  /**
   * Each game has a window timer that is the maximum allowable time for the player to complete the game.
   * With most games, let's use the "Brutal" difficulty and assume that the player uses 70% of that time to complete
   * each game.
   * With SlashGame, we calculate the average guardingTime with "window" of the "Brutal" difficulty, then add 100ms of
   * reaction time.
   * With MinesweeperGame, all difficulties have the window of 15000. 70% of it is a bit high. Let's assume the player
   * needs 5000ms and 2000ms of the memory phase.
   */
  let expectedTime;
  const balanceMultiplier = 0.7;
  switch (gameId) {
    // SlashGame
    case 0:
      expectedTime = 2725;
      break;
    // BracketGame
    case 1:
      expectedTime = 2500 * balanceMultiplier;
      break;
    // BackwardGame
    case 2:
      expectedTime = 8000 * balanceMultiplier;
      break;
    // BribeGame
    case 3:
      expectedTime = 2500 * balanceMultiplier;
      break;
    // CheatCodeGame
    case 4:
      expectedTime = 3000 * balanceMultiplier;
      break;
    // Cyberpunk2077Game
    case 5:
      expectedTime = 10000 * balanceMultiplier;
      break;
    // MinesweeperGame
    case 6:
      expectedTime = 7000;
      break;
    // WireCuttingGame
    case 7:
      expectedTime = 4000 * balanceMultiplier;
      break;
    default:
      throw new Error(`Unexpected game id: ${gameId}`);
  }
  return defaultWaitTimeBetweenFloors + clampNumber(expectedTime - (date.now() - tsStartOfMinigame), 0, 15000);
}

const minigames = [
  SlashGame,
  BracketGame,
  BackwardGame,
  BribeGame,
  CheatCodeGame,
  Cyberpunk2077Game,
  MinesweeperGame,
  WireCuttingGame,
];

function cancel(): void {
  Router.toPage(Page.City);
  return;
}

export function Game(props: GameProps): React.ReactElement {
  const [level, setLevel] = useState(1);
  const [stage, setStage] = useState(Stage.Countdown);
  const [results, setResults] = useState("");
  const [gameIds, setGameIds] = useState({
    lastGames: [-1, -1],
    id: Math.floor(Math.random() * minigames.length),
  });
  const tsStartOfMinigame = useRef(date.now());
  const timeoutId = useRef(0);

  const setupNextGame = useCallback(() => {
    let id = gameIds.lastGames[0];
    const ids = [gameIds.lastGames[0], gameIds.lastGames[1], gameIds.id];
    while (ids.includes(id)) {
      id = Math.floor(Math.random() * minigames.length);
    }
    setGameIds({
      lastGames: [gameIds.lastGames[1], gameIds.id],
      id,
    });
  }, [gameIds]);

  function pushResult(win: boolean): void {
    setResults((old) => {
      let next = old;
      next += win ? "✓" : "✗";
      if (next.length > 15) next = next.slice(1);
      return next;
    });
  }

  const onSuccess = useCallback(() => {
    pushResult(true);
    if (level === props.MaxLevel) {
      setStage(Stage.Sell);
      return;
    }
    setStage(Stage.Countdown);
    setLevel(level + 1);
    setupNextGame();
  }, [level, props.MaxLevel, setupNextGame]);

  const onFailure = useCallback(
    (options?: { automated: boolean }) => {
      setStage(Stage.Countdown);
      pushResult(false);
      Player.receiveRumor(FactionName.ShadowsOfAnarchy);
      let damage = calculateDamageAfterFailingInfiltration(props.StartingDifficulty);
      // Kill the player immediately if they use automation, so it's clear they're not meant to
      if (options?.automated) {
        damage = Player.hp.current;
        setTimeout(() => {
          SnackbarEvents.emit(
            "You were hospitalized. Do not try to automate infiltration!",
            ToastVariant.WARNING,
            5000,
          );
        }, 500);
      }
      if (Player.takeDamage(damage)) {
        Router.toPage(Page.City);
        return;
      }
      setupNextGame();
    },
    [props.StartingDifficulty, setupNextGame],
  );

  let stageComponent: React.ReactNode;
  switch (stage) {
    case Stage.Countdown:
      stageComponent = <Countdown time={calculateCountDownTime(tsStartOfMinigame.current, gameIds.lastGames[1])} />;
      break;
    case Stage.Minigame: {
      const MiniGame = minigames[gameIds.id];
      stageComponent = (
        <MiniGame onSuccess={onSuccess} onFailure={onFailure} difficulty={props.Difficulty + level / 50} />
      );
      break;
    }
    case Stage.Sell:
      stageComponent = (
        <Victory
          StartingDifficulty={props.StartingDifficulty}
          Difficulty={props.Difficulty}
          Reward={props.Reward}
          MaxLevel={props.MaxLevel}
        />
      );
      break;
  }

  useEffect(() => {
    if (stage !== Stage.Countdown) {
      return;
    }
    clearTimeout(timeoutId.current);
    timeoutId.current = window.setTimeout(() => {
      setStage(Stage.Minigame);
      tsStartOfMinigame.current = date.now();
    }, calculateCountDownTime(tsStartOfMinigame.current, gameIds.lastGames[1]));
  }, [stage, gameIds]);

  useEffect(() => {
    const clearSubscription = PlayerEvents.subscribe((eventType) => {
      if (eventType !== PlayerEventType.Hospitalized) {
        return;
      }
      cancel();
      dialogBoxCreate("Infiltration was cancelled because you were hospitalized");
    });
    return () => {
      clearSubscription();
      clearTimeout(timeoutId.current);
    };
  }, []);

  return (
    <Container>
      <Paper sx={{ p: 1, mb: 1, display: "grid", justifyItems: "center", gap: 1 }}>
        {stage !== Stage.Sell && (
          <Button sx={{ width: "100%" }} onClick={cancel}>
            Cancel Infiltration
          </Button>
        )}
        <Typography variant="h5">
          Level {level} / {props.MaxLevel}
        </Typography>
        <Typography variant="h4">
          <span style={{ color: "gray" }}>{results.slice(0, results.length - 1)}</span>
          {results[results.length - 1]}
        </Typography>
      </Paper>

      {stageComponent}
    </Container>
  );
}
