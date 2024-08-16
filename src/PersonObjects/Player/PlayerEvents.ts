import { EventEmitter } from "../../utils/EventEmitter";

export enum PlayerEventType {
  Hospitalized,
}

export const PlayerEvents = new EventEmitter<[PlayerEventType]>();
