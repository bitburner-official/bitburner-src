import React from "react";
import { Box, Typography } from "@mui/material";

import { Player } from "@player";
import { getRecordKeys } from "../../Types/Record";
import { useCycleRerender } from "../../ui/React/hooks";
import { Locations } from "../Locations";
import { GenericLocation } from "./GenericLocation";
import { exceptionAlert } from "../../utils/helpers/exceptionAlert";

export function JobRoot(): React.ReactElement {
  useCycleRerender();

  const jobs = getRecordKeys(Player.jobs).map((companyName) => {
    const location = Locations[companyName];
    if (location == null) {
      exceptionAlert(new Error(`Player.jobs contains invalid data. companyName: ${companyName}.`), true);
      return <></>;
    }
    return (
      <Box key={companyName} sx={{ marginBottom: "20px" }}>
        <GenericLocation location={location} showBackButton={false} />;
      </Box>
    );
  });

  if (jobs.length === 0) {
    return (
      <Typography sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        No jobs
      </Typography>
    );
  }

  return <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, 30em)" }}>{jobs}</Box>;
}
