import React from "react";
import { Stats } from "./Stats";
import { Console } from "./Console";
import { AllPages } from "./AllPages";

import { Player } from "@player";
import { Box } from "@mui/material";
import { useCycleRerender } from "../../ui/React/hooks";

export function BladeburnerRoot(): React.ReactElement {
  useCycleRerender();
  const bladeburner = Player.bladeburner;
  if (!bladeburner) return <></>;
  return (
    <Box display="flex" flexDirection="column">
      <Box sx={{ display: "grid", gridTemplateColumns: "4fr 8fr", p: 1 }}>
        <Stats bladeburner={bladeburner} />
        <Console bladeburner={bladeburner} />
      </Box>

      <AllPages bladeburner={bladeburner} />
    </Box>
  );
}
