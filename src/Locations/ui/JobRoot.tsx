import React from "react";
import { Box } from "@mui/material";

import { Player } from "@player";
import { getRecordKeys } from "../../Types/Record";
import { useCycleRerender } from "../../ui/React/hooks";
import { Locations } from "../Locations";
import { GenericLocation } from "./GenericLocation";

export function JobRoot(): React.ReactElement {
  useCycleRerender();

  const jobs = getRecordKeys(Player.jobs).map((companyName) => {
    const location = Locations[companyName];
    if (location == null) {
      throw new Error(`Invalid company name: ${companyName}`);
    }
    return (
      <Box key={companyName} sx={{ marginBottom: "20px" }}>
        <GenericLocation loc={location} showBackButton={false} />;
      </Box>
    );
  });

  return <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, 28em)" }}>{jobs}</Box>;
}
