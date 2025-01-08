import React, { useState } from "react";

import { TextField } from "@mui/material";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { Player } from "@player";
import {
  calculateCurrentShareBonus,
  calculateShareBonusWithAdditionalThreads,
  pendingUIShareJobIds,
  ShareBonusTime,
  startSharing,
} from "../../NetworkShare/Share";
import { formatRam } from "../../ui/formatNumber";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { useCycleRerender } from "../../ui/React/hooks";
import { roundToTwo } from "../../utils/helpers/roundToTwo";

export function ShareOption({ rerender }: { rerender: () => void }): React.ReactElement {
  const [ram, setRam] = useState<number>(0);
  useCycleRerender();

  const home = Player.getHomeComputer();
  const threads = Math.floor(ram / 4);

  function onShare(): void {
    if (threads === 0) {
      return;
    }
    if (!Number.isFinite(threads) || threads < 0) {
      dialogBoxCreate("Invalid RAM amount.");
      return;
    }
    const freeRAM = home.maxRam - home.ramUsed;
    const ramUsage = roundToTwo(4 * threads);
    if (ramUsage > freeRAM + 0.001) {
      dialogBoxCreate("Not enough RAM.");
      return;
    }

    home.updateRamUsed(roundToTwo(home.ramUsed + ramUsage));
    const end = startSharing(threads, home.cpuCores);
    const jobId = window.setTimeout(() => {
      end();
      if (pendingUIShareJobIds.includes(jobId)) {
        home.updateRamUsed(roundToTwo(home.ramUsed - ramUsage));
      }
      rerender();
    }, ShareBonusTime);
    pendingUIShareJobIds.push(jobId);
  }

  return (
    <Paper sx={{ my: 1, p: 1 }}>
      <Typography>
        You can share free RAM of your home computer with your faction to get a bonus multiplier for reputation gain.
        Each time you share your free RAM, you get a boost for {ShareBonusTime / 1000} seconds. You can share free RAM
        of other servers that you have admin rights by using ns.share() API.
        <br />
        Free RAM on home computer: {formatRam(home.maxRam - home.ramUsed)}.
        <br />
        Current bonus: {calculateCurrentShareBonus()}. Bonus with {formatRam(ram)}:{" "}
        {calculateShareBonusWithAdditionalThreads(threads, home.cpuCores)}
      </Typography>

      <TextField
        value={ram}
        onChange={(event) => {
          if (event.target.value === "") {
            setRam(0);
            return;
          }
          const value = Number.parseFloat(event.target.value);
          if (!Number.isFinite(value) || value < 0) {
            return;
          }
          setRam(value);
        }}
        InputProps={{
          endAdornment: <Button onClick={onShare}>Share</Button>,
        }}
      />
    </Paper>
  );
}
