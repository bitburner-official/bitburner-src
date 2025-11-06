import { RFAMessage } from "./MessageDefinitions";
import { RFARequestHandler } from "./MessageHandlers";
import { SnackbarEvents } from "../ui/React/Snackbar";
import { ToastVariant } from "@enums";
import { Settings } from "../Settings/Settings";

function showErrorMessage(address: string, detail: string) {
  SnackbarEvents.emit(`Error with websocket ${address}, details: ${detail}`, ToastVariant.ERROR, 5000);
}

const eventCodeWhenIntentionallyStoppingConnection = 3000;

export class Remote {
  connection?: WebSocket;
  ipaddr: string;
  port: number;

  constructor(ip: string, port: number) {
    this.ipaddr = ip;
    this.port = port;
  }

  public stopConnection(): void {
    this.connection?.close(eventCodeWhenIntentionallyStoppingConnection);
  }

  public startConnection(autoConnectAttempt = 1): void {
    const address = (Settings.UseWssForRemoteFileApi ? "wss" : "ws") + "://" + this.ipaddr + ":" + this.port;

    //This tracks if a connection was established to prevent redundant toasts
    let successfullyConnected = false;

    try {
      this.connection = new WebSocket(address);
    } catch (error) {
      console.error(error);
      showErrorMessage(address, String(error));
      return;
    }

    //log connection errors on manual and the first auto connect attempts
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

      //enable error reports after a successfull auto connect
      if (autoConnectAttempt > 2 && this.connection) {
        this.connection.addEventListener("error", (e: Event) => showErrorMessage(address, JSON.stringify(e)));
      }
    });
    this.connection.addEventListener("close", (event) => {
      /**
       * On Bitburner side, we may intentionally close the connection. For example, we do that before starting a new
       * connection. In this event handler, we do things that are only necessary when the connection is closed
       * unexpectedly (e.g., show a warning, reconnect after a delay), so we need to check whether the close event is
       * unexpected.
       */
      if (event.code === eventCodeWhenIntentionallyStoppingConnection) {
        return;
      }

      //Printing a connetion error alongside the connection closed warning is both redunant and confusing
      if (successfullyConnected) {
        SnackbarEvents.emit(`Remote API connection closed. Code: ${event.code}.`, ToastVariant.WARNING, 2000);
      }

      if (Settings.RemoteFileApiReconnectionDelay > 0) {
        setTimeout(() => {
          if (autoConnectAttempt === 1 && Settings.RemoteFileApiReconnectionDelay > 0) {
            SnackbarEvents.emit(`Attempting to auto connect Remote API`, ToastVariant.WARNING, 2000);
          }

          //reset attempts if a connection was established
          const attempts = successfullyConnected ? 1 : autoConnectAttempt + 1;

          this.startConnection(attempts);
        }, Settings.RemoteFileApiReconnectionDelay * 1000);
      }
    });
  }
}

function handleMessageEvent(this: WebSocket, e: MessageEvent): void {
  /**
   * Validating e.data and the result of JSON.parse() is too troublesome, so we typecast them here. If the data is
   * invalid, it means the RFA "client" (the tool that the player is using) is buggy, but that's not our problem.
   */
  const msg = JSON.parse(e.data as string) as RFAMessage;

  if (!msg.method || !RFARequestHandler[msg.method]) {
    const response = new RFAMessage({ error: "Unknown message received", id: msg.id });
    this.send(JSON.stringify(response));
    return;
  }
  const response = RFARequestHandler[msg.method](msg);
  if (!response) return;

  if (response instanceof Promise) {
    void response.then((data) => this.send(JSON.stringify(data)));
    return;
  }
  this.send(JSON.stringify(response));
}
