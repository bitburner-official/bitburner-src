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
  let tooltip: string;
  switch (path.length) {
    case 0:
      tooltip = "";
      break;
    case 1:
      tooltip = `connect ${path[0]}`;
      break;
    case 2:
      tooltip = `connect ${path[0]}; connect ${path[1]}`;
      break;
    default:
      tooltip = `connect ${path[0]}; ...; connect ${path.at(-1)}`;
      break;
  }
  return (
    <Tooltip title={tooltip}>
      <Link onClick={onClick}>{text}</Link>
    </Tooltip>
  );
}
