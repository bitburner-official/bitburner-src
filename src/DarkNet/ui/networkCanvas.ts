import { DarknetState } from "../models/DarknetState";
import {
  DW_SERVER_GAP_LEFT,
  DW_SERVER_GAP_TOP,
  DW_SERVER_HEIGHT,
  DW_SERVER_WIDTH,
  MAP_BORDER_WIDTH,
} from "./dnetStyles";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { getNetDepth, isLabyrinthServer } from "../effects/labyrinth";
import { NET_WIDTH } from "../Enums";
import type { DarknetServer } from "../../Server/DarknetServer";
import { getDarknetServerOrThrow } from "../utils/darknetServerUtils";

export const drawOnCanvas = (canvas: HTMLCanvasElement, netDisplayDepth: number, labDepth: number) => {
  const ctx = canvas?.getContext("2d");
  if (!ctx || !canvas) {
    console.error("Could not get canvas context");
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const server of DarknetState.Network.flat()) {
    if (
      !server ||
      // Servers in DarknetState.Network are not labyrinth servers, so it's fine to check server.depth.
      server.depth >= netDisplayDepth ||
      (!server.hasAdminRights && !server.serversOnNetwork.find((s) => getDarknetServerOrThrow(s).hasAdminRights))
    ) {
      continue;
    }

    // Draw a line between each server and its connected servers
    for (const connectedServerName of server.serversOnNetwork) {
      const connectedServer = getDarknetServerOrThrow(connectedServerName);
      // With labyrinth servers, server.depth is always -1, so we need to check labDepth.
      const connectedServerDepth = isLabyrinthServer(connectedServerName) ? labDepth : connectedServer.depth;
      if (
        connectedServerDepth >= netDisplayDepth ||
        (!connectedServer.hasAdminRights &&
          !connectedServer.serversOnNetwork.find((s) => getDarknetServerOrThrow(s).hasAdminRights))
      ) {
        continue;
      }
      ctx.beginPath();
      const connectedColor = "green";
      const disconnectedColor = "grey";
      ctx.strokeStyle = server.hasAdminRights || connectedServer.hasAdminRights ? connectedColor : disconnectedColor;
      const startPosition = getPixelPosition(server, true);
      const endPosition = getPixelPosition(connectedServer, true);
      ctx.moveTo(startPosition.left, startPosition.top);
      ctx.lineTo(endPosition.left, endPosition.top);
      ctx.stroke();
    }
  }
};

export const getPixelPosition = (server: DarknetServer, centered = false) => {
  return getPixelPositionFromCoords(server.hostname, server.leftOffset, server.depth, centered);
};

export const getPixelPositionFromCoords = (hostname: string, x: number, y: number, centered = false) => {
  if (hostname === SpecialServers.DarkWeb) {
    x = (NET_WIDTH - 1) * 0.5;
    y = -1;
  } else if (isLabyrinthServer(hostname)) {
    x = (NET_WIDTH - 1) * 0.5;
    y = getNetDepth() + 0.5;
  }
  const centeredOffsetHorizontal = centered ? DW_SERVER_WIDTH / 2 : 0;
  const centeredOffsetVertical = centered ? DW_SERVER_HEIGHT / 2 : 0;

  const widthOfServers = (DW_SERVER_GAP_LEFT + DW_SERVER_WIDTH) * x;
  const staggeredHorizontalOffset = y >= 0 && y < getNetDepth() && y % 2 ? DW_SERVER_WIDTH / 2 : 0;
  const heightOfServers = (DW_SERVER_GAP_TOP + DW_SERVER_HEIGHT) * y;

  return {
    top: heightOfServers + MAP_BORDER_WIDTH + centeredOffsetVertical,
    left: widthOfServers + MAP_BORDER_WIDTH + centeredOffsetHorizontal + staggeredHorizontalOffset,
  };
};
