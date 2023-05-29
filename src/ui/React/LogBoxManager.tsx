import React, { useEffect, useRef, useState } from "react";
import Draggable, { DraggableEvent } from "react-draggable";
import { ResizableBox, ResizeCallbackData } from "react-resizable";

import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { debounce } from "lodash";

import { workerScripts } from "../../Netscript/WorkerScripts";
import { killWorkerScriptByPid } from "../../Netscript/killWorkerScript";
import { startWorkerScript } from "../../NetscriptWorker";
import { RunningScript } from "../../Script/RunningScript";
import { findRunningScriptByPid } from "../../Script/ScriptHelpers";
import { GetServer } from "../../Server/AllServers";
import { Settings } from "../../Settings/Settings";
import { EventEmitter } from "../../utils/EventEmitter";
import { ANSIITypography } from "./ANSIITypography";
import { dialogBoxCreate } from "./DialogBox";
import { useRerender } from "./hooks";

let layerCounter = 0;

export const LogBoxEvents = new EventEmitter<[RunningScript]>();
export const LogBoxCloserEvents = new EventEmitter<[number]>();
export const LogBoxClearEvents = new EventEmitter<[]>();

// Dynamic properties (size, position) bound to a specific rendered instance of a LogBox
export class LogBoxProperties {
  x = window.innerWidth * 0.4;
  y = window.innerHeight * 0.3;
  width = 500;
  height = 500;

  rerender: () => void;
  rootRef: React.RefObject<Draggable>;

  constructor(rerender: () => void, rootRef: React.RefObject<Draggable>) {
    this.rerender = rerender;
    this.rootRef = rootRef;
  }

  updateDOM(): void {
    if (!this.rootRef.current) return;
    const state = this.rootRef.current.state as { x: number; y: number };
    state.x = this.x;
    state.y = this.y;
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.updateDOM();
  }

  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.rerender();
  }

  isVisible(): boolean {
    return this.rootRef.current !== null;
  }
}

interface Log {
  id: number; // The PID of the script *when the window was first opened*
  script: RunningScript;
}

let logs: Log[] = [];

export function LogBoxManager(): React.ReactElement {
  const rerender = useRerender();
  useEffect(
    () =>
      LogBoxEvents.subscribe((script: RunningScript) => {
        if (logs.some((l) => l.script.pid === script.pid)) return;
        logs.push({
          id: script.pid,
          script: script,
        });
        rerender();
      }),
    [],
  );

  //Event used by ns.closeTail to close tail windows
  useEffect(
    () =>
      LogBoxCloserEvents.subscribe((pid: number) => {
        closePid(pid);
      }),
    [],
  );

  useEffect(() =>
    LogBoxClearEvents.subscribe(() => {
      logs = [];
      rerender();
    }),
  );

  //Close tail windows by their id
  function close(id: number): void {
    logs = logs.filter((l) => l.id !== id);
    rerender();
  }

  //Close tail windows by their pid.
  function closePid(pid: number): void {
    logs = logs.filter((log) => log.script.pid !== pid);
    rerender();
  }

  return (
    <>
      {logs.map((log) => (
        <LogWindow key={log.id} script={log.script} onClose={() => close(log.id)} />
      ))}
    </>
  );
}

interface IProps {
  script: RunningScript;
  onClose: () => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    logs: {
      overflowY: "scroll",
      overflowX: "hidden",
      scrollbarWidth: "auto",
      flexDirection: "column-reverse",
      whiteSpace: "pre-wrap",
      wordWrap: "break-word",
    },
    titleButton: {
      borderWidth: "0 0 0 1px",
      borderColor: Settings.theme.welllight,
      borderStyle: "solid",
      borderRadius: "0",
      padding: "0",
      height: "100%",
    },
  }),
);

export const logBoxBaseZIndex = 1500;

function LogWindow(props: IProps): React.ReactElement {
  const draggableRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Draggable>(null);
  const script = props.script;
  const classes = useStyles();
  const container = useRef<HTMLDivElement>(null);
  const textArea = useRef<HTMLDivElement>(null);
  const rerender = useRerender(1000);
  const propsRef = useRef(new LogBoxProperties(rerender, rootRef));
  script.tailProps = propsRef.current;
  const [minimized, setMinimized] = useState(false);

  const textAreaKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === "a") {
      if (!textArea.current) return; //Should never happen
      const r = new Range();
      r.setStartBefore(textArea.current);
      r.setEndAfter(textArea.current);
      document.getSelection()?.removeAllRanges();
      document.getSelection()?.addRange(r);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const onResize = (e: React.SyntheticEvent, { size }: ResizeCallbackData) => {
    propsRef.current.setSize(size.width, size.height);
  };

  useEffect(() => {
    propsRef.current.updateDOM();
    updateLayer();
  }, []);

  function kill(): void {
    killWorkerScriptByPid(script.pid);
    rerender();
  }

  function run(): void {
    const server = GetServer(script.server);
    if (server === null) return;
    const s = findRunningScriptByPid(script.pid, server);
    if (s === null) {
      const baseScript = server.scripts.get(script.filename);
      if (!baseScript) {
        return dialogBoxCreate(
          `Could not launch script. The script ${script.filename} no longer exists on the server ${server.hostname}.`,
        );
      }
      const ramUsage = baseScript.getRamUsage(server.scripts);
      if (!ramUsage) {
        return dialogBoxCreate(`Could not calculate ram usage for ${script.filename} on ${server.hostname}.`);
      }
      // Reset some things, because we're reusing the RunningScript instance
      script.ramUsage = ramUsage;
      script.dataMap = {};
      script.onlineExpGained = 0;
      script.onlineMoneyMade = 0;
      script.onlineRunningTime = 0.01;

      startWorkerScript(script, server);
      rerender();
    } else {
      console.warn(`Tried to rerun pid ${script.pid} that was already running!`);
    }
  }

  function updateLayer(): void {
    const c = container.current;
    if (c === null) return;
    c.style.zIndex = logBoxBaseZIndex + layerCounter + "";
    layerCounter++;
    rerender();
  }

  function title(): React.ReactElement {
    const title_str = script.title === "string" ? script.title : `${script.filename} ${script.args.join(" ")}`;
    return (
      <Typography
        variant="h6"
        sx={{ marginRight: "auto", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}
        title={title_str}
      >
        {script.title}
      </Typography>
    );
  }

  function minimize(): void {
    setMinimized(!minimized);
  }

  function lineColor(s: string): "error" | "success" | "warn" | "info" | "primary" {
    if (s.match(/(^\[[^\]]+\] )?ERROR/) || s.match(/(^\[[^\]]+\] )?FAIL/)) {
      return "error";
    }
    if (s.match(/(^\[[^\]]+\] )?SUCCESS/)) {
      return "success";
    }
    if (s.match(/(^\[[^\]]+\] )?WARN/)) {
      return "warn";
    }
    if (s.match(/(^\[[^\]]+\] )?INFO/)) {
      return "info";
    }
    return "primary";
  }

  // And trigger fakeDrag when the window is resized
  useEffect(() => {
    window.addEventListener("resize", onWindowResize);
    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

  const onWindowResize = debounce((): void => {
    const node = draggableRef.current;
    if (!node) return;

    if (!isOnScreen(node)) {
      propsRef.current.setPosition(0, 0);
    }
  }, 100);

  const isOnScreen = (node: HTMLDivElement): boolean => {
    const bounds = node.getBoundingClientRect();

    return !(bounds.right < 0 || bounds.bottom < 0 || bounds.left > innerWidth || bounds.top > outerWidth);
  };

  const boundToBody = (e: DraggableEvent): void | false => {
    if (
      e instanceof MouseEvent &&
      (e.clientX < 0 || e.clientY < 0 || e.clientX > innerWidth || e.clientY > innerHeight)
    )
      return false;
  };

  // Max [width, height]
  const minConstraints: [number, number] = [150, 33];

  return (
    <Draggable handle=".drag" onDrag={boundToBody} ref={rootRef} onMouseDown={updateLayer}>
      <Box
        display="flex"
        sx={{
          flexFlow: "column",
          position: "fixed",
          zIndex: 1400,
          minWidth: `${minConstraints[0]}px`,
          minHeight: `${minConstraints[1]}px`,
          ...(minimized
            ? {
                border: "none",
                margin: 0,
                maxHeight: 0,
                padding: 0,
              }
            : {
                border: `1px solid ${Settings.theme.welllight}`,
              }),
        }}
        ref={container}
      >
        <ResizableBox
          width={propsRef.current.width}
          height={propsRef.current.height}
          onResize={onResize}
          minConstraints={minConstraints}
          handle={
            <span
              style={{
                position: "absolute",
                right: "-10px",
                bottom: "-16px",
                cursor: "nw-resize",
                display: minimized ? "none" : "inline-block",
              }}
            >
              <ArrowForwardIosIcon color="primary" style={{ transform: "rotate(45deg)", fontSize: "1.75rem" }} />
            </span>
          }
        >
          <>
            <Paper className="drag" sx={{ display: "flex", alignItems: "center", cursor: "grab" }} ref={draggableRef}>
              {title()}

              <span style={{ minWidth: "fit-content", height: `${minConstraints[1]}px` }}>
                {!workerScripts.has(script.pid) ? (
                  <IconButton className={classes.titleButton} onClick={run} onTouchEnd={run}>
                    <PlayCircleIcon />
                  </IconButton>
                ) : (
                  <IconButton className={classes.titleButton} onClick={kill} onTouchEnd={kill}>
                    <StopCircleIcon color="error" />
                  </IconButton>
                )}
                <IconButton className={classes.titleButton} onClick={minimize} onTouchEnd={minimize}>
                  {minimized ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                </IconButton>
                <IconButton className={classes.titleButton} onClick={props.onClose} onTouchEnd={props.onClose}>
                  <CloseIcon />
                </IconButton>
              </span>
            </Paper>

            <Paper
              className={classes.logs}
              style={{ height: `calc(100% - ${minConstraints[1]}px)`, display: minimized ? "none" : "flex" }}
              tabIndex={-1}
              ref={textArea}
              onKeyDown={textAreaKeyDown}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                {script.logs.map(
                  (line: React.ReactNode, i: number): React.ReactNode =>
                    typeof line !== "string" ? line : <ANSIITypography key={i} text={line} color={lineColor(line)} />,
                )}
              </div>
            </Paper>
          </>
        </ResizableBox>
      </Box>
    </Draggable>
  );
}
