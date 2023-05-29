import { EventEmitter } from "../utils/EventEmitter";
export const TerminalEvents = new EventEmitter<[]>();
export const TerminalClearEvents = new EventEmitter<[]>();
export const TerminalProcessEvents = new EventEmitter<[]>();
