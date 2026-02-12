import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  type PointerEventHandler,
  type WheelEventHandler,
} from "react";
import { Container, Typography, Button, Box, Tooltip } from "@mui/material";
import { ZoomIn, ZoomOut } from "@mui/icons-material";
import { throttle } from "lodash";
import { ServerStatusBox } from "./ServerStatusBox";
import { useRerender } from "../../ui/React/hooks";
import { DarknetEvents, DarknetState } from "../models/DarknetState";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { drawOnCanvas, getPixelPosition } from "./networkCanvas";
import { dnetStyles, DWServerLogStyles } from "./dnetStyles";
import { getLabyrinthDetails, isLabyrinthServer } from "../effects/labyrinth";
import { DarknetServer } from "../../Server/DarknetServer";
import { getAllDarknetServers } from "../utils/darknetNetworkUtils";
import { ServerDetailsModal } from "./ServerDetailsModal";
import { AutoCompleteSearchBox } from "../../ui/AutoCompleteSearchBox";
import { getDarknetServerOrThrow } from "../utils/darknetServerUtils";
import { getServerLogs } from "../models/packetSniffing";
import { getTimeoutChance } from "../effects/offlineServerHandling";
import { DocumentationLink } from "../../ui/React/DocumentationLink";
import { Settings } from "../../Settings/Settings";

const DW_NET_WIDTH = 6000;
const DW_NET_HEIGHT = 12000;
const initialSearchLabel = `Search:`;

export function NetworkDisplayWrapper(): React.ReactElement {
  const rerender = useRerender();
  const draggableBackground = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [zoomIndex, setZoomIndex] = useState(DarknetState.zoomIndex);
  const [netDisplayDepth, setNetDisplayDepth] = useState<number>(1);
  const [searchLabel, setSearchLabel] = useState<string>(initialSearchLabel);
  const [serverOpened, setServerOpened] = useState<DarknetServer | null>(null);
  const zoomOptions = useMemo(() => [0.12, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 1, 1.3], []);
  const { classes } = dnetStyles({});
  const instability = getTimeoutChance();
  const instabilityText = instability > 0.01 ? `${(instability * 100).toFixed(1)}%` : "< 1%";

  const scrollTo = useCallback(
    (top: number, left: number) => {
      DarknetState.netViewTopScroll = top;
      DarknetState.netViewLeftScroll = left;

      draggableBackground?.current?.scrollTo({
        top: top,
        left: left,
        behavior: "instant",
      });
    },
    [draggableBackground],
  );

  const updateDisplay = useCallback(() => {
    if (!canvas.current) {
      return;
    }
    const visibilityMargin = DarknetState.showFullNetwork ? 99 : 3;
    setNetDisplayDepth(getDeepestServerDepth() + visibilityMargin);

    rerender();
    drawOnCanvas(canvas.current);
  }, [rerender]);

  useEffect(() => {
    const clearSubscription = DarknetEvents.subscribe(() => updateDisplay());
    draggableBackground.current?.addEventListener("wheel", (e) => e.preventDefault());
    scrollTo(DarknetState.netViewTopScroll, DarknetState.netViewLeftScroll);
    updateDisplay();

    return () => {
      clearSubscription();
    };
  }, [updateDisplay, rerender, scrollTo]);

  const getDeepestServerDepth = () => {
    const lab = getLabyrinthDetails().lab;
    const startingDepth = lab && getServerLogs(lab, 1, true).length ? lab.depth : 0;
    return DarknetState.Network.flat().reduce(
      (deepest, server) => (server?.hasAdminRights && server.depth > deepest ? server.depth : deepest),
      startingDepth,
    );
  };

  const allowAuth = (server: DarknetServer | null) =>
    !!server &&
    (server.hasAdminRights ||
      server.serversOnNetwork.some((neighbor) => getDarknetServerOrThrow(neighbor).hasAdminRights));

  const darkWebRoot = getDarknetServerOrThrow(SpecialServers.DarkWeb);
  const labDetails = getLabyrinthDetails();
  const labyrinth = labDetails.lab;
  const depth = labDetails.depth;

  const handleDragStart: PointerEventHandler<HTMLDivElement> = (pointerEvent) => {
    const target = pointerEvent.target as HTMLDivElement;
    const background = draggableBackground.current;
    if (target.id === "draggableBackgroundTarget") {
      background?.setPointerCapture(pointerEvent.pointerId);
    }
  };

  const handleDragEnd: PointerEventHandler<HTMLDivElement> = (pointerEvent) => {
    const target = pointerEvent.target as HTMLDivElement;
    const background = draggableBackground.current;
    if (target.id === "draggableBackgroundTarget") {
      background?.releasePointerCapture(pointerEvent.pointerId);
    }
    DarknetEvents.emit();
  };

  const handleDrag: PointerEventHandler<HTMLDivElement> = (pointerEvent) => {
    const background = draggableBackground.current;
    if (background?.hasPointerCapture(pointerEvent.pointerId)) {
      scrollTo(background?.scrollTop - pointerEvent.movementY, (background?.scrollLeft ?? 0) - pointerEvent.movementX);
    }
  };

  const zoomIn = useCallback(() => {
    if (zoomIndex >= zoomOptions.length - 1) {
      return;
    }
    DarknetState.zoomIndex = Math.max(zoomIndex + 1, 0);
    setZoomIndex(DarknetState.zoomIndex);
    const zoom = zoomOptions[zoomIndex];
    const background = draggableBackground.current;
    scrollTo(
      (background?.scrollTop ?? 0) + ((background?.clientHeight ?? 0) / 4) * zoom,
      (background?.scrollLeft ?? 0) + ((background?.clientWidth ?? 0) / 4) * zoom,
    );
  }, [zoomIndex, setZoomIndex, zoomOptions, scrollTo]);

  const zoomOut = useCallback(() => {
    if (zoomIndex <= 0) {
      return;
    }
    DarknetState.zoomIndex = Math.min(zoomIndex - 1, zoomOptions.length - 1);
    setZoomIndex(DarknetState.zoomIndex);
    const zoom = zoomOptions[zoomIndex];
    const background = draggableBackground.current;
    scrollTo(
      (background?.scrollTop ?? 0) - ((background?.clientHeight ?? 0) / 4) * zoom,
      (background?.scrollLeft ?? 0) - ((background?.clientWidth ?? 0) / 4) * zoom,
    );
  }, [zoomIndex, setZoomIndex, zoomOptions, scrollTo]);

  const zoom = useCallback(
    (wheelEvent: WheelEvent) => {
      const target = wheelEvent.target as HTMLDivElement;
      if (!draggableBackground.current || DarknetState.openServer) {
        return;
      }
      if (wheelEvent.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }

      if (!target?.parentElement?.getBoundingClientRect()) {
        return;
      }
    },
    [draggableBackground, zoomOut, zoomIn],
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

  const search = (selection: string, options: string[], searchTerm: string) => {
    if (searchTerm.length === 1) {
      return;
    } // Ignore single character searches
    if (!searchTerm) {
      setSearchLabel(initialSearchLabel);
      return;
    }
    const servers = getAllDarknetServers();
    const foundServer =
      servers.find((s) => s.hostname.toLowerCase() === selection.toLowerCase()) ||
      servers.find((s) => s.hostname.toLowerCase() === options[0]?.toLowerCase());

    if (!foundServer) {
      setSearchLabel(`(No results)`);
      return;
    } else {
      setSearchLabel(initialSearchLabel);
    }

    const position = getPixelPosition(foundServer, true);

    const background = draggableBackground.current;
    scrollTo(
      position.top * zoomOptions[zoomIndex] - ((background?.clientHeight ?? 0) / 2 - 100),
      position.left * zoomOptions[zoomIndex] - (background?.clientWidth ?? 0) / 2,
    );

    if (allowAuth(foundServer)) {
      setServerOpened(foundServer);
    }
  };

  const getAutocompleteSuggestionList = (): string[] => {
    const servers = getAllDarknetServers()
      .filter((s) => s.depth < netDisplayDepth && !isLabyrinthServer(s.hostname))
      .map((s) => s.hostname);

    if (labyrinth && netDisplayDepth > depth) {
      return [...servers, labyrinth.hostname];
    }

    return servers;
  };

  const getServerKey = (server: DarknetServer, x: number, y: number) => {
    return `${x} ${y} ${server.hostname} ${server.hasAdminRights}`;
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
        <Box className={`${classes.inlineFlexBox}`}>
          <Typography variant={"h5"} sx={{ fontWeight: "bold" }}>
            Dark Net
          </Typography>
          {instability && (
            <Tooltip
              title={
                <>
                  If too many darknet servers are backdoored, it will increase the chance that authentication <br />
                  attempts will return a 408 Request Timeout error (even if the password is correct). <br />
                  Most servers will eventually restart or go offline, which removes backdoors over time.
                </>
              }
            >
              <Typography variant={"subtitle1"} sx={{ fontStyle: "italic" }}>
                {" "}
                Instability: {instabilityText}
              </Typography>
            </Tooltip>
          )}
        </Box>
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
            width={DW_NET_WIDTH}
            height={DW_NET_HEIGHT}
            style={{ position: "absolute", zIndex: -1 }}
          ></canvas>
          {darkWebRoot && <ServerStatusBox server={darkWebRoot} enableAuth={true} classes={classes} />}
          {DarknetState.Network.slice(0, netDisplayDepth).map((row, i) =>
            row.map(
              (server, j) =>
                server && (
                  <ServerStatusBox
                    server={server}
                    key={getServerKey(server, i, j)}
                    enableAuth={allowAuth(server)}
                    classes={classes}
                  />
                ),
            ),
          )}

          {labyrinth && netDisplayDepth > depth && (
            <ServerStatusBox server={labyrinth} enableAuth={allowAuth(labyrinth)} classes={classes} />
          )}
        </div>
      </div>
      <div className={classes.zoomContainer}>
        <Button className={classes.button} onClick={() => zoomIn()}>
          <ZoomIn />
        </Button>
        <Button className={classes.button} onClick={() => zoomOut()}>
          <ZoomOut />
        </Button>
      </div>
      <Box className={`${classes.inlineFlexBox}`}>
        <Typography component="div" display="flex">
          <Typography display="flex" alignItems="center" paddingRight="1em">
            {searchLabel}
          </Typography>
          <AutoCompleteSearchBox
            placeholder="Search for server"
            maxSuggestions={6}
            suggestionList={getAutocompleteSuggestionList}
            ignoredTextRegex={/ /g}
            onSelection={(_, selection, options, searchValue) => {
              search(selection, options, searchValue);
            }}
            width={300}
          />
        </Typography>
        <DocumentationLink
          page="programming/darknet.md"
          style={{
            ...DWServerLogStyles,
            fontSize: "18px",
            padding: "2px 20px",
            backgroundColor: Settings.theme.button,
          }}
        >
          Darknet Docs
        </DocumentationLink>
      </Box>
    </Container>
  );
}
