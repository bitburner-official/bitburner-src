import { Component } from "@enums";

export const cellSize = 48;

export const defaultIconStyle = {
  width: cellSize + "px",
  height: cellSize + "px",
  color: "white",
};

const ColorR = "red";
const ColorG = "#7CFC00";
const ColorB = "#1E90FF";
const ColorY = "yellow";
const ColorC = "cyan";
const ColorM = "magenta";
const ColorW = "white";

const componentColors: Record<string, string> = {
  r: ColorR,
  g: ColorG,
  b: ColorB,
  y: ColorY,
  c: ColorC,
  m: ColorM,
  w: ColorW,
};

export const getComponentColor = (component: Component): string =>
  componentColors[component[0].toLowerCase()] ?? ColorW;
