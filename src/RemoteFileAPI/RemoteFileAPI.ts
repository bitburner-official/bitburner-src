import { Settings } from "../Settings/Settings";
import { Remote } from "./Remote";

let server: Remote | undefined;

export function newRemoteFileApiConnection(): void {
  if (server) server.stopConnection();
  if (Settings.RemoteFileApiPort === 0 || Settings.RemoteFileApiPort > 65535) return;
  server = new Remote(
    Settings.RemoteFileApiAddress === "" ? "localhost" : Settings.RemoteFileApiAddress,
    Settings.RemoteFileApiPort,
  );
  server.startConnection();
}

export function isRemoteFileApiConnectionLive(): boolean {
  return server !== undefined && server.connection !== undefined && server.connection.readyState === 1;
}

export function getRemoteFileApiConnectionStatus(): "Online" | "Offline" | "Reconnecting" {
  if (isRemoteFileApiConnectionLive()) {
    return "Online";
  }
  if (server?.reconnecting) {
    return "Reconnecting";
  }
  return "Offline";
}
