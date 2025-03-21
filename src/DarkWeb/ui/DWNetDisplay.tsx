import React, {useEffect, useRef, PointerEventHandler} from "react";
import { Container, Typography } from "@mui/material";
import { DWServerComponent, getPixelPosition } from "./DWServerComponent";
import { DarkWebNetwork, populateDarkWebNetwork } from "../models/DarkWebNetwork";
import { useRerender } from "../../ui/React/hooks";

export const DW_NET_WIDTH = 2000;
export const DW_NET_HEIGHT = 4000;

export function DWNetDisplay(): React.ReactElement {

  const rerender = useRerender();
  const draggableBackground = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    populateDarkWebNetwork();
    rerender();
    drawOnCanvas();
  }, [rerender]);

  const drawOnCanvas = () => {
    for (const server of DarkWebNetwork.flat()) {
      if (!server) { continue; }
      const ctx = canvas.current?.getContext("2d");
      if (ctx == null) { return; }
      // draw a line between each server and its connected servers

      for (const connectedServer of server.connections) {
        if (!connectedServer) { continue; }
        ctx.strokeStyle = "blue";
        ctx.beginPath();
        const startPosition = getPixelPosition(server.x, server.y);
        const endPosition = getPixelPosition(connectedServer.x, connectedServer.y);
        ctx.moveTo(startPosition.left, startPosition.top );
        ctx.lineTo(endPosition.left, endPosition.top);
        ctx.stroke();
      }
    }
  }


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
  }

  const handleDrag: PointerEventHandler<HTMLDivElement> = (pointerEvent) => {
    if (draggableBackground.current?.hasPointerCapture(pointerEvent.pointerId)) {
      draggableBackground.current.scrollLeft -= pointerEvent.movementX;
      draggableBackground.current.scrollTop -= pointerEvent.movementY;
    }
  }


  return (
    <Container maxWidth="lg" sx={{ mx: 0 }} >
      <Typography variant={"h6"}>Dark Web</Typography>
        <div style={{width: "calc(90vw - 250px)", height: "90vh", overflow: "scroll", position: "relative", border: "solid 1px blue" }}
             ref={draggableBackground}
             onPointerDown={handleDragStart}
             onPointerUp={handleDragEnd}
             onPointerMove={handleDrag}
        >
          <div
               style={{position: "relative", width: `${DW_NET_WIDTH}px`, height: `${DW_NET_HEIGHT}px`}}
               id={"draggableBackgroundTarget"}
          >
            <canvas ref={canvas} id="dwebCanvas" width={DW_NET_WIDTH} height={DW_NET_HEIGHT} style={{position: "absolute", zIndex: -1}}></canvas>
            {DarkWebNetwork.map((row, i) => (
                row.map((server, j) => ( server ?
                    <DWServerComponent server={server} key={`${i},${j}`}/> : ""
                ))
              )
            )}

          </div>
        </div>
    </Container>
  );
}