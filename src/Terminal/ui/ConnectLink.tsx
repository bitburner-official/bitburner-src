import React, { useCallback } from "react";
import { Link as MuiLink } from "@mui/material";
import { Terminal } from "../../Terminal";
import { Player } from "@player";
import { validateConnections } from "../../Server/ServerHelpers";

interface IConnectLinkProps {
  path: string[];
  text: string;
}

export function ConnectLink({ path, text }: IConnectLinkProps): React.ReactElement {
  const onClick = useCallback(() => {
    const result = validateConnections(Player.getCurrentServer(), path);
    if (result.success) {
      Terminal.connectToServer(result.destination);
      return;
    }
    Terminal.error(result.message);
  }, [path]);
  return <MuiLink onClick={onClick}>{text}</MuiLink>;
}
