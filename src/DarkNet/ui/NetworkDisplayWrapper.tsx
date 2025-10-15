import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  type PointerEventHandler,
  type WheelEventHandler,
} from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { ZoomIn, ZoomOut } from "@mui/icons-material";
import { throttle } from "lodash";
import { ServerStatusBox } from "./ServerStatusBox";
import { useRerender } from "../../ui/React/hooks";
import { DarknetEvents, DarknetState } from "../models/DarknetState";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { drawOnCanvas, getPixelPosition } from "./networkCanvas";
import { dnetStyles } from "./dnetStyles";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { getLabyrinthDetails } from "../effects/labyrinth";
import { DarknetServer } from "../../Server/DarknetServer";
import { getAllDarknetServers } from "../utils/darknetNetworkUtils";
import { ServerDetailsModal } from "./ServerDetailsModal";
import { AutoCompleteSearchBox } from "../../ui/AutoCompleteSearchBox";
import { getDarknetServer, getDarknetServerOrThrow } from "../utils/darknetServerUtils";
import { exceptionAlert } from "../../utils/helpers/exceptionAlert";

const DW_NET_WIDTH = 6000;
const DW_NET_HEIGHT = 12000;
const initialSearchLabel = `Search for server:`;

export function NetworkDisplayWrapper(): React.ReactElement {
  const rerender = useRerender();
  const draggableBackground = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [zoomIndex, setZoomIndex] = useState(7);
  const [netDisplayDepth, setNetDisplayDepth] = useState<number>(1);
  const [searchLabel, setSearchLabel] = useState<string>(initialSearchLabel);
  const [serverOpened, setServerOpened] = useState<DarknetServer | null>(null);
  const zoomOptions = useMemo(() => [0.12, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 1, 1.5], []);
  const { classes } = dnetStyles({});

  useEffect(() => {
    const clearSubscription = DarknetEvents.subscribe(() => {
      if (canvas.current) {
        const deepestServer = DarknetState.Network.flat().reduce((deepest, server) => {
          if (server?.hasAdminRights && server.depth > deepest) {
            return server.depth;
          }
          return deepest;
        }, 1);
        const visibilityMargin = DarknetState.showFullNetwork ? 99 : 3;
        setNetDisplayDepth(deepestServer + visibilityMargin);

        rerender();
        drawOnCanvas(canvas.current);
      }
    });
    canvas.current && drawOnCanvas(canvas.current);
    draggableBackground.current?.addEventListener("wheel", (e) => e.preventDefault());

    return () => {
      clearSubscription();
    };
  }, [rerender]);

  useEffect(() => {
    DarknetEvents.emit();
  }, []);

  const allowAuth = (server: DarknetServer | null) =>
    !!server &&
    (server.hasAdminRights ||
      server.serversOnNetwork.some((neighbor) => {
        const neighborServer = getDarknetServer(neighbor);
        if (neighborServer == null) {
          exceptionAlert(
            new Error(
              `Found invalid neighbor dnet server. Server: ${server.hostname}. serversOnNetwork: ${server.serversOnNetwork}. ` +
                `neighbor: ${neighbor}. offlineServers: ${DarknetState.offlineServers}`,
            ),
          );
          return false;
        }
        return neighborServer.hasAdminRights;
      }));

  const darkWebRoot = getDarknetServerOrThrow(SpecialServers.DarkWeb);
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

  const zoomOut = useCallback(() => {
    setZoomIndex(Math.max(Math.min(zoomIndex + 1, zoomOptions.length - 1), 0));
  }, [zoomIndex, setZoomIndex, zoomOptions]);

  const zoomIn = useCallback(() => {
    setZoomIndex(Math.max(Math.min(zoomIndex - 1, zoomOptions.length - 1), 0));
  }, [zoomIndex, setZoomIndex, zoomOptions]);

  const zoom = useCallback(
    (wheelEvent: WheelEvent) => {
      const target = wheelEvent.target as HTMLDivElement;
      if (!draggableBackground.current || DarknetState.openServer) {
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
    },
    [draggableBackground, zoomIn, zoomOut],
  );

  const zoomRef = useRef(zoom);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  // creating throttled callback only once - on mount
  const throttledZoom = useMemo(() => {
    const func = (wheelEvent: WheelEvent) => {
      zoomRef.current?.(wheelEvent);
    };
    return throttle(func, 200);
  }, []);

  const handleZoom: WheelEventHandler<HTMLDivElement> = (wheelEvent) => {
    wheelEvent.stopPropagation();
    throttledZoom(wheelEvent as unknown as WheelEvent);
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

  const search = (searchTerm: string) => {
    if (!searchTerm) {
      setSearchLabel(initialSearchLabel);
      return;
    }

    const results = getAllDarknetServers().filter(
      (s) => s.hostname.toLowerCase().includes(searchTerm) && s.depth < netDisplayDepth,
    );
    const foundServer = results[Math.floor(Math.random() * results.length)] ?? null;

    if (!foundServer) {
      setSearchLabel(`(No results for "${searchTerm}")`);
      return;
    } else {
      setSearchLabel(initialSearchLabel);
      setZoomIndex(8);
    }

    const position = getPixelPosition(foundServer, true);

    if (draggableBackground.current) {
      draggableBackground.current.scrollTo({
        top: position.top * zoomOptions[zoomIndex] - (draggableBackground.current.clientHeight / 2 - 100),
        left: position.left * zoomOptions[zoomIndex] - draggableBackground.current.clientWidth / 2,
        behavior: "instant",
      });
    }

    if (allowAuth(foundServer) && results.length === 1) {
      setServerOpened(foundServer);
    }
  };

  return (
    <Container maxWidth={false} disableGutters>
      {serverOpened ? (
        <ServerDetailsModal
          open={!!serverOpened}
          onClose={() => setServerOpened(null)}
          server={serverOpened}
          classes={classes}
        />
      ) : (
        ""
      )}
      {DarknetState.allowMutating ? (
        <Typography variant={"h6"}>Dark Net</Typography>
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
          {darkWebRoot && <ServerStatusBox server={darkWebRoot} enableAuth={true} classes={classes} />}
          {DarknetState.Network.slice(0, netDisplayDepth).map((row, i) =>
            row.map(
              (server, j) =>
                server &&
                isWithinScreen(server) && (
                  <ServerStatusBox server={server} key={`${i},${j}`} enableAuth={allowAuth(server)} classes={classes} />
                ),
            ),
          )}

          {labyrinth && netDisplayDepth > depth && (
            <ServerStatusBox server={labyrinth} enableAuth={allowAuth(labyrinth)} classes={classes} />
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
        <Button onClick={() => Router.toPage(Page.Documentation, { docPage: "programming/darknet.md" })}>
          Darknet Documentation
        </Button>
        <Typography component="div" display="flex">
          <Typography display="flex" alignItems="center" paddingRight="1em">
            {searchLabel}
          </Typography>
          <AutoCompleteSearchBox
            sx={{ maxWidth: "300px" }}
            placeholder="Search for server"
            maxSuggestions={6}
            suggestionList={() => getAllDarknetServers().map((s) => s.hostname)}
            ignoredTextRegex={/ /g}
            onSelection={(event, selection, options) => {
              search(options[0] ?? "");
            }}
          />
        </Typography>
      </Box>
    </Container>
  );
}
