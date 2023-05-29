import React from "react";

import Box from "@mui/material/Box";
import { Player } from "@player";

import { useRerender } from "../../ui/React/hooks";
import { AllPages } from "./AllPages";
import { Console } from "./Console";
import { Stats } from "./Stats";

export function BladeburnerRoot(): React.ReactElement {
  useRerender(200);
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
