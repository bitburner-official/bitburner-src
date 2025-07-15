import { EventEmitter } from "../utils/EventEmitter";

export enum UIEventType {
  MainUILoaded,
}

export const UIEventEmitter = new EventEmitter<UIEventType[]>();
