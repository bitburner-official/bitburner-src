import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import { Box } from "@mui/system";
import { Myrian } from "../Myrian";

import PersonIcon from "@mui/icons-material/Person";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import Battery20Icon from "@mui/icons-material/Battery20";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LandscapeIcon from "@mui/icons-material/Landscape";
import { IconButton } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

import ZoomInMapIcon from "@mui/icons-material/ZoomInMap";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";

const iterator = (i: number, offset = 0): number[] => {
  return Array(i)
    .fill(0)
    .map((_, v) => v + offset);
};

interface ICellProps {
  tile: string;
  tileSize: number;
}

const Cell = ({ tile, tileSize: x }: ICellProps): React.ReactElement => {
  const sx = {
    display: "block",
    color: "white",
    fontSize: x + "px",
  };
  return (
    <div
      style={{
        minWidth: x + "px",
        width: x + "px",
        minHeight: x + "px",
        height: x + "px",
        margin: "0px",
        padding: "0px",
      }}
    >
      {tile === "&nbsp;" && <div />}
      {tile === "b" && <BatteryFullIcon sx={sx} />}
      {tile === "d" && <Battery20Icon sx={sx} />}
      {tile === "c" && <FavoriteIcon sx={sx} />}
      {tile === "s" && <PersonIcon sx={sx} />}
      {tile === "m" && <LandscapeIcon sx={sx} />}
    </div>
  );
};

interface IProps {
  myrian: Myrian;
}

const calcTiles = (v: number) => Math.floor((50 * 11) / v);

export function MyrianRoot({ myrian }: IProps): React.ReactElement {
  const [center, rawSetCenter] = useState<[number, number]>([14, 8]);
  const [size, rawSetSize] = useState(60);
  const tiles = calcTiles(size);
  const [dragging, setDragging] = useState(false);
  const [dragScreenPos, setDragScreenPos] = useState<[number, number]>([0, 0]);
  const [dragCenter, setDragCenter] = useState<[number, number]>([0, 0]);

  const setCenter = (v: [number, number], tiles: number) => {
    rawSetCenter(() => {
      v[0] = Math.max(Math.floor(tiles / 2), v[0]);
      v[1] = Math.max(Math.floor(tiles / 2), v[1]);
      v[0] = Math.min(myrian.world[0].length - Math.floor(tiles / 2), v[0]);
      v[1] = Math.min(myrian.world.length - Math.floor(tiles / 2), v[1]);
      return v;
    });
  };

  const setSize = (px: number) => {
    const newTiles = calcTiles(px);
    if (newTiles > 25) {
      px = calcTiles(25);
    }
    if (newTiles < 5) {
      px = calcTiles(5);
    }
    rawSetSize(px);
    return px;
  };
  const [, setRerender] = useState(false);
  const rerender = () => setRerender((old) => !old);
  useEffect(() => {
    const intervalID = setInterval(rerender, 20);
    return () => clearInterval(intervalID);
  }, []);

  const sleeves = Object.fromEntries(myrian.sleeves.map((s) => [`${s.x}_${s.y}`, s]));

  const move = (x: number, y: number) => () => {
    setCenter([center[0] + x, center[1] + y], tiles);
  };

  const zoom = (size: number) => () => {
    // setSize((s) => s + size);
  };

  const onMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setDragging(true);
    setDragScreenPos([event.screenX, event.screenY]);
    setDragCenter(center);
  };
  const onStopDragging = () => setDragging(false);

  const onMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!dragging) return;
    const dx = event.screenX - dragScreenPos[0] + size / 2;
    const dy = event.screenY - dragScreenPos[1] + size / 2;
    setCenter([dragCenter[0] - Math.floor(dx / size), dragCenter[1] - Math.floor(dy / size)], tiles);
  };

  const onWheel = (event: React.WheelEvent) => {
    const newSize = setSize(size * (1 + event.deltaY / 500));
    const newTiles = calcTiles(newSize);
    setCenter(center, newTiles);
  };

  return (
    <Container maxWidth="lg" disableGutters sx={{ mx: 0, display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex" }}>
        <div
          style={{ cursor: dragging ? "grabbing" : "grab" }}
          onMouseDown={onMouseDown}
          onMouseUp={onStopDragging}
          onMouseMove={onMouseMove}
          onMouseLeave={onStopDragging}
          onWheel={onWheel}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              m: 0,
              p: 0,
              borderColor: "white",
              borderStyle: "solid",
              borderWidth: "1px",
            }}
          >
            {iterator(tiles, center[1] - Math.floor(tiles / 2)).map((j) => (
              <Box key={myrian.world[j].join("") + j} sx={{ display: "flex", flexDirection: "row" }}>
                {iterator(tiles, center[0] - Math.floor(tiles / 2)).map((i) => (
                  <Cell
                    key={i + "" + j + "" + myrian.world[j][i]}
                    tileSize={size}
                    tile={sleeves[`${i}_${j}`] ? "s" : myrian.world[j][i]}
                  />
                ))}
              </Box>
            ))}
          </Box>
        </div>
      </Box>

      <Box sx={{ display: "flex" }}>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex" }}>
            <Box sx={{ width: "40px", height: "40px" }} />
            <Box sx={{ width: "40px", height: "40px" }}>
              <IconButton onClick={move(0, -1)}>
                <KeyboardArrowUpIcon />
              </IconButton>
            </Box>
            <Box sx={{ width: "40px", height: "40px" }} />
          </Box>
          <Box sx={{ display: "flex" }}>
            <Box sx={{ width: "40px", height: "40px" }}>
              <IconButton onClick={move(-1, 0)}>
                <KeyboardArrowLeftIcon />
              </IconButton>
            </Box>
            <Box sx={{ width: "40px", height: "40px" }} />
            <Box sx={{ width: "40px", height: "40px" }}>
              <IconButton onClick={move(1, 0)}>
                <KeyboardArrowRightIcon />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ display: "flex" }}>
            <Box sx={{ width: "40px", height: "40px" }} />
            <Box sx={{ width: "40px", height: "40px" }}>
              <IconButton onClick={move(0, 1)}>
                <KeyboardArrowDownIcon />
              </IconButton>
            </Box>
            <Box sx={{ width: "40px", height: "40px" }} />
          </Box>
        </Box>

        <Box>
          <IconButton onClick={zoom(-2)}>
            <ZoomInMapIcon />
          </IconButton>

          <IconButton onClick={zoom(2)}>
            <ZoomOutMapIcon />
          </IconButton>
        </Box>
      </Box>
    </Container>
  );
}
