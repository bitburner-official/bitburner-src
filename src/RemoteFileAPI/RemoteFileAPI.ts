import { Settings } from "../Settings/Settings";
import { Remote } from "./Remote";

let server: Remote;

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
  return server && server.connection != undefined && server.connection.readyState == 1;
}
