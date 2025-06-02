import { DarknetState } from "../models/DarknetState";
import { GetServer } from "../../Server/AllServers";
import {
  DW_SERVER_GAP_LEFT,
  DW_SERVER_GAP_TOP,
  DW_SERVER_HEIGHT,
  DW_SERVER_WIDTH,
  MAP_BORDER_WIDTH,
} from "./dnetStyles";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { getNetDepth, isLabyrinthServer } from "../effects/labyrinth";
import { BaseServer } from "../../Server/BaseServer";
import { getDarknetData } from "../effects/effects";
import { NET_WIDTH } from "../Enums";

export const drawOnCanvas = (canvas: HTMLCanvasElement) => {
  const ctx = canvas?.getContext("2d");
  if (!ctx || !canvas) {
    console.error("Could not get canvas context");
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const server of DarknetState.Network.flat()) {
    if (!server || (!server.hasAdminRights && !server.serversOnNetwork.find((s) => GetServer(s)?.hasAdminRights))) {
      continue;
    }

    // draw a line between each server and its connected servers
    for (const connectedServerName of server.serversOnNetwork) {
      const connectedServer = GetServer(connectedServerName);
      if (
        !connectedServer ||
        (!connectedServer.hasAdminRights && !connectedServer.serversOnNetwork.find((s) => GetServer(s)?.hasAdminRights))
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

export const getPixelPosition = (server: BaseServer, centered = false) => {
  const centeredOffsetHorizontal = centered ? DW_SERVER_WIDTH / 2 : 0;
  const centeredOffsetVertical = centered ? DW_SERVER_HEIGHT / 2 : 0;

  if (server.hostname === SpecialServers.DarkWeb) {
    return {
      top: MAP_BORDER_WIDTH * 0.2 + (centered ? centeredOffsetVertical : 0),
      left: (DW_SERVER_GAP_LEFT + DW_SERVER_WIDTH) * NET_WIDTH * 0.5 + (centered ? centeredOffsetHorizontal : 0),
    };
  } else if (isLabyrinthServer(server.hostname)) {
    return {
      top:
        MAP_BORDER_WIDTH +
        centeredOffsetVertical +
        (DW_SERVER_GAP_TOP + DW_SERVER_HEIGHT) * getNetDepth() +
        DW_SERVER_GAP_TOP,
      left: (DW_SERVER_GAP_LEFT + DW_SERVER_WIDTH) * NET_WIDTH * 0.5 + (centered ? centeredOffsetHorizontal : 0),
    };
  }

  const coords = getCoordinates(server);

  const widthOfServers = (DW_SERVER_GAP_LEFT + DW_SERVER_WIDTH) * coords.y;
  const staggeredHorizontalOffset = coords.x % 2 ? DW_SERVER_WIDTH / 2 : 0;
  const heightOfServers = (DW_SERVER_GAP_TOP + DW_SERVER_HEIGHT) * coords.x;

  return {
    top: heightOfServers + MAP_BORDER_WIDTH + centeredOffsetVertical,
    left: widthOfServers + MAP_BORDER_WIDTH + centeredOffsetHorizontal + staggeredHorizontalOffset,
  };
};

const getCoordinates = (server: BaseServer) => {
  const darknetData = getDarknetData(server);
  if (!darknetData) {
    throw new Error("Server missing dark web data");
  }
  return {
    x: darknetData.depth,
    y: darknetData.leftOffset,
  };
};
