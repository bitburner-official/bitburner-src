import React, { useState } from "react";

import { Container, Button, Paper, Box, Tooltip, Switch, FormControlLabel, Typography } from "@mui/material";
import { Help } from "@mui/icons-material";

import { formatNumberNoSuffix, formatPercent } from "../../ui/formatNumber";

import { AllGangs, getClashWinChance } from "../AllGangs";

import { useGang } from "./Context";
import { TerritoryInfoModal } from "./TerritoryInfoModal";
import { PromptEvent } from "../../ui/React/PromptManager";

/** React Component for the territory subpage. */
export function TerritorySubpage(): React.ReactElement {
  const gang = useGang();
  const gangNames = Object.keys(AllGangs).filter((g) => g != gang.facName);
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <Container disableGutters maxWidth="md" sx={{ mx: 0 }}>
      <Typography>
        此页面显示你的帮派控制了多少地盘。该数值以百分比表示，代表你控制了总地盘的多大比例。
      </Typography>

      <Button onClick={() => setInfoOpen(true)} sx={{ my: 1 }}>
        <Help sx={{ mr: 1 }} />
        关于帮派地盘
      </Button>

      <Box component={Paper} sx={{ p: 1, mb: 1 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
          {gang.facName}（你的帮派）
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={gang.territoryWarfareEngaged}
              onChange={(event) => {
                let canWinAtLeastOneGang = false;
                for (const gangName of Object.keys(AllGangs)) {
                  if (gang.facName === gangName) {
                    continue;
                  }
                  if (getClashWinChance(gang.facName, gangName) >= 0.5) {
                    canWinAtLeastOneGang = true;
                    break;
                  }
                }
                /**
                 * tooLowGangPower is a special check. Before the first tick of territory clash, the power of all gangs
                 * is 1, so the win chance of the player's gang against all gangs is 50%. If the player tries to enable
                 * the clash in this short time frame, canWinAtLeastOneGang is true, but their gang will still be
                 * crushed after the first clash tick.
                 */
                const tooLowGangPower = gang.getPower() < 2;
                const needToBeWarned = !canWinAtLeastOneGang || tooLowGangPower;
                /**
                 * Show a confirmation popup if the player tries to enable the territory clash when their gang is too
                 * weak and cannot win any other gangs.
                 */
                if (event.target.checked && needToBeWarned) {
                  let message = "你的帮派太弱了。";
                  if (!canWinAtLeastOneGang) {
                    message += " 它对所有其他帮派的冲突胜率都低于 50%。";
                  }
                  PromptEvent.emit({
                    txt:
                      message +
                      "\n参与地盘冲突后，平均而言你总会损失地盘。\n\n你真的想参与地盘冲突吗？",
                    resolve: (value: string | boolean) => {
                      if (value === true) {
                        gang.territoryWarfareEngaged = true;
                      }
                    },
                  });
                } else {
                  gang.territoryWarfareEngaged = event.target.checked;
                }
              }}
            />
          }
          label={
            <Tooltip
              title={
                <Typography>
                  参与地盘冲突会将你的冲突概率设为 100%。停止参与后，你的冲突概率会逐渐下降，直至 0%。
                </Typography>
              }
            >
              <Typography>参与地盘冲突</Typography>
            </Tooltip>
          }
        />
        <br />
        <FormControlLabel
          control={
            <Switch
              checked={gang.notifyMemberDeath}
              onChange={(event) => (gang.notifyMemberDeath = event.target.checked)}
            />
          }
          label={
            <Tooltip
              title={
                <Typography>
                  如果启用此选项，每当你的帮派成员在地盘冲突中死亡时，你都会收到弹窗通知。
                </Typography>
              }
            >
              <Typography>帮派成员死亡时通知我</Typography>
            </Tooltip>
          }
        />

        <Typography>
          <b>地盘冲突概率：</b> {formatPercent(gang.territoryClashChance, 3)} <br />
          <b>势力：</b> {formatNumberNoSuffix(AllGangs[gang.facName].power, 3)} <br />
          <b>地盘：</b> {formatTerritory(AllGangs[gang.facName].territory)}% <br />
        </Typography>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
        {gangNames
          .sort((a, b) => {
            if (AllGangs[a].territory <= 0 && AllGangs[b].territory > 0) return 1;
            if (AllGangs[a].territory > 0 && AllGangs[b].territory <= 0) return -1;
            return 0;
          })
          .map((name) => (
            <OtherGangTerritory key={name} name={name} />
          ))}
      </Box>
      <TerritoryInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </Container>
  );
}
function formatTerritory(n: number): string {
  const v = n * 100;
  const precision = 3;
  if (v <= 0) {
    return formatNumberNoSuffix(0, precision);
  } else if (v >= 100) {
    return formatNumberNoSuffix(100, precision);
  } else {
    return formatNumberNoSuffix(v, precision);
  }
}

interface ITerritoryProps {
  name: string;
}

function OtherGangTerritory(props: ITerritoryProps): React.ReactElement {
  const gang = useGang();
  const territory = AllGangs[props.name].territory;
  const opacity = territory > 0 ? 1 : 0.75;
  return (
    <Box component={Paper} sx={{ p: 1, opacity }}>
      <Typography variant="h6" sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        {props.name}
      </Typography>
      <Typography>
        <b>势力：</b> {formatNumberNoSuffix(AllGangs[props.name].power, 3)} <br />
        <b>地盘：</b> {formatTerritory(territory)}% <br />
        <b>冲突获胜概率：</b> {formatPercent(getClashWinChance(gang.facName, props.name), 3)}
      </Typography>
    </Box>
  );
}
