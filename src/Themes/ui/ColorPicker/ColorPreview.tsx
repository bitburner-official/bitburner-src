import { RGB } from "./";
import React from "react";

type Props = {
  rgb: RGB;
};

export function ColorPreview({ rgb: { r, g, b } }: Props) {
  return (
    <div
      style={{
        width: "50px",
        height: "50px",
        backgroundColor: `rgb(${r} ${g} ${b})`,
        borderRadius: "20%",
      }}
    ></div>
  );
}
