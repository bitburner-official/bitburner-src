import React, { PointerEventHandler, useEffect, useRef, useState, WheelEventHandler } from "react";
import { Container, Typography, Button, Box, Link } from "@mui/material";
import { ZoomIn, ZoomOut } from "@mui/icons-material";
import { DNServerComponent } from "./DNServerComponent";
import { useRerender } from "../../ui/React/hooks";
import { DarknetEvents, DarknetState } from "../models/DarknetState";
import { GetServer } from "../../Server/AllServers";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { BaseServer } from "../../Server/BaseServer";
import { drawOnCanvas, getPixelPosition } from "./networkCanvas";
import { clearDarknet, populateDarknet } from "../controllers/DarknetNetworkGenerator";
import { dnetStyles } from "./dnetStyles";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { WEBSTORM } from "../controllers/webstorm";
import { getLabyrinthDetails } from "../effects/labyrinth";
import { DarknetServer } from "../../Server/DarknetServer";

export const DW_NET_WIDTH = 6000;
export const DW_NET_HEIGHT = 12000;

export function NetworkDisplayWrapper(): React.ReactElement {
  const rerender = useRerender();
  const draggableBackground = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [zoomIndex, setZoomIndex] = useState(7);
  const [netDisplayDepth, setNetDisplayDepth] = useState<number>(1);
  const [visibilityMargin, setVisibilityMargin] = useState<number>(3);
  const zoomOptions = [0.12, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 1, 1.5];
  const { classes } = dnetStyles({});

  useEffect(() => {
    DarknetEvents.subscribe(() => {
      if (canvas.current) {
        const deepestServer: number = DarknetState.Network.flat().reduce((deepest, server) => {
          if (server?.hasAdminRights && server?.darknetData && (server?.darknetData?.x ?? 0 > deepest)) {
            return server.darknetData.x;
          }
          return deepest;
        }, 1);
        setNetDisplayDepth(deepestServer + visibilityMargin);

        rerender();
        drawOnCanvas(canvas.current);
      }
    });
    canvas.current && drawOnCanvas(canvas.current);
    draggableBackground?.current?.addEventListener("wheel", (e) => e.preventDefault());
  }, [rerender, visibilityMargin]);

  useEffect(() => {
    DarknetEvents.emit();
  }, []);

  const allowAuth = (server: BaseServer | null) =>
    !!server &&
    (server.hasAdminRights || server.serversOnNetwork.some((neighbor) => GetServer(neighbor)?.hasAdminRights));

  const darkWebRoot = GetServer(SpecialServers.DarkWeb);
  const labDetails = getLabyrinthDetails();
  const labyrinth = labDetails.lab;
  const depth = labDetails.depth;

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
    DarknetEvents.emit();
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
    if (!draggableBackground?.current || DarknetState.openServer) {
      return;
    }
    if (wheelEvent.deltaY < 0) {
      zoomOut();
    } else {
      zoomIn();
    }

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

  const zoomOut = () => {
    setZoomIndex(Math.max(Math.min(zoomIndex + 1, zoomOptions.length - 1), 0));
  };

  const zoomIn = () => {
    setZoomIndex(Math.max(Math.min(zoomIndex - 1, zoomOptions.length - 1), 0));
  };

  const isWithinScreen = (server: DarknetServer) => {
    const { left, top } = getPixelPosition(server, true);
    const buffer = 600;
    const visibleAreaLeftEdge = (draggableBackground.current?.scrollLeft ?? 0) / zoomOptions[zoomIndex];
    const visibleAreaTopEdge = (draggableBackground.current?.scrollTop ?? 0) / zoomOptions[zoomIndex];
    const visibleAreaRightEdge =
      visibleAreaLeftEdge +
      ((draggableBackground.current?.clientWidth ?? 0) / zoomOptions[zoomIndex] ** 2 || window.innerWidth);
    const visibleAreaBottomEdge =
      visibleAreaTopEdge +
      ((draggableBackground.current?.clientHeight ?? 0) / zoomOptions[zoomIndex] ** 2 || window.innerHeight);
    return (
      left >= visibleAreaLeftEdge - buffer &&
      left <= visibleAreaRightEdge + buffer &&
      top >= visibleAreaTopEdge - buffer &&
      top <= visibleAreaBottomEdge + buffer
    );
  };

  return (
    <Container maxWidth={false} disableGutters>
      {DarknetState.isMutating ? (
        <Typography variant={"h6"}>Dark Web</Typography>
      ) : (
        <Typography variant={"h6"} className={classes.gold}>
          [WEBSTORM WARNING]
        </Typography>
      )}
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
          {darkWebRoot ? <DNServerComponent server={darkWebRoot} enableAuth={true} classes={classes} /> : ""}
          {DarknetState.Network.slice(0, netDisplayDepth).map((row, i) =>
            row.map((server, j) =>
              server && isWithinScreen(server) ? (
                <DNServerComponent server={server} key={`${i},${j}`} enableAuth={allowAuth(server)} classes={classes} />
              ) : (
                ""
              ),
            ),
          )}

          {labyrinth && netDisplayDepth > depth ? (
            <DNServerComponent server={labyrinth} enableAuth={allowAuth(labyrinth)} classes={classes} />
          ) : (
            ""
          )}
        </div>
      </div>
      <div className={classes.zoomContainer}>
        <Button className={classes.button} onClick={() => zoomOut()}>
          <ZoomIn />
        </Button>
        <Button className={classes.button} onClick={() => zoomIn()}>
          <ZoomOut />
        </Button>
      </div>
      <Box className={`${classes.inlineFlexBox}`}>
        <Link
          style={{ cursor: "pointer" }}
          onClick={() => Router.toPage(Page.Documentation, { docPage: "advanced/darknet.md" })}
        >
          Darknet Documentation
        </Link>
        <Button
          onClick={() => {
            clearDarknet(true);
            populateDarknet();
          }}
          variant={"contained"}
          className={classes.button}
        >
          Generate New Web (for testing)
        </Button>
        <Button
          onClick={() => {
            setVisibilityMargin(visibilityMargin === 3 ? 99 : 3);
            DarknetEvents.emit();
          }}
          className={classes.button}
        >
          Toggle Show Full Network
        </Button>
        <Button onClick={() => void WEBSTORM()} variant={"contained"} className={classes.button}>
          START WEBSTORM (for testing)
        </Button>
      </Box>
    </Container>
  );
}
