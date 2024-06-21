import { Paper, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

interface IProps {
  onFinish: () => void;
}

export function Countdown(props: IProps): React.ReactElement {
  const [x, setX] = useState(3);

  useEffect(() => {
    if (x === 0) {
      props.onFinish();
    }
  }, [x]);

  useEffect(() => {
    const id = setInterval(() => {
      setX((previousValue) => previousValue - 1);
    }, 1000);
    return () => {
      clearInterval(id);
    };
  }, []);

  return (
    <Paper sx={{ p: 1, textAlign: "center" }}>
      <Typography variant="h4">Get Ready!</Typography>
      <Typography variant="h4">{x}</Typography>
    </Paper>
  );
}
