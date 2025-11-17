import type { InfiltrationStage } from "./InfiltrationStage";
import { AugmentationName, FactionName, ToastVariant } from "@enums";
import { Player } from "@player";
import { Page } from "../ui/Router";
import { Router } from "../ui/GameRoot";
import { Location } from "../Locations/Location";
import { EventEmitter } from "../utils/EventEmitter";
import { PlayerEvents, PlayerEventType } from "../PersonObjects/Player/PlayerEvents";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import { SnackbarEvents } from "../ui/React/Snackbar";
import { CountdownModel } from "./model/CountdownModel";
import { IntroModel } from "./model/IntroModel";
import { BackwardModel } from "./model/BackwardModel";
import { BracketModel } from "./model/BracketModel";
import { BribeModel } from "./model/BribeModel";
import { CheatCodeModel } from "./model/CheatCodeModel";
import { Cyberpunk2077Model } from "./model/Cyberpunk2077Model";
import { MinesweeperModel } from "./model/MinesweeperModel";
import { SlashModel } from "./model/SlashModel";
import { WireCuttingModel } from "./model/WireCuttingModel";
import { VictoryModel } from "./model/VictoryModel";
import { calculateDifficulty, MaxDifficultyForInfiltration } from "./formulas/game";
import { calculateDamageAfterFailingInfiltration } from "./utils";

const minigames = [
  BackwardModel,
  BracketModel,
  BribeModel,
  CheatCodeModel,
  Cyberpunk2077Model,
  MinesweeperModel,
  SlashModel,
  WireCuttingModel,
] as const;

export class Infiltration {
  location: Location;
  startingSecurityLevel: number;
  startingDifficulty: number;
  /** Note that levels are 1-indexed! maxLevel is inclusive. */
  level = 1;
  maxLevel: number;
  /** Checkmarks that represent success/failure per-stage. */
  results = "";

  /** Used to avoid repeating games too quickly. gameIds[0] is the current (or last) game. */
  gameIds = [-1, -1, -1];

  /**
   * Invalid until infiltration is started, used to calculate rewards.
   * Timestamp based on Date.now(), because it is compared against something
   * stored in the savegame.
   */
  gameStartTimestamp = -1;

  /** End of stage, based on performance.now() since it is never persisted. */
  stageEndTimestamp = -1;

  /**
   * Used to clean up pending stage timeouts if Infil is cancelled, undefined for
   * timeouts that have finished. Typescript isn't happy with passing null to clearTimeout().
   */
  timeoutIds: (ReturnType<typeof setTimeout> | undefined)[] = [];

  stage: InfiltrationStage;

  /** Signals when the UI needs to update. */
  updateEvent = new EventEmitter<[]>();

  /** Cancels our subscription to hospitalization events. */
  clearSubscription: null | (() => void) = null;

  constructor(location: Location) {
    if (!location.infiltrationData) {
      throw new Error(`You tried to infiltrate an invalid location: ${location.name}`);
    }
    this.location = location;
    this.startingSecurityLevel = location.infiltrationData.startingSecurityLevel;
    this.maxLevel = location.infiltrationData.maxClearanceLevel;
    this.startingDifficulty = calculateDifficulty(this.startingSecurityLevel);
    this.stage = new IntroModel();
    this.clearSubscription = PlayerEvents.subscribe((eventType) => {
      if (eventType !== PlayerEventType.Hospitalized) {
        return;
      }
      this.cancel();
      dialogBoxCreate("Infiltration was cancelled because you were hospitalized");
    });
  }

  difficulty(): number {
    return this.startingDifficulty + this.level / 50;
  }

  startInfiltration() {
    this.gameStartTimestamp = Date.now();
    if (this.startingDifficulty >= MaxDifficultyForInfiltration) {
      setTimeout(() => {
        SnackbarEvents.emit(
          "You were discovered immediately. That location is far too secure for your current skill level.",
          ToastVariant.ERROR,
          5000,
        );
      }, 500);
      Player.takeDamage(Player.hp.current);
      this.cancel();
      return;
    }
    this.stage = new CountdownModel(this);
    this.updateEvent.emit();
  }

  /**
   * Adds a callback to the EventEmitter. This wraps the callback in a check
   * that the stage active during registration is currently active, so that
   * if the component is switched out, we don't do anything.
   */
  addStageCallback(cb: () => void): () => void {
    const currentStage = this.stage;
    return this.updateEvent.subscribe(() => {
      if (currentStage !== this.stage) return;
      return cb();
    });
  }

  onSuccess(): void {
    this.results += "✓";
    this.clearTimeouts();
    if (this.level >= this.maxLevel) {
      this.stage = new VictoryModel();
      this.cleanup();
    } else {
      this.stage = new CountdownModel(this);
      this.level += 1;
    }
    this.updateEvent.emit();
  }

  onFailure(options?: { automated?: boolean }): void {
    this.results += "✗";
    this.clearTimeouts();
    this.stage = new CountdownModel(this);
    Player.receiveRumor(FactionName.ShadowsOfAnarchy);
    let damage = calculateDamageAfterFailingInfiltration(this.startingSecurityLevel);
    // Kill the player immediately if they use automation, so it's clear they're not meant to
    if (options?.automated) {
      damage = Player.hp.current;
      setTimeout(() => {
        SnackbarEvents.emit("You were hospitalized. Do not try to automate infiltration!", ToastVariant.WARNING, 5000);
      }, 500);
    }
    if (Player.takeDamage(damage)) {
      this.cancel();
      return;
    }
    this.updateEvent.emit();
  }

  setStageTime(currentStage: InfiltrationStage, durationMs: number): void {
    if (Player.hasAugmentation(AugmentationName.WKSharmonizer, true)) {
      durationMs *= 1.3;
    }
    this.stageEndTimestamp = performance.now() + durationMs;
    this.clearTimeouts();
    this.timeoutIds.push(
      setTimeout(() => {
        this.timeoutIds = [];
        if (currentStage !== this.stage) return;
        this.onFailure();
      }, durationMs),
    );
  }

  setTimeSequence(currentStage: InfiltrationStage, durations: number[], callback: (idx: number) => void): void {
    this.clearTimeouts();
    let total = 0;
    for (let i = 0; i < durations.length; ++i) {
      total += durations[i];
      this.timeoutIds.push(
        setTimeout(() => {
          this.timeoutIds[i] = undefined;
          if (i >= durations.length) {
            this.timeoutIds = [];
          }
          if (currentStage === this.stage) {
            callback(i);
          }
        }, total),
      );
    }
    this.stageEndTimestamp = performance.now() + total;
  }

  newGame(): void {
    let id = this.gameIds[0];
    while (this.gameIds.includes(id)) {
      id = Math.floor(Math.random() * minigames.length);
    }
    this.gameIds.unshift(id);
    this.gameIds.pop();
    this.stage = new minigames[id](this);
    this.updateEvent.emit();
  }

  clearTimeouts(): void {
    for (const id of this.timeoutIds) {
      clearTimeout(id);
    }
    this.timeoutIds = [];
  }

  cleanup(): void {
    this.clearTimeouts();
    this.clearSubscription?.();
    this.clearSubscription = null;
  }

  cancel(): void {
    this.cleanup();
    if (Player.infiltration !== this) {
      return;
    }
    Player.infiltration = null;
    if (Router.page() === Page.Infiltration) {
      Router.toPage(Page.City);
    }
  }
}
