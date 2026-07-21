import React, { useCallback } from "react";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
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
  const first = path[0];
  const last = path.at(-1);
  let tooltip: string;
  if (last == null) {
    tooltip = "";
  } else if (path.length === 1) {
    tooltip = `connect ${first}`;
  } else if (path.length === 2) {
    tooltip = `connect ${first}; connect ${last}`;
  } else {
    tooltip = `connect ${first}; ...; connect ${last}`;
  }
  return (
    <Tooltip title={tooltip}>
      <Link onClick={onClick}>{text}</Link>
    </Tooltip>
  );
}
