import { HSV, useSyncState } from "./";
import React, { MouseEvent, useEffect } from "react";

type Props = {
  sat: number;
  val: number;
  hue: number;
  setSV: (sv: Omit<HSV, "hue">) => void;
};

const MARKER_RADIUS = 4;

function constrain(val: number, min: number, max: number) {
  return val > min ? (val < max ? val : max) : min;
}

export function SVCanvas({ hue, sat, val, setSV }: Props) {
  const [s, setS] = useSyncState(sat);
  const [v, setV] = useSyncState(val);

  const setSVByEvent = (event: MouseEvent) => {
    const { width, height, x: posX, y: posY } = event.currentTarget.getBoundingClientRect();

    const x = constrain(event.clientX - posX - MARKER_RADIUS, -MARKER_RADIUS, width - MARKER_RADIUS);
    const y = constrain(event.clientY - posY - MARKER_RADIUS, -MARKER_RADIUS, height - MARKER_RADIUS);

    const s = ((x + MARKER_RADIUS) / width) * 100;
    const v = 100 - ((y + MARKER_RADIUS) / height) * 100;

    setS(s);
    setV(v);
  };

  useEffect(() => {
    if (sat == s && val == v) return;

    setSV({ sat: s, val: v });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, v]);

  return (
    <SVCanvasDisplay
      hue={hue}
      onMouseDown={(e) => setSVByEvent(e)}
      onMouseMove={(e) => e.buttons == 1 && setSVByEvent(e)}
    >
      <Marker s={s} v={v}></Marker>
    </SVCanvasDisplay>
  );
}

type DisplayProps = {
  hue: number;
  onMouseDown: (e: MouseEvent) => void;
  onMouseMove: (e: MouseEvent) => void;
  children: JSX.Element;
};

function SVCanvasDisplay({ hue, onMouseDown, onMouseMove, children }: DisplayProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: `hsl(${hue} 100% 50%)`,
      }}
      draggable={false}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "rgba(0, 0, 0, 0) linear-gradient(to right, rgb(255, 255, 255), rgba(255, 255, 255, 0)) repeat scroll 0% 0%",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0) linear-gradient(to top, rgb(0, 0, 0), rgba(0, 0, 0, 0)) repeat scroll 0% 0%",
            position: "relative",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

type MarkerProps = {
  s: number;
  v: number;
};

function Marker({ s, v }: MarkerProps) {
  return (
    <div
      style={{
        width: `${MARKER_RADIUS * 2}px`,
        height: `${MARKER_RADIUS * 2}px`,
        background: "transparent",
        border: "1.2px solid white",
        borderRadius: "100%",
        position: "absolute",
        left: `calc(${s}% - ${MARKER_RADIUS}px)`,
        bottom: `calc(${v}% - ${MARKER_RADIUS}px)`,
      }}
    ></div>
  );
}
