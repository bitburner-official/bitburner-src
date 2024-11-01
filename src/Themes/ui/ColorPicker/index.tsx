import { ColorPreview } from "./ColorPreview";
import { HexInput, formatRGBtoHEX } from "./HexInput";
import { HueSlider } from "./HueSlider";
import { RGBDigit } from "./RGBDigit";
import { SVCanvas } from "./SVCanvas";
import React, { Dispatch, useEffect, useMemo, useReducer, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Modal } from "../../../ui/React/Modal";
import Button from "@mui/material/Button";

export type HSV = {
  hue: number;
  sat: number;
  val: number;
};

export type RGB = {
  r: number;
  g: number;
  b: number;
  a?: number;
};

function normalize(color: HSV | RGB) {
  const isRGB = (c: RGB | HSV): c is RGB => Object.hasOwn(color, "r");
  const rgb: RGB = isRGB(color) ? color : HSVtoRGB(color);
  const hsv: HSV = !isRGB(color) ? color : RGBtoHSV(color);
  return { rgb, hsv };
}

type OpenColorPickerButtonProps = {
  color: string;
  title: string;
  onColorChange: (color: string) => void;
};

function parseHEXtoRGB(hex: string): RGB {
  if (hex.length == 4) {
    return {
      r: Number.parseInt(`${hex[1]}${hex[1]}`, 16),
      g: Number.parseInt(`${hex[2]}${hex[2]}`, 16),
      b: Number.parseInt(`${hex[3]}${hex[3]}`, 16),
    };
  }

  if (hex.length == 7) {
    return {
      r: Number.parseInt(`${hex[1]}${hex[2]}`, 16),
      g: Number.parseInt(`${hex[3]}${hex[4]}`, 16),
      b: Number.parseInt(`${hex[5]}${hex[6]}`, 16),
    };
  }

  if (hex.length == 9) {
    return {
      r: Number.parseInt(`${hex[1]}${hex[2]}`, 16),
      g: Number.parseInt(`${hex[3]}${hex[4]}`, 16),
      b: Number.parseInt(`${hex[5]}${hex[6]}`, 16),
      a: Number.parseInt(`${hex[7]}${hex[8]}`, 16),
    };
  }

  throw new Error("Invalid hex string");
}

export function OpenColorPickerButton({ color, onColorChange }: OpenColorPickerButtonProps) {
  const [open, setOpen] = useState(false);

  //detached state to prevent rerenders of modal on change.
  const [selectedColor, setSelectedColor] = useDetachedState("");

  return (
    <button
      style={{
        position: "relative",
        margin: "6px",
        width: "24px",
        minWidth: "24px",
        height: "24px",
        minHeight: "24px",
        borderRadius: "5px",
        border: "none",
        cursor: "pointer",
        backgroundColor: color,
        color: "inherit",
      }}
      onClick={() => open || setOpen(true)}
    >
      <Modal open={open} onClose={() => setOpen(false)}>
        {open && (
          <>
            <ColorPicker setColorString={(c) => setSelectedColor(c)} initialColor={parseHEXtoRGB(color)}></ColorPicker>
            <div
              style={{
                display: "flex",
                justifyContent: "right",
                marginTop: "1em",
              }}
            >
              <Button onClick={() => onColorChange(selectedColor[0])}>Apply</Button>
            </div>
          </>
        )}
      </Modal>
    </button>
  );
}

type ColorPickerProps = {
  initialColor?: RGB | HSV;
  setColorString: (color: string) => void;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export function ColorPicker({ initialColor, setColorString, ...attr }: ColorPickerProps) {
  const [color, setColor] = useState<RGB | HSV>(initialColor ?? { r: 255, g: 255, b: 255 });

  const { rgb, hsv } = normalize(color);

  const theme = useTheme();

  useEffect(() => {
    setColorString(formatRGBtoHEX(normalize(color).rgb));
  }, [color, setColorString]);

  return (
    <div
      {...attr}
      style={{
        height: "250px",
        width: "350px",
        display: "flex",
        flexDirection: "column",
        userSelect: "none",
        gap: "1em",
        paddingTop: "8px",
        color: theme.palette.primary.light,
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <SVCanvas hue={hsv.hue} sat={hsv.sat} val={hsv.val} setSV={(sv) => setColor({ hue: hsv.hue, ...sv })}></SVCanvas>
      <HueSlider hue={hsv.hue} setHue={(h) => setColor({ ...hsv, hue: h })}></HueSlider>
      <span
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <ColorPreview rgb={rgb}></ColorPreview>
        <HexInput rgb={rgb} setRGB={(c) => setColor(c)}></HexInput>
        <RGBDigit digitLabel="R" digit={[rgb.r, (r) => setColor({ ...rgb, r })]}></RGBDigit>
        <RGBDigit digitLabel="G" digit={[rgb.g, (g) => setColor({ ...rgb, g })]}></RGBDigit>
        <RGBDigit digitLabel="B" digit={[rgb.b, (b) => setColor({ ...rgb, b })]}></RGBDigit>
      </span>
    </div>
  );
}

function useDetachedState<T>(val: T) {
  //this useMemo is used like useState that doesnt trigger a rerender
  return useMemo(() => {
    const state = [val] as [T];
    return [
      state,
      (val: T) => {
        state[0] = val;
      },
    ] as const;
    // this memo should only be run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function useSyncState<T>(val: T): [T, Dispatch<T>] {
  //used to manually trigger a rerender on state change
  const [, rerender] = useReducer(() => ({}), {});

  //this hook internal state is irrelevant for rendering so we dont want to rerender on change
  const [[prev], setPrev] = useDetachedState(val);
  const [[state], setStateInternal] = useDetachedState(val);

  const setState = (value: T) => (setStateInternal(value), rerender());

  if (!Object.is(prev, val)) {
    setPrev(val);
    setStateInternal(val);
    return [val, setState];
  }

  return [state, setState];
}

function HSVtoRGB({ hue, sat, val }: HSV): RGB {
  const h = hue;
  const s = sat / 100;
  const v = val / 100;
  // https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
  const f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  return {
    r: Math.round(f(5) * 255),
    g: Math.round(f(3) * 255),
    b: Math.round(f(1) * 255),
  };
}

function RGBtoHSV(rgb: RGB): HSV {
  // https://stackoverflow.com/questions/3018313/algorithm-to-convert-rgb-to-hsv-and-hsv-to-rgb-in-range-0-255-for-both
  const hsv: HSV = { hue: 0, sat: 0, val: 0 };
  let min, max;

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  min = r < g ? r : g;
  min = min < b ? min : b;

  max = r > g ? r : g;
  max = max > b ? max : b;

  hsv.val = Math.floor(max * 100);
  const delta = max - min;

  if (delta < 0.00001) {
    hsv.sat = 0;
    hsv.hue = 0;
    return hsv;
  }
  if (max > 0.0) {
    hsv.sat = Math.floor((delta / max) * 100);
  } else {
    hsv.sat = 0.0;
    hsv.hue = 0;
    return hsv;
  }
  if (r >= max) hsv.hue = (g - b) / delta;
  else if (g >= max) hsv.hue = 2.0 + (b - r) / delta;
  else hsv.hue = 4.0 + (r - g) / delta;

  hsv.hue *= 60.0;

  if (hsv.hue < 0.0) hsv.hue += 360.0;

  hsv.hue = Math.floor(hsv.hue);

  return hsv;
}
