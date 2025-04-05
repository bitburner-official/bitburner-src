import React, { PointerEventHandler, useEffect, useRef, useState, WheelEventHandler } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { DNServerComponent } from "./DNServerComponent";
import { useRerender } from "../../ui/React/hooks";
import { DarknetEvents, DarknetState } from "../models/DarknetState";
import { GetServer } from "../../Server/AllServers";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { BaseServer } from "../../Server/BaseServer";
import { drawOnCanvas } from "./networkCanvas";
import { clearDarknet, populateDarknet } from "../controllers/DarknetNetworkGenerator";
import { WEBSTORM } from "../controllers/DarknetNetworkMovement";
import { dnetStyles } from "./dnetStyles";

export const DW_NET_WIDTH = 6000;
export const DW_NET_HEIGHT = 8000;

export function NetworkDisplayWrapper(): React.ReactElement {
  const rerender = useRerender();
  const draggableBackground = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [zoomIndex, setZoomIndex] = useState(6);
  const zoomOptions = [0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 1, 1.5];
  const { classes } = dnetStyles({});

  useEffect(() => {
    DarknetEvents.subscribe(() => {
      if (canvas.current) {
        rerender();
        drawOnCanvas(canvas.current);
      }
    });
    canvas.current && drawOnCanvas(canvas.current);
    draggableBackground?.current?.addEventListener("wheel", (e) => e.preventDefault());
  }, [rerender]);

  const allowAuth = (server: BaseServer | null) =>
    !!server &&
    (server.hasAdminRights || server.serversOnNetwork.some((neighbor) => GetServer(neighbor)?.hasAdminRights));

  const darkWebRoot = GetServer(SpecialServers.DarkWeb);
  if (!darkWebRoot) {
    throw new Error("Could not find darkweb root server");
  }
  const labyrinth = GetServer(SpecialServers.Labyrinth);
  if (!labyrinth) {
    throw new Error("Could not find labyrinth server");
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
    <Container maxWidth={false} disableGutters>
      <Typography variant={"h6"}>Dark Web</Typography>
      <div
        className={classes.NetWrapper}
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
            cursor: "grab",
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
          <DNServerComponent server={darkWebRoot} enableAuth={true} />
          {DarknetState.Network.map((row, i) =>
            row.map((server, j) =>
              server ? <DNServerComponent server={server} key={`${i},${j}`} enableAuth={allowAuth(server)} /> : "",
            ),
          )}

          <DNServerComponent server={labyrinth} enableAuth={true /*allowAuth(labyrinth)  TODO */} />
        </div>
      </div>
      <Box className={`${classes.inlineFlexBox}`}>
        <Button
          onClick={() => {
            clearDarknet();
            populateDarknet();
          }}
          variant={"contained"}
        >
          Generate New Web
        </Button>
        <Button onClick={() => void WEBSTORM()} variant={"contained"}>
          START WEBSTORM
        </Button>
      </Box>
    </Container>
  );
}
