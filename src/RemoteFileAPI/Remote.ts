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
  closeAutoConnectToast?: () => void;

  constructor(ip: string, port: number) {
    this.ipaddr = ip;
    this.port = port;
  }

  public stopConnection(): void {
    this.connection?.close(eventCodeWhenIntentionallyStoppingConnection);
    this.closeAutoConnectToast?.();
  }

  private enableErrorToasts(): void {
    if (!this.connection) return;
    this.connection.addEventListener("error", (e: Event) => showErrorMessage(this.makeWebsocketURL(), JSON.stringify(e)));
  }

  private makeWebsocketURL(): string {
    return (Settings.UseWssForRemoteFileApi ? "wss" : "ws") + "://" + this.ipaddr + ":" + this.port;
  }

  public startConnection(isAutoConnect = false): void {
    const address = this.makeWebsocketURL();
    try {
      this.connection = new WebSocket(address);
    } catch (error) {
      console.error(error);
      showErrorMessage(address, String(error));
      return;
    }

    if (!isAutoConnect) //dont spam error messages on auto connect
      this.enableErrorToasts();

    this.connection.addEventListener("message", handleMessageEvent);
    this.connection.addEventListener("open", () => {
      SnackbarEvents.emit(
        `Remote API connection established on ${this.ipaddr}:${this.port}`,
        ToastVariant.SUCCESS,
        2000,
      );
      if (this.closeAutoConnectToast) {
        //we still want errors after a successful auto connect
        this.enableErrorToasts();
        this.closeAutoConnectToast();
        this.closeAutoConnectToast = undefined;
      }
    }
    );
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
      if (!isAutoConnect)
        SnackbarEvents.emit(`Remote API connection closed. Code: ${event.code}.`, ToastVariant.WARNING, 2000);
      if (Settings.RemoteFileApiReconnectionDelay > 0) {
        setTimeout(() => {
          if (!this.closeAutoConnectToast) {
            SnackbarEvents.emit(`Attempting to auto connect Remote API`, ToastVariant.WARNING, (closeSnackbar) => {
              this.closeAutoConnectToast = closeSnackbar;
            });
          }
          this.startConnection(true);
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
