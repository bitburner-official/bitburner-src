import { Settings } from "../Settings/Settings";
import { isValidConnectionHostname, isValidConnectionPort } from "../Settings/SettingsUtils";
import { Remote } from "./Remote";

let server: Remote | undefined;

export function canCreateNewRemoteFileApiConnection(): boolean {
  return (
    isValidConnectionHostname(Settings.RemoteFileApiAddress).success &&
    isValidConnectionPort(Settings.RemoteFileApiPort)
  );
}

export function newRemoteFileApiConnection(): void {
  closeRemoteFileApiConnection();
  if (!canCreateNewRemoteFileApiConnection()) {
    return;
  }
  server = new Remote(Settings.RemoteFileApiAddress, Settings.RemoteFileApiPort);
  server.startConnection();
}

export function closeRemoteFileApiConnection(): void {
  if (!server) {
    return;
  }
  server.stopConnection();
}

export function isRemoteFileApiConnectionLive(): boolean {
  return server !== undefined && server.connection !== undefined && server.connection.readyState === 1;
}

export function getRemoteFileApiConnectionStatus(): "Online" | "Offline" | "Reconnecting" | "Connecting" {
  if (isRemoteFileApiConnectionLive()) {
    return "Online";
  }
  if (server?.reconnecting) {
    return "Reconnecting";
  }
  if (server?.connection?.readyState === 0) {
    return "Connecting";
  }
  return "Offline";
}
