/**
 * Creates a dropdown (select HTML element) with server hostnames as options
 *
 * Configurable to only contain certain types of servers
 */
import React from "react";
import { GetAllServers } from "../../Server/AllServers";
import { Server } from "../../Server/Server";
import { BaseServer } from "../../Server/BaseServer";
import { Player } from "@player";
import { HacknetServer } from "../../Hacknet/HacknetServer";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import { AugmentationName } from "@enums";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { throwIfReachable } from "../../utils/helpers/throwIfReachable";

export enum ServerType {
  All = 0,
  Foreign = 1, // Non-owned servers
  Owned = 2, // Home Computer, Purchased Servers, and Hacknet Servers
  Purchased = 3, // Everything from Owned except home computer
}

interface IProps {
  purchase: () => void;
  canPurchase: boolean;
  serverType: ServerType;
  onChange: (event: SelectChangeEvent) => void;
  value: string;
}

export function ServerDropdown(props: IProps): React.ReactElement {
  /**
   * Checks if the server should be shown in the dropdown menu, based on the
   * 'serverType' property
   */
  function isValidServer(baseServer: BaseServer): boolean {
    /**
     * isOwnedServer is true if baseServer is home, private servers, or hacknet servers. Note that, with home computer,
     * baseServer.purchasedByPlayer is true.
     */
    const isOwnedServer =
      (baseServer instanceof Server && baseServer.purchasedByPlayer) || baseServer instanceof HacknetServer;
    const type = props.serverType;
    switch (type) {
      case ServerType.All:
        return true;
      case ServerType.Foreign:
        // Exclude home, private servers, hacknet servers.
        if (isOwnedServer) {
          return false;
        }
        // If the player has not installed TRP, exclude WD server.
        return (
          Player.hasAugmentation(AugmentationName.TheRedPill, true) ||
          baseServer.hostname !== SpecialServers.WorldDaemon
        );
      case ServerType.Owned:
        return isOwnedServer;
      case ServerType.Purchased:
        return isOwnedServer && baseServer.hostname !== SpecialServers.Home;
      default:
        throwIfReachable(type);
    }
    return false;
  }

  const servers = [];
  for (const server of GetAllServers().sort((a, b) => a.hostname.localeCompare(b.hostname))) {
    if (isValidServer(server)) {
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
