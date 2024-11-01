import { useSyncState } from "./";
import React, { useEffect } from "react";

type Props = {
  digitLabel: "R" | "G" | "B";
  digit: [number, (d: number) => void];
};

const styleSheet = new CSSStyleSheet();
styleSheet.replace(`
.color-picker-rgb-digit::-webkit-outer-spin-button,
.color-picker-rgb-digit::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
`);

export function RGBDigit({ digitLabel, digit: [digit, setDigit] }: Props) {
  const [value, setValue] = useSyncState(digit);

  useEffect(() => {
    if (document.adoptedStyleSheets.includes(styleSheet)) return;
    document.adoptedStyleSheets.push(styleSheet);
    return () => void (document.adoptedStyleSheets = document.adoptedStyleSheets.filter((s) => s != styleSheet));
  }, []);

  useEffect(() => {
    if (digit == value) return;
    if (value > 255) return setValue(255);
    if (value < 0) return setValue(0);

    setDigit(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderBottom: "1px solid currentColor",
      }}
    >
      <span style={{ fontWeight: "bolder" }}>{digitLabel}</span>
      <input
        className="color-picker-rgb-digit"
        type="number"
        min="0"
        max="255"
        style={{
          width: "2.5em",
          appearance: "textfield",
          MozAppearance: "textfield",
          WebkitAppearance: "textfield",
          border: "none",
          background: "transparent",
          color: "inherit",
        }}
        value={value + ""}
        onChange={({ currentTarget: { value } }) => setValue(Number.parseInt((value || "0").replaceAll(/[^0-9]/g, "")))}
      />
    </div>
  );
}
