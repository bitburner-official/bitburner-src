import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import { Box } from "@mui/system";
import { Myrian } from "../Myrian";

import PersonIcon from "@mui/icons-material/Person";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import Battery20Icon from "@mui/icons-material/Battery20";
import FavoriteIcon from "@mui/icons-material/Favorite";

const iterator = (i: number): number[] => {
  return Array(i).fill(0);
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
        width: x + "px",
        height: x + "px",
        margin: "0px",
        padding: "0px",
      }}
    >
      {tile === "" && <div />}
      {tile === "b" && <BatteryFullIcon sx={sx} />}
      {tile === "d" && <Battery20Icon sx={sx} />}
      {tile === "c" && <FavoriteIcon sx={sx} />}
      {tile === "s" && <PersonIcon sx={sx} />}
    </div>
  );
};

interface IProps {
  myrian: Myrian;
}

export function MyrianRoot({ myrian }: IProps): React.ReactElement {
  const [, setRerender] = useState(false);
  const rerender = () => setRerender((old) => !old);
  useEffect(() => {
    const intervalID = setInterval(rerender, 200);
    return () => clearInterval(intervalID);
  }, []);

  const sleeves = Object.fromEntries(myrian.sleeves.map((s) => [`${s.x}_${s.y}`, s]));

  return (
    <Container maxWidth="lg" disableGutters sx={{ mx: 0 }}>
      <Box sx={{ display: "flex", flexDirection: "column", m: 0, p: 0 }}>
        {iterator(myrian.world.length).map((_, j) => (
          <Box key={myrian.world[j].join("") + j} sx={{ display: "flex", flexDirection: "row" }}>
            {iterator(myrian.world[j].length).map((_, i) => (
              <Cell key={i + "" + j + "" + myrian.world[j][i]} tile={sleeves[`${i}_${j}`] ? "s" : myrian.world[j][i]} />
            ))}
          </Box>
        ))}
      </Box>
    </Container>
  );
}
