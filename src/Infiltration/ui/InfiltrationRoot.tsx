import React, { useCallback, useEffect, useState } from "react";
import type { InfiltrationStage } from "../InfiltrationStage";
import type { Infiltration } from "../Infiltration";
import { Player } from "@player";
import { Button, Container, Paper, Typography } from "@mui/material";
import { GameTimer } from "./GameTimer";
import { Intro } from "./Intro";
import { IntroModel } from "../model/IntroModel";
import { Countdown } from "./Countdown";
import { CountdownModel } from "../model/CountdownModel";
import { BackwardGame } from "./BackwardGame";
import { BackwardModel } from "../model/BackwardModel";
import { BracketGame } from "./BracketGame";
import { BracketModel } from "../model/BracketModel";
import { BribeGame } from "./BribeGame";
import { BribeModel } from "../model/BribeModel";
import { CheatCodeGame } from "./CheatCodeGame";
import { CheatCodeModel } from "../model/CheatCodeModel";
import { Cyberpunk2077Game } from "./Cyberpunk2077Game";
import { Cyberpunk2077Model } from "../model/Cyberpunk2077Model";
import { MinesweeperGame } from "./MinesweeperGame";
import { MinesweeperModel } from "../model/MinesweeperModel";
import { SlashGame } from "./SlashGame";
import { SlashModel } from "../model/SlashModel";
import { WireCuttingGame } from "./WireCuttingGame";
import { WireCuttingModel } from "../model/WireCuttingModel";
import { Victory } from "./Victory";
import { VictoryModel } from "../model/VictoryModel";

interface StageProps {
  state: Infiltration;
  stage: InfiltrationStage;
}

// The extra cast here is needed because otherwise it sees the more-specific
// types of the components, and gets grumpy that they are not interconvertible.
const stages = new Map([
  [IntroModel, Intro],
  [CountdownModel, Countdown],
  [BackwardModel, BackwardGame],
  [BracketModel, BracketGame],
  [BribeModel, BribeGame],
  [CheatCodeModel, CheatCodeGame],
  [Cyberpunk2077Model, Cyberpunk2077Game],
  [MinesweeperModel, MinesweeperGame],
  [SlashModel, SlashGame],
  [WireCuttingModel, WireCuttingGame],
  [VictoryModel, Victory],
] as [new () => object, React.ComponentType<StageProps>][]);

function Progress({ results }: { results: string }): React.ReactElement {
  return (
    <Typography variant="h4">
      {/* Only show the last 14 results instead of the full history. */}
      <span style={{ color: "gray" }}>{results.slice(-15, -1)}</span>
      {results[results.length - 1]}
    </Typography>
  );
}

export function InfiltrationRoot(): React.ReactElement {
  const state = Player.infiltration;
  const [__, setRefresh] = useState(0);
  const cancel = useCallback(() => state?.cancel?.(), [state]);
  // As a precaution, tear down infil if we leave the page. This covers us
  // from things like Singularity changing pages.
  useEffect(() => cancel, [cancel]);

  useEffect(() => {
    if (!state) {
      return;
    }
    const press = (event: KeyboardEvent) => {
      if (!event.isTrusted || !(event instanceof KeyboardEvent)) {
        state.onFailure({ automated: true });
        return;
      }
      // A slight sublety here: This dispatches events to the currently active
      // stage, not to the stage corresponding to the currently displayed UI.
      // The two should generally be the same, but since React does async
      // stuff, it can lag behind (potentially a lot, in edge cases).
      state.stage.onKey(event);
    };
    const unsub = state.updateEvent.subscribe(() => setRefresh((old) => old + 1));
    document.addEventListener("keydown", press);
    return () => {
      unsub();
      document.removeEventListener("keydown", press);
    };
  }, [state]);

  if (!state) {
    // This shouldn't happen, but we can't completely rule it out due to React
    // timing weirdness. Show a basic message in case players actually see
    // this. Because the current page is not saved, reloading should always
    // fix this state.
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "calc(100vh - 16px)" }}>
        <Typography variant="h2">当前未在进行潜入！</Typography>
      </div>
    );
  }
  const StageComponent = stages.get(state.stage.constructor as new () => object);
  if (!StageComponent) {
    throw new Error("Internal error: Unknown stage " + state.stage.constructor.name);
  }
  return (
    <div style={{ display: "flex", alignItems: "center", height: "calc(100vh - 16px)" }}>
      {state.stage instanceof IntroModel ? (
        <Intro state={state} />
      ) : (
        <Container>
          <Paper sx={{ p: 1, mb: 1, display: "grid", justifyItems: "center", gap: 1 }}>
            {!(state.stage instanceof VictoryModel) && (
              <Button sx={{ width: "100%" }} onClick={cancel}>
                取消潜入
              </Button>
            )}
            <Typography variant="h5">
              第 {state.level} / {state.maxLevel} 层
            </Typography>
            <Progress results={state.results} />
          </Paper>

          {
            // The logic is weird here because "false" gets dropped but "true" generates a console warning
            !(state.stage instanceof CountdownModel || state.stage instanceof VictoryModel) && (
              <Paper sx={{ p: 1, mb: 1 }}>
                <GameTimer endTimestamp={state.stageEndTimestamp} />
              </Paper>
            )
          }

          <StageComponent state={state} stage={state.stage} />
        </Container>
      )}
    </div>
  );
}
