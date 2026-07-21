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
    if (!result.success) {
      Terminal.error(result.message);
      return;
    }
    Terminal.connectToServer(result.destination);
  }, [path]);
  return <MuiLink onClick={onClick}>{text}</MuiLink>;
}
