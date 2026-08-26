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
      dialogBoxCreate("无效的 RAM 数值。");
      return;
    }
    const freeRAM = home.maxRam - home.ramUsed;
    if (ramUsage > freeRAM + 0.001) {
      dialogBoxCreate("RAM 不足。");
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
        你可以将家用电脑的空闲 RAM 与你的各个派系共享，以获得声望收益的加成倍率。每次共享空闲 RAM 后，你会获得{" "}
        {ShareBonusTime / 1000} 秒的加成。之后加成消失，共享的 RAM 会被归还。你还可以通过 ns.share() API
        共享你有管理员权限的其他服务器的空闲 RAM。
        <br />
        家用电脑空闲 RAM：{formatRam(home.maxRam - home.ramUsed)}。
        <br />
        当前加成：{formatNumber(calculateCurrentShareBonus(), 6)}。共享 {formatRam(ramUsage)} 后的加成：{" "}
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
              通过此工具共享的 RAM 会向下取整到最接近的 4 的倍数。
              <br />
              例如，输入 18 GB 实际会共享 16 GB。
            </Typography>
          }
        >
          <Typography component="div" style={{ display: "flex", alignItems: "center" }}>
            <Button onClick={onShare}>共享</Button>
            <InfoIcon sx={{ fontSize: "1.5em", marginLeft: "10px" }} />
          </Typography>
        </Tooltip>
      </Typography>
    </Paper>
  );
}
