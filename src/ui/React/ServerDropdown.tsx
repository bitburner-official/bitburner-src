/**
 * Creates a dropdown (select HTML element) with server hostnames as options
 *
 * Configurable to only contain certain types of servers
 */
import React from "react";
import { GetAllServers } from "../../Server/AllServers";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import { checkServerOwnership, ServerOwnershipType } from "../../Server/ServerHelpers";

interface IProps {
  purchase: () => void;
  canPurchase: boolean;
  serverType: ServerOwnershipType;
  onChange: (event: SelectChangeEvent) => void;
  value: string;
}

export function ServerDropdown(props: IProps): React.ReactElement {
  const servers = [];
  for (const server of GetAllServers().sort((a, b) => a.hostname.localeCompare(b.hostname))) {
    if (checkServerOwnership(server, props.serverType)) {
      servers.push(
        <MenuItem key={server.hostname} value={server.hostname}>
          {server.hostname}
        </MenuItem>,
      );
    }
  }

  return (
    <Select
      startAdornment={
        <Button onClick={props.purchase} disabled={!props.canPurchase}>
          Buy
        </Button>
      }
      sx={{ mx: 1 }}
      value={props.value}
      onChange={props.onChange}
    >
      {servers}
    </Select>
  );
}
