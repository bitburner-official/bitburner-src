import React, { useState } from "react";

import { Box, Typography, Button, Container } from "@mui/material";

import { Player } from "@player";

import { SleeveElem } from "./SleeveElem";
import { FAQModal } from "./FAQModal";
import { useCycleRerender } from "../../../ui/React/hooks";
import { Settings } from "../../../Settings/Settings";

export function SleeveRoot(): React.ReactElement {
  const [FAQOpen, setFAQOpen] = useState(false);
  const rerender = useCycleRerender();

  return (
    <>
      <Container disableGutters maxWidth="md" sx={{ mx: 0 }}>
        <Typography variant="h4">分身</Typography>
        <Typography>
          分身是 MK-V 合成人（人造仿生人），你的意识被复制到了其中。换言之，这些合成人包含你思维的完美复制品。
          <br />
          <br />
          分身可以被用来同时执行不同的任务。
          <br />
          <br />
        </Typography>
        {Player.bitNodeOptions.disableSleeveExpAndAugmentation && (
          <Typography color={Settings.theme.warning}>
            你启用了"禁用分身的经验与强化"选项。你的分身将无法获得经验，也无法安装强化。
            <br />
            <br />
          </Typography>
        )}
      </Container>

      <Button onClick={() => setFAQOpen(true)}>FAQ</Button>
      <Box display="grid" sx={{ gridTemplateColumns: "repeat(2, 1fr)", mt: 1 }}>
        {Player.sleeves.map((sleeve, i) => (
          <SleeveElem key={i} rerender={rerender} sleeve={sleeve} />
        ))}
      </Box>
      <FAQModal open={FAQOpen} onClose={() => setFAQOpen(false)} />
    </>
  );
}
