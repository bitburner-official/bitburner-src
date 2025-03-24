import React, { useEffect, useRef, PointerEventHandler, WheelEventHandler, useState } from "react";
import { Container, Typography } from "@mui/material";
import { DWServerComponent, getPixelPosition } from "./DWServerComponent";
import { useRerender } from "../../ui/React/hooks";
import { DarkWebEvents, DarkWebNetwork } from "../models/DarkWebState";
import { DW_SERVER_HEIGHT, DW_SERVER_WIDTH } from "./dwebStyles";
import { GetServer } from "../../Server/AllServers";
import { Server } from "../../Server/Server";

export const DW_NET_WIDTH = 4000;
export const DW_NET_HEIGHT = 6000;

export function DWNetDisplayWrapper(): React.ReactElement {
  const rerender = useRerender();
  const draggableBackground = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [zoomIndex, setZoomIndex] = useState(5);
  const zoomOptions = [0.3, 0.4, 0.5, 0.6, 0.75, 1, 1.5];

  useEffect(() => {
    DarkWebEvents.subscribe(() => {
      if (canvas.current) {
        rerender();
        drawOnCanvas();
      }
    });
    drawOnCanvas();
    draggableBackground?.current?.addEventListener("wheel", (e) => e.preventDefault());
  }, [rerender]);

  const drawOnCanvas = () => {
    const ctx = canvas.current?.getContext("2d");
    if (ctx == null || !canvas.current) {
      console.error("Could not get canvas context");
      return;
    }
    ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);

    for (const server of DarkWebNetwork.flat()) {
      if (!server) {
        continue;
      }

      // draw a line between each server and its connected servers
      for (const connectedServerName of server.serversOnNetwork) {
        const connectedServer = GetServer(connectedServerName);
        const darkWebData = server.darkWebData;
        const connectedDarkWebData = connectedServer?.darkWebData;
        if (!connectedServer || !connectedDarkWebData || !darkWebData) {
          continue;
        }
        ctx.beginPath();
        ctx.strokeStyle = server.hasAdminRights || connectedServer.hasAdminRights ? "green" : "grey";
        const startPosition = getPixelPosition(darkWebData.x, darkWebData.y);
        const endPosition = getPixelPosition(connectedDarkWebData.x, connectedDarkWebData.y);
        ctx.moveTo(startPosition.left + DW_SERVER_WIDTH / 2, startPosition.top + DW_SERVER_HEIGHT / 2);
        ctx.lineTo(endPosition.left + DW_SERVER_WIDTH / 2, endPosition.top + DW_SERVER_HEIGHT / 2);
        ctx.stroke();
      }
    }
  };

  const allowAuth = (server: Server) =>  server.hasAdminRights ||
      server?.darkWebData?.x === 0 ||
      server.serversOnNetwork.some((neighbor) => GetServer(neighbor)?.hasAdminRights);

  const handleDragStart: PointerEventHandler<HTMLDivElement> = (pointerEvent) => {
    const target = pointerEvent.target as HTMLDivElement;
    if (target.id === "draggableBackgroundTarget") {
      draggableBackground.current?.setPointerCapture(pointerEvent.pointerId);
    }
  };

  const handleDragEnd: PointerEventHandler<HTMLDivElement> = (pointerEvent) => {
    const target = pointerEvent.target as HTMLDivElement;
    if (target.id === "draggableBackgroundTarget") {
      draggableBackground.current?.releasePointerCapture(pointerEvent.pointerId);
    }
  };

  const handleDrag: PointerEventHandler<HTMLDivElement> = (pointerEvent) => {
    if (draggableBackground.current?.hasPointerCapture(pointerEvent.pointerId)) {
      draggableBackground.current.scrollLeft -= pointerEvent.movementX;
      draggableBackground.current.scrollTop -= pointerEvent.movementY;
    }
  };

  const handleZoom: WheelEventHandler<HTMLDivElement> = (wheelEvent) => {
    wheelEvent.stopPropagation();
    const target = wheelEvent.target as HTMLDivElement;
    if (!draggableBackground?.current) {
      return;
    }
    const direction = wheelEvent.deltaY < 0 ? 1 : -1;
    setZoomIndex(Math.max(Math.min(zoomIndex + direction, zoomOptions.length - 1), 0));

    if (!target?.parentElement?.getBoundingClientRect()) {
      return;
    }
    // TODO: scroll toward the mouse cursor location?
    // const width = target?.parentElement?.getBoundingClientRect()?.width;
    // const height = target?.parentElement?.getBoundingClientRect()?.height;
    // const deltaX = wheelEvent.pageX - target?.parentElement?.getBoundingClientRect()?.x;
    // const deltaY = wheelEvent.pageY - target?.parentElement?.getBoundingClientRect()?.y;
    // // adjust the draggableBackground scrollLeft and scrollTop to make the zoom center around the mouse position
    // draggableBackground.current.scrollLeft += width * 0.5;
    // draggableBackground.current.scrollTop += height * 0.5;
  };

  return (
    <Container maxWidth="lg" sx={{ mx: 0 }}>
      <Typography variant={"h6"}>Dark Web</Typography>
      <div
        style={{
          width: "calc(90vw - 250px)",
          height: "90vh",
          overflow: "scroll",
          position: "relative",
          border: "solid 1px blue",
        }}
        ref={draggableBackground}
        onPointerDown={handleDragStart}
        onPointerUp={handleDragEnd}
        onPointerMove={handleDrag}
        onWheel={handleZoom}
      >
        <div
          style={{
            position: "relative",
            width: `${DW_NET_WIDTH}px`,
            height: `${DW_NET_HEIGHT}px`,
            zoom: zoomOptions[zoomIndex],
          }}
          id={"draggableBackgroundTarget"}
        >
          <canvas
            ref={canvas}
            id="dwebCanvas"
            width={DW_NET_WIDTH}
            height={DW_NET_HEIGHT}
            style={{ position: "absolute", zIndex: -1 }}
          ></canvas>
          {DarkWebNetwork.map((row, i) =>
            row.map((server, j) => (server ?
              <DWServerComponent server={server} key={`${i},${j}`} enableAuth={allowAuth(server)} /> : "")),
          )}
        </div>
      </div>
    </Container>
  );
}
