import type { Bladeburner } from "../Bladeburner";
import type { BlackOperation } from "../Actions/BlackOperation";
import type { Operation } from "../Actions/Operation";

import React, { useState } from "react";
import { TeamSizeModal } from "./TeamSizeModal";
import { formatNumberNoSuffix } from "../../ui/formatNumber";
import { Button } from "@mui/material";

interface TeamSizeButtonProps {
  action: Operation | BlackOperation;
  bladeburner: Bladeburner;
}
export function TeamSizeButton({ action, bladeburner }: TeamSizeButtonProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button style={{ marginLeft: "1rem" }} disabled={bladeburner.teamSize === 0} onClick={() => setOpen(true)}>
        设置团队规模（当前规模：{formatNumberNoSuffix(action.teamCount, 0)}）
      </Button>
      <TeamSizeModal open={open} onClose={() => setOpen(false)} action={action} bladeburner={bladeburner} />
    </>
  );
}
