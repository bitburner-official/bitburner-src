import { Paper } from "@mui/material";
import React, { useEffect, useState } from "react";
import { AugmentationName } from "@enums";
import { Player } from "@player";
import { ProgressBar } from "../../ui/React/Progress";

type GameTimerProps = {
  millis: number;
  onExpire: () => void;
  noPaper?: boolean;
  ignoreAugment_WKSharmonizer?: boolean;
  tick?: number;
};

export function GameTimer({
  millis,
  onExpire,
  noPaper,
  ignoreAugment_WKSharmonizer,
  tick = 100,
}: GameTimerProps): React.ReactElement {
  const [v, setV] = useState(100);
  const totalMillis =
    (!ignoreAugment_WKSharmonizer && Player.hasAugmentation(AugmentationName.WKSharmonizer, true) ? 1.3 : 1) * millis;

  useEffect(() => {
    const intervalId = setInterval(() => {
      setV((old) => {
        if (old <= 0) onExpire();
        return old - (tick / totalMillis) * 100;
      });
    }, tick);

    return () => {
      clearInterval(intervalId);
    };
  }, [onExpire, tick, totalMillis]);

  // https://stackoverflow.com/questions/55593367/disable-material-uis-linearprogress-animation
  // TODO(hydroflame): there's like a bug where it triggers the end before the
  // bar physically reaches the end
  return noPaper ? (
    <ProgressBar variant="determinate" value={v} color="primary" />
  ) : (
    <Paper sx={{ p: 1, mb: 1 }}>
      <ProgressBar variant="determinate" value={v} color="primary" />
    </Paper>
  );
}
