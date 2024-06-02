import React from "react";
import { cellSize } from "./common";
import { styled } from "@mui/system";
import { findDevice, myrianSize } from "../Myrian";
import { DeviceIcon } from "./DeviceIcon";
import { Typography } from "@mui/material";

const BaseCell = styled("div")({
  width: cellSize,
  height: cellSize,
  backgroundColor: "#444",
  padding: 0,
  margin: "2px",
  marginTop: "4px",
  marginBottom: "4px",
});

const TextCell = styled(BaseCell)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#00000000",
});

const DeviceCell = ({ x, y }: { x: number; y: number }): React.ReactElement => {
  const device = findDevice([x, y]);
  return <BaseCell>{device && <DeviceIcon device={device} />}</BaseCell>;
};

const ColD = styled("div")({
  padding: 0,
  margin: 0,
});

interface IColProps {
  x: number;
}

const DeviceCol = ({ x }: IColProps): React.ReactElement => {
  return (
    <ColD>
      <TextCell>
        <Typography>{x}</Typography>
      </TextCell>
      {new Array(myrianSize).fill(undefined).map((_, y) => (
        <DeviceCell key={y} x={x} y={y}></DeviceCell>
      ))}
    </ColD>
  );
};

const Table = styled("div")({
  border: "1px solid #fff",
  borderSpacing: "2px",
  overflow: "hidden",
  display: "flex",
  flexDirection: "row",
  paddingLeft: "2px",
  paddingRight: "2px",
});

const YColumn = (
  <ColD>
    <TextCell>
      <Typography>
        &nbsp;X
        <br />
        Y&nbsp;
      </Typography>
    </TextCell>
    {new Array(myrianSize).fill(undefined).map((_, y) => (
      <TextCell key={y}>
        <Typography>{y}</Typography>
      </TextCell>
    ))}
  </ColD>
);

export const Grid = () => (
  <div style={{ display: "flex" }}>
    <Table>
      {YColumn}
      {new Array(myrianSize).fill(undefined).map((_, x) => (
        <DeviceCol key={x} x={x} />
      ))}
    </Table>
  </div>
);
