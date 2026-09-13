import React, { useState } from "react";

import { TextField } from "@mui/material";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/Info";

import { Player } from "@player";
import {
  calculateCurrentShareBonus,
  calculateShareBonusWithAdditionalThreads,
  pendingUIShareJobIds,
  ShareBonusTime,
  startSharing,
} from "../../NetworkShare/Share";
import { formatRam, formatNumber } from "../../ui/formatNumber";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { useCycleRerender } from "../../ui/React/hooks";
import { roundToTwo } from "../../utils/helpers/roundToTwo";

export function ShareOption({ rerender }: { rerender: () => void }): React.ReactElement {
  const [ram, setRam] = useState<number>(0);
  useCycleRerender();

  const home = Player.getHomeComputer();
  const threads = Math.floor(ram / 4);
  const ramUsage = roundToTwo(4 * threads);

  function onShare(): void {
    if (threads === 0) {
      return;
    }
    if (!Number.isFinite(threads) || threads < 0) {
      dialogBoxCreate("Invalid RAM amount.");
      return;
    }
    const freeRAM = home.maxRam - home.ramUsed;
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
    rerender();
  }

  return (
    <Paper sx={{ my: 1, p: 1 }}>
      <Typography>
        You can share free RAM of your home computer with your factions to get a bonus multiplier for reputation gain.
        Each time you share your free RAM, you get a boost for {ShareBonusTime / 1000} seconds. After that, you lose the
        boost and get back your shared RAM. You can share free RAM of other servers that you have admin rights to by
        using the ns.share() API.
        <br />
        Free RAM on home computer: {formatRam(home.maxRam - home.ramUsed)}.
        <br />
        Current bonus: {formatNumber(calculateCurrentShareBonus(), 6)}. Bonus with {formatRam(ramUsage)}:{" "}
        {formatNumber(calculateShareBonusWithAdditionalThreads(threads, home.cpuCores), 6)}
      </Typography>

      <Typography component="div" style={{ display: "flex" }}>
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
        />
        <Tooltip
          title={
            <Typography>
              RAM shared via this tool is rounded down to the nearest multiple of 4.
              <br />
              For example, a value of 18 GB results in 16 GB.
            </Typography>
          }
        >
          <Typography component="div" style={{ display: "flex", alignItems: "center" }}>
            <Button onClick={onShare}>Share</Button>
            <InfoIcon sx={{ fontSize: "1.5em", marginLeft: "10px" }} />
          </Typography>
        </Tooltip>
      </Typography>
    </Paper>
  );
}
