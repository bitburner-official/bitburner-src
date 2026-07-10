import { type RFARequest, RFAErrorResponse } from "./MessageDefinitions";
import { RFARequestHandler } from "./MessageHandlers";
import { SnackbarEvents } from "../ui/React/Snackbar";
import { ToastVariant } from "@enums";
import { Settings } from "../Settings/Settings";
import { EventEmitter } from "../utils/EventEmitter";
import type { getRemoteFileApiConnectionStatus } from "./RemoteFileAPI";

const timeOutIds = new Set<number>();

function showErrorMessage(address: string, detail: string) {
  SnackbarEvents.emit(`Error with websocket ${address}, details: ${detail}`, ToastVariant.ERROR, 5000);
}

export const RemoteFileApiConnectionEvents = new EventEmitter<[ReturnType<typeof getRemoteFileApiConnectionStatus>]>();

export class Remote {
  connection?: WebSocket;
  ipaddr: string;
  port: number;
  reconnecting = false;

  constructor(ip: string, port: number) {
    this.ipaddr = ip;
    this.port = port;
  }

  public stopConnection(): void {
    // Cancel all pending retries immediately. This function is only called when we intentionally close the current
    // connection before starting a new one. The new connection will retry on its own if needed.
    timeOutIds.forEach((id) => window.clearTimeout(id));
    timeOutIds.clear();

    if (this.connection) {
      this.connection.intentionallyClosed = true;
    }
    this.connection?.close();
    RemoteFileApiConnectionEvents.emit("Offline");
  }

  public startConnection(autoConnectAttempt = 1): void {
    const address = (Settings.UseWssForRemoteFileApi ? "wss" : "ws") + "://" + this.ipaddr + ":" + this.port;

    // This tracks if a connection was established to prevent redundant toasts
    let successfullyConnected = false;

    try {
      this.connection = new WebSocket(address);
    } catch (error) {
      console.error(error);
      showErrorMessage(address, String(error));
      return;
    }

    // Log connection errors on manual and the first auto connect attempts
    this.connection.addEventListener("error", (e: Event) => {
      if (autoConnectAttempt <= 1 || successfullyConnected) {
        showErrorMessage(address, JSON.stringify(e));
      }
    });
    this.connection.addEventListener("message", handleMessageEvent);

    this.connection.addEventListener("open", () => {
      successfullyConnected = true;

      SnackbarEvents.emit(
        `Remote API connection established on ${this.ipaddr}:${this.port}`,
        ToastVariant.SUCCESS,
        2000,
      );
      RemoteFileApiConnectionEvents.emit("Online");
    });
    this.connection.addEventListener("close", (event) => {
      /**
       * On Bitburner side, we may intentionally close the connection. For example, we do that before starting a new
       * connection. In this event handler, we do things that are only necessary when the connection is closed
       * unexpectedly (e.g., show a warning, reconnect after a delay), so we need to check whether the close event is
       * unexpected.
       */
      if (event.currentTarget instanceof WebSocket && event.currentTarget.intentionallyClosed) {
        return;
      }

      /**
       * Only show the warning if the connection was established. Printing the connection error alongside the connection
       * closed warning is both redundant and confusing.
       */
      if (successfullyConnected) {
        SnackbarEvents.emit(`Remote API connection closed. Code: ${event.code}.`, ToastVariant.WARNING, 2000);
      }

      if (Settings.RemoteFileApiReconnectionDelay > 0) {
        this.reconnecting = true;
        const timeOutId = window.setTimeout(() => {
          timeOutIds.delete(timeOutId);
          if (autoConnectAttempt === 1) {
            SnackbarEvents.emit(`Attempting to auto connect Remote API`, ToastVariant.WARNING, 2000);
          }

          // Reset attempts if a connection was established
          const attempts = successfullyConnected ? 1 : autoConnectAttempt + 1;

          this.startConnection(attempts);
        }, Settings.RemoteFileApiReconnectionDelay * 1000);
        timeOutIds.add(timeOutId);
        RemoteFileApiConnectionEvents.emit("Reconnecting");
      } else {
        this.reconnecting = false;
        RemoteFileApiConnectionEvents.emit("Offline");
      }
    });
  }
}

function handleMessageEvent(this: WebSocket, e: MessageEvent): void {
  /**
   * Validating e.data and the result of JSON.parse() is too troublesome, so we typecast them here. If the data is
   * invalid, it means the RFA "client" (the tool that the player is using) is buggy, but that's not our problem.
   */
  const msg = JSON.parse(e.data as string) as RFARequest;

  if (!msg.method || !RFARequestHandler[msg.method]) {
    const response = new RFAErrorResponse({ error: "Unknown message received", id: msg.id });
    this.send(JSON.stringify(response));
    return;
  }
  const response = RFARequestHandler[msg.method](msg);
  if (response instanceof Promise) {
    void response.then((data) => this.send(JSON.stringify(data)));
    return;
  }
  this.send(JSON.stringify(response));
}
