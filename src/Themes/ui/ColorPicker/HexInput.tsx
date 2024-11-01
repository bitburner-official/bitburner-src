import { useTheme } from "@mui/material/styles";
import { RGB, useSyncState } from "./";
import React, { ChangeEvent, useEffect, useState } from "react";

type Props = {
  rgb: RGB;
  setRGB: (rgb: RGB) => void;
};

export function formatRGBtoHEX(rgb: RGB) {
  const digits = [
    rgb.r.toString(16).padStart(2, "0"),
    rgb.g.toString(16).padStart(2, "0"),
    rgb.b.toString(16).padStart(2, "0"),
  ];

  if (rgb.a) digits.push(rgb.a.toString(16).padStart(2, "0"));

  if (digits.every((d) => d[0] == d[1])) return digits.reduce((prev, cur) => `${prev}${cur[0]}`, "");

  return digits.join("");
}

export function HexInput({ rgb, setRGB }: Props) {
  const hex = formatRGBtoHEX(rgb);

  const [value, setValue] = useSyncState(hex);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (value.length != 3 && value.length != 6 && value.length != 8) {
      if (!error) setError(true);
      return;
    }

    const rgb: RGB =
      value.length == 3
        ? {
            r: Number.parseInt(`${value[0]}${value[0]}`, 16),
            g: Number.parseInt(`${value[1]}${value[1]}`, 16),
            b: Number.parseInt(`${value[2]}${value[2]}`, 16),
          }
        : {
            r: Number.parseInt(value.slice(0, 2), 16),
            g: Number.parseInt(value.slice(2, 4), 16),
            b: Number.parseInt(value.slice(4, 6), 16),
          };

    if (value.length == 8) rgb.a = Number.parseInt(value.slice(6, 8), 16);

    if (Object.values(rgb).some((v) => isNaN(v))) {
      if (!error) setError(true);
      return;
    }

    if (error) setError(false);

    if (hex == formatRGBtoHEX(rgb)) return;

    setRGB(rgb);

    //this updates the current color so we only want to run this if `value` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <HexInputDisplay
      value={value}
      onChange={({ currentTarget: { value } }) => value.length <= 8 && setValue(value)}
      error={error}
    ></HexInputDisplay>
  );
}

type DisplayProps = {
  error: boolean;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

function HexInputDisplay({ error, value, onChange }: DisplayProps) {
  const theme = useTheme();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "0.2em",
        borderTop: `1px solid ${error ? theme.palette.error.light : "transparent"}`,
        borderRight: `1px solid ${error ? theme.palette.error.light : "transparent"}`,
        borderBottom: `1px solid ${error ? theme.palette.error.light : "currentColor"}`,
        borderLeft: `1px solid ${error ? theme.palette.error.light : "transparent"}`,
      }}
    >
      <span style={{ fontWeight: "bolder" }}>HEX</span>
      <span
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "0.3em",
        }}
      >
        <span>#</span>
        <input
          type="text"
          style={{
            width: "5em",
            appearance: "none",
            MozAppearance: "none",
            WebkitAppearance: "none",
            border: "none",
            background: "transparent",
            color: "inherit",
          }}
          value={value}
          onChange={onChange}
        />
        <span
          style={{
            display: "inline-block",
            width: "1em",
            textAlign: "right",
            color: theme.palette.error.light,
          }}
        >
          {error ? "X" : ""}
        </span>
      </span>
    </div>
  );
}
