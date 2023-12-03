import { TableBody, TableRow } from "@mui/material";
import * as React from "react";
import { ActiveFragment } from "../ActiveFragment";
import { calculateGrid } from "../Helper";
import { BaseGift } from "../BaseGift";
import { Cell } from "./Cell";

interface IProps {
  width: number;
  height: number;
  ghostGrid: number[][];
  gift: BaseGift;
  enter(i: number, j: number): void;
  click(i: number, j: number): void;
}

function randomColor(fragment: ActiveFragment): string {
  // Can't set Math.random seed so copy casino. TODO unplanned refactor both RNG later.
  let s1 = Math.pow((fragment.x + 1) * (fragment.y + 1), 10);
  let s2 = s1;
  let s3 = s1;

  const colors = [];
  for (let i = 0; i < 3; i++) {
    s1 = (171 * s1) % 30269;
    s2 = (172 * s2) % 30307;
    s3 = (170 * s3) % 30323;
    colors.push((s1 / 30269.0 + s2 / 30307.0 + s3 / 30323.0) % 1.0);
  }

  return `rgb(${colors[0] * 256}, ${colors[1] * 256}, ${colors[2] * 256})`;
}

export function Grid(props: IProps): React.ReactElement {
  const activeGrid = calculateGrid(props.gift);

  function color(worldX: number, worldY: number): string {
    if (props.ghostGrid[worldX][worldY] && activeGrid[worldX][worldY]) return "red";
    if (props.ghostGrid[worldX][worldY]) return "white";

    if (activeGrid[worldX][worldY]) {
      const fragment = props.gift.fragmentAt(worldX, worldY);
      if (!fragment) throw new Error("ActiveFragment should not be null");
      return randomColor(fragment);
    }
    return "";
  }

  function borderWidth(worldX1: number, worldY1: number, worldX2: number, worldY2: number): number {
    const fragment1 = props.gift.fragmentAt(worldX1, worldY1);
    const fragment2 = props.gift.fragmentAt(worldX2, worldY2);
    if (fragment1 === undefined) return 1;
    if (fragment1 === fragment2) return 0;
    return 1;
  }

  // switch the width/length to make axis consistent.
  const elems = [];
  for (let j = 0; j < props.height; j++) {
    const cells = [];
    for (let i = 0; i < props.width; i++) {
      cells.push(
        <Cell
          key={i}
          onMouseEnter={() => props.enter(i, j)}
          onClick={() => props.click(i, j)}
          color={color(i, j)}
          borderBottom={borderWidth(i, j, i, j + 1)}
          borderRight={borderWidth(i, j, i + 1, j)}
          borderTop={borderWidth(i, j, i, j - 1)}
          borderLeft={borderWidth(i, j, i - 1, j)}
        />,
      );
    }
    elems.push(<TableRow key={j}>{cells}</TableRow>);
  }

  return <TableBody>{elems}</TableBody>;
}
