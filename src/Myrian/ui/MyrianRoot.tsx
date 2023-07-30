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
}

const Cell = ({ tile }: ICellProps): React.ReactElement => {
  const x = 50;
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

export function MyrianRoot({ myrian }: IProps): React.ReactElement {
  const [center, setCenter] = useState([myrian.world[0].length / 2, myrian.world.length / 2]);
  const [size, setSize] = useState(11);
  const [, setRerender] = useState(false);
  const rerender = () => setRerender((old) => !old);
  useEffect(() => {
    const intervalID = setInterval(rerender, 20);
    return () => clearInterval(intervalID);
  }, []);

  const sleeves = Object.fromEntries(myrian.sleeves.map((s) => [`${s.x}_${s.y}`, s]));

  const move = (x: number, y: number) => () => {
    setCenter((c) => [Math.max(Math.floor(size / 2), c[0] + x), Math.max(Math.floor(size / 2), c[1] + y)]);
  };

  const zoom = (size: number) => () => {
    setSize((s) => s + size);
  };
  return (
    <Container maxWidth="lg" disableGutters sx={{ mx: 0, display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex" }}>
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
          {iterator(size, center[1] - Math.floor(size / 2)).map((j) => (
            <Box key={myrian.world[j].join("") + j} sx={{ display: "flex", flexDirection: "row" }}>
              {iterator(size, center[0] - Math.floor(size / 2)).map((i) => (
                <Cell
                  key={i + "" + j + "" + myrian.world[j][i]}
                  tile={sleeves[`${i}_${j}`] ? "s" : myrian.world[j][i]}
                />
              ))}
            </Box>
          ))}
        </Box>
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
