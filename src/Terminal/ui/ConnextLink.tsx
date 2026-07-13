import React from "react";
import { Link as MuiLink } from "@mui/material";
import { Terminal } from "../../Terminal";

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
    // if (!isServerLinkAllowed(hostname)) {
    //     Terminal.error("Invalid server. Connection failed.");
    //     return;
    // }
    // Terminal.connectToServer(hostname);
  };
  return <MuiLink onClick={onClick}>{props.text}</MuiLink>;
}
