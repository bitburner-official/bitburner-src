import React from "react";
import { Link as MuiLink } from "@mui/material";
import { Terminal } from "../../Terminal";
import { Player } from "@player";
import { validateConnections } from "../../Server/ServerHelpers";

interface IConnectLinkProps {
  path: string[];
  text: string;
}

export function ConnectLink(props: IConnectLinkProps): React.ReactElement {
  const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const { nativeEvent } = event;
    if (!(nativeEvent instanceof Event) || !nativeEvent.isTrusted) {
      Terminal.error("Links created by ns.ui.createServerLink() can only be used manually.");
      return;
    }
    const result = validateConnections(Player.getCurrentServer(), props.path);
    switch (result.status) {
      case "server not found":
        Terminal.error(`${result.hostname} not found. Connection failed.`);
        return;
      case "no connection":
        Terminal.error(`Unable to connect from ${result.from} to ${result.to}. Connection failed.`);
        return;
      case "ok":
        Terminal.connectToServer(result.destination.hostname);
        return;
      default: {
        const __s: never = result;
      }
    }
  };
  return <MuiLink onClick={onClick}>{props.text}</MuiLink>;
}
