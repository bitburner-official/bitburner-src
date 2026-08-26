import React, { useState } from "react";

import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { Tooltip } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";

import { Player } from "@player";
import { achievements } from "../../Achievements/Achievements";
import { Engine } from "../../engine";
import type { AchievementId } from "../../Achievements/Types";
import { AutoExpandAccordion } from "../../ui/AutoExpand/AutoExpandAccordion";

export function AchievementsDev(): React.ReactElement {
  const [playerAchievement, setPlayerAchievements] = useState(Player.achievements.map((m) => m.ID));

  function grantAchievement(id: AchievementId): void {
    Player.giveAchievement(id);
    setPlayerAchievements(Player.achievements.map((m) => m.ID));
  }

  function grantAllAchievements(): void {
    Object.values(achievements).forEach((a) => Player.giveAchievement(a.ID));
    setPlayerAchievements(Player.achievements.map((m) => m.ID));
  }

  function removeAchievement(id: AchievementId): void {
    Player.achievements = Player.achievements.filter((a) => a.ID !== id);
    setPlayerAchievements(Player.achievements.map((m) => m.ID));
  }

  function clearAchievements(): void {
    Player.achievements = [];
    setPlayerAchievements(Player.achievements.map((m) => m.ID));
  }

  function disableEngineCheck(): void {
    Engine.Counters.achievementsCounter = Number.MAX_VALUE;
  }

  function enableEngineCheck(): void {
    Engine.Counters.achievementsCounter = 0;
  }

  return (
    <AutoExpandAccordion cacheKey="DEVMENU_AchievementsDev" unmountOnExit={true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>成就</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <table>
          <tbody>
            <tr>
              <td></td>
              <td>
                <Typography>成就：</Typography>
              </td>
              <td>
                <ButtonGroup>
                  <Button onClick={grantAllAchievements}>全部授予</Button>
                  <Button onClick={clearAchievements}>清空</Button>
                  <Button onClick={disableEngineCheck}>禁用引擎检查</Button>
                  <Button onClick={enableEngineCheck}>启用引擎检查</Button>
                </ButtonGroup>
              </td>
            </tr>
            {Object.values(achievements).map((i) => {
              const achieved = playerAchievement.includes(i.ID);
              return (
                <tr key={"ach-" + i.ID}>
                  <td>
                    {achieved ? (
                      <Tooltip title="已获得">
                        <LockOpenIcon color="primary" />
                      </Tooltip>
                    ) : (
                      <Tooltip title="未解锁">
                        <LockIcon color="secondary" />
                      </Tooltip>
                    )}
                  </td>
                  <td>
                    <Tooltip
                      title={
                        <>
                          {i.ID}
                          <br />
                          {i.Description}
                        </>
                      }
                    >
                      <Typography color={achieved ? "primary" : "secondary"}>{i.Name}:</Typography>
                    </Tooltip>
                  </td>
                  <td>
                    <ButtonGroup>
                      <Button onClick={() => grantAchievement(i.ID)}>授予</Button>
                      <Button onClick={() => removeAchievement(i.ID)}>移除</Button>
                    </ButtonGroup>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </AccordionDetails>
    </AutoExpandAccordion>
  );
}
