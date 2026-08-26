import React from "react";

import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Player } from "@player";
import { Engine } from "../../engine";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { AutoExpandAccordion } from "../../ui/AutoExpand/AutoExpandAccordion";

export function TimeSkipDev(): React.ReactElement {
  function timeskip(time: number) {
    return () => {
      Player.lastUpdate -= time;
      Engine._lastUpdate -= time;
      dialogBoxCreate("时间跳跃效果已生效");
    };
  }

  return (
    <AutoExpandAccordion cacheKey="DEVMENU_TimeSkipDev" unmountOnExit={true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>时间跳跃</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Button onClick={timeskip(60 * 1000)}>1 分钟</Button>
        <Button onClick={timeskip(60 * 60 * 1000)}>1 小时</Button>
        <Button onClick={timeskip(24 * 60 * 60 * 1000)}>1 天</Button>
      </AccordionDetails>
    </AutoExpandAccordion>
  );
}
