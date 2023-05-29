/**
 * React Subcomponent for displaying a location's UI, when that location is a slum
 *
 * This subcomponent renders all of the buttons for committing crimes
 */
import React from "react";

import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { Player } from "@player";

import { Crime } from "../../Crime/Crime";
import { Crimes } from "../../Crime/Crimes";
import { Router } from "../../ui/GameRoot";
import { useRerender } from "../../ui/React/hooks";
import { Page } from "../../ui/Router";
import { formatPercent } from "../../ui/formatNumber";

export function SlumsLocation(): React.ReactElement {
  useRerender(1000);
  const crimes = Object.values(Crimes);

  function doCrime(e: React.MouseEvent<HTMLElement>, crime: Crime) {
    if (!e.isTrusted) return;
    crime.commit();
    Router.toPage(Page.Work);
    Player.focus = true;
  }

  return (
    <Box sx={{ display: "grid", width: "fit-content" }}>
      {crimes.map((crime) => (
        <Tooltip title={crime.tooltipText}>
          <Button onClick={(e) => doCrime(e, crime)}>
            {crime.type} ({formatPercent(crime.successRate(Player))} chance of success)
          </Button>
        </Tooltip>
      ))}
    </Box>
  );
}
