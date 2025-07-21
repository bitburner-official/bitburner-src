import { Button, Container, Paper, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
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
import { calculateReward, MaxDifficultyForInfiltration } from "../formulas/game";

type GameProps = {
  startingSecurityLevel: number;
  difficulty: number;
  maxLevel: number;
};

enum Stage {
  Countdown = 0,
  Minigame,
  Result,
  Sell,
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

export function Game({ startingSecurityLevel, difficulty, maxLevel }: GameProps): React.ReactElement {
  const [level, setLevel] = useState(1);
  const [stage, setStage] = useState(Stage.Countdown);
  const [results, setResults] = useState("");
  const [gameIds, setGameIds] = useState({
    lastGames: [-1, -1],
    id: Math.floor(Math.random() * minigames.length),
  });
  // Base for when rewards are calculated, which is the start of the game window
  const [timestamp, __] = useState(Date.now());
  const reward = calculateReward(startingSecurityLevel);

  const setupNextGame = useCallback(() => {
    const nextGameId = () => {
      let id = gameIds.lastGames[0];
      const ids = [gameIds.lastGames[0], gameIds.lastGames[1], gameIds.id];
      while (ids.includes(id)) {
        id = Math.floor(Math.random() * minigames.length);
      }
      return id;
    };

    setGameIds({
      lastGames: [gameIds.lastGames[1], gameIds.id],
      id: nextGameId(),
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
    if (level === maxLevel) {
      setStage(Stage.Sell);
    } else {
      setStage(Stage.Countdown);
      setLevel(level + 1);
    }
    setupNextGame();
  }, [level, maxLevel, setupNextGame]);

  const onFailure = useCallback(
    (options?: { automated?: boolean; impossible?: boolean }) => {
      setStage(Stage.Countdown);
      pushResult(false);
      Player.receiveRumor(FactionName.ShadowsOfAnarchy);
      let damage = calculateDamageAfterFailingInfiltration(startingSecurityLevel);
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
      if (options?.impossible) {
        damage = Player.hp.current;
        setTimeout(() => {
          SnackbarEvents.emit(
            "You were discovered immediately. That location is far too secure for your current skill level.",
            ToastVariant.ERROR,
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
    [startingSecurityLevel, setupNextGame],
  );

  function cancel(): void {
    Router.toPage(Page.City);
    return;
  }

  let stageComponent: React.ReactNode;
  switch (stage) {
    case Stage.Countdown:
      stageComponent = <Countdown onFinish={() => setStage(Stage.Minigame)} />;
      break;
    case Stage.Minigame: {
      const MiniGame = minigames[gameIds.id];
      stageComponent = <MiniGame onSuccess={onSuccess} onFailure={onFailure} difficulty={difficulty + level / 50} />;
      break;
    }
    case Stage.Sell:
      stageComponent = (
        <Victory
          startingSecurityLevel={startingSecurityLevel}
          difficulty={difficulty}
          reward={reward}
          timestamp={timestamp}
          maxLevel={maxLevel}
        />
      );
      break;
  }

  function Progress(): React.ReactElement {
    return (
      <Typography variant="h4">
        <span style={{ color: "gray" }}>{results.slice(0, results.length - 1)}</span>
        {results[results.length - 1]}
      </Typography>
    );
  }

  useEffect(() => {
    const clearSubscription = PlayerEvents.subscribe((eventType) => {
      if (eventType !== PlayerEventType.Hospitalized) {
        return;
      }
      cancel();
      dialogBoxCreate("Infiltration was cancelled because you were hospitalized");
    });

    return clearSubscription;
  }, []);

  useEffect(() => {
    // Immediately fail if the difficulty is higher than the max value.
    if (difficulty >= MaxDifficultyForInfiltration) {
      onFailure({ impossible: true });
    }
  });

  return (
    <Container>
      <Paper sx={{ p: 1, mb: 1, display: "grid", justifyItems: "center", gap: 1 }}>
        {stage !== Stage.Sell && (
          <Button sx={{ width: "100%" }} onClick={cancel}>
            Cancel Infiltration
          </Button>
        )}
        <Typography variant="h5">
          Level {level} / {maxLevel}
        </Typography>
        <Progress />
      </Paper>

      {stageComponent}
    </Container>
  );
}
