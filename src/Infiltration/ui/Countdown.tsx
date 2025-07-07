import { Paper, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";

interface IProps {
  time: number;
}

export function Countdown({ time }: IProps): React.ReactElement {
  const [x, setX] = useState(3);
  const intervalId = useRef(0);

  useEffect(() => {
    if (x === 0) {
      clearInterval(intervalId.current);
    }
  }, [x]);

  useEffect(() => {
    intervalId.current = window.setInterval(() => {
      setX((previousValue) => previousValue - 1);
    }, time / 3);
    return () => {
      clearInterval(intervalId.current);
    };
  }, [time]);

  return (
    <Paper sx={{ p: 1, textAlign: "center" }}>
      <Typography variant="h4">Get Ready!</Typography>
      <Typography variant="h4">{x}</Typography>
    </Paper>
  );
}
